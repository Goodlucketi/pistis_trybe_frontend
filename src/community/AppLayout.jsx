import Sidebar from "./components/layouts/Sidebar";
import RightPanel from "./components/layouts/RightPanel";
import MobileTopBar from "./components/layouts/MobileTopBar";
import MobileBottomNav from "./components/layouts/MobileBottomNav";
import Devotional from "./components/layouts/Devotional";
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

const AppLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hide right panel when on groups or messages page
  const hideRightPanel =
    location.pathname.startsWith("/dashboard/groups") ||
    location.pathname.startsWith("/dashboard/messages");

  // Hide devotional on mobile for profile + messages
  const hideDevotionalOnMobile = [
    '/dashboard/profile',
    '/dashboard/messages'
  ].some(path => location.pathname.startsWith(path));

  const showDevotionalMobile = isMobile && !hideDevotionalOnMobile;
  const showDevotionalDesktop =!isMobile;

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Mobile Top Bar */}
      <MobileTopBar onMenuClick={() => setIsMobileSidebarOpen(true)} />

      <div className="flex max-w-[1280px] mx-auto gap-6 px-4 md:px-6 pt-4 lg:pt-6">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden lg:block shrink-0">
          <Sidebar isMobile={false} />
        </div>

        {/* MOBILE SIDEBAR OVERLAY */}
        <Sidebar
          isMobile={true}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* MAIN CONTENT */}
        <main className={`flex-1 ${hideRightPanel? "max-w-full" : "max-w-[1280px]"} mx-auto min-h-[calc(100vh-2rem)] pb-20 lg:pb-0`}>
          {/* Mobile Devotional - conditional */}
          {showDevotionalMobile && (
            <div className="lg:hidden mb-4">
              <Devotional />
            </div>
          )}

          <Outlet />
        </main>

       {/* RIGHT PANEL + Desktop Devotional */}
        {!hideRightPanel && (
          <div className="hidden xl:block shrink-0">
            <RightPanel />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30">
        <MobileBottomNav />
      </div>
    </div>
  );
}

export default AppLayout;