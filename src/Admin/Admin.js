import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaStar,
  FaBox,
  FaShoppingCart,
  FaCut,
  FaCalendarAlt,
} from "react-icons/fa";
import UserManagement from "./UserManagement";
import ServiceManagement from "./ServiceManagement";
import ReviewManagement from "./ReviewManagement";
import ProductManagement from "./ProductManagement";
import OrderManagement from "./OrderManagement";
import BarberManagement from "./BarberManagement";
import AppointmentManagement from "./AppointmentManagement";
import StatsManagement from "./StatsManagement";
import { useAppointmentContext } from "../context/AppointmentContext";
import api from "../utils/api";
import io from "socket.io-client";
import "./Admin.css";

const BACKEND_URL = "https://hairsalon-m4jx.onrender.com";
const socket = io(BACKEND_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  secure: true,
});

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const { newAppointmentCount, setNewAppointmentCount } = useAppointmentContext();
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State cho toggle sidebar

  const clearNotification = () => {
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const fetchNewAppointmentCount = async () => {
    try {
      const response = await api.get("/api/appointments/all");
      const newApps = response.data.filter(
        (a) => a.status === "pending" || a.status === "confirmed"
      );
      setNewAppointmentCount(newApps.length);
    } catch (err) {
      console.error("Lỗi khi lấy số lượng lịch hẹn mới:", err);
    }
  };

  const fetchNewOrderCount = async () => {
    try {
      const response = await api.get("/api/orders/all");
      const newOrders = response.data.filter((o) => o.status === "pending");
      setNewOrderCount(newOrders.length);
    } catch (err) {
      console.error("Lỗi khi lấy số lượng đơn hàng mới:", err);
    }
  };

  useEffect(() => {
    fetchNewAppointmentCount();
    fetchNewOrderCount();

    socket.on("newAppointment", (data) => {
      console.log("New appointment received in Admin:", data);
      setNewAppointmentCount((prev) => prev + 1);
      setNotification({ message: data.message, type: "success" });
      clearNotification();
    });

    socket.on("newOrder", (data) => {
      console.log("New order received in Admin:", data);
      setNewOrderCount((prev) => prev + 1);
      setNotification({ message: data.message, type: "success" });
      clearNotification();
    });

    socket.on("connect", () => {
      console.log("WebSocket connected to:", BACKEND_URL);
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error in Admin:", err);
      setNotification({ message: "Lỗi kết nối realtime!", type: "error" });
      clearNotification();
    });

    return () => {
      socket.off("newAppointment");
      socket.off("newOrder");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [setNewAppointmentCount]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-page">
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <ul className="sidebar-menu">
          <li
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            <FaUsers className="menu-icon" /> <span>Quản lý người dùng</span>
          </li>
          <li
            className={activeTab === "stats" ? "active" : ""}
            onClick={() => setActiveTab("stats")}
          >
            <FaChartLine className="menu-icon" /> <span>Thống kê</span>
          </li>
          <li
            className={activeTab === "services" ? "active" : ""}
            onClick={() => setActiveTab("services")}
          >
            <FaCog className="menu-icon" /> <span>Quản lý dịch vụ</span>
          </li>
          <li
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            <FaStar className="menu-icon" /> <span>Quản lý Review</span>
          </li>
          <li
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            <FaBox className="menu-icon" /> <span>Quản lý Sản phẩm</span>
          </li>
          <li
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            <FaShoppingCart className="menu-icon" /> <span>Quản lý Đơn hàng</span>
            {newOrderCount > 0 && (
              <span className="new-appointment-count">{newOrderCount}</span>
            )}
          </li>
          <li
            className={activeTab === "barbers" ? "active" : ""}
            onClick={() => setActiveTab("barbers")}
          >
            <FaCut className="menu-icon" /> <span>Quản lý Thợ cắt tóc</span>
          </li>
          <li
            className={activeTab === "appointments" ? "active" : ""}
            onClick={() => setActiveTab("appointments")}
          >
            <FaCalendarAlt className="menu-icon" /> <span>Quản lý Lịch hẹn</span>
            {newAppointmentCount > 0 && (
              <span className="new-appointment-count">{newAppointmentCount}</span>
            )}
          </li>
          <li onClick={handleLogout}>
            <FaSignOutAlt className="menu-icon" /> <span>Đăng xuất</span>
          </li>
        </ul>
      </aside>

      <main className="admin-content">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <header className="admin-header">
          <h1>Chào mừng đến với Bảng điều khiển Admin</h1>
        </header>

        {notification.message && (
          <div className={`notification ${notification.type}`}>
            <span>{notification.message}</span>
          </div>
        )}

        <section className="tab-content">
          {activeTab === "users" && <UserManagement />}
          {activeTab === "stats" && <StatsManagement />}
          {activeTab === "services" && <ServiceManagement />}
          {activeTab === "reviews" && <ReviewManagement />}
          {activeTab === "products" && <ProductManagement />}
          {activeTab === "orders" && (
            <OrderManagement
              newOrderCount={newOrderCount}
              setNewOrderCount={setNewOrderCount}
            />
          )}
          {activeTab === "barbers" && <BarberManagement />}
          {activeTab === "appointments" && <AppointmentManagement />}
        </section>
      </main>
    </div>
  );
};

export default Admin;