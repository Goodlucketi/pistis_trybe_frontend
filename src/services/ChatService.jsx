import api from "../api/api";

export const getChats = async () => {
  const response = await api.get("/chats");
  return response.data.data;
};

export const startDirectChat = async (targetUserId) => {
  const response = await api.post("/chats/direct", { targetUserId });
  return response.data.data;
};

export const createGroupChat = async ({ name, participantIds }) => {
  const response = await api.post("/chats/groups", { name, participantIds });
  return response.data.data;
};

export const getMessages = async (chatId, page = 1, limit = 50) => {
  const response = await api.get(`/chats/${chatId}/messages`, { params: { page, limit } });
  return response.data.data;
};

/**
 * FIX: Only call this for FILE uploads.
 * Text-only messages must go through the socket (useSocket → sendMessage).
 * Calling this for text would duplicate the message (socket also saves it).
 */
export const sendMessage = async (chatId, { body = "", replyTo = null, file = null }) => {
  if (!file) {
    throw new Error("sendMessage HTTP endpoint is only for file uploads. Use socket for text.");
  }
  const formData = new FormData();
  if (body) formData.append("body", body);
  if (replyTo) formData.append("replyTo", replyTo);
  formData.append("file", file);
  const response = await api.post(`/chats/${chatId}/messages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const deleteMessage = async (chatId, messageId) => {
  const response = await api.delete(`/chats/${chatId}/messages/${messageId}`);
  return response.data;
};

export const reactToMessage = async (chatId, messageId, emoji) => {
  const response = await api.post(`/chats/${chatId}/messages/${messageId}/react`, { emoji });
  return response.data.data;
};
