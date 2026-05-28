import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidebarDriver from "../../components/Sidebar/SidebarDriver";

function DriverLayout() {
  return (
    <div className="flex h-screen">
      <SidebarDriver />
      <main className="flex-1 overflow-auto">
        <Outlet />
        <ToastContainer position="top-right" />
      </main>
    </div>
  );
}

export default DriverLayout;
