import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace("/v1", "") || "https://pistis-trybe-backend.onrender.com";

let socketInstance = null;

const getSocket = () => {
  if (socketInstance?.connected) return socketInstance;

  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socketInstance.on("connect_error", (err) => {
    console.warn("Socket connect error:", err.message);
  });

  return socketInstance;
};

// FIX: Exposed so AuthService can call it on logout
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    return () => {};
  }, []);

  const joinConversation = useCallback((conversationId) => {
    socketRef.current?.emit("join:conversation", conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    socketRef.current?.emit("leave:conversation", conversationId);
  }, []);

  const sendMessage = useCallback((payload) => {
    socketRef.current?.emit("send_message", payload);
  }, []);

  const startTyping = useCallback((conversationId) => {
    socketRef.current?.emit("typing:start", conversationId);
  }, []);

  const stopTyping = useCallback((conversationId) => {
    socketRef.current?.emit("typing:stop", conversationId);
  }, []);

  const on = useCallback((event, handler) => {
    const socket = socketRef.current || getSocket();
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, []);

  return { joinConversation, leaveConversation, sendMessage, startTyping, stopTyping, on };
};
