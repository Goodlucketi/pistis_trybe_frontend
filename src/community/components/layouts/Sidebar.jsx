import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, LogOut } from "lucide-react";
import clsx from "clsx";
import {
  FiHome, FiUsers, FiBookOpen, FiMessageCircle, FiEdit2, FiChevronLeft,
} from "react-icons/fi";
import logo from "../../../assets/logos/sidebar_logo.png";
import { logoutUser } from "../../../services/AuthService";
import CreatePostModal from "../groups/CreatePostModal";
import CreateGroupModal from "../groups/CreateGroupModal";
import { getMe } from "../../../services/UserService";

export default function Sidebar({ isOpen, onClose, isMobile = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const collapsed = isMobile ? false : desktopCollapsed;
  const sidebarWidth = collapsed ? "w-20" : "w-64";
  const isMessagesPage = location.pathname.startsWith("/dashboard/messages");

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const mainLinks = [
    { name: "Feed", path: "/dashboard/feed", icon: <FiHome /> },
    { name: "Bible", path: "/dashboard/bible", icon: <FiBookOpen /> },
    { name: "Groups", path: "/dashboard/groups", icon: <FiUsers /> },
    { name: "Messages", path: "/dashboard/messages", icon: <FiMessageCircle /> },
  ];

  const quickLinks = [
    { name: "Create New Post", onClick: () => setShowCreatePost(true), icon: <FiEdit2 /> },
    { name: "Create New Group", onClick: () => setShowCreateGroup(true), icon: <FiUsers /> },
  ];

  const renderLink = (link, isQuick = false) => {
    const isActive = location.pathname === link.path;

    if (link.onClick) {
      return (
        <button
          key={link.name}
          onClick={() => { link.onClick(); isMobile && onClose?.(); }}
          className={clsx(
            "flex items-center transition-all rounded-lg px-3 py-2.5 text-white w-full",
            collapsed ? "justify-center" : "justify-start",
            "hover:bg-white/10"
          )}
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0">{link.icon}</span>
          {!collapsed && <span className="ml-3 text-sm">{link.name}</span>}
        </button>
      );
    }

    return (
      <Link
        key={link.name}
        to={link.path}
        onClick={() => isMobile && onClose?.()}
        className={clsx(
          "flex items-center transition-all rounded-lg px-3 py-2.5 text-white",
          collapsed ? "justify-center" : "justify-start",
          isActive && !isQuick ? "bg-[#6A4094] font-semibold" : "hover:bg-white/10"
        )}
      >
        <span className="w-5 h-5 flex items-center justify-center shrink-0">{link.icon}</span>
        {!collapsed && <span className="ml-3 text-sm">{link.name}</span>}
      </Link>
    );
  };

  const sidebarClasses = clsx(
    "bg-[#401667] text-white flex flex-col justify-between p-3 rounded-xl transition-all duration-300",
    isMobile
      ? "fixed top-0 left-0 z-50 w-64 h-screen transform"
      : clsx(
          sidebarWidth,
          "sticky hidden lg:flex",
          isMessagesPage
            ? "top-0 h-[95vh] rounded-none"
            : "top-25 h-[calc(100vh-7rem)]"
        )
  );

  const mobileTransform = isMobile && (isOpen ? "translate-x-0" : "-translate-x-full");

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={clsx(sidebarClasses, mobileTransform)}>
        <div className="flex flex-col gap-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center px-4 shrink-0">
            {isMobile ? (
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
                <X size={20} />
              </button>
            ) : (
              <button
                onClick={() => setDesktopCollapsed(!desktopCollapsed)}
                className="p-1 hover:bg-white/10 rounded transition-transform duration-300 bg-white/30"
              >
                <FiChevronLeft
                  className={clsx("w-6 h-6 transition-transform duration-300", collapsed && "rotate-180")}
                />
              </button>
            )}
          </div>

          {/* Main Links */}
          <nav className="flex flex-col gap-1.5">
            {mainLinks.map((link) => renderLink(link))}
          </nav>

          <hr className="border-[#B58DD44D]" />

          {!collapsed && (
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider px-3">
              Quick Actions
            </p>
          )}
          <nav className="flex flex-col gap-1.5">
            {quickLinks.map((link) => renderLink(link, true))}
          </nav>
        </div>

        {/* Bottom Account Card */}
        <div className="mt-auto shrink-0">
          {collapsed ? (
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-500/20 text-white/70 hover:text-red-400 transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="flex bg-[#6A4094] rounded-lg p-2 justify-center">
                <img src={logo} alt="Pistis Logo" className="w-8 h-8 rounded-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="bg-[#6A4094] border border-[#B58DD44D] rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-semibold">
                      {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <p className="font-semibold text-white text-xs truncate">
                    {user?.fullName || "Complete your profile"}
                  </p>
                  <p className="text-white/70 text-[10px] truncate">{user?.email}</p>
                </div>
              </div>

              {/* Sign Out button */}
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>

              <Link
                to="/dashboard/profile"
                onClick={() => isMobile && onClose?.()}
                className="w-full px-3 py-2 rounded-lg bg-[#401667] hover:bg-[#2e1048] text-white text-xs font-medium transition text-center"
              >
                View Account
              </Link>
            </div>
          )}
        </div>
      </aside>
      <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} />
      <CreateGroupModal isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} />
    </>
  );
}