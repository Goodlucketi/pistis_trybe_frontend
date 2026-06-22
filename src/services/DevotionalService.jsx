import api from "../api/api";

export const getTodaysDevotional = async () => {
  const res = await api.get("/devotionals/today");
  return res.data.data;
};

export const getDevotionals = async (page = 1, limit = 10) => {
  const res = await api.get("/devotionals", { params: { page, limit } });
  return res.data.data;
};

export const getDevotionalByDate = async (date) => {
  const res = await api.get(`/devotionals/date/${date}`);
  return res.data.data;
};

// Admin
export const getAdminDevotionals = async (page = 1, limit = 20) => {
  const res = await api.get("/admin/devotionals", { params: { page, limit } });
  return res.data.data;
};

export const createDevotional = async (data) => {
  const res = await api.post("/admin/devotionals", data);
  return res.data.data;
};

export const updateDevotional = async (id, data) => {
  const res = await api.patch(`/admin/devotionals/${id}`, data);
  return res.data.data;
};

export const deleteDevotional = async (id) => {
  const res = await api.delete(`/admin/devotionals/${id}`);
  return res.data;
};
