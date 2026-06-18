import api from "../api/api";

export const getComments = async (postId, page = 1, limit = 20) => {
  const response = await api.get(`/posts/${postId}/comments`, { params: { page, limit } });
  return response.data.data;
};

export const createComment = async (postId, body) => {
  const response = await api.post(`/posts/${postId}/comments`, { body });
  return response.data.data;
};

export const deleteComment = async (postId, commentId) => {
  const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
  return response.data;
};
