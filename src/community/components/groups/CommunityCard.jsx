import { MoreVertical, Settings, Users, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const CommunityCard = ({ community, userRole, onJoin, isLoading, currentUserId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { _id, name, coverUrl, membersCount, description } = community;

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 border border-gray-100 h-60">
      {/* Cover */}
      <Link to={`/dashboard/groups/${_id}`}>
        <div
          className="h-24 w-full bg-cover bg-center bg-gradient-to-br from-[#401667] to-purple-400"
          style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : {}}
        />
      </Link>

      <div className="px-4 py-3">
        <div className="flex items-start justify-between mb-1">
          <Link to={`/dashboard/groups/${_id}`}>
            <h3 className="text-gray-800 font-semibold text-base hover:text-[#401667] line-clamp-1">{name}</h3>
          </Link>

          {userRole !== "non-member" && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-gray-100 rounded-full">
                <MoreVertical size={16} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-30 bg-white rounded-xl shadow-lg z-100 py-1">
                  {userRole === "admin" && (
                    <Link
                      to={`/dashboard/groups/${_id}/settings`}
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 text-xs"
                    >
                      <Settings size={14} /> Manage Group
                    </Link>
                  )}
                  <Link
                    to={`/dashboard/groups/${_id}/members`}
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 text-xs"
                  >
                    <Users size={14} /> View Members
                  </Link>
                  <button
                    onClick={() => { onJoin(); setShowMenu(false); }}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 text-xs text-red-600 w-full"
                  >
                    <LogOut size={14} /> Leave Group
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{description}</p>}

        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <Users size={12} /> {membersCount || 0} members
          </span>

          {userRole === "admin" && (
            <span className="px-3 py-1 rounded-lg bg-[#401667] text-white text-xs font-medium">Admin</span>
          )}
          {userRole === "member" && (
            <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium">Joined</span>
          )}
          {userRole === "non-member" && (
            <button
              onClick={onJoin}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 disabled:opacity-50 transition"
            >
              {isLoading ? "..." : "Join"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;