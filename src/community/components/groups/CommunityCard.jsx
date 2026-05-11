import { MoreVertical, Settings, Users, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const CommunityCard = ({ community, userRole, onJoin }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { title, image, membersCount, members = [] } = community;

  const displayMembers = members.slice(0, 5);

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300">
      {/* Banner */}
      <Link to={`/dashboard/groups/${community.id}`}>
        <div
          className="h-18 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      </Link>

      {/* Content */}
      <div className="bg-white px-4 py-3">
        <div className="flex items-start justify-between mb-1">
          <Link to={`/dashboard/groups/${community.id}`}>
            <h3 className="text-gray-800 font-medium text-lg hover:text-[#401667]">
              {title}
            </h3>
          </Link>
          
          {/* Admin/Member Menu */}
          {userRole!== "non-member" && (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical size={18} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                  {userRole === "admin" && (
                    <Link 
                      to={`/dashboard/groups/${community.id}/settings`}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      <Settings size={16} /> Manage Group
                    </Link>
                  )}

                  {userRole !== "non-member" && (
                    <Link
                      to={`/dashboard/messages/${community.id}`}
                      className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm font-medium"
                    >
                      Message
                    </Link>
                  )}
                  
                  <Link 
                    to={`/dashboard/groups/${community.id}/members`}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    <Users size={16} /> View Members
                  </Link>
                  <button 
                    onClick={onJoin}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-red-600 w-full"
                  >
                    <LogOut size={16} /> Leave Group
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatars + Count + Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {displayMembers.map((member) => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <span className="ml-3 text-gray-600 text-sm font-medium">
              +{membersCount}
            </span>
          </div>

          {/* State-based Button */}
          {userRole === "admin" && (
            <span className="px-4 py-2 rounded-xl bg-[#401667] text-white text-sm font-medium">
              Admin
            </span>
          )}
          {userRole === "member" && (
            <span className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium">
              Joined
            </span>
          )}
          {userRole === "non-member" && (
            <button
              onClick={onJoin}
              className="px-5 py-2 rounded-xl font-medium transition duration-300 bg-purple-200 text-purple-900 hover:bg-purple-300"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;