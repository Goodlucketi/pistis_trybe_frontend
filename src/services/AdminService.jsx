import api from "../api/api";

const BASE = "/admin";

export const getDashboardStats = async () => {
  const res = await api.get(`${BASE}/dashboard`);
  return res.data.data;
};

// Users
export const getAdminUsers = async (params = {}) => {
  const res = await api.get(`${BASE}/users`, { params });
  return res.data.data;
};

export const getAdminUserDetail = async (userId) => {
  const res = await api.get(`${BASE}/users/${userId}`);
  return res.data.data;
};

export const blockUser = async (userId) => {
  const res = await api.patch(`${BASE}/users/${userId}/block`);
  return res.data;
};

export const unblockUser = async (userId) => {
  const res = await api.patch(`${BASE}/users/${userId}/unblock`);
  return res.data;
};

export const verifyUser = async (userId) => {
  const res = await api.patch(`${BASE}/users/${userId}/verify`);
  return res.data;
};

export const changeUserRole = async (userId, newRole) => {
  const res = await api.patch(`${BASE}/users/${userId}/role`, { newRole });
  return res.data;
};

export const deleteAdminUser = async (userId) => {
  const res = await api.delete(`${BASE}/users/${userId}`);
  return res.data;
};

// Posts
export const getAdminPosts = async (params = {}) => {
  const res = await api.get(`${BASE}/posts`, { params });
  return res.data.data;
};

export const adminDeletePost = async (postId) => {
  const res = await api.delete(`${BASE}/posts/${postId}`);
  return res.data;
};

export const adminRestorePost = async (postId) => {
  const res = await api.patch(`${BASE}/posts/${postId}/restore`);
  return res.data;
};

// Groups
export const getAdminGroups = async (params = {}) => {
  const res = await api.get(`${BASE}/groups`, { params });
  return res.data.data;
};

export const adminDeleteGroup = async (groupId) => {
  const res = await api.delete(`${BASE}/groups/${groupId}`);
  return res.data;
};

// Announcements
export const broadcastAnnouncement = async ({ title, body, targetRole }) => {
  const res = await api.post(`${BASE}/announce`, { title, body, targetRole });
  return res.data.data;
};
