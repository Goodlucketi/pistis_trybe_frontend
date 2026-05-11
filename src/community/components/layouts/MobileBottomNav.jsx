import {
  Home,
  BookOpen,
  Users,
  MessageCircle,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import useCommunityStore from "../../store/useCommunityStore";

const navItems = [
  { 
    key: "feed", 
    label: "Feed", 
    icon: Home, 
    to: "/dashboard/feed" 
},
{ 
    key: "bible", 
    label: "Bible", 
    icon: BookOpen, 
    to: "/dashboard/bible" 
},
  { 
    key: "groups", 
    label: "Groups", 
    icon: Users, 
    to: "/dashboard/groups" 
  },
  { 
    key: "messages", 
    label: "Messages", 
    icon: MessageCircle, 
    to: "/dashboard/messages" 
  },
  { 
    key: "profile", 
    label: "Profile", 
    icon: User, 
    to: "/dashboard/profile" 
  },
];

const MobileBottomNav = () => {
    const { activeView, setActiveView } = useCommunityStore();
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-md bg-[#4B1D83]">
        <div className="flex items-center justify-between px-2 py-2">
            {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;

            return (
                <Link to={item.to}
                    key={item.key}
                    onClick={() => setActiveView(item.key)}
                    className={clsx("flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition",
                        isActive
                            ? "text-slate-100 bg-slate-100/20"
                            : "text-slate-100"
                        )
                    }
                >
                    <Icon size={22} />
                    <span className="text-[11px] mt-0.5 font-medium">
                        {item.label}
                    </span>
                </Link>
            );
            })}
        </div>
        </nav>
    );
};

export default MobileBottomNav;