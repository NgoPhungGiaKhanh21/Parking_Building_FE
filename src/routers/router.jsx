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
import AdminDashboard from "../page/Admin/Dashboard/AdminDashboard";
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
import CurrentSession from "../page/Driver/CurrentSession/currentSession";
import Payment from "../page/Driver/Payment/Payment";
import PaymentHistory from "../page/Driver/PaymentHistory/PaymentHistory";
import PaymentSuccess from "../page/Driver/Payment/PaymentSuccess";
import PaymentCancel from "../page/Driver/Payment/PaymentCancel";
import PaymentManagement from "../page/Staff/paymentManagement/PaymentManagement";
import VehicleExit from "../page/Staff/vehicleExit/VehicleExit";
import GuestPayment from "../page/Staff/vehicleExitGuest/GuestPayment";
import GuestPaymentSuccess from "../page/Staff/vehicleExitGuest/GuestPaymentSuccess";
import GuestPaymentCancel from "../page/Staff/vehicleExitGuest/GuestPaymentCancel";
import Availability from "../page/Driver/Availability/availability"
import DriverIncidentReports from "../page/Driver/IncidentReports/DriverIncidentReports";
import IncidentManagement from "../page/Staff/incidentManagement/IncidentManagement";
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

  // PayOS redirect — BE trả về /payment/success|failed; FE phân nhánh driver vs staff guest
  {
    path: "/payment",
    element: <PrivateRoute allowedRoles={["ROLE_DRIVER", "ROLE_STAFF"]} />,
    children: [
      { path: "success", element: <PaymentSuccess /> },
      { path: "failed", element: <PaymentCancel /> },
      { path: "cancel", element: <PaymentCancel /> },
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
        children: [
          { path: "", element: <AdminDashboard /> },
          { path: "user-management", element: <UserManagement /> },
        ],
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
          { path: "", element: <BuildingManager /> },
          {
            path: "building/floors/:floorId/:floorSlug",
            element: <ZoneByFloorManagement />,
          },
          { path: "building/floors/:buildingId", element: <FloorManagement /> },
          { path: "parking-space", element: <ParkingSpacePage /> },
          { path: "staff", element: <StaffManagement /> },
          { path: "vehicle", element: <VehicleManager /> },
          { path: "revenue", element: <Dashboard /> },
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
        children: [
          { path: "", element: <VehicleEntry /> },
          { path: "vehicle-exit", element: <VehicleExit /> },
          { path: "vehicle-exit/payment", element: <GuestPayment /> },
          { path: "vehicle-exit/payment/success", element: <GuestPaymentSuccess /> },
          { path: "vehicle-exit/payment/failed", element: <GuestPaymentCancel /> },
          { path: "payments", element: <PaymentManagement /> },
          { path: "incidents", element: <IncidentManagement /> },
        ],
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
          { path: "availability", element: <Availability /> },
          { path: "reservation", element: <ReservationManage /> },
          { path: "current-session", element: <CurrentSession /> },
          { path: "payment", element: <Payment /> },
          { path: "payment/success", element: <PaymentSuccess /> },
          { path: "payment/cancel", element: <PaymentCancel /> },
          { path: "payment-history", element: <PaymentHistory /> },
          { path: "reports", element: <DriverIncidentReports /> },
        ],
      },
    ],
  },
]);

export default router;
