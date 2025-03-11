import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../utils/api";
import "./BarberManagement.css";

const BarberManagement = () => {
  const [barbers, setBarbers] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: null,
    experience_years: "",
    phone: "",
    address: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  const clearNotification = () => {
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const response = await api.get("/api/barbers");
      setBarbers(response.data);
    } catch (err) {
      setError("Lỗi khi tải danh sách thợ cắt tóc");
      setNotification({ message: "Không thể tải danh sách thợ cắt tóc!", type: "error" });
      clearNotification();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date_of_birth: date });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      if (key === "date_of_birth" && formData[key]) {
        data.append(key, formData[key].toISOString().split("T")[0]);
      } else {
        data.append(key, formData[key]);
      }
    }
    if (selectedFile) {
      data.append("image", selectedFile);
    }

    try {
      if (editingId) {
        const response = await api.put(`/api/barbers/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBarbers(barbers.map((b) => (b.id === editingId ? response.data : b)));
        setNotification({ message: "Cập nhật thợ cắt tóc thành công!", type: "success" });
      } else {
        const response = await api.post("/api/barbers", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBarbers([...barbers, response.data]);
        setNotification({ message: "Thêm thợ cắt tóc thành công!", type: "success" });
      }
      resetForm();
      fetchBarbers();
      clearNotification();
    } catch (err) {
      setError("Lỗi khi lưu thông tin thợ cắt tóc");
      setNotification({ message: "Lưu thông tin thợ cắt tóc thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thợ cắt tóc này?")) {
      try {
        await api.delete(`/api/barbers/${id}`);
        setBarbers(barbers.filter((b) => b.id !== id));
        setNotification({ message: "Xóa thợ cắt tóc thành công!", type: "success" });
        clearNotification();
      } catch (err) {
        setError("Lỗi khi xóa thợ cắt tóc");
        setNotification({ message: "Xóa thợ cắt tóc thất bại!", type: "error" });
        clearNotification();
      }
    }
  };

  const handleEdit = (barber) => {
    setEditingId(barber.id);
    setFormData({
      full_name: barber.full_name,
      date_of_birth: barber.date_of_birth ? new Date(barber.date_of_birth) : null,
      experience_years: barber.experience_years,
      phone: barber.phone,
      address: barber.address,
    });
    setSelectedFile(null);
    setPreviewImage(barber.image);
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      date_of_birth: null,
      experience_years: "",
      phone: "",
      address: "",
    });
    setSelectedFile(null);
    setPreviewImage(null);
    setEditingId(null);
  };

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); // Định dạng dd/MM/yyyy
  };

  return (
    <div className="barber-management">
      <h2>Quản lý Thợ cắt tóc</h2>

      {notification.message && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="barber-form">
        <div className="form-group">
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Họ và tên"
            required
          />
        </div>
        <div className="form-group">
          <DatePicker
            selected={formData.date_of_birth}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="Chọn ngày sinh"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            maxDate={new Date()}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            name="experience_years"
            value={formData.experience_years}
            onChange={handleInputChange}
            placeholder="Số năm kinh nghiệm"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Số điện thoại"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Địa chỉ"
            required
          />
        </div>
        <div className="form-group image-upload">
          <input
            type="file"
            id="image-upload"
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <div className="image-upload-container">
            <label htmlFor="image-upload" className="image-preview">
              {previewImage ? (
                <img src={previewImage} alt="Preview" />
              ) : (
                <div className="image-placeholder">Nhấn để chọn ảnh</div>
              )}
            </label>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editingId ? "Cập nhật" : "Thêm mới"}
          </button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Hủy
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="barber-list1">
        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Ngày sinh</th>
              <th>Kinh nghiệm</th>
              <th>SĐT</th>
              <th>Địa chỉ</th>
              <th>Ảnh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {barbers.map((barber) => (
              <tr key={barber.id}>
                <td>{barber.full_name}</td>
                <td>{formatDate(barber.date_of_birth)}</td> {/* Sử dụng hàm formatDate */}
                <td>{barber.experience_years} năm</td>
                <td>{barber.phone}</td>
                <td>{barber.address}</td>
                <td>
                  {barber.image && (
                    <img src={barber.image} alt={barber.full_name} className="barber-image" />
                  )}
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(barber)}>
                    Sửa
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(barber.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BarberManagement;