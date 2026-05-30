import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layout/RootLayout";
import Home from "../page/Home/Home";
import Login from "../page/LoginPage/Login";
import Register from "../page/LoginPage/Register";
import Dashboard from "../page/Manager/Dashboard/Dashboard";
//import PrivateRoute from "./privateRouter";
import ManagerLayout from "../page/Manager/ManagerLayout";
import StaffLayout from "../page/Staff/StaffLayout";
import DriverLayout from "../page/Driver/DriverLayout";
import AdminLayout from "../page/Admin/AdminLayout";
import UserManagement from "../page/Admin/UserManage/UserManagement";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "", element: <Home /> },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },

  //Admin router
  {
    path: "/admin",
    //element: <PrivateRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [{ path: "", element: <UserManagement /> }],
      },
    ],
  },
  //Manager router
  {
    path: "/manager",
    //element: <PrivateRoute allowedRoles={["manager"]} />,
    children: [
      {
        path: "",
        element: <ManagerLayout />,
        children: [{ path: "", element: <Dashboard /> }],
      },
    ],
  },
  //Staff router
  {
    path: "/staff",
    //element: <PrivateRoute allowedRoles={["staff"]} />,
    children: [
      {
        path: "",
        element: <StaffLayout />,
        children: [{ path: "", element: <Dashboard /> }],
      },
    ],
  },
  //Driver router
  {
    path: "/driver",
    //element: <PrivateRoute allowedRoles={["driver"]} />,
    children: [
      {
        path: "",
        element: <DriverLayout />,
        children: [{ path: "", element: <Dashboard /> }],
      },
    ],
  },
]);

export default router;
