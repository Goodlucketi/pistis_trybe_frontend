import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from "./pages/home/Login";
import Register from "./pages/home/Register";
import ForgotPassword from "./pages/home/ForgotPwd";
import ResetPassword from "./pages/home/ResetPwd";
import AppLayout from "./community/AppLayout";
import PlainLayout from "./community/PlainLayout";
import ProtectedRoute from "./auth/ProtectedRoute";

import AdminProtectedRoute from "./auth/AdminProtectedRoute";
import AdminLayout from "./community/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminUserDetail from "./pages/admin/users/AdminUserDetail";
import AdminPosts from "./pages/admin/posts/AdminPosts";
import AdminGroups from "./pages/admin/groups/AdminGroups";
import AdminAnnouncements from "./pages/admin/announcements/AdminAnnouncements";
import AdminDevotionals from "./pages/admin/devotionals/AdminDevotionals";

import Profile from "./pages/profile/Profile";
import ProfileSetting from "./pages/profile/settings/setProfile";
import EditProfile from "./pages/profile/edit/editProfile";

import Feed from "./community/components/feed/Feed";
import BibleReader from "./community/components/feed/BibleReader";
import Messages from "./pages/messaging/MessagesPage";

import UserProfile from './pages/profile/UserProfile';
import Groups from "./community/components/feed/Groups";
import GroupDetail from "./community/components/groups/GroupDetail";
import GroupMembers from "./community/components/groups/GroupMembers";
import GroupSettings from "./community/components/groups/GroupSettings";

function App() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("pistis-theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("pistis-theme", theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      const storedTheme = localStorage.getItem("pistis-theme");
      if (!storedTheme) {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route 
          path="/admin" 
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route 
            index 
            element={<AdminDashboard />} 
          />
          <Route 
            path="users" 
            element={<AdminUsers />} 
          />
          <Route 
            path="users/:userId" 
            element={<AdminUserDetail />} 
          />
          <Route 
            path="posts" 
            element={<AdminPosts />} 
          />
          <Route 
            path="groups" 
            element={<AdminGroups />} 
          />
          <Route 
            path="announcements" 
            element={<AdminAnnouncements />} 
          />
          <Route 
            path="devotionals" 
            element={<AdminDevotionals 
            />} 
          />
        </Route>

        {/* Protected Dashboard Routes WITH Navbar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="feed" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/settings" element={<ProfileSetting />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="feed" element={<Feed />} />
          <Route path="bible" element={<BibleReader />} />
          <Route path="groups" element={<Groups />} />
          <Route path="groups/:id" element={<GroupDetail />} />
          <Route path="groups/:id/members" element={<GroupMembers />} />
          <Route path="groups/:id/settings" element={<GroupSettings />} />
          <Route path="users/:userId" element={<UserProfile />} />
        </Route>

        {/* Protected Messages Routes WITHOUT Navbar */}
        <Route
          path="/dashboard/messages"
          element={
            <ProtectedRoute>
              <PlainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Messages />} />
          <Route path=":conversationId" element={<Messages />} />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover
        theme="colored" 
      />
    </>
  );
}

export default App;