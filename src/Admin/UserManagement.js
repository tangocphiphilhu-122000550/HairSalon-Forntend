import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import api from "../utils/api";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({});

  // Lấy danh sách tất cả người dùng khi component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users/all");
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm người dùng theo username
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) {
      fetchAllUsers();
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/api/users/${searchTerm}`);
      setUsers([res.data]);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm người dùng:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Mở form chỉnh sửa người dùng
  const handleEdit = (user) => {
    setEditUser(user.username);
    setFormData({
      newUsername: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
  };

  // Xử lý thay đổi trong form chỉnh sửa
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Cập nhật thông tin người dùng
  const handleUpdate = async (username) => {
    try {
      const res = await api.put(`/api/users/update/${username}`, formData);
      setUsers(users.map((u) => (u.username === username ? res.data.user : u)));
      setEditUser(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
    }
  };

  // Xóa người dùng
  const handleDelete = async (username) => {
    if (window.confirm(`Bạn chắc chắn muốn xóa người dùng ${username}?`)) {
      try {
        await api.delete(`/api/users/delete/${username}`);
        setUsers(users.filter((u) => u.username !== username));
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
      }
    }
  };

  return (
    <div className="users-tab">
      <h2>Quản lý người dùng</h2>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Tìm kiếm theo username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">
          <FaSearch />
        </button>
      </form>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="users-list">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.username} className="user-card">
                {editUser === user.username ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      name="newUsername"
                      value={formData.newUsername}
                      onChange={handleFormChange}
                      placeholder="Username mới"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="Số điện thoại"
                    />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      placeholder="Địa chỉ"
                    />
                    <div className="edit-actions">
                      <button
                        className="action-btn save-btn"
                        onClick={() => handleUpdate(user.username)}
                      >
                        Lưu
                      </button>
                      <button
                        className="action-btn cancel-btn"
                        onClick={() => setEditUser(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{user.username}</h3>
                    <p>Email: {user.email}</p>
                    <p>Số điện thoại: {user.phone || "Chưa cập nhật"}</p>
                    <p>Địa chỉ: {user.address || "Chưa cập nhật"}</p>
                    <div className="user-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleEdit(user)}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(user.username)}
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>Không tìm thấy người dùng nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;