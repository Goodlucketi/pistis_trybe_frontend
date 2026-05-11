import api from "../api/api";

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  // Save token and user from correct keys
  const { accessToken, user } = response.data.data;
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (user) localStorage.setItem("user", JSON.stringify(user));
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const forgotPwd = async (data) => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

export const resetPwd = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!localStorage.getItem("accessToken");

export const changePassword = async (data) => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};