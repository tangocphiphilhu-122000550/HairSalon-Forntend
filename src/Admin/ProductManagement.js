import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import api from "../utils/api";
import "./ProductManagement.css";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", price: "", description: "", stock: "" });
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [confirmAction, setConfirmAction] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({ name: "", price: "", description: "", stock: "", image: null });

  const clearNotification = () => {
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/products/getall");
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      setNotification({ message: "Không thể lấy danh sách sản phẩm!", type: "error" });
      clearNotification();
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredProducts(products);
      setSuggestions([]);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setFilteredProducts(filtered);
    }
  };

  const handleSuggestionClick = (product) => {
    setFilteredProducts([product]);
    setSearchTerm(product.name);
    setSuggestions([]);
  };

  const handleEdit = (product) => {
    setEditProduct(product.name);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || "",
      stock: product.stock,
    });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setAddFormData({ ...addFormData, image: files[0] });
    } else {
      setAddFormData({ ...addFormData, [name]: value });
    }
  };

  const handleAddProduct = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", addFormData.name);
      formDataToSend.append("price", addFormData.price);
      formDataToSend.append("stock", addFormData.stock);
      formDataToSend.append("description", addFormData.description);
      if (addFormData.image) {
        formDataToSend.append("image", addFormData.image);
      }

      const res = await api.post("/api/products/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newProduct = res.data.product;
      setProducts([newProduct, ...products]);
      setFilteredProducts([newProduct, ...filteredProducts]);
      setShowAddForm(false);
      setAddFormData({ name: "", price: "", description: "", stock: "", image: null });
      setNotification({ message: "Thêm sản phẩm thành công!", type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      setNotification({ message: "Thêm sản phẩm thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleUpdate = async (name) => {
    try {
      const res = await api.put(`/api/products/${name}`, formData);
      const updatedProduct = res.data.product;
      setProducts(products.map((p) => (p.name === name ? updatedProduct : p)));
      setFilteredProducts(filteredProducts.map((p) => (p.name === name ? updatedProduct : p)));
      setEditProduct(null);
      setNotification({ message: `Cập nhật sản phẩm thành công!`, type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      setNotification({ message: "Cập nhật sản phẩm thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleDelete = async (name) => {
    try {
      await api.delete(`/api/products/${name}`);
      setProducts(products.filter((p) => p.name !== name));
      setFilteredProducts(filteredProducts.filter((p) => p.name !== name));
      setNotification({ message: `Xóa sản phẩm thành công!`, type: "success" });
      clearNotification();
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      setNotification({ message: "Xóa sản phẩm thất bại!", type: "error" });
      clearNotification();
    }
  };

  const handleConfirmUpdate = (name) => {
    setConfirmAction({
      type: "update",
      name,
      message: `Bạn có chắc chắn muốn cập nhật sản phẩm ${name}?`,
    });
  };

  const handleConfirmDelete = (name) => {
    setConfirmAction({
      type: "delete",
      name,
      message: `Bạn có chắc chắn muốn xóa sản phẩm ${name}?`,
    });
  };

  const handleConfirmAdd = () => {
    setConfirmAction({
      type: "add",
      message: "Bạn có chắc chắn muốn thêm sản phẩm này?",
    });
  };

  const confirmActionHandler = () => {
    if (confirmAction.type === "update") {
      handleUpdate(confirmAction.name);
    } else if (confirmAction.type === "delete") {
      handleDelete(confirmAction.name);
    } else if (confirmAction.type === "add") {
      handleAddProduct();
    }
    setConfirmAction(null);
  };

  const cancelActionHandler = () => {
    setConfirmAction(null);
  };

  const toggleDescription = (name) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="product-management-tab">
      <h2>Quản lý Sản phẩm</h2>
      <div className="product-management-header">
        <div className="product-search-container">
          <form className="product-search-form">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="product-search-input"
            />
            <button type="submit" className="product-search-btn" disabled>
              <FaSearch />
            </button>
          </form>
          {suggestions.length > 0 && (
            <ul className="product-suggestions-dropdown">
              {suggestions.map((product) => (
                <li
                  key={product.name}
                  onClick={() => handleSuggestionClick(product)}
                  className="product-suggestion-item"
                >
                  {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="product-add-btn"
          onClick={() => setShowAddForm(true)}
        >
          Thêm sản phẩm
        </button>
      </div>

      {showAddForm && (
        <div className="product-add-form">
          <h3>Thêm sản phẩm mới</h3>
          <input
            type="text"
            name="name"
            value={addFormData.name}
            onChange={handleAddFormChange}
            placeholder="Tên sản phẩm"
            className="product-add-input"
          />
          <input
            type="number"
            name="price"
            value={addFormData.price}
            onChange={handleAddFormChange}
            placeholder="Giá (VNĐ)"
            className="product-add-input"
          />
          <input
            type="number"
            name="stock"
            value={addFormData.stock}
            onChange={handleAddFormChange}
            placeholder="Số lượng tồn kho"
            className="product-add-input"
          />
          <textarea
            name="description"
            value={addFormData.description}
            onChange={handleAddFormChange}
            placeholder="Mô tả"
            className="product-add-textarea"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleAddFormChange}
            className="product-add-file"
          />
          <div className="product-edit-actions">
            <button
              className="product-save-btn"
              onClick={handleConfirmAdd}
            >
              Thêm
            </button>
            <button
              className="product-cancel-btn"
              onClick={() => setShowAddForm(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {notification.message && (
        <div className={`product-notification ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      {confirmAction && (
        <div className="product-confirmation">
          <p>{confirmAction.message}</p>
          <div className="product-confirmation-actions">
            <button className="product-confirm-btn" onClick={confirmActionHandler}>
              Xác nhận
            </button>
            <button className="product-cancel-btn" onClick={cancelActionHandler}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="product-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.name} className="product-item">
                {editProduct === product.name ? (
                  <div className="product-edit-form">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Tên sản phẩm"
                      className="product-edit-input"
                    />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      placeholder="Giá (VNĐ)"
                      className="product-edit-input"
                    />
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleFormChange}
                      placeholder="Số lượng tồn kho"
                      className="product-edit-input"
                    />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Mô tả"
                      className="product-edit-textarea"
                    />
                    <div className="product-edit-actions">
                      <button
                        className="product-save-btn"
                        onClick={() => handleConfirmUpdate(product.name)}
                      >
                        Lưu
                      </button>
                      <button
                        className="product-cancel-btn"
                        onClick={() => setEditProduct(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{product.name}</h3>
                    <p>Giá: {product.price} VNĐ</p>
                    <p>Số lượng tồn kho: {product.stock}</p>
                    <p
                      className={`product-description ${expandedDescriptions[product.name] ? "expanded" : "collapsed"}`}
                      onClick={() => toggleDescription(product.name)}
                    >
                      Mô tả: {product.description || "Chưa có"}
                      {!expandedDescriptions[product.name] && product.description && (
                        <span className="product-see-more">... Xem thêm</span>
                      )}
                    </p>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="product-image1"
                      />
                    )}
                    <div className="product-actions">
                      <button
                        className="product-edit-btn"
                        onClick={() => handleEdit(product)}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        className="product-delete-btn"
                        onClick={() => handleConfirmDelete(product.name)}
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>Không tìm thấy sản phẩm nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;