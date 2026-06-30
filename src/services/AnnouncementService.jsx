import api from "../api/api";

export const getAnnouncements = async (page = 1, limit = 20) => {
  const res = await api.get("/announcements", { params: { page, limit } });
  return res.data.data;
};

// Admin
export const getAdminAnnouncements = async (page = 1, limit = 20) => {
  const res = await api.get("/admin/announcements", { params: { page, limit } });
  return res.data.data;
};

export const createAnnouncement = async (formData) => {
  const res = await api.post("/admin/announcements", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateAnnouncement = async (id, data) => {
  const res = await api.patch(`/admin/announcements/${id}`, data);
  return res.data.data;
};

export const deleteAnnouncement = async (id) => {
  const res = await api.delete(`/admin/announcements/${id}`);
  return res.data;
};
