// useSocket.js - replace your file
import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||   "https://pistis-trybe-backend.onrender.com";

let socketInstance = null;

const getSocket = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.warn("No accessToken - socket not created");
    return null;
  }

  if (socketInstance?.connected) return socketInstance;
  
  // don't recreate if connecting
  if (socketInstance && !socketInstance.connected) return socketInstance;

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"], // add polling for Render
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  socketInstance.on("connect", () => {
    console.log("✅ Socket connected:", socketInstance.id);
  });

  socketInstance.on("connect_error", (err) => {
    console.error("Socket error:", err.message);
    // if token expired, disconnect
    if (err.message.includes("Authentication")) {
      disconnectSocket();
    }
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    
    // keep alive for Render free tier
    const pingInterval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("ping");
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      // don't disconnect on unmount - keep singleton
    };
  }, []);

  // ... rest of your methods stay same
  const joinConversation = useCallback((id) => socketRef.current?.emit("join:conversation", id), []);
  const leaveConversation = useCallback((id) => socketRef.current?.emit("leave:conversation", id), []);
  const sendMessage = useCallback((p) => socketRef.current?.emit("send_message", p), []);
  const startTyping = useCallback((id) => socketRef.current?.emit("typing:start", id), []);
  const stopTyping = useCallback((id) => socketRef.current?.emit("typing:stop", id), []);
  const on = useCallback((event, handler) => {
    const socket = socketRef.current || getSocket();
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, []);

  return { joinConversation, leaveConversation, sendMessage, startTyping, stopTyping, on };
};
