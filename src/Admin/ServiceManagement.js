import React, { useState, useEffect } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import api from "../utils/api";
import "./ServiceManagement.css";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editService, setEditService] = useState(null);
  const [formData, setFormData] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newService, setNewService] = useState({
    service_name: "",
    description: "",
    price: "",
    duration_minutes: "",
  });
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [confirmAction, setConfirmAction] = useState(null); // State để quản lý xác nhận hành động

  const clearNotification = () => {
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  useEffect(() => {
    fetchAllServices();
  }, []);

  const fetchAllServices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/services/getall");
      setServices(res.data);
      setFilteredServices(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", error);
      setNotification({ message: "Không thể lấy danh sách dịch vụ!", type: "error" });
      clearNotification();
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredServices(services);
      setSuggestions([]);
    } else {
      const filtered = services.filter((service) =>
        service.service_name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const handleSuggestionClick = (service) => {
    setFilteredServices([service]);
    setSearchTerm(service.service_name);
    setSuggestions([]);
  };

  const handleEdit = (service) => {
    setEditService(service.service_name);
    setFormData({
      description: service.description,
      price: service.price,
      duration_minutes: service.duration_minutes,
    });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (name) => {
    try {
      const res = await api.put(`/api/services/${name}`, formData);
      setServices(services.map((s) => (s.service_name === name ? res.data : s)));
      setFilteredServices([res.data]);
      setEditService(null);
      setNotification({ message: `Cập nhật dịch vụ ${name} thành công!`, type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi cập nhật dịch vụ:", error);
      setNotification({ message: "Cập nhật dịch vụ thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleDelete = async (name) => {
    try {
      await api.delete(`/api/services/${name}`);
      setServices(services.filter((s) => s.service_name !== name));
      setFilteredServices(filteredServices.filter((s) => s.service_name !== name));
      setNotification({ message: `Xóa dịch vụ ${name} thành công!`, type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error);
      setNotification({ message: "Xóa dịch vụ thất bại!", type: "error" });
      clearNotification();
    }
  };

  // Xử lý khi nhấn nút Update (hiển thị confirm)
  const handleConfirmUpdate = (name) => {
    setConfirmAction({
      type: "update",
      name,
      message: `Bạn có chắc chắn muốn cập nhật dịch vụ ${name}?`,
    });
  };

  // Xử lý khi nhấn nút Delete (hiển thị confirm)
  const handleConfirmDelete = (name) => {
    setConfirmAction({
      type: "delete",
      name,
      message: `Bạn có chắc chắn muốn xóa dịch vụ ${name}?`,
    });
  };

  // Xác nhận hành động từ dropdown
  const confirmActionHandler = () => {
    if (confirmAction.type === "update") {
      handleUpdate(confirmAction.name);
    } else if (confirmAction.type === "delete") {
      handleDelete(confirmAction.name);
    }
    setConfirmAction(null); // Đóng dropdown sau khi xác nhận
  };

  // Hủy hành động từ dropdown
  const cancelActionHandler = () => {
    setConfirmAction(null); // Đóng dropdown khi hủy
  };

  const handleNewServiceChange = (e) => {
    setNewService({ ...newService, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/services/create", newService);
      setServices([res.data, ...services]);
      setFilteredServices([res.data, ...filteredServices]);
      setNewService({
        service_name: "",
        description: "",
        price: "",
        duration_minutes: "",
      });
      setShowCreateForm(false);
      setNotification({ message: `Thêm dịch vụ ${res.data.service_name} thành công!`, type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      setNotification({
        message: "Thêm dịch vụ thất bại! " + (error.response?.data?.message || ""),
        type: "error",
      });
      clearNotification();
    }
  };

  return (
    <div className="services-tab">
      <h2>Quản lý dịch vụ</h2>
      <div className="services-header">
        <div className="search-container">
          <form className="search-form">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên dịch vụ..."
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
              {suggestions.map((service) => (
                <li
                  key={service.service_name}
                  onClick={() => handleSuggestionClick(service)}
                >
                  {service.service_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="create-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <FaPlus /> {showCreateForm ? "Ẩn form" : "Thêm dịch vụ"}
        </button>
      </div>

      {showCreateForm && (
        <form className="create-form" onSubmit={handleCreate}>
          <input
            type="text"
            name="service_name"
            value={newService.service_name}
            onChange={handleNewServiceChange}
            placeholder="Tên dịch vụ"
            required
          />
          <input
            type="text"
            name="description"
            value={newService.description}
            onChange={handleNewServiceChange}
            placeholder="Mô tả"
          />
          <input
            type="number"
            name="price"
            value={newService.price}
            onChange={handleNewServiceChange}
            placeholder="Giá (VNĐ)"
            required
          />
          <input
            type="number"
            name="duration_minutes"
            value={newService.duration_minutes}
            onChange={handleNewServiceChange}
            placeholder="Thời gian (phút)"
            required
          />
          <button type="submit" className="action-btn save-btn">
            Thêm
          </button>
        </form>
      )}

      {/* Dropdown thông báo kết quả */}
      {notification.message && (
        <div className={`notification-dropdown ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Dropdown xác nhận hành động */}
      {confirmAction && (
        <div className="confirmation-dropdown">
          <p>{confirmAction.message}</p>
          <div className="confirmation-actions">
            <button
              className="action-btn confirm-btn"
              onClick={confirmActionHandler}
            >
              Xác nhận
            </button>
            <button
              className="action-btn cancel-btn"
              onClick={cancelActionHandler}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="services-list">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div key={service.service_name} className="service-card">
                {editService === service.service_name ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Mô tả"
                    />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      placeholder="Giá (VNĐ)"
                    />
                    <input
                      type="number"
                      name="duration_minutes"
                      value={formData.duration_minutes}
                      onChange={handleFormChange}
                      placeholder="Thời gian (phút)"
                    />
                    <div className="edit-actions">
                      <button
                        className="action-btn save-btn"
                        onClick={() => handleConfirmUpdate(service.service_name)}
                      >
                        Lưu
                      </button>
                      <button
                        className="action-btn cancel-btn"
                        onClick={() => setEditService(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{service.service_name}</h3>
                    <p>Mô tả: {service.description || "Chưa có"}</p>
                    <p>Giá: {service.price} VNĐ</p>
                    <p>Thời gian: {service.duration_minutes} phút</p>
                    <div className="service-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleEdit(service)}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleConfirmDelete(service.service_name)}
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>Không tìm thấy dịch vụ nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;