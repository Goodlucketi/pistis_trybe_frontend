import api from "../api/api";

// ==================== GROUPS ====================
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
  const response = await api.get("/groups/my");
  return response.data.data;
};

export const createGroup = async (formData) => {
  const response = await api.post("/groups", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const updateGroup = async ({ id, ...data }) => {
  const response = await api.patch(`/groups/${id}`, data);
  return response.data.data;
};

export const deleteGroup = async (id) => {
  const response = await api.delete(`/groups/${id}`);
  return response.data.data;
};

// ==================== GROUP POSTS - USE UNIFIED POST ENDPOINTS ====================
export const getGroupPosts = async (id, cursor = null) => {
  const response = await api.get(`/groups/${id}/posts`, { 
    params: { cursor, limit: 10 } 
  });
  return response.data.data;
};

// CHANGED: Use createPost, pass groupId in formData
export const createPost = async ({ groupId, formData }) => {
  formData.append("groupId", groupId); // <-- add groupId to formData
  const response = await api.post(`/groups/${groupId}/posts`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

// CHANGED: Use deletePost, only needs postId now
export const deletePost = async ({ postId }) => {
  const response = await api.delete(`/posts/${postId}`); // <-- unified endpoint
  return response.data.data;
};

export const likeGroupPost = async ({ postId }) => {
  const response = await api.post(`/posts/${postId}/like`); // <-- unified endpoint
  return response.data.data;
};

// ==================== MEMBER ACTIONS ====================
export const kickMember = async ({ groupId, userId }) => {
  const response = await api.delete(`/groups/${groupId}/members/${userId}`);
  return response.data.data;
};

export const promoteMember = async ({ groupId, userId }) => {
  const response = await api.patch(`/groups/${groupId}/members/${userId}/promote`);
  return response.data.data;
};