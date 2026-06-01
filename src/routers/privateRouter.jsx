import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.account);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toLowerCase();

  // Nếu route không cho phép role hiện tại
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "ROLE_ADMIN") return <Navigate to="/admin" replace />;
    if (role === "ROLE_MANAGER") return <Navigate to="/manager" replace />;
    if (role === "ROLE_STAFF") return <Navigate to="/staff" replace />;
    if (role === "ROLE_DRIVER") return <Navigate to="/driver" replace />;
    return <Navigate to="/" replace />;
  }

  // Nếu hợp lệ, cho render các route con
  return <Outlet />;
};

export default PrivateRoute;
