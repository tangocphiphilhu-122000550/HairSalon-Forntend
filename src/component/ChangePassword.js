import React, { useState, useEffect } from "react";
import api from "../utils/api"; // Import instance axios đã cấu hình
import { FaCheck, FaHome, FaArrowLeft } from "react-icons/fa"; // Import icons
import "./ChangePassword.css"; // Import file CSS
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const navigate = useNavigate();

    // Xử lý hiển thị thông báo thành công và tự động chuyển trang
    useEffect(() => {
        let timer;
        if (showSuccessPopup) {
            timer = setTimeout(() => {
                navigate("/"); // Điều hướng về trang chủ sau 2 giây
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [showSuccessPopup, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới không khớp!");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post(
                "https://hairsalon-m4jx.onrender.com/api/auth/change-password",
                { oldPassword, newPassword }
            ); // Không cần thêm header vì api.js đã tự động lấy token từ IndexedDB

            setSuccess(response.data.message);
            setShowSuccessPopup(true); // Hiển thị popup thành công
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.response?.data?.message || "Đã có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToHome = () => {
        navigate("/"); // Điều hướng về trang chủ
    };

    return (
        <div className="change-password-page">
            {/* Nút quay lại trang chủ ở góc trái phía trên */}
            <button className="back-to-home-button" onClick={handleBackToHome}>
                <FaArrowLeft /> Trang chủ
            </button>

            <div className="change-password-container">
                <h2>Đổi Mật Khẩu</h2>

                {error && <p className="error-message">{error}</p>}
                {success && !showSuccessPopup && <p className="success-message">{success}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Mật khẩu cũ</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Nhập lại mật khẩu mới</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                </form>
            </div>

            {/* Popup thông báo thành công */}
            {showSuccessPopup && (
                <div className="success-popup-overlay">
                    <div className="success-popup">
                        <div className="success-icon">
                            <FaCheck />
                        </div>
                        <h3>Thành công!</h3>
                        <p>{success}</p>
                        <p className="redirect-message">Chuyển hướng về trang chủ trong 2 giây...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangePassword;