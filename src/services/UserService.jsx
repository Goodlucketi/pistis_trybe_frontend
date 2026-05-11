import api from "../api/api";

export const getMe = async () => {
  const response = await api.get("/users/me");
  return response.data.data;
};

export const updateMe = async (formData) => {
  const response = await api.patch("/users/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (response.data.data) {
    localStorage.setItem("user", JSON.stringify(response.data.data));
  }
  return response.data.data;
};

export const getUserPosts = async (userId, page = 1, limit = 20) => {
  const response = await api.get(`/users/${userId}/posts`, { params: { page, limit } });
  return response.data.data;
};

export const getFollowers = async (userId) => {
  const response = await api.get(`/users/${userId}/followers`);
  return response.data.data;
};

export const getFollowing = async (userId) => {
  const response = await api.get(`/users/${userId}/following`);
  return response.data.data;
};

export const toggleFollow = async (userId) => {
  const response = await api.post(`/users/${userId}/follow`);
  return response.data.data;
};

export const searchUsers = async (query) => {
  if (!query || query.trim().length < 2) return [];
  const response = await api.get("/users/find", { params: { q: query } });
  return response.data.data;
};