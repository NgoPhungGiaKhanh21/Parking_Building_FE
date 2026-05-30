import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toLowerCase();

  // Nếu route không cho phép role hiện tại
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "manager") return <Navigate to="/manager" replace />;
    if (role === "staff") return <Navigate to="/staff" replace />;
    if (role === "driver") return <Navigate to="/driver" replace />;
    return <Navigate to="/" replace />;
  }

  // Nếu hợp lệ, cho render các route con
  return <Outlet />;
};

export default PrivateRoute;
