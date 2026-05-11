import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/home/Login";
import Register from "./pages/home/Register";
import ForgotPassword from "./pages/home/ForgotPwd";
import ResetPassword from "./pages/home/ResetPwd";
import AppLayout from "./community/AppLayout";
import PlainLayout from "./community/PlainLayout";
import ProtectedRoute from "./auth/ProtectedRoute";

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
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Dashboard Routes WITH Navbar */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
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
  );
}

export default App;