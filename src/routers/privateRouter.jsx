import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  // Lấy token từ Redux, fallback sang localStorage để chống lỗi khi F5 reload trang
  const { token } = useSelector((state) => state.auth);
  const isAuthenticated = token || localStorage.getItem("token");

  // Nếu không có token (chưa đăng nhập) => Đá về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Lấy role từ localStorage và chuyển thành chữ thường để dễ so sánh
  const currentRole = localStorage.getItem("role");

  // Nếu route không cho phép role hiện tại
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    if (currentRole === "ROLE_ADMIN") return <Navigate to="/admin" replace />;
    if (currentRole === "ROLE_MANAGER")
      return <Navigate to="/manager" replace />;
    if (currentRole === "ROLE_STAFF") return <Navigate to="/staff" replace />;
    if (currentRole === "ROLE_DRIVER") return <Navigate to="/driver" replace />;
    return <Navigate to="/" replace />;
  }

  // Nếu hợp lệ, cho phép render các component con bên trong route
  return <Outlet />;
};

export default PrivateRoute;
