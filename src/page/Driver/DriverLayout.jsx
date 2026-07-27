import { Outlet, useLocation } from "react-router";
import { useEffect, useRef } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidebarDriver from "../../components/Sidebar/SidebarDriver";

function DriverLayout() {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="flex h-screen">
      <SidebarDriver />
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

export default DriverLayout;
