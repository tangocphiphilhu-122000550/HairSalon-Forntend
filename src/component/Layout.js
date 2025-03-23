// Layout.js
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FaCartPlus } from "react-icons/fa";
import { useCart } from "../CartContext"; // Import useCart để lấy dữ liệu giỏ hàng
import "./Home"; // Tạo file CSS riêng cho Layout nếu cần

const Layout = () => {
  const navigate = useNavigate();
  const { cart } = useCart(); // Lấy dữ liệu giỏ hàng từ CartContext

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <div className="layout-container">
      {/* Outlet sẽ render các trang con (Home, Service, Cart, v.v.) */}
      <Outlet />

      {/* Nút Zalo */}
      <a
        href="https://zalo.me/0343894612"
        target="_blank"
        rel="noopener noreferrer"
        className="zalo-button17"
      >
        <img
          src="/LogoZalo.webp"
          alt="Liên hệ Zalo"
          style={{ width: "60px", height: "60px" }}
        />
      </a>

      {/* Icon Giỏ hàng */}
      <div className="cart-button17" onClick={handleCartClick}>
        <FaCartPlus style={{ fontSize: "40px", color: "#ff7eb3" }} />
        {cart.length > 0 && (
          <span className="cart-count-home">{cart.length}</span>
        )}
      </div>
    </div>
  );
};

export default Layout;