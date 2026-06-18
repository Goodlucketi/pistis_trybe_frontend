import Sidebar from "./components/layouts/Sidebar";
import RightPanel from "./components/layouts/RightPanel";
import MobileTopBar from "./components/layouts/MobileTopBar";
import MobileBottomNav from "./components/layouts/MobileBottomNav";
import Devotional from "./components/layouts/Devotional";
import ErrorBoundary from "../shared/ErrorBoundary";
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

  const hideRightPanel =
    location.pathname.startsWith("/dashboard/groups") ||
    location.pathname.startsWith("/dashboard/messages");

  const hideDevotionalOnMobile = ["/dashboard/profile", "/dashboard/messages"].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <MobileTopBar onMenuClick={() => setIsMobileSidebarOpen(true)} />

      <div className="flex w-full mx-auto gap-6 px-4 md:px-10 pt-4 lg:pt-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <ErrorBoundary message="Sidebar failed to load.">
            <Sidebar isMobile={false} />
          </ErrorBoundary>
        </div>

        {/* Mobile Sidebar Overlay */}
        {/* <Sidebar isMobile isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} /> */}

        {/* Main Content */}
        <main className={`flex-1 ${hideRightPanel ? "max-w-full" : "max-w-[1280px]"} mx-auto min-h-[calc(100vh-2rem)] pb-20 lg:pb-0`}>
          {/* Mobile Devotional */}
          {isMobile && !hideDevotionalOnMobile && (
            <div className="lg:hidden mb-4">
              <ErrorBoundary message="Devotional failed to load.">
                <Devotional />
              </ErrorBoundary>
            </div>
          )}

          {/* FIX: Wrap page content in ErrorBoundary so a crash is contained */}
          <ErrorBoundary message="This page encountered an error. Try refreshing.">
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Right Panel */}
        {!hideRightPanel && (
          <div className="hidden xl:block shrink-0">
            <ErrorBoundary message="Right panel failed to load.">
              <RightPanel />
            </ErrorBoundary>
          </div>
        )}
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30">
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default AppLayout;
