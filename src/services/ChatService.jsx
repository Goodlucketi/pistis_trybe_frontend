import api from "../api/api";

export const getChats = async () => {
  const response = await api.get("/chats");
  return response.data.data;
};

export const startDirectChat = async (targetUserId) => {
  const response = await api.post("/chats", { targetUserId });
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

export const sendMessage = async (chatId, { body, replyTo, file }) => {
  const formData = new FormData();
  if (body) formData.append("body", body);
  if (replyTo) formData.append("replyTo", replyTo);
  if (file) formData.append("file", file);
  const response = await api.post(`/chats/${chatId}/messages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const deleteMessage = async (chatId, msgId) => {
  const response = await api.delete(`/chats/${chatId}/messages/${msgId}`);
  return response.data.data;
};

export const reactToMessage = async (chatId, msgId, emoji) => {
  const response = await api.post(`/chats/${chatId}/messages/${msgId}/react`, { emoji });
  return response.data.data;
};
