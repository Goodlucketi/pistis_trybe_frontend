import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, MoreVertical, Pencil, Settings, LogOut } from "lucide-react";
import { logoutUser } from "../../../services/AuthService";
import ImageViewer from "../../../shared/ImageViewer";

export default function ProfileTopBlock({ user }) {
  const isEmpty = !user;
  const [showMenu, setShowMenu] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    setShowMenu(false);
  };

  const menuItems = [
    { 
        label: isEmpty ? "Create Profile" : "Edit", 
        icon: Pencil, 
        to: "/dashboard/profile/edit" 
    },
    { 
        label: "Settings", 
        icon: Settings, 
        to: "/dashboard/profile/settings" 
    },
    { 
        label: "Log Out", 
        icon: LogOut, 
        onClick: handleLogout, 
        danger: true 
    },
  ];

  return (
    <div className="w-full bg-[#fff] rounded-2xl flex justify-between items-start gap-4">
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-4 sm:gap-6 min-w-0 flex-1">
        {/* Avatar — clickable to view full size */}
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden ${
            !isEmpty && user?.avatar ? "cursor-pointer hover:opacity-90 transition" : ""
          }`}
          onClick={() => !isEmpty && user?.avatar && setViewerOpen(true)}
        >
          {!isEmpty && user?.avatar ? (
            <img src={user.avatar} alt="profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-black truncate">
            {isEmpty ? "No profile yet" : user.name || "Complete your profile"}
          </h2>
          {!isEmpty && !user.name && (
            <p className="text-xs text-[#401667] mt-1">👉 Tap the menu to add your name and bio</p>
          )}

          <div className="flex flex-wrap gap-4 sm:gap-6 mt-3 text-xs sm:text-sm text-gray-600">
            <span className="whitespace-nowrap">
              <strong className="text-black">{isEmpty ? 0 : user.followers?.length || 0}</strong> Followers
            </span>
            <span className="whitespace-nowrap">
              <strong className="text-black">{isEmpty ? 0 : user.following?.length || 0}</strong> Following
            </span>
            <span className="whitespace-nowrap">
              <strong className="text-black">{isEmpty ? 0 : user.posts?.length || 0}</strong> Posts
            </span>
          </div>

          {isEmpty && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Create your profile to start connecting.</p>
          )}
        </div>
      </div>

      {/* RIGHT SIDE - 3 DOT MENU */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 rounded-full transition group relative"
          aria-label="Profile options"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
          <span className="hidden md:block absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Options
          </span>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-10 w-36 bg-white border border-gray-200 rounded-xl shadow-md z-20 py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const baseClasses = `w-full flex items-center gap-3 px-3 py-2 text-sm transition ${
                item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
              }`;
              if (item.to) {
                return (
                  <Link key={item.label} to={item.to} onClick={() => setShowMenu(false)} className={baseClasses}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              }
              return (
                <button key={item.label} onClick={item.onClick} className={baseClasses}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Avatar full-screen viewer */}
      <ImageViewer
        images={user?.avatar ? [user.avatar] : []}
        startIndex={0}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}