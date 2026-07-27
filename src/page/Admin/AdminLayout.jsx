import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidebarAdmin from "../../components/Sidebar/SidebarAdmin";

function AdminLayout() {
  return (
    <div className="flex h-screen">
      <SidebarAdmin />
      <main className="flex-1 overflow-auto">
        <Outlet />
        <ToastContainer position="top-right" />
      </main>
    </div>
  );
}

export default AdminLayout;
