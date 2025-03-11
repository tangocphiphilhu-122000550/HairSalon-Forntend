import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import api from "../utils/api";
import { useAppointmentContext } from "../context/AppointmentContext";
import "./AppointmentManagement.css";

const BACKEND_URL = "https://hairsalon-m4jx.onrender.com";
const socket = io(BACKEND_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  secure: true,
});

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [newAppointments, setNewAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ status: "" });
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const { newAppointmentCount, setNewAppointmentCount } = useAppointmentContext(); // Thêm newAppointmentCount để kiểm tra

  const clearNotification = () => {
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/appointments/all");
      const sortedAppointments = response.data.sort((a, b) => b.id - a.id);
      setAppointments(sortedAppointments);
      const newApps = sortedAppointments.filter(
        (a) => a.status === "pending" || a.status === "confirmed"
      );
      setNewAppointments(newApps);
      setNewAppointmentCount(newApps.length); // Đồng bộ số lượng với danh sách thực tế
    } catch (err) {
      setError("Lỗi khi tải danh sách lịch hẹn");
      setNotification({ message: "Không thể tải danh sách lịch hẹn!", type: "error" });
      clearNotification();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    socket.on("connect", () => {
      console.log("WebSocket connected to:", BACKEND_URL);
    });

    socket.on("newAppointment", (data) => {
      console.log("New appointment received:", data);
      setNotification({ message: data.message, type: "success" });
      setNewAppointments((prev) => {
        const updatedNewApps = [data.appointment, ...prev];
        setNewAppointmentCount(updatedNewApps.length); // Đồng bộ ngay khi có lịch mới
        return updatedNewApps;
      });
      setAppointments((prev) => [data.appointment, ...prev]);
      clearNotification();
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
      setNotification({ message: "Lỗi kết nối realtime!", type: "error" });
      clearNotification();
    });

    return () => {
      socket.off("connect");
      socket.off("newAppointment");
      socket.off("connect_error");
    };
  }, [setNewAppointmentCount]);

  const fetchAppointmentsByUsername = async () => {
    if (!searchUsername.trim()) {
      fetchAppointments();
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/api/appointments/${searchUsername}`);
      const sortedAppointments = response.data.sort((a, b) => b.id - a.id);
      setAppointments(sortedAppointments);
      const newApps = sortedAppointments.filter(
        (a) => a.status === "pending" || a.status === "confirmed"
      );
      setNewAppointments(newApps);
      setNewAppointmentCount(newApps.length);
      setNotification({ message: `Đã tải lịch hẹn của ${searchUsername}`, type: "success" });
      clearNotification();
    } catch (err) {
      setError("Lỗi khi tải lịch hẹn theo username");
      setNotification({ message: "Không tìm thấy lịch hẹn cho username này!", type: "error" });
      clearNotification();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingId(appointment.id);
    setFormData({ status: appointment.status });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (appointmentId) => {
    try {
      const response = await api.put(`/api/appointments/update/${appointmentId}`, {
        status: formData.status,
      });
      const updatedAppointment = response.data.appointment;
      setAppointments(
        appointments.map((a) => (a.id === appointmentId ? updatedAppointment : a))
      );
      if (formData.status === "completed" || formData.status === "cancelled") {
        setNewAppointments((prev) => {
          const updatedNewApps = prev.filter((a) => a.id !== appointmentId);
          setNewAppointmentCount(updatedNewApps.length); // Đồng bộ khi xóa khỏi newAppointments
          return updatedNewApps;
        });
      }
      setEditingId(null);
      setNotification({ message: "Cập nhật lịch hẹn thành công!", type: "success" });
      clearNotification();
    } catch (err) {
      setError("Lỗi khi cập nhật lịch hẹn");
      setNotification({ message: "Cập nhật lịch hẹn thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch hẹn này?")) {
      try {
        await api.delete(`/api/appointments/${appointmentId}`);
        setAppointments(appointments.filter((a) => a.id !== appointmentId));
        setNewAppointments((prev) => {
          const updatedNewApps = prev.filter((a) => a.id !== appointmentId);
          setNewAppointmentCount(updatedNewApps.length); // Đồng bộ khi xóa
          return updatedNewApps;
        });
        setSelectedAppointmentId(null);
        setNotification({ message: "Xóa lịch hẹn thành công!", type: "success" });
        clearNotification();
      } catch (err) {
        setError("Lỗi khi xóa lịch hẹn");
        setNotification({ message: "Xóa lịch hẹn thất bại!", type: "error" });
        clearNotification();
      }
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      const response = await api.put(`/api/appointments/update/${appointmentId}`, {
        status: "completed",
      });
      const updatedAppointment = response.data.appointment;
      setAppointments(
        appointments.map((a) => (a.id === appointmentId ? updatedAppointment : a))
      );
      setNewAppointments((prev) => {
        const updatedNewApps = prev.filter((a) => a.id !== appointmentId);
        setNewAppointmentCount(updatedNewApps.length); // Đồng bộ khi hoàn thành
        return updatedNewApps;
      });
      setNotification({ message: "Lịch hẹn đã hoàn thành!", type: "success" });
      clearNotification();
    } catch (err) {
      setError("Lỗi khi hoàn thành lịch hẹn");
      setNotification({ message: "Hoàn thành lịch hẹn thất bại!", type: "error" });
      clearNotification();
    }
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

  const toggleDropdown = (appointmentId) => {
    setSelectedAppointmentId(selectedAppointmentId === appointmentId ? null : appointmentId);
  };

  return (
    <div className="appointment-management">
      <h2>Quản lý Lịch hẹn</h2>

      {notification.message && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      {newAppointments.length > 0 && (
        <div className="new-appointments">
          <h3>Lịch hẹn mới</h3>
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Thợ cắt tóc</th>
                <th>Dịch vụ</th>
                <th>Ngày hẹn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {newAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.user_name || "Không xác định"}</td>
                  <td>{appointment.barber_name || "Không xác định"}</td>
                  <td>{appointment.service_name || "Không xác định"}</td>
                  <td>{formatDateTime(appointment.appointment_date)}</td>
                  <td>{appointment.status}</td>
                  <td>
                    <button
                      className="complete-btn"
                      onClick={() => handleComplete(appointment.id)}
                    >
                      Hoàn thành
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Nhập username để tìm lịch hẹn"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
        />
        <button onClick={fetchAppointmentsByUsername}>Tìm kiếm</button>
        <button onClick={fetchAppointments}>Hiển thị tất cả</button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="appointment-list">
          <h3>Tất cả lịch hẹn</h3>
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Thợ cắt tóc</th>
                <th>Dịch vụ</th>
                <th>Ngày hẹn</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Đánh giá</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <React.Fragment key={appointment.id}>
                  <tr
                    onClick={() => toggleDropdown(appointment.id)}
                    className={selectedAppointmentId === appointment.id ? "selected" : ""}
                  >
                    <td>{appointment.user_name || "Không xác định"}</td>
                    <td>{appointment.barber_name || "Không xác định"}</td>
                    <td>{appointment.service_name || "Không xác định"}</td>
                    <td>{formatDateTime(appointment.appointment_date)}</td>
                    <td>
                      {editingId === appointment.id ? (
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleFormChange}
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      ) : (
                        appointment.status
                      )}
                    </td>
                    <td>{appointment.total_amount} VNĐ</td>
                    <td>
                      {appointment.rating
                        ? `${appointment.rating}/5${appointment.review_text ? ` - ${appointment.review_text}` : ""}`
                        : "Chưa đánh giá"}
                    </td>
                    <td>
                      {editingId === appointment.id ? (
                        <>
                          <button
                            className="save-btn"
                            onClick={() => handleUpdate(appointment.id)}
                          >
                            Lưu
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => setEditingId(null)}
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <span>Nhấn để xem</span>
                      )}
                    </td>
                  </tr>
                  {selectedAppointmentId === appointment.id && (
                   <div className="dropdown-modal">
                   <div className="dropdown-content">
                     <span
                       className="close-dropdown"
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedAppointmentId(null);
                       }}
                     >
                       ×
                     </span>
                     
                     <h3 style={{ marginTop: 0, marginBottom: 20 }}>Chi tiết lịch hẹn</h3>
                     
                     <div className="appointment-details">
                       <div className="detail-item">
                         <span className="detail-label">ID:</span>
                         <span className="detail-value">{appointment.id}</span>
                       </div>
                       
                       <div className="detail-item">
                         <span className="detail-label">Người dùng:</span>
                         <span className="detail-value">{appointment.user_name || "Không xác định"}</span>
                       </div>
                       
                       <div className="detail-item">
                         <span className="detail-label">Thợ cắt tóc:</span>
                         <span className="detail-value">{appointment.barber_name || "Không xác định"}</span>
                       </div>
                       
                       <div className="detail-item">
                         <span className="detail-label">Dịch vụ:</span>
                         <span className="detail-value">{appointment.service_name || "Không xác định"}</span>
                       </div>
                       
                       <div className="detail-item">
                         <span className="detail-label">Ngày hẹn:</span>
                         <span className="detail-value">{formatDateTime(appointment.appointment_date)}</span>
                       </div>
                       
                       <div className="detail-item">
                         <span className="detail-label">Trạng thái:</span>
                         <span className="detail-value">{appointment.status}</span>
                       </div>
                       
                       <div className="detail-item">
                         <span className="detail-label">Tổng tiền:</span>
                         <span className="detail-value">{appointment.total_amount} VNĐ</span>
                       </div>
                       
                       <div className="detail-item">
                         <span className="detail-label">Đánh giá:</span>
                         <span className="detail-value">{appointment.rating ? `${appointment.rating}/5` : "Chưa đánh giá"}</span>
                       </div>
                       
                       <div className="review-section">
                         <span className="detail-label">Nội dung đánh giá:</span>
                         <p className="detail-value" style={{ margin: '5px 0' }}>{appointment.review_text || "Không có"}</p>
                       </div>
                     </div>
                     
                     <div className="dropdown-actions">
                       <button
                         className="delete-btn"
                         onClick={(e) => {
                           e.stopPropagation();
                           handleDelete(appointment.id);
                         }}
                       >
                         Xóa
                       </button>
                     </div>
                   </div>
                 </div>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;