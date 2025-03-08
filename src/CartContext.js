import React, { createContext, useState, useContext, useEffect } from "react";
import { getToken } from "./utils/tokenStorage"; // Import getToken để kiểm tra trạng thái đăng nhập

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const token = getToken(); // Kiểm tra token ngay khi khởi tạo
    return token ? savedCart : []; // Nếu không có token (chưa đăng nhập), trả về giỏ hàng rỗng
  });

  // Đồng bộ giỏ hàng với localStorage khi cart thay đổi
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = (product, quantity) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.product_name === product.name);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.product_name === product.name
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product_name: product.name, quantity, price: product.price }];
    });
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productName) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_name !== productName));
  };

  // Hàm xóa toàn bộ giỏ hàng (giữ nguyên từ mã cũ của bạn)
  const clearCart = () => {
    setCart([]);
  };

  // Hàm reset giỏ hàng khi đăng xuất
  const resetCart = () => {
    setCart([]); // Đặt giỏ hàng về rỗng
    localStorage.setItem("cart", JSON.stringify([])); // Cập nhật localStorage
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, resetCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);