import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!email || !room) return;
      setIsLoading(true);
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      setIsLoading(false);
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  const generateRandomRoom = () => {
    const randomRoom = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRoom(randomRoom);
  };

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '20px'
    }}>
      {/* Main Container */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '16px'
          }}>🎥</div>
          <h1 style={{
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Join Video Call
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
            margin: '0',
            fontWeight: '400'
          }}>
            Enter your details to start or join a room
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitForm} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Email Input */}
          <div style={{ textAlign: 'left' }}>
            <label style={{
              display: 'block',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              📧 Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '16px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            />
          </div>

          {/* Room Input */}
          <div style={{ textAlign: 'left' }}>
            <label style={{
              display: 'block',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              🏠 Room ID
            </label>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'stretch'
            }}>
              <input
                type="text"
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value.toUpperCase())}
                placeholder="Enter room ID"
                required
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  fontSize: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '600'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
              <button
                type="button"
                onClick={generateRandomRoom}
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'scale(1)';
                }}
                title="Generate random room ID"
              >
                🎲
              </button>
            </div>
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '12px',
              margin: '8px 0 0 0',
              fontStyle: 'italic'
            }}>
              Create a new room or join an existing one
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!email || !room || isLoading}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '18px',
              fontWeight: '700',
              color: 'white',
              background: (!email || !room || isLoading) 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'linear-gradient(45deg, #4CAF50, #45a049)',
              border: 'none',
              borderRadius: '16px',
              cursor: (!email || !room || isLoading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: (!email || !room || isLoading) 
                ? 'none' 
                : '0 6px 20px rgba(76, 175, 80, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Joining...
              </>
            ) : (
              <>
                🚀 Join Room
              </>
            )}
          </button>
        </form>

        {/* Features */}
        <div style={{
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '20px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
              <div>Secure</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
              <div>Fast</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌐</div>
              <div>WebRTC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Spinner Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        input::-webkit-input-placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        input::-moz-placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        input:-ms-input-placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LobbyScreen;