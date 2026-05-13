import { Bell, Search } from "lucide-react";
import pistis_logo from "../../../assets/logos/pistis_logo.png";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../../services/UserService";

const MobileTopBar = ({ onMenuClick }) => {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  return (
    <header className="sticky flex items-center justify-between top-0 z-30 bg-white border-b border-gray-100 px-5 md:px-20 2xl:px-40 py-2">
      {/* Logo */}
      <div className="flex items-center shrink-0 md:py-3">
        <img src={pistis_logo} alt="Pistis Trybe Logo" className="w-3/12" />
        <span className="md:text-lg">Pistis Trybe</span>
      </div>

      <div className="flex items-center justify-between md:gap-10 px-4 py-3 w-full md:w-9/12">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 md:w-10/12">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm placeholder:text-gray-400 md:p-2 w-full"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="hidden md:flex items-center md:gap-5">
          {/* Notification */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <Link to="/dashboard/profile" className="flex items-center gap-2">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#401667] flex items-center justify-center ring-2 ring-gray-100">
                <span className="text-white text-sm font-semibold">
                  {user?.fullName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    "?"}
                </span>
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default MobileTopBar;