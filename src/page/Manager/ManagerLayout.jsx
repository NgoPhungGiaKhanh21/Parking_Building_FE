import { Outlet, useLocation } from "react-router";
import { useEffect, useRef } from "react";
import SidebarManager from "../../components/Sidebar/SideBarManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManagerLayout() {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="flex h-screen">
      <SidebarManager />
      <main
        ref={mainRef}
        className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <Outlet />
        <ToastContainer position="top-right" />
      </main>
    </div>
  );
}

export default ManagerLayout;
