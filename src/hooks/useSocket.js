import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/v1", "") || "http://localhost:8080";

let socketInstance = null;

export const getSocket = () => socketInstance;

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("🟢 Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      // Don't disconnect on unmount — keep connection alive across pages
    };
  }, []);

  const joinConversation = useCallback((conversationId) => {
    socketInstance?.emit("join:conversation", conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    socketInstance?.emit("leave:conversation", conversationId);
  }, []);

  const sendMessage = useCallback((payload) => {
    socketInstance?.emit("send_message", payload);
  }, []);

  const reactToMessage = useCallback((payload) => {
    socketInstance?.emit("react_message", payload);
  }, []);

  const deleteMessage = useCallback((payload) => {
    socketInstance?.emit("delete_message", payload);
  }, []);

  const startTyping = useCallback((conversationId) => {
    socketInstance?.emit("typing:start", conversationId);
  }, []);

  const stopTyping = useCallback((conversationId) => {
    socketInstance?.emit("typing:stop", conversationId);
  }, []);

  const on = useCallback((event, handler) => {
    socketInstance?.on(event, handler);
    return () => socketInstance?.off(event, handler);
  }, []);

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    sendMessage,
    reactToMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    on,
  };
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
