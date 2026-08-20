import { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Users2,
  Megaphone,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { logoutUser } from "../../../services/AuthService";

const links = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    end: true,
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: <Users className="w-4 h-4" />,
  },
  {
    to: "/admin/posts",
    label: "Posts",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    to: "/admin/groups",
    label: "Groups",
    icon: <Users2 className="w-4 h-4" />,
  },
  {
    to: "/admin/devotionals",
    label: "Devotionals",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    to: "/admin/announcements",
    label: "Announcements",
    icon: <Megaphone className="w-4 h-4" />,
  },
];

// Defined at module scope (not inside the component) so it isn't recreated on
// every render, which would remount the sidebar nav and reset its focus/scroll.
const SidebarContent = ({ user, onNavigate, onLogout }) => (
  <div className="flex flex-col h-full">
    <div className="p-5 border-b border-white/10 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
        <ShieldCheck className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-white font-bold text-sm">Admin Panel</p>
        <p className="text-white/60 text-xs">Pistis Trybe</p>
      </div>
    </div>

    <nav className="flex-1 p-4 space-y-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive ? "bg-white text-[#401667]" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          {link.icon}
          {link.label}
        </NavLink>
      ))}
    </nav>

    <div className="p-4 border-t border-white/10">
      <div className="flex items-center gap-3 mb-3 px-2">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">{user?.fullName?.charAt(0)?.toUpperCase() || "A"}</span>
        </div>
        <div className="min-w-0">
          <p className="text-white text-xs font-semibold truncate">{user?.fullName || "Admin"}</p>
          <p className="text-white/50 text-[10px] capitalize">{user?.role}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 text-sm transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  </div>
);

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const sidebarProps = {
    user,
    onNavigate: () => setSidebarOpen(false),
    onLogout: handleLogout,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#401667] shrink-0">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-56 bg-[#401667] flex flex-col shrink-0">
            <SidebarContent {...sidebarProps} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <ShieldCheck className="w-5 h-5 text-[#401667]" />
            <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
          </div>
          <div className="ml-auto">
            <NavLink to="/dashboard/feed" className="text-xs text-[#401667] hover:underline font-medium">
              ← Back to App
            </NavLink>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}