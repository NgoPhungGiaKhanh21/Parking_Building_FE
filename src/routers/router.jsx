import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layout/RootLayout";
import Home from "../page/Home/Home";
import Login from "../page/LoginPage/Login";
import Register from "../page/LoginPage/Register";
import Dashboard from "../page/Manager/Dashboard/Dashboard";
import PrivateRoute from "./privateRouter";
import ManagerLayout from "../page/Manager/ManagerLayout";
import StaffLayout from "../page/Staff/StaffLayout";
import DriverLayout from "../page/Driver/DriverLayout";
import AdminLayout from "../page/Admin/AdminLayout";
import UserManagement from "../page/Admin/UserManage/UserManagement";
import FloorManagement from "../page/Manager/Building/FloorManagement";
import ZoneByFloorManagement from "../page/Manager/Zone/ZoneByFloorManagement";
import ParkingSpacePage from "../page/Manager/ParkingSpace/parking_page";
import VehicleManagement from "../page/Driver/VehicleManage/VehicleManagement";
import BuildingManager from "../page/Manager/Building/BuildingManager";
import StaffManagement from "../page/Manager/Building/StaffManagement";
import VehicleManager from "../page/Manager/VehicleManage/vehicleManage";
import ReservationManage from "../page/Driver/ReservationManage/reservationManagement";
import PriceManager from "../page/Manager/PriceManager/PriceManager";
import VehicleEntry from "../page/Staff/vehicleEntry/vehicleEntry";
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
    element: <PrivateRoute allowedRoles={["ROLE_ADMIN"]} />,
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
    element: <PrivateRoute allowedRoles={["ROLE_MANAGER"]} />,
    children: [
      {
        path: "",
        element: <ManagerLayout />,
        children: [
          { path: "", element: <Dashboard /> },
          { path: "building", element: <BuildingManager /> },
          {
            path: "building/floors/:floorId/:floorSlug",
            element: <ZoneByFloorManagement />,
          },
          { path: "building/floors/:buildingId", element: <FloorManagement /> },
          { path: "parking-space", element: <ParkingSpacePage /> },
          { path: "staff", element: <StaffManagement /> },
          { path: "vehicle", element: <VehicleManager /> },
          { path: "price-policy", element: <PriceManager /> },
        ],
      },
    ],
  },
  //Staff router
  {
    path: "/staff",
    element: <PrivateRoute allowedRoles={["ROLE_STAFF"]} />,
    children: [
      {
        path: "",
        element: <StaffLayout />,
        children: [{ path: "", element: <VehicleEntry /> }],
      },
    ],
  },
  //Driver router
  {
    path: "/driver",
    element: <PrivateRoute allowedRoles={["ROLE_DRIVER"]} />,
    children: [
      {
        path: "",
        element: <DriverLayout />,
        children: [
          { path: "", element: <VehicleManagement /> },
          { path: "reservation", element: <ReservationManage /> },
        ],
      },
    ],
  },
]);

export default router;
