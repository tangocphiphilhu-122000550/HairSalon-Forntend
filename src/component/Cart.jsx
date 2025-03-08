import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { FaTrash } from "react-icons/fa";
import { getUsername } from "../utils/tokenStorage";
import { useCart } from "../CartContext"; // Import useCart
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart } = useCart(); // Lấy addToCart từ Context
  const [address, setAddress] = useState("");
  const [hasAddress, setHasAddress] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const username = await getUsername();
        if (username) {
          const response = await api.get(`/api/users/${username}`);
          const userAddress = response.data.address || "";
          setAddress(userAddress);
          setHasAddress(!!userAddress);
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await api.get("/api/products/getall");
        setProducts(response.data);
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
      }
    };

    fetchUserInfo();
    fetchProducts();
  }, []);

  const handleQuantityChange = (productName, delta) => {
    const updatedCart = cart.map((item) =>
      item.product_name === productName
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Cập nhật localStorage
    // Cập nhật giỏ hàng trong Context
    clearCart(); // Xóa giỏ hàng cũ
    updatedCart.forEach((item) =>
      addToCart({ name: item.product_name, price: item.price }, item.quantity) // Thêm lại từng sản phẩm
    );
  };

  const handleRemoveItem = (productName) => {
    removeFromCart(productName); // Gọi hàm từ Context
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const shippingFee = 30000;
  const calculateTotal = () => {
    return calculateSubtotal() + shippingFee;
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setError("Giỏ hàng trống!");
      return;
    }
    if (!hasAddress) {
      setError("Vui lòng cập nhật địa chỉ trong profile trước khi đặt hàng!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderData = {
        items: cart.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
        })),
        payment_method: "cash",
      };
      await api.post("/api/orders/create", orderData);
      clearCart(); // Xóa giỏ hàng từ Context
      alert("Đặt hàng thành công!");
      navigate("/OrderHistory");
    } catch (err) {
      setError(err.response?.data?.message || "Đã có lỗi xảy ra khi đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (productName) => {
    const product = products.find((p) => p.name === productName);
    return product?.image_url || "";
  };

  return (
    <div className="cart-wrapper">
      <div className="cart-container">
        <h1>Đặt hàng</h1>
        {error && <p className="error">{error}</p>}
        {cart.length === 0 ? (
          <p>Giỏ hàng của bạn đang trống.</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.product_name} className="cart-item">
                  <img
                    src={getProductImage(item.product_name)}
                    alt={item.product_name}
                    className="cart-item-image"
                  />
                  <div className="item-info">
                    <h3>{item.product_name}</h3>
                    <p>Giá: {item.price} VND</p>
                    <div className="quantity-control1">
                      <button onClick={() => handleQuantityChange(item.product_name, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.product_name, 1)}>+</button>
                    </div>
                  </div>
                  <FaTrash className="remove-icon" onClick={() => handleRemoveItem(item.product_name)} />
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h3>Thông tin giao hàng</h3>
              {hasAddress ? (
                <p className="address-display">Địa chỉ: {address}</p>
              ) : (
                <p className="address-warning">
                  Vui lòng <Link to="/profile">cập nhật địa chỉ</Link> trong profile trước khi đặt hàng!
                </p>
              )}
              <p>Phương thức thanh toán: Thanh toán khi nhận hàng</p>
              <div className="total-section">
                <p>Tiền tạm tính: {calculateSubtotal()} VND</p>
                <p>Phí vận chuyển: {shippingFee} VND</p>
                <p className="total-amount">Tổng tiền: {calculateTotal()} VND</p>
              </div>
              <button className="place-order-btn" onClick={handlePlaceOrder} disabled={loading || !hasAddress}>
                {loading ? "Đang xử lý..." : "Đặt hàng"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;