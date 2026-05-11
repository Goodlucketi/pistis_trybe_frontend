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
