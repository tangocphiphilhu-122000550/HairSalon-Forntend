import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../utils/tokenStorage"; // Hàm lấy token từ IndexedDB
import { jwtDecode } from "jwt-decode";



const ProtectedRoute = ({ children }) => {
  const token = getToken();

  if (!token) {
    // Nếu không có token, chuyển hướng về trang đăng nhập
    return <Navigate to="/auth" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userTypeId = decodedToken.user_type_id;

    if (userTypeId !== 1) {
      // Nếu không phải admin, chuyển hướng về trang chủ
      return <Navigate to="/" replace />;
    }

    // Nếu là admin, cho phép truy cập
    return children;
  } catch (error) {
    // Nếu token không hợp lệ, chuyển hướng về trang đăng nhập
    return <Navigate to="/auth" replace />;
  }
};

export default ProtectedRoute;