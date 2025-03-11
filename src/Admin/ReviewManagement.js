import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import api from "../utils/api";
import "./ReviewManagement.css";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [formData, setFormData] = useState({ rating: "", comment: "" });
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [confirmAction, setConfirmAction] = useState(null);

  const clearNotification = () => {
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/reviews");
      setReviews(res.data);
      setFilteredReviews(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách review:", error);
      setNotification({ message: "Không thể lấy danh sách review!", type: "error" });
      clearNotification();
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredReviews(reviews);
      setSuggestions([]);
    } else {
      const filtered = reviews.filter((review) =>
        review.username.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setFilteredReviews(filtered);
    }
  };

  const handleSuggestionClick = (review) => {
    setFilteredReviews([review]);
    setSearchTerm(review.username);
    setSuggestions([]);
  };

  const handleEdit = (review) => {
    setEditReview(review.id);
    setFormData({ rating: review.rating, comment: review.comment });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    try {
      const res = await api.put(`/api/reviews/${id}`, formData);
      setReviews(reviews.map((r) => (r.id === id ? res.data : r)));
      setFilteredReviews(filteredReviews.map((r) => (r.id === id ? res.data : r)));
      setEditReview(null);
      setNotification({ message: `Cập nhật review thành công!`, type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi cập nhật review:", error);
      setNotification({ message: "Cập nhật review thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/reviews/${id}`);
      setReviews(reviews.filter((r) => r.id !== id));
      setFilteredReviews(filteredReviews.filter((r) => r.id !== id));
      setNotification({ message: `Xóa review thành công!`, type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi xóa review:", error);
      setNotification({ message: "Xóa review thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleConfirmUpdate = (id) => {
    setConfirmAction({
      type: "update",
      id,
      message: `Bạn có chắc chắn muốn cập nhật review này?`,
    });
  };

  const handleConfirmDelete = (id) => {
    setConfirmAction({
      type: "delete",
      id,
      message: `Bạn có chắc chắn muốn xóa review này?`,
    });
  };

  const confirmActionHandler = () => {
    if (confirmAction.type === "update") {
      handleUpdate(confirmAction.id);
    } else if (confirmAction.type === "delete") {
      handleDelete(confirmAction.id);
    }
    setConfirmAction(null);
  };

  const cancelActionHandler = () => {
    setConfirmAction(null);
  };

  return (
    <div className="reviews-tab">
      <h2>Quản lý Review</h2>
      <div className="reviews-header">
        <div className="search-container">
          <form className="search-form">
            <input
              type="text"
              placeholder="Tìm kiếm theo username..."
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
              {suggestions.map((review) => (
                <li
                  key={review.id}
                  onClick={() => handleSuggestionClick(review)}
                >
                  {review.username}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {notification.message && (
        <div className={`notification-dropdown ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

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
        <div className="reviews-list">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} className="review-card">
                {editReview === review.id ? (
                  <div className="edit-form">
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleFormChange}
                      placeholder="Điểm đánh giá (1-5)"
                      min="1"
                      max="5"
                    />
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleFormChange}
                      placeholder="Nhận xét"
                    />
                    <div className="edit-actions">
                      <button
                        className="action-btn save-btn"
                        onClick={() => handleConfirmUpdate(review.id)}
                      >
                        Lưu
                      </button>
                      <button
                        className="action-btn cancel-btn"
                        onClick={() => setEditReview(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{review.username || "Không có tên"}</h3>
                    <p>Điểm: {review.rating}</p>
                    <p>Nhận xét: {review.comment || "Chưa có"}</p>
                    <div className="review-actions">
                      <button
                        className="action-btn"
                        onClick={() => handleEdit(review)}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleConfirmDelete(review.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>Không tìm thấy review nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;