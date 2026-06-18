import api from "../api/api";

export const getNotifications = async (page = 1, limit = 20) => {
  const response = await api.get("/notifications", { params: { page, limit } });
  return response.data.data;
};

export const markNotificationsRead = async (notificationIds) => {
  const response = await api.patch("/notifications/read", { notificationIds });
  return response.data;
};
