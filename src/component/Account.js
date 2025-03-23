import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getToken, clearToken, clearUsername } from "../utils/tokenStorage";
import { useCart } from "../CartContext";
import { jwtDecode } from "jwt-decode";
import "./Account.css"; // File CSS cho trang Account

const Account = () => {
  const navigate = useNavigate();
  const { resetCart } = useCart();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await getToken();
        if (!token) {
          navigate("/auth");
        } else {
          const decodedToken = jwtDecode(token);
          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedToken.exp < currentTime) {
            await clearToken();
            await clearUsername();
            navigate("/auth");
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
        await clearToken();
        await clearUsername();
        navigate("/auth");
      }
    };
    checkAuthStatus();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const res = await api.post("/api/auth/logout", {});
      const { clearToken: shouldClearToken } = res.data;
      if (shouldClearToken) {
        await clearToken();
        await clearUsername();
        resetCart();
      }
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      await clearToken();
      await clearUsername();
      resetCart();
      navigate("/");
    }
  };

  return (
    <div className="account-container">
      <h1>Tài khoản của tôi</h1>
      <div className="account-menu">
        <Link to="/profile" className="account-item">Thông tin cá nhân</Link>
        <Link to="/OrderHistory" className="account-item">Lịch sử đặt hàng</Link>
        <Link to="/History" className="account-item">Lịch sử cắt</Link>
        <Link to="/ChangePassword" className="account-item">Đổi mật khẩu</Link>
        <button onClick={handleLogout} className="account-item logout-button">Đăng xuất</button>
      </div>
    </div>
  );
};

export default Account;