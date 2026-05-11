import React from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

export default function ProfileTopBlock({ user }) {
  const isEmpty = !user;

  return (
    <div className="w-full bg-[#fff] rounded-2xl flex justify-between items-start gap-4">
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-4 sm:gap-6 min-w-0">
        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
          {!isEmpty && user?.avatar ? (
            <img
              src={user.avatar}
              alt="profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-black truncate">
            {isEmpty ? "No profile yet" : user.name || "Complete your profile"}
          </h2>
          {!isEmpty && !user.name && (
            <p className="text-xs text-[#401667] mt-1">
              👉 Tap <strong>Edit</strong> to add your name and bio
            </p>
          )}

          <div className="flex flex-wrap gap-4 sm:gap-6 mt-3 text-xs sm:text-sm text-gray-600">
            <span className="whitespace-nowrap">
              <strong className="text-black">
                {isEmpty ? 0 : user.followers?.length || 0}
              </strong>{" "}
              Followers
            </span>
            <span className="whitespace-nowrap">
              <strong className="text-black">
                {isEmpty ? 0 : user.following?.length || 0}
              </strong>{" "}
              Following
            </span>
            <span className="whitespace-nowrap">
              <strong className="text-black">
                {isEmpty ? 0 : user.posts?.length || 0}
              </strong>{" "}
              Posts
            </span>
          </div>

          {isEmpty && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Create your profile to start connecting.
            </p>
          )}
        </div>
      </div>

      {/* RIGHT SIDE BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
        <Link to="/dashboard/profile/settings">
          <button className="w-full px-3 sm:px-5 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-medium hover:bg-gray-50 transition whitespace-nowrap">
            Settings
          </button>
        </Link>

        <Link to="/dashboard/profile/edit">
          <button className="w-full px-3 sm:px-5 py-2 rounded-xl bg-[#401667] hover:scale-103 transition text-white text-xs sm:text-sm font-medium whitespace-nowrap">
            {isEmpty ? "Create" : "Edit"}
          </button>
        </Link>
      </div>
    </div>
  );
}