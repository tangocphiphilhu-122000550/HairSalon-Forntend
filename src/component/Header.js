import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaHome, FaBoxOpen, FaInfoCircle, FaCog, FaSignInAlt, FaShoppingCart } from "react-icons/fa"; // Thêm lại FaShoppingCart
import api from "../utils/api";
import { getToken, clearToken, clearUsername } from "../utils/tokenStorage";
import { useCart } from "../CartContext";
import { jwtDecode } from "jwt-decode";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const [hideTaskbar, setHideTaskbar] = useState(false);
  const { cart, resetCart } = useCart();
  const lastScrollPosition = useRef(0);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await getToken();
        if (token) {
          const decodedToken = jwtDecode(token);
          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedToken.exp < currentTime) {
            await clearToken();
            await clearUsername();
            setIsLoggedIn(false);
          } else {
            setIsLoggedIn(true);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
        await clearToken();
        await clearUsername();
        setIsLoggedIn(false);
      }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY;
      if (currentScrollPosition <= 0) {
        setHideTaskbar(false);
      } else if (currentScrollPosition > lastScrollPosition.current) {
        setHideTaskbar(true);
        setShowMobileDropdown(false);
      } else if (currentScrollPosition < lastScrollPosition.current) {
        setHideTaskbar(false);
      }
      lastScrollPosition.current = currentScrollPosition;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await api.post("/api/auth/logout", {});
      const { clearToken: shouldClearToken } = res.data;
      if (shouldClearToken) {
        await clearToken();
        await clearUsername();
        resetCart();
      }
      setIsLoggedIn(false);
      setShowDropdown(false);
      setShowMobileDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      await clearToken();
      await clearUsername();
      resetCart();
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-menu") && !event.target.closest(".mobile-user-menu")) {
        setShowDropdown(false);
        setShowMobileDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleMobileUserClick = (e) => {
    if (isLoggedIn) {
      e.preventDefault();
      setShowMobileDropdown(!showMobileDropdown);
    } else {
      navigate("/auth");
    }
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <>
      <header className="header">
        <nav className="navbar">
          <ul className="nav-links left">
            <li>
              <Link to="/" className={location.pathname === "/" ? "active" : ""}>Trang chủ</Link>
            </li>
            <li>
              <Link to="/Service" className={location.pathname === "/Service" ? "active" : ""}>Dịch vụ</Link>
            </li>
          </ul>

          <div className="logo">
            <Link to="/">
              <img src="/logo.png" alt="Logo" />
            </Link>
          </div>

          <ul className="nav-links right">
            <li>
              <Link to="/products" className={location.pathname === "/products" ? "active" : ""}>Sản phẩm</Link>
            </li>
            <li>
              <Link to="/About" className={location.pathname === "/about" ? "active" : ""}>Giới thiệu</Link>
            </li>
          </ul>

          <div className="cart-icon-header desktop-only" onClick={handleCartClick}>
            <FaShoppingCart />
            {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </div>

          {isLoggedIn ? (
            <div className="user-menu desktop-only" onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}>
              <FaUserCircle className="user-icon" />
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link to="/Profile" onClick={() => setShowDropdown(false)}>Thông tin cá nhân</Link>
                  <Link to="/OrderHistory" onClick={() => setShowDropdown(false)}>Lịch sử đặt hàng</Link>
                  <Link to="/History" onClick={() => setShowDropdown(false)}>Lịch sử cắt</Link>
                  <Link to="/ChangePassword" onClick={() => setShowMobileDropdown(false)}>Đổi mật khẩu</Link>
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="login-button-wrapper desktop-only">
              <button className="login-button">Đăng Kí</button>
            </Link>
          )}
        </nav>
      </header>

      <div className={`mobile-taskbar ${hideTaskbar ? 'taskbar-hidden' : ''}`}>
        <div className="taskbar-content">
          <Link to="/" className={`taskbar-item ${location.pathname === "/" ? "active" : ""}`}>
            <FaHome className="taskbar-icon" />
            <span>Trang chủ</span>
          </Link>
          <Link to="/Service" className={`taskbar-item ${location.pathname === "/Service" ? "active" : ""}`}>
            <FaCog className="taskbar-icon" />
            <span>Dịch vụ</span>
          </Link>
          <Link to="/Products" className={`taskbar-item ${location.pathname === "/products" ? "active" : ""}`}>
            <FaBoxOpen className="taskbar-icon" />
            <span>Sản phẩm</span>
          </Link>
          <Link to="/About" className={`taskbar-item ${location.pathname === "/about" ? "active" : ""}`}>
            <FaInfoCircle className="taskbar-icon" />
            <span>Giới thiệu</span>
          </Link>
          <div className="taskbar-item mobile-user-menu" onClick={handleMobileUserClick}>
            {isLoggedIn ? (
              <>
                <FaUserCircle className="taskbar-icon" />
                <span>Cá nhân</span>
                {showMobileDropdown && (
                  <div className="mobile-dropdown-menu">
                    <Link to="/profile" onClick={() => setShowMobileDropdown(false)}>Thông tin cá nhân</Link>
                    <Link to="/OrderHistory" onClick={() => setShowMobileDropdown(false)}>Lịch sử đặt hàng</Link>
                    <Link to="/History" onClick={() => setShowDropdown(false)}>Lịch sử cắt</Link>
                    <Link to="/ChangePassword" onClick={() => setShowMobileDropdown(false)}>Đổi mật khẩu</Link>
                    <button onClick={handleLogout}>Đăng xuất</button>
                  </div>
                )}
              </>
            ) : (
              <>
                <FaSignInAlt className="taskbar-icon" />
                <span>Đăng ký</span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;