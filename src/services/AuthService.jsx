import api from "../api/api";
import { disconnectSocket } from "../hooks/useSocket";

export const loginUser = async ({ email, password }) => {
  const response = await api.post("/auth/login", { email, password });
  const { accessToken, refreshToken, user } = response.data.data;
  console.log("LOGIN USER OBJECT:", user);
  if(accessToken) localStorage.setItem("accessToken", accessToken);
  if(refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if(user) localStorage.setItem("user", JSON.stringify(user));
  return response.data.data;
};

export const registerUser = async ({ fullName, email, password }) => {
  const response = await api.post("/auth/register", { fullName, email, password });
  const { accessToken, refreshToken, user } = response.data.data;
  if(accessToken) localStorage.setItem("accessToken", accessToken);
  if(refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if(user) localStorage.setItem("user", JSON.stringify(user));
  return response.data.data;
};

export const googleLogin = async (credential) => {
  const response = await api.post("/auth/google", { credential });
  const { accessToken, refreshToken, user } = response.data.data;
  if(accessToken) localStorage.setItem("accessToken", accessToken);
  if(refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if(user) localStorage.setItem("user", JSON.stringify(user));
  return response.data.data;
};

export const forgotPwd = async ({ email }) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPwd = async ({ token, email, newPassword }) => {
  const response = await api.post("/auth/reset-password", { token, email, newPassword });
  return response.data;
};

// FIX: Disconnect socket on logout to prevent stale connections
export const logoutUser = () => {
  disconnectSocket();
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

// Used by PostCard and other components that need the cached user synchronously
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!localStorage.getItem("accessToken");
// export const isAuthenticated = () => !!localStorage.getItem("accessToken");

export const changePassword = async (data) => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};
