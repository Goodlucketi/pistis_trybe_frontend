import api from "../api/api";

export const getGroups = async () => {
  const response = await api.get("/groups");
  return response.data.data;
};

export const getGroupById = async (id) => {
  const response = await api.get(`/groups/${id}`);
  return response.data.data;
};

export const joinLeaveGroup = async (id) => {
  const response = await api.post(`/groups/${id}/join`);
  return response.data.data;
};

export const getGroupMembers = async (id, page = 1, limit = 30) => {
  const response = await api.get(`/groups/${id}/members`, { params: { page, limit } });
  return response.data.data;
};

export const getMyGroups = async () => {
  const response = await api.get("/users/me/groups");
  return response.data.data;
};

export const createGroup = async (formData) => {
  const response = await api.post("/groups", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

// NEW: Posts
export const getGroupPosts = async (id, cursor = null) => {
  const response = await api.get(`/groups/${id}/posts`, { 
    params: { cursor, limit: 10 } 
  });
  return response.data.data;
};

export const createGroupPost = async ({ groupId, text }) => {
  const response = await api.post(`/groups/${groupId}/posts`, { text });
  return response.data.data;
};

export const pinPost = async ({ groupId, postId }) => {
  const response = await api.patch(`/groups/${groupId}/posts/${postId}/pin`);
  return response.data.data;
};

export const deletePost = async ({ groupId, postId }) => {
  const response = await api.delete(`/groups/${groupId}/posts/${postId}`);
  return response.data.data;
};

// NEW: Member actions
export const kickMember = async ({ groupId, userId }) => {
  const response = await api.delete(`/groups/${groupId}/members/${userId}`);
  return response.data.data;
};

export const promoteMember = async ({ groupId, userId }) => {
  const response = await api.patch(`/groups/${groupId}/members/${userId}/promote`);
  return response.data.data;
};

// NEW: Settings
export const updateGroup = async ({ id, ...data }) => {
  const response = await api.patch(`/groups/${id}`, data);
  return response.data.data;
};

export const deleteGroup = async (id) => {
  const response = await api.delete(`/groups/${id}`);
  return response.data.data;
};