import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidebarStaff from "../../components/Sidebar/SideBarStaff";

function StaffLayout() {
  return (
    <div className="flex h-screen">
      <SidebarStaff />
      <main className="flex-1 overflow-auto">
        <Outlet />
        <ToastContainer position="top-right" />
      </main>
    </div>
  );
}

export default StaffLayout;
