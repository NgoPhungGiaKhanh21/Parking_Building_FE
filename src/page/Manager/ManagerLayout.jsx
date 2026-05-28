import { Outlet } from "react-router";
import SidebarManager from "../../components/Sidebar/SideBarManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManagerLayout() {
  return (
    <div className="flex h-screen">
      <SidebarManager />
      <main className="flex-1 overflow-auto">
        <Outlet />
        <ToastContainer position="top-right" />
      </main>
    </div>
  );
}

export default ManagerLayout;
