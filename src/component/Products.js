import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getToken } from "../utils/tokenStorage";
import styled from "styled-components";
import { useCart } from "../CartContext";
import { FaShoppingCart } from "react-icons/fa";
import "./Products.css";

const Products = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortOrder, setSortOrder] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = await getToken();
        const response = await api.get("/api/products/getall");
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Đã có lỗi xảy ra khi tải sản phẩm");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    const intPrice = Math.floor(Number(price));
    return intPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VND";
  };

  const filterAndSortProducts = () => {
    let result = [...products];
    if (priceRange.min || priceRange.max) {
      const min = priceRange.min ? parseFloat(priceRange.min) : 0;
      const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      result = result.filter(
        (product) => product.price >= min && product.price <= max
      );
    }
    if (sortOrder === "asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      result.sort((a, b) => b.price - a.price);
    }
    if (searchTerm) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(result);
  };

  const handlePriceChange = (e) => {
    setPriceRange({ ...priceRange, [e.target.name]: e.target.value });
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    filterAndSortProducts();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filteredSuggestions = products.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
    filterAndSortProducts();
  };

  const handleSuggestionClick = (productName) => {
    setSearchTerm(productName);
    setSuggestions([]);
    filterAndSortProducts();
  };

  const handleIconClick = () => {
    setIsSearchExpanded(true);
    searchRef.current.querySelector(".input").focus();
  };

  const handleProductClick = (product) => {
    navigate(`/ProductDetail/${product.name}`, { state: { product } });
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setShowNotification(product.name);
    setTimeout(() => setShowNotification(null), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestions([]);
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Thay thế phần loading bằng loader mới
  if (loading) {
    return (
      <div className="loader-overlay">
        <div className="loader">
          <span className="loader-text">Đang tải...</span>
          <span className="load"></span>
        </div>
      </div>
    );
  }

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="products-container">
      <h1 className="header-title">Danh sách sản phẩm</h1>
      <div className="controls-section">
        <div className="filter-section">
          <button
            className="toggle-filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
          </button>
          {showFilters && (
            <div className="filters">
              <form onSubmit={handleApplyFilters} className="filter-form">
                <div className="price-filter">
                  <input
                    type="number"
                    name="min"
                    value={priceRange.min}
                    onChange={handlePriceChange}
                    placeholder="Giá tối thiểu (VND)"
                    min="0"
                  />
                  <input
                    type="number"
                    name="max"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                    placeholder="Giá tối đa (VND)"
                    min="0"
                  />
                </div>
                <div className="sort-filter">
                  <select value={sortOrder} onChange={handleSortChange}>
                    <option value="">Sắp xếp mặc định</option>
                    <option value="asc">Giá: Thấp đến Cao</option>
                    <option value="desc">Giá: Cao đến Thấp</option>
                  </select>
                </div>
                <button type="submit" className="apply-filter-btn">
                  Áp dụng
                </button>
              </form>
            </div>
          )}
        </div>
        <StyledWrapper className="search-container" ref={searchRef}>
          <div className="input-container">
            <input
              type="text"
              name="text"
              className={`input ${isSearchExpanded ? "expanded" : ""}`}
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="icon"
              onClick={handleIconClick}
            >
              <rect fill="white" height={24} width={24} />
              <path
                d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM9 11.5C9 10.1193 10.1193 9 11.5 9C12.8807 9 14 10.1193 14 11.5C14 12.8807 12.8807 14 11.5 14C10.1193 14 9 12.8807 9 11.5ZM11.5 7C9.01472 7 7 9.01472 7 11.5C7 13.9853 9.01472 16 11.5 16C12.3805 16 13.202 15.7471 13.8957 15.31L15.2929 16.7071C15.6834 17.0976 16.3166 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L15.31 13.8957C15.7471 13.202 16 12.3805 16 11.5C16 9.01472 13.9853 7 11.5 7Z"
                clipRule="evenodd"
                fillRule="evenodd"
              />
            </svg>
          </div>
          {searchTerm && isSearchExpanded && (
            <ul className="suggestions">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion) => (
                  <li
                    key={suggestion.name}
                    onClick={() => handleSuggestionClick(suggestion.name)}
                    className="suggestion-item"
                  >
                    {suggestion.image_url && (
                      <img
                        src={suggestion.image_url}
                        alt={suggestion.name}
                        className="suggestion-image"
                      />
                    )}
                    <span>{suggestion.name}</span>
                  </li>
                ))
              ) : (
                <li className="no-suggestions">Không tìm thấy sản phẩm</li>
              )}
            </ul>
          )}
        </StyledWrapper>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p>Không tìm thấy sản phẩm nào phù hợp.</p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.name}
              className="product-card"
              onClick={() => handleProductClick(product)}
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="product-image"
                />
              )}
              <div className="product-content">
                <h2>{product.name}</h2>
                <div className="product-footer">
                  <p className="price">Giá: {formatPrice(product.price)}</p>
                  <p className="stock">Còn lại: {product.stock} sản phẩm</p>
                </div>
                <button
                  className="add-to-cart-btn"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  <FaShoppingCart className="cart-icon" /> Thêm vào giỏ
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showNotification && (
        <div className="notification-dropdown">
          <p>{`Sản phẩm ${showNotification} đã được thêm vào giỏ hàng!`}</p>
        </div>
      )}
    </div>
  );
};

const StyledWrapper = styled.div`
  position: relative;
`;

export default Products;