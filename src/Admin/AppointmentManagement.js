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
  const { newAppointmentCount, setNewAppointmentCount } = useAppointmentContext();

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
      setNewAppointmentCount(newApps.length);
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
        setNewAppointmentCount(updatedNewApps.length);
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
          setNewAppointmentCount(updatedNewApps.length);
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
          setNewAppointmentCount(updatedNewApps.length);
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
        setNewAppointmentCount(updatedNewApps.length);
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
    <div className="am10-management">
      <h2>Quản lý Lịch hẹn</h2>

      {notification.message && (
        <div className={`am10-notification ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      {newAppointments.length > 0 && (
        <div className="am10-new-appointments">
          <h3>Lịch hẹn mới</h3>
          <div className="am10-table-wrapper">
            <table className="am10-table">
              <thead className="am10-thead">
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
                  <tr key={appointment.id} className="am10-row">
                    <td data-label="Người dùng">{appointment.user_name || "Không xác định"}</td>
                    <td data-label="Thợ cắt tóc">{appointment.barber_name || "Không xác định"}</td>
                    <td data-label="Dịch vụ">{appointment.service_name || "Không xác định"}</td>
                    <td data-label="Ngày hẹn">{formatDateTime(appointment.appointment_date)}</td>
                    <td data-label="Trạng thái">{appointment.status}</td>
                    <td data-label="Hành động">
                      <button
                        className="am10-complete-btn"
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
          <div className="am10-card-view">
            {newAppointments.map((appointment) => (
              <div key={appointment.id} className="am10-card">
                <div className="am10-card-row">
                  <div className="am10-card-item">
                    <span className="am10-card-label">Người dùng:</span>
                    <span>{appointment.user_name || "Không xác định"}</span>
                  </div>
                  <div className="am10-card-item">
                    <span className="am10-card-label">Thợ cắt tóc:</span>
                    <span>{appointment.barber_name || "Không xác định"}</span>
                  </div>
                </div>
                <div className="am10-card-row">
                  <div className="am10-card-item">
                    <span className="am10-card-label">Dịch vụ:</span>
                    <span>{appointment.service_name || "Không xác định"}</span>
                  </div>
                  <div className="am10-card-item">
                    <span className="am10-card-label">Ngày hẹn:</span>
                    <span>{formatDateTime(appointment.appointment_date)}</span>
                  </div>
                </div>
                <div className="am10-card-row">
                  <div className="am10-card-item">
                    <span className="am10-card-label">Trạng thái:</span>
                    <span>{appointment.status}</span>
                  </div>
                  <div className="am10-card-item">
                    <span className="am10-card-label">Hành động:</span>
                    <button
                      className="am10-complete-btn"
                      onClick={() => handleComplete(appointment.id)}
                    >
                      Hoàn thành
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="am10-search-bar">
        <input
          type="text"
          placeholder="Nhập username để tìm lịch hẹn"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
        />
        <button className="am10-button" onClick={fetchAppointmentsByUsername}>Tìm kiếm</button>
        <button className="am10-button" onClick={fetchAppointments}>Hiển thị tất cả</button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p className="am10-error">{error}</p>
      ) : (
        <div className="am10-appointment-list">
          <h3>Tất cả lịch hẹn</h3>
          <div className="am10-table-wrapper">
            <table className="am10-table">
              <thead className="am10-thead">
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
                      className={`am10-row ${selectedAppointmentId === appointment.id ? "am10-selected" : ""}`}
                    >
                      <td data-label="Người dùng">{appointment.user_name || "Không xác định"}</td>
                      <td data-label="Thợ cắt tóc">{appointment.barber_name || "Không xác định"}</td>
                      <td data-label="Dịch vụ">{appointment.service_name || "Không xác định"}</td>
                      <td data-label="Ngày hẹn">{formatDateTime(appointment.appointment_date)}</td>
                      <td data-label="Trạng thái">
                        {editingId === appointment.id ? (
                          <select
                            className="am10-select"
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
                      <td data-label="Tổng tiền">{appointment.total_amount} VNĐ</td>
                      <td data-label="Đánh giá">
                        {appointment.rating
                          ? `${appointment.rating}/5${appointment.review_text ? ` - ${appointment.review_text}` : ""}`
                          : "Chưa đánh giá"}
                      </td>
                      <td data-label="Hành động">
                        {editingId === appointment.id ? (
                          <>
                            <button
                              className="am10-save-btn"
                              onClick={() => handleUpdate(appointment.id)}
                            >
                              Lưu
                            </button>
                            <button
                              className="am10-cancel-btn"
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
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="am10-card-view">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`am10-card ${selectedAppointmentId === appointment.id ? "am10-selected" : ""}`}
                onClick={() => toggleDropdown(appointment.id)}
              >
                <div className="am10-card-row">
                  <div className="am10-card-item">
                    <span className="am10-card-label">Người dùng:</span>
                    <span>{appointment.user_name || "Không xác định"}</span>
                  </div>
                  <div className="am10-card-item">
                    <span className="am10-card-label">Thợ cắt tóc:</span>
                    <span>{appointment.barber_name || "Không xác định"}</span>
                  </div>
                </div>
                <div className="am10-card-row">
                  <div className="am10-card-item">
                    <span className="am10-card-label">Dịch vụ:</span>
                    <span>{appointment.service_name || "Không xác định"}</span>
                  </div>
                  <div className="am10-card-item">
                    <span className="am10-card-label">Ngày hẹn:</span>
                    <span>{formatDateTime(appointment.appointment_date)}</span>
                  </div>
                </div>
                <div className="am10-card-row">
                  <div className="am10-card-item">
                    <span className="am10-card-label">Trạng thái:</span>
                    {editingId === appointment.id ? (
                      <select
                        className="am10-select"
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
                      <span>{appointment.status}</span>
                    )}
                  </div>
                  <div className="am10-card-item">
                    <span className="am10-card-label">Tổng tiền:</span>
                    <span>{appointment.total_amount} VNĐ</span>
                  </div>
                </div>
                <div className="am10-card-row">
                  <div className="am10-card-item">
                    <span className="am10-card-label">Đánh giá:</span>
                    <span>
                      {appointment.rating
                        ? `${appointment.rating}/5${appointment.review_text ? ` - ${appointment.review_text}` : ""}`
                        : "Chưa đánh giá"}
                    </span>
                  </div>
                  <div className="am10-card-item">
                    <span className="am10-card-label">Hành động:</span>
                    {editingId === appointment.id ? (
                      <>
                        <button
                          className="am10-save-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdate(appointment.id);
                          }}
                        >
                          Lưu
                        </button>
                        <button
                          className="am10-cancel-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <span>Nhấn để xem chi tiết</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAppointmentId && (
        <div className="am10-dropdown-modal">
          <div className="am10-dropdown-content">
            <span
              className="am10-close-dropdown"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAppointmentId(null);
              }}
            >
              ×
            </span>

            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Chi tiết lịch hẹn</h3>

            {appointments
              .filter((appointment) => appointment.id === selectedAppointmentId)
              .map((appointment) => (
                <div key={appointment.id} className="am10-appointment-details">
                  <div className="am10-detail-item">
                    <span className="am10-detail-label">ID:</span>
                    <span className="am10-detail-value">{appointment.id}</span>
                  </div>
                  <div className="am10-detail-item">
                    <span className="am10-detail-label">Người dùng:</span>
                    <span className="am10-detail-value">{appointment.user_name || "Không xác định"}</span>
                  </div>
                  <div className="am10-detail-item">
                    <span className="am10-detail-label">Thợ cắt tóc:</span>
                    <span className="am10-detail-value">{appointment.barber_name || "Không xác định"}</span>
                  </div>
                  <div className="am10-detail-item">
                    <span className="am10-detail-label">Dịch vụ:</span>
                    <span className="am10-detail-value">{appointment.service_name || "Không xác định"}</span>
                  </div>
                  <div className="am10-detail-item">
                    <span className="am10-detail-label">Ngày hẹn:</span>
                    <span className="am10-detail-value">{formatDateTime(appointment.appointment_date)}</span>
                  </div>
                  <div className="am10-detail-item">
                    <span className="am10-detail-label">Trạng thái:</span>
                    <span className="am10-detail-value">{appointment.status}</span>
                  </div>
                  <div className="am10-detail-item">
                    <span className="am10-detail-label">Tổng tiền:</span>
                    <span className="am10-detail-value">{appointment.total_amount} VNĐ</span>
                  </div>
                  <div className="am10-detail-item">
                    <span className="am10-detail-label">Đánh giá:</span>
                    <span className="am10-detail-value">{appointment.rating ? `${appointment.rating}/5` : "Chưa đánh giá"}</span>
                  </div>
                  <div className="am10-review-section">
                    <span className="am10-detail-label">Nội dung đánh giá:</span>
                    <p className="am10-detail-value" style={{ margin: "5px 0" }}>{appointment.review_text || "Không có"}</p>
                  </div>
                </div>
              ))}

            <div className="am10-dropdown-actions">
              <button
                className="am10-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(selectedAppointmentId);
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;