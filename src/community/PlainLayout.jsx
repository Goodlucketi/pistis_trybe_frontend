import { Outlet } from "react-router-dom";
import Sidebar from "./components/layouts/Sidebar"; 
import MobileBottomNav from "./components/layouts/MobileBottomNav";

const PlainLayout = () => {
  return (
    <div className="h-screen w-screen bg-gray-50">
      {/* Center container with max-width for desktop */}
      <div className="h-full p-4 w-full lg:max-w-[1280px] lg:mx-auto flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:py-2">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <MobileBottomNav />
        </div>
      </div>
    </div>
  );
};

export default PlainLayout;