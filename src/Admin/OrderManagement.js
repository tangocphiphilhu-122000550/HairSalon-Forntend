import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import api from "../utils/api";
import io from "socket.io-client";
import "./OrderManagement.css";

const BACKEND_URL = "https://hairsalon-m4jx.onrender.com";
const socket = io(BACKEND_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  secure: true,
});

const OrderManagement = ({ newOrderCount, setNewOrderCount }) => {
  const [orders, setOrders] = useState([]);
  const [newOrders, setNewOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [confirmAction, setConfirmAction] = useState(null);
  const statusSelectRef = useRef(null);

  const clearNotification = () => {
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/orders/all");
      console.log("Dữ liệu từ API /api/orders/all:", res.data);
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data);
      const newOrdersFiltered = data.filter((o) => o.status === "pending");
      setNewOrders(newOrdersFiltered);
      setFilteredOrders(data);
      setNewOrderCount(newOrdersFiltered.length);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      setNotification({ message: "Không thể lấy danh sách đơn hàng!", type: "error" });
      clearNotification();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();

    socket.on("newOrder", (data) => {
      console.log("New order received in OrderManagement:", data);
      setNewOrders((prev) => {
        const updatedNewOrders = [data.order, ...prev];
        setNewOrderCount(updatedNewOrders.length);
        return updatedNewOrders;
      });
      setOrders((prev) => {
        const updatedOrders = [data.order, ...prev];
        if (!searchTerm || data.order.user_name.toLowerCase() === searchTerm.toLowerCase()) {
          setFilteredOrders(updatedOrders);
        }
        return updatedOrders;
      });
      setNotification({ message: data.message, type: "success" });
      clearNotification();
    });

    socket.on("connect", () => {
      console.log("WebSocket connected to:", BACKEND_URL);
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
      setNotification({ message: "Lỗi kết nối realtime!", type: "error" });
      clearNotification();
    });

    return () => {
      socket.off("newOrder");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [searchTerm, setNewOrderCount]);

  // Handle clicks outside of the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (statusSelectRef.current && !statusSelectRef.current.contains(event.target)) {
        // If clicking outside of the select element, close the edit mode
        setEditOrderId(null);
      }
    }

    // Add event listener when edit mode is active
    if (editOrderId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editOrderId]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredOrders(orders);
      setSuggestions([]);
    } else {
      // Chỉ lọc các đơn hàng có user_name khớp chính xác với searchTerm
      const filtered = orders.filter((order) =>
        order?.user_name?.toLowerCase() === value.toLowerCase()
      );
      const uniqueUserNames = [...new Set(filtered.map((order) => order.user_name))];
      setSuggestions(
        uniqueUserNames.map((userName) => ({
          user_name: userName,
          count: filtered.filter((order) => order.user_name === userName).length,
        }))
      );
      setFilteredOrders(filtered);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const selectedUserName = suggestion.user_name;
    const filtered = orders.filter((order) => order.user_name === selectedUserName);
    setFilteredOrders(filtered);
    setSearchTerm(selectedUserName);
    setSuggestions([]);
  };

  const handleEdit = (order) => {
    setEditOrderId(order.id);
  };

  const handleUpdate = async (orderId, status) => {
    try {
      const res = await api.put("/api/orders/update", {
        order_id: orderId,
        status: status,
      });
      const updatedOrder = res.data.order;
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
      setFilteredOrders(filteredOrders.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (status !== "pending") {
        setNewOrders((prev) => {
          const updatedNewOrders = prev.filter((o) => o.id !== orderId);
          setNewOrderCount(updatedNewOrders.length);
          return updatedNewOrders;
        });
      }
      setEditOrderId(null);
      setNotification({ message: "Cập nhật trạng thái đơn hàng thành công!", type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
      setNotification({ message: "Cập nhật trạng thái đơn hàng thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleStatusChange = (e, orderId) => {
    const newStatus = e.target.value;
    handleUpdate(orderId, newStatus);
  };

  const handleDelete = async (orderId) => {
    try {
      await api.delete("/api/orders/delete", { data: { order_id: orderId } });
      setOrders(orders.filter((o) => o.id !== orderId));
      setFilteredOrders(filteredOrders.filter((o) => o.id !== orderId));
      setNewOrders((prev) => {
        const updatedNewOrders = prev.filter((o) => o.id !== orderId);
        setNewOrderCount(updatedNewOrders.length);
        return updatedNewOrders;
      });
      setNotification({ message: "Xóa đơn hàng thành công!", type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
      setNotification({ message: "Xóa đơn hàng thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleComplete = async (orderId) => {
    try {
      const res = await api.put("/api/orders/update", {
        order_id: orderId,
        status: "completed",
      });
      const updatedOrder = res.data.order;
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
      setFilteredOrders(filteredOrders.map((o) => (o.id === orderId ? updatedOrder : o)));
      setNewOrders((prev) => {
        const updatedNewOrders = prev.filter((o) => o.id !== orderId);
        setNewOrderCount(updatedNewOrders.length);
        return updatedNewOrders;
      });
      setNotification({ message: "Đơn hàng đã hoàn thành!", type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi hoàn thành đơn hàng:", error);
      setNotification({ message: "Hoàn thành đơn hàng thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleCancel = async (orderId) => {
    try {
      const res = await api.put("/api/orders/update", {
        order_id: orderId,
        status: "cancelled",
      });
      const updatedOrder = res.data.order;
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
      setFilteredOrders(filteredOrders.map((o) => (o.id === orderId ? updatedOrder : o)));
      setNewOrders((prev) => {
        const updatedNewOrders = prev.filter((o) => o.id !== orderId);
        setNewOrderCount(updatedNewOrders.length);
        return updatedNewOrders;
      });
      setNotification({ message: "Đơn hàng đã bị hủy!", type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      setNotification({ message: "Hủy đơn hàng thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handlePending = async (orderId) => {
    try {
      const res = await api.put("/api/orders/update", {
        order_id: orderId,
        status: "pending",
      });
      const updatedOrder = res.data.order;
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
      setFilteredOrders(filteredOrders.map((o) => (o.id === orderId ? updatedOrder : o)));
      setNotification({ message: "Đơn hàng đã được đặt lại thành chờ xử lý!", type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi đặt lại trạng thái đơn hàng:", error);
      setNotification({ message: "Đặt lại trạng thái đơn hàng thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleConfirmDelete = (orderId) => {
    setConfirmAction({
      type: "delete",
      id: orderId,
      message: `Bạn có chắc chắn muốn xóa đơn hàng #${orderId}?`,
    });
  };

  const confirmActionHandler = () => {
    if (confirmAction.type === "delete") {
      handleDelete(confirmAction.id);
    }
    setConfirmAction(null);
  };

  const cancelActionHandler = () => {
    setConfirmAction(null);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="orders-tab">
      <h2>Quản lý Đơn hàng</h2>

      {notification.message && (
        <div className={`notification-dropdown ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      {newOrders.length > 0 && (
        <div className="new-orders">
          <h3>Đơn hàng mới</h3>
          {newOrders.map((order) => (
            <div key={order.id} className="order-card">
            <div className="order-content">
              <h3>Đơn hàng #{order.id}</h3>
              
              <div className="order-info-grid">
                <div className="order-info-item">
                  <span className="order-info-label">Khách hàng</span>
                  <span className="order-info-value">{order.user_name || "Không xác định"}</span>
                </div>
                
                <div className="order-info-item">
                  <span className="order-info-label">Tổng tiền</span>
                  <span className="order-info-value">{order.total_amount} VNĐ</span>
                </div>
                
                <div className="order-info-item">
                  <span className="order-info-label">Trạng thái</span>
                  <span className={`order-status ${order.status}`}>{order.status}</span>
                </div>
                
                <div className="order-info-item">
                  <span className="order-info-label">Phương thức thanh toán</span>
                  <span className="order-info-value">{order.payment_method}</span>
                </div>
                
                <div className="order-info-item">
                  <span className="order-info-label">Ngày tạo</span>
                  <span className="order-info-value">{formatDateTime(order.created_at)}</span>
                </div>
              </div>
              
              <h4>Sản phẩm:</h4>
              <ul>
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <li key={index}>
                      {item.product_name} - Số lượng: {item.quantity} - Giá: {item.price_at_time} VNĐ
                      {item.review && (
                        <span>
                          {" "} (Đánh giá: {item.review.rating}/5 - "{item.review.comment}")
                        </span>
                      )}
                    </li>
                  ))
                ) : (
                  <li>Không có sản phẩm</li>
                )}
              </ul>
            </div>
            <div className="order-actions">
              <button
                className="action-btn complete-btn"
                onClick={() => handleComplete(order.id)}
              >
                Hoàn thành
              </button>
              <button
                className="action-btn cancel-btn"
                onClick={() => handleCancel(order.id)}
              >
                Hủy
              </button>
              <button
                className="action-btn pending-btn"
                onClick={() => handlePending(order.id)}
              >
                Chờ xử lý
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      <div className="orders-header">
        <div className="search-container">
          <form className="search-form">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên user..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled>
              <FaSearch />
            </button>
          </form>
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.user_name}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.user_name} ({suggestion.count} đơn hàng)
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {confirmAction && (
        <div className="confirmation-dropdown">
          <p>{confirmAction.message}</p>
          <div className="confirmation-actions">
            <button className="action-btn confirm-btn" onClick={confirmActionHandler}>
              Xác nhận
            </button>
            <button className="action-btn cancel-btn" onClick={cancelActionHandler}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="orders-list">
          <h3>Tất cả đơn hàng</h3>
          {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
  <div className="order-content">
    <h3>Đơn hàng #{order.id}</h3>
    
    <div className="order-info-grid">
      <div className="order-info-item">
        <span className="order-info-label">Khách hàng</span>
        <span className="order-info-value">{order.user_name || "Không xác định"}</span>
      </div>
      
      <div className="order-info-item">
        <span className="order-info-label">Tổng tiền</span>
        <span className="order-info-value">{order.total_amount} VNĐ</span>
      </div>
      
      {editOrderId === order.id ? (
        <div className="order-info-item">
          <div className="status-edit" ref={statusSelectRef}>
            <label>Trạng thái: </label>
            <select
              name="status"
              defaultValue={order.status}
              onChange={(e) => handleStatusChange(e, order.id)}
            >
              <option value="pending">Chờ xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="order-info-item">
          <span className="order-info-label">Trạng thái</span>
          <span className={`order-status ${order.status}`}>{order.status}</span>
        </div>
      )}
      
      <div className="order-info-item">
        <span className="order-info-label">Phương thức thanh toán</span>
        <span className="order-info-value">{order.payment_method}</span>
      </div>
      
      <div className="order-info-item">
        <span className="order-info-label">Ngày tạo</span>
        <span className="order-info-value">{formatDateTime(order.created_at)}</span>
      </div>
    </div>
    
    <h4>Sản phẩm:</h4>
    <ul>
      {Array.isArray(order.items) && order.items.length > 0 ? (
        order.items.map((item, index) => (
          <li key={index}>
            {item.product_name} - Số lượng: {item.quantity} - Giá: {item.price_at_time} VNĐ
            {item.review && (
              <span>
                {" "} (Đánh giá: {item.review.rating}/5 - "{item.review.comment}")
              </span>
            )}
          </li>
        ))
      ) : (
        <li>Không có sản phẩm</li>
      )}
    </ul>
  </div>
  <div className="order-actions">
    <button
      className="action-btn"
      onClick={() => handleEdit(order)}
    >
      Cập nhật trạng thái
    </button>
    <button
      className="action-btn delete-btn"
      onClick={() => handleConfirmDelete(order.id)}
    >
      Xóa
    </button>
  </div>
</div>
            ))
          ) : (
            <p>Không tìm thấy đơn hàng nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;