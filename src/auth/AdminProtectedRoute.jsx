import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const user = (() => { 
    try { 
      return JSON.parse(localStorage.getItem("user") || "null"); 
    } 
    catch { 
      return null; 
    } 
  })();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin" && user.role !== "super_admin") return <Navigate to="/dashboard/feed" replace />;
  return children;
};

export default AdminProtectedRoute;
