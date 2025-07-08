const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
const roomToUsersMap = new Map(); // Track users in each room

// Generate unique room ID
function generateUniqueRoomId() {
  let roomId;
  do {
    roomId = Math.random().toString(36).substring(2, 10).toUpperCase();
  } while (roomToUsersMap.has(roomId)); // Keep generating until we get a unique one
  return roomId;
}

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

  // Handle room ID generation request
  socket.on("generate:room", () => {
    const uniqueRoomId = generateUniqueRoomId();
    socket.emit("room:generated", { roomId: uniqueRoomId });
    console.log(`Generated unique room ID: ${uniqueRoomId}`);
  });

  socket.on("room:join", (data) => {
    const { email, room } = data;

    console.log(`User ${email} attempting to join room ${room}`);

    // Initialize room if it doesn't exist
    if (!roomToUsersMap.has(room)) {
      roomToUsersMap.set(room, new Set());
      console.log(`Created new room: ${room}`);
    }

    const roomUsers = roomToUsersMap.get(room);
    console.log(`Current room ${room} size: ${roomUsers.size}`);

    // Check if user is already in the room (prevent duplicate joins)
    if (roomUsers.has(socket.id)) {
      console.log(`User ${email} is already in room ${room}`);
      socket.emit("room:join", {
        email,
        room,
        currentUsers: roomUsers.size,
        maxUsers: 2,
      });
      return;
    }

    // Check if room is full (maximum 2 users)
    if (roomUsers.size >= 2) {
      socket.emit("room:full", {
        message: "Room is full. Maximum 2 users allowed.",
        currentUsers: roomUsers.size,
        maxUsers: 2,
      });
      console.log(`Room ${room} is full. Rejected user: ${email}`);
      return;
    }

    // Add user to maps
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    roomUsers.add(socket.id);

    // Store room info in socket for cleanup
    socket.currentRoom = room;
    socket.userEmail = email;

    // Join the room first
    socket.join(room);

    // Notify existing users in room about new user
    socket.to(room).emit("user:joined", { email, id: socket.id });

    // Send updated room status to ALL users in the room (including the new user)
    io.to(room).emit("room:status:update", {
      currentUsers: roomUsers.size,
      maxUsers: 2,
      roomId: room,
    });

    // Confirm room join to the new user
    socket.emit("room:join", {
      email,
      room,
      currentUsers: roomUsers.size,
      maxUsers: 2,
    });

    console.log(
      `User ${email} (${socket.id}) successfully joined room ${room}. Room size: ${roomUsers.size}/2`
    );
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Socket Disconnected`, socket.id);

    // Clean up user from maps
    const email = socketidToEmailMap.get(socket.id);
    if (email) {
      emailToSocketIdMap.delete(email);
    }
    socketidToEmailMap.delete(socket.id);

    // Clean up room
    if (socket.currentRoom && roomToUsersMap.has(socket.currentRoom)) {
      const roomUsers = roomToUsersMap.get(socket.currentRoom);
      roomUsers.delete(socket.id);

      // Notify other users in room about user leaving
      socket.to(socket.currentRoom).emit("user:left", {
        email: socket.userEmail,
        id: socket.id,
      });

      // Send updated room status to ALL remaining users in the room
      io.to(socket.currentRoom).emit("room:status:update", {
        currentUsers: roomUsers.size,
        maxUsers: 2,
        roomId: socket.currentRoom,
      });

      // Remove empty rooms
      if (roomUsers.size === 0) {
        roomToUsersMap.delete(socket.currentRoom);
        console.log(`Room ${socket.currentRoom} deleted (empty)`);
      } else {
        console.log(
          `User ${socket.userEmail} left room ${socket.currentRoom}. Room size: ${roomUsers.size}/2`
        );
      }
    }
  });

  // Optional: Add room info endpoint
  socket.on("room:info", ({ room }) => {
    const roomUsers = roomToUsersMap.get(room);
    const currentUsers = roomUsers ? roomUsers.size : 0;

    socket.emit("room:info", {
      room,
      currentUsers,
      maxUsers: 2,
      isFull: currentUsers >= 2,
      canJoin: currentUsers < 2,
    });
  });
});
