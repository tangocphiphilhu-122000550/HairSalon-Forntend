import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaStar } from "react-icons/fa"; // Thêm FaStar
import api from "../utils/api";
import { useCart } from "../CartContext";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { product } = state || {};
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/api/orders/${product.id}`);
        setReviews(response.data);
        setLoadingReviews(false);
      } catch (err) {
        setErrorReviews("Không thể tải đánh giá: " + (err.response?.data?.message || err.message));
        setLoadingReviews(false);
      }
    };

    if (product) fetchReviews();
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleBuyNow = () => {
    localStorage.setItem("cart", JSON.stringify([{ product_name: product.name, quantity, price: product.price }]));
    navigate("/cart");
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  if (!product) return <div>Sản phẩm không tồn tại</div>;

  return (
    <div className="product-detail-wrapper">
      <div className="product-detail">
        <div className="product-info">
          <img src={product.image_url} alt={product.name} className="product-image" />
          <div className="product-details">
            <h1>{product.name}</h1>
            <div className="quantity-control">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
            <p className="price">Giá Sản Phẩm: {product.price} VND</p>
            <div className="button-group">
              <button className="add-to-cart" onClick={handleAddToCart}>
                <FaShoppingCart className="cart-icon" /> Thêm vào giỏ hàng
              </button>
              <button className="buy-now" onClick={handleBuyNow}>
                Đặt mua
              </button>
            </div>
          </div>
        </div>

        {showNotification && (
          <div className="notification-dropdown">
            <p>{`Sản phẩm ${product.name} đã được thêm vào giỏ hàng!`}</p>
          </div>
        )}

        <div className="description-section">
          <h2>Thông tin chi tiết</h2>
          <p className="description">{product.description || "Không có mô tả"}</p>
        </div>

        <div className="reviews-section">
          <h2>Đánh giá sản phẩm</h2>
          {loadingReviews ? (
            <p>Đang tải đánh giá...</p>
          ) : errorReviews ? (
            <p className="error">{errorReviews}</p>
          ) : reviews.length === 0 ? (
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          ) : (
            <ul className="reviews-list">
              {reviews.map((review) => (
                <li key={review.id} className="review-item">
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={star <= review.rating ? "star-filled" : "star-empty"}
                      />
                    ))}
                  </div>
                  <p className="comment">{review.comment || "Không có bình luận"}</p>
                  <p className="user">Người đánh giá: {review.user_name || "Ẩn danh"}</p>
                  <p className="date">Ngày: {new Date(review.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;