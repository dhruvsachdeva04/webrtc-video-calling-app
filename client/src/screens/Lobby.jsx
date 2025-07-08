import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingRoom, setIsGeneratingRoom] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [mode, setMode] = useState(null); // 'create' or 'join' or null

  const socket = useSocket();
  const navigate = useNavigate();

  const generateUniqueRoom = useCallback(() => {
    setIsGeneratingRoom(true);
    socket.emit("generate:room");
  }, [socket]);

  const handleGeneratedRoom = useCallback((data) => {
    setRoom(data.roomId);
    setIsGeneratingRoom(false);
    setCopySuccess(""); // Reset copy status
  }, []);

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
    setRoom(""); // Reset room
    setCopySuccess("");
    
    if (selectedMode === 'create') {
      generateUniqueRoom();
    }
  };

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!email || !room) return;
      setIsLoading(true);
      
      // Store email in localStorage for RoomPage to use
      localStorage.setItem('userEmail', email);
      
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

  const copyRoomToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(room);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = room;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(""), 2000);
      } catch (fallbackErr) {
        setCopySuccess("Copy failed");
        setTimeout(() => setCopySuccess(""), 2000);
      }
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    socket.on("room:generated", handleGeneratedRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
      socket.off("room:generated", handleGeneratedRoom);
    };
  }, [socket, handleJoinRoom, handleGeneratedRoom]);

  // Mode Selection Screen
  if (!mode) {
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
              Video Call
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              margin: '0',
              fontWeight: '400'
            }}>
              How would you like to get started?
            </p>
          </div>

          {/* Mode Selection Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Create Room Button */}
            <button
              onClick={() => handleModeSelection('create')}
              style={{
                width: '100%',
                padding: '24px',
                background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
              }}
            >
              <span style={{ fontSize: '24px' }}>➕</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>Create New Room</div>
                <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '400' }}>Start a new video call</div>
              </div>
            </button>

            {/* Join Room Button */}
            <button
              onClick={() => handleModeSelection('join')}
              style={{
                width: '100%',
                padding: '24px',
                background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
              }}
            >
              <span style={{ fontSize: '24px' }}>🚪</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>Join Existing Room</div>
                <div style={{ fontSize: '14px', opacity: '0.9', fontWeight: '400' }}>Enter a room ID to join</div>
              </div>
            </button>
          </div>

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
      </div>
    );
  }

  // Form Screen (Create or Join)
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
        {/* Back Button */}
        <button
          onClick={() => setMode(null)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          ←
        </button>

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
            {mode === 'create' ? 'Create Room' : 'Join Room'}
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
            margin: '0',
            fontWeight: '400'
          }}>
            {mode === 'create' 
              ? 'Enter your email and create your unique room'
              : 'Enter your email and room ID to join'
            }
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

          {/* Room Section */}
          {mode === 'create' ? (
            /* Create Mode - Auto-generated Room Display */
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
                🏠 Your Room ID
              </label>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'stretch'
              }}>
                {/* Room ID Display */}
                <div style={{
                  flex: 1,
                  padding: '16px 20px',
                  fontSize: '18px',
                  border: '2px solid rgba(76, 175, 80, 0.5)',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '20px'
                }}>
                  {isGeneratingRoom ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span style={{ fontSize: '14px' }}>Generating...</span>
                    </div>
                  ) : (
                    room || "Loading..."
                  )}
                </div>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={copyRoomToClipboard}
                  disabled={!room || isGeneratingRoom}
                  style={{
                    padding: '16px',
                    backgroundColor: copySuccess ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: (!room || isGeneratingRoom) ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '60px'
                  }}
                  onMouseOver={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = copySuccess ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                  title="Copy room ID to clipboard"
                >
                  {copySuccess ? "✓" : "📋"}
                </button>

                {/* Regenerate Button */}
                <button
                  type="button"
                  onClick={generateUniqueRoom}
                  disabled={isGeneratingRoom}
                  style={{
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: isGeneratingRoom ? 'not-allowed' : 'pointer',
                    fontSize: '18px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                  title="Generate new room ID"
                >
                  🎲
                </button>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px'
              }}>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '12px',
                  margin: '0',
                  fontStyle: 'italic'
                }}>
                  Share this ID with others to join your room
                </p>
                {copySuccess && (
                  <span style={{
                    color: 'rgba(76, 175, 80, 1)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {copySuccess}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Join Mode - Manual Room Input */
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
              <input
                type="text"
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value.toUpperCase())}
                placeholder="Enter room ID (e.g., ABC123XY)"
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
                  boxSizing: 'border-box',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '600',
                  textAlign: 'center'
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
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '12px',
                margin: '8px 0 0 0',
                fontStyle: 'italic'
              }}>
                Get the room ID from the person who created the room
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!email || !room || isLoading || isGeneratingRoom}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '18px',
              fontWeight: '700',
              color: 'white',
              background: (!email || !room || isLoading || isGeneratingRoom) 
                ? 'rgba(255, 255, 255, 0.2)' 
                : mode === 'create' 
                  ? 'linear-gradient(45deg, #4CAF50, #45a049)'
                  : 'linear-gradient(45deg, #2196F3, #1976D2)',
              border: 'none',
              borderRadius: '16px',
              cursor: (!email || !room || isLoading || isGeneratingRoom) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: (!email || !room || isLoading || isGeneratingRoom) 
                ? 'none' 
                : mode === 'create'
                  ? '0 6px 20px rgba(76, 175, 80, 0.4)'
                  : '0 6px 20px rgba(33, 150, 243, 0.4)',
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
                e.target.style.boxShadow = mode === 'create' 
                  ? '0 8px 25px rgba(76, 175, 80, 0.5)'
                  : '0 8px 25px rgba(33, 150, 243, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = (!email || !room || isLoading || isGeneratingRoom) 
                  ? 'none' 
                  : mode === 'create'
                    ? '0 6px 20px rgba(76, 175, 80, 0.4)'
                    : '0 6px 20px rgba(33, 150, 243, 0.4)';
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
                {mode === 'create' ? 'Creating Room...' : 'Joining Room...'}
              </>
            ) : (
              <>
                {mode === 'create' ? '🚀 Create & Join Room' : '🚪 Join Room'}
              </>
            )}
          </button>
        </form>
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