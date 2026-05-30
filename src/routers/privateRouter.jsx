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
  const currentRole = localStorage.getItem("role")?.toLowerCase();

  // Nếu route có giới hạn quyền (allowedRoles) và role hiện tại không được phép
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    // Tự động đá user về đúng trang dashboard tương ứng với quyền của họ
    switch (currentRole) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "manager":
        return <Navigate to="/manager" replace />;
      case "staff":
        return <Navigate to="/staff" replace />;
      case "driver":
        return <Navigate to="/driver" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Nếu hợp lệ, cho phép render các component con bên trong route
  return <Outlet />;
};

export default PrivateRoute;
