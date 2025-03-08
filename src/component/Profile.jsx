import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Thay axios bằng api instance
import { getToken, getUsername } from "../utils/tokenStorage"; // Import từ tokenStorage
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await getToken(); // Lấy token từ IndexedDB
      const username = await getUsername(); // Lấy username từ IndexedDB

      if (!token || !username) {
        navigate("/auth");
        return;
      }

      try {
        const response = await api.get(`/api/users/${username}`); // Sử dụng api instance
        if (response.data) {
          setUser(response.data);
          setPhone(response.data.phone || "");
          setAddress(response.data.address || "");
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin user:", err);
      }
    };

    fetchUserData();
  }, [navigate]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.put(`/api/users/update/${user.username}`, { 
        phone, 
        address 
      }); // Sử dụng api instance

      if (response.status === 200) {
        showNotification("Cập nhật thành công!", "success");
        setUser((prev) => ({
          ...prev,
          phone: response.data.phone,
          address: response.data.address,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      showNotification("Cập nhật thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("avatar", file);
  
    try {
      setLoading(true);
      const response = await api.put(`/api/users/${user.username}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }); // Sử dụng api instance

      if (response.status === 200) {
        setUser((prev) => ({ ...prev, image_url: response.data.image_url }));
        showNotification("Avatar đã được cập nhật!", "success");
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      showNotification("Cập nhật avatar thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            {notification.type === "success" && (
              <div className="notification-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    fill="currentColor"
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                  />
                </svg>
              </div>
            )}
            <div className="notification-message">{notification.message}</div>
          </div>
        </div>
      )}

      <h2>Thông tin cá nhân</h2>
      <label htmlFor="avatarInput" className="avatar-wrapper">
        <img src={user.image_url || "default-avatar.png"} alt="Avatar" />
        <div className="overlay">Thay đổi avatar</div>
      </label>
      <input
        type="file"
        id="avatarInput"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarChange}
      />
      
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>User:</strong> {user.username}</p>
      
      <label><strong>Số điện thoại:</strong></label>
      <input 
        type="text" 
        value={phone} 
        onChange={(e) => setPhone(e.target.value)} 
      />

      <label><strong>Địa chỉ:</strong></label>
      <input 
        type="text" 
        value={address} 
        onChange={(e) => setAddress(e.target.value)} 
      />

      <button onClick={handleUpdateProfile} disabled={loading}>
        {loading ? "Đang cập nhật..." : "Lưu Thông Tin"}
      </button>
    </div>
  );
};

export default Profile;