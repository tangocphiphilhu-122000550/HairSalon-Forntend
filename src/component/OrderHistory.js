import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import "./OrderHistory.css";

const StarRating = ({ rating, onChange }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "star selected" : "star"}
          onClick={() => onChange(star)}
        >
          ⭐
        </span>
      ))}
    </div>
  );
};

const OrderHistory = () => {
  const { state } = useLocation();
  const [orders, setOrders] = useState(state?.orders || []);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewData, setReviewData] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await api.get("/api/orders/by-username");
        if (!Array.isArray(response.data)) {
          throw new Error("Dữ liệu trả về không hợp lệ");
        }
        // Sắp xếp orders theo id giảm dần (lớn nhất lên đầu)
        const sortedOrders = response.data.sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders); // Ban đầu hiển thị toàn bộ đơn hàng
        setLoading(false);
      } catch (err) {
        setError("Không thể tải lịch sử đặt hàng: " + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  // Hàm tìm kiếm theo mã đơn hàng
  const handleSearch = () => {
    let result = [...orders];

    if (searchTerm.trim() !== "") {
      const searchNumber = parseInt(searchTerm.replace("#", ""), 10);
      if (!isNaN(searchNumber) && searchNumber >= 1 && searchNumber <= orders.length) {
        result = [orders[searchNumber - 1]];
      } else {
        result = [];
      }
    }

    setFilteredOrders(result);
  };

  // Hàm lọc theo ngày
  const handleDateFilter = () => {
    let result = [...orders];

    if (startDate || endDate) {
      result = result.filter((order) => {
        const orderDate = new Date(order.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          return orderDate >= start && orderDate <= end;
        } else if (start) {
          return orderDate >= start;
        } else if (end) {
          return orderDate <= end;
        }
        return true;
      });
    }

    setFilteredOrders(result);
  };

  // Reset về toàn bộ đơn hàng khi xóa searchTerm và không có bộ lọc ngày
  useEffect(() => {
    if (searchTerm.trim() === "" && !startDate && !endDate) {
      setFilteredOrders(orders);
    }
  }, [searchTerm, startDate, endDate, orders]);

  const handleReviewChange = (orderId, productId, field, value) => {
    setReviewData((prev) => {
      const existingReview = prev.find((r) => r.orderId === orderId && r.productId === productId);
      if (existingReview) {
        return prev.map((r) =>
          r.orderId === orderId && r.productId === productId ? { ...r, [field]: value } : r
        );
      }
      return [...prev, { orderId, productId, [field]: value }];
    });
  };

  const getReview = (orderId, productId) =>
    reviewData.find((r) => r.orderId === orderId && r.productId === productId) || {};

  const updateOrderWithReview = (orderId, productId, review) => {
    return orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            items: o.items.map((i) =>
              i.product_id === productId ? { ...i, review } : i
            ),
          }
        : o
    );
  };

  const handleSubmitReview = async (orderId, productId) => {
    const review = getReview(orderId, productId);
    if (!review.rating) {
      alert("Vui lòng chọn điểm đánh giá từ 1 đến 5!");
      return;
    }

    setSubmitting(true);
    try {
      const reviewPayload = {
        order_id: orderId,
        product_id: productId,
        rating: review.rating,
        comment: review.comment || "",
      };

      await api.post("/api/orders/reviews/create", reviewPayload);
      alert("Đánh giá sản phẩm thành công!");

      const updatedOrders = updateOrderWithReview(orderId, productId, {
        rating: review.rating,
        comment: review.comment,
      });
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders); // Cập nhật cả danh sách lọc
      setReviewData((prev) => prev.filter((r) => !(r.orderId === orderId && r.productId === productId)));
    } catch (err) {
      alert("Lỗi khi gửi đánh giá: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Đang tải lịch sử đặt hàng...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!orders.length) return <div>Chưa có đơn hàng nào.</div>;

  return (
    <div className="order-history-wrapper">
      <h1>Lịch sử đặt hàng</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Nhập mã đơn hàng (VD: #1, #2)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-icon" onClick={handleSearch}>
          🔍
        </span>
      </div>
      <div className="date-filter-container">
        <label>Từ ngày:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="date-input"
        />
        <label>Đến ngày:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="date-input"
        />
        <button className="apply-filter-btn" onClick={handleDateFilter}>
          Áp dụng
        </button>
      </div>
      {filteredOrders.length === 0 && (searchTerm || startDate || endDate) ? (
        <div className="no-results">
          Không tìm thấy đơn hàng nào khớp với điều kiện tìm kiếm
        </div>
      ) : (
        <ul className="order-list">
          {filteredOrders.map((order) => (
            <li key={order.id} className="order-item">
              <p>Mã đơn hàng: #{orders.indexOf(order) + 1}</p>
              <p>Tổng tiền: {order.total_amount} VND</p>
              <p>Trạng thái: {order.status}</p>
              <p>Ngày đặt: {new Date(order.created_at).toLocaleDateString()}</p>
              <p>Phương thức thanh toán: {order.payment_method}</p>
              <h3>Sản phẩm:</h3>
              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={item.product_id}>
                    <p>Tên sản phẩm: {item.product_name}</p>
                    <p>Số lượng: {item.quantity}</p>
                    <p>Giá: {item.price_at_time} VND</p>
                    {item.review ? (
                      <p>
                        Đánh giá: <StarRating rating={item.review.rating} onChange={() => {}} /> -{" "}
                        {item.review.comment}
                      </p>
                    ) : order.status === "completed" ? (
                      <div className="review-form">
                        <label>Điểm đánh giá:</label>
                        <StarRating
                          rating={getReview(order.id, item.product_id).rating || 0}
                          onChange={(value) =>
                            handleReviewChange(order.id, item.product_id, "rating", value)
                          }
                        />
                        <label>Bình luận:</label>
                        <textarea
                          value={getReview(order.id, item.product_id).comment || ""}
                          onChange={(e) =>
                            handleReviewChange(order.id, item.product_id, "comment", e.target.value)
                          }
                        />
                        <button
                          onClick={() => handleSubmitReview(order.id, item.product_id)}
                          disabled={submitting}
                        >
                          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                      </div>
                    ) : (
                      <p>Chưa thể đánh giá (đơn hàng chưa hoàn thành)</p>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;