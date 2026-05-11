import api from "../api/api";

export const getFeed = async (page = 1, limit = 20, type = "forYou") => {
  const response = await api.get("/posts", { params: { page, limit, type } });
  return response.data.data;
};

export const createPost = async (formData) => {
  const response = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const toggleLike = async (postId) => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data.data;
};

export const editPost = async (postId, data) => {
  const response = await api.patch(`/posts/${postId}`, data);
  return response.data.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data.data;
};