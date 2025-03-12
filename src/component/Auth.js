import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { setToken, setUsername } from "../utils/tokenStorage";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Auth.css";

const API_URL = "https://hairsalon-m4jx.onrender.com/api/auth";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    return () => setMessage("");
  }, [isLogin, showForgotPassword]);

  // Hiệu ứng lật card khi chuyển đổi giữa đăng nhập và đăng ký
  useEffect(() => {
    setIsFlipped(!isLogin);
  }, [isLogin]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      phone: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const endpoint = isLogin ? "/login" : "/register";
      const data = isLogin
        ? { username: form.username, password: form.password }
        : {
            username: form.username,
            email: form.email,
            password: form.password,
            phone: form.phone,
          };
      
      const res = await api.post(`${API_URL}${endpoint}`, data);
      setMessage(res.data.message);

      if (isLogin) {
        const { token } = res.data;
        await setToken(token);
        await setUsername(form.username);

        const decodedToken = jwtDecode(token);
        const userTypeId = decodedToken.user_type_id;

        setTimeout(() => {
          if (userTypeId === 1) {
            navigate("/admin");
          } else if (userTypeId === 2) {
            navigate("/");
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        setTimeout(() => {
          setIsLogin(true);
          resetForm();
        }, 1000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.post(`${API_URL}/forgot-password`, { email: forgotEmail });
      setMessage(res.data.message);
      setForgotEmail("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div className={`card-3d-container ${showForgotPassword ? 'show-forgot' : ''}`}>
        <div className={`card-3d-wrapper ${isFlipped ? 'is-flipped' : ''}`}>
          {/* Login Card */}
          <div className="card-front">
            <div className="center-wrap">
              <form className="section text-center" onSubmit={handleSubmit}>
                <h4 className="auth-title">Đăng Nhập</h4>
                {message && <div className="message">{message}</div>}
                
                <div className="form-group">
                  <input 
                    type="text" 
                    name="username" 
                    className="form-style" 
                    placeholder="Tên đăng nhập" 
                    id="username-login" 
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                  <i className="input-icon uil uil-user"></i>
                </div>
                
                <div className="form-group mt-2">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    className="form-style" 
                    placeholder="Mật khẩu" 
                    id="password-login" 
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <i className="input-icon uil uil-lock-alt"></i>
                  <span className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? "Ẩn" : "Hiện"}
                  </span>
                </div>
                
                <button type="submit" className="btn mt-4">Đăng Nhập</button>
                
                <p className="mb-0 mt-4 text-center">
                  <a href="#" className="link" onClick={() => setShowForgotPassword(true)}>Quên mật khẩu?</a>
                </p>
                
                <p className="mb-0 mt-4 text-center">
                  Chưa có tài khoản?
                  <a href="#" className="link" onClick={() => setIsLogin(false)}>Đăng Ký</a>
                </p>
              </form>
            </div>
          </div>
          
          {/* Register Card */}
          <div className="card-back">
            <div className="center-wrap">
              <form className="section text-center" onSubmit={handleSubmit}>
                <h4 className="auth-title">Đăng Ký</h4>
                {message && <div className="message">{message}</div>}
                
                <div className="form-group">
                  <input 
                    type="text" 
                    name="username" 
                    className="form-style" 
                    placeholder="Tên đăng nhập" 
                    id="username-register" 
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                  <i className="input-icon uil uil-user"></i>
                </div>
                
                <div className="form-group mt-2">
                  <input 
                    type="email" 
                    name="email" 
                    className="form-style" 
                    placeholder="Email" 
                    id="email-register" 
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  <i className="input-icon uil uil-at"></i>
                </div>
                
                <div className="form-group mt-2">
                  <input 
                    type="text" 
                    name="phone" 
                    className="form-style" 
                    placeholder="Số điện thoại" 
                    id="phone-register" 
                    value={form.phone}
                    onChange={handleChange}
                  />
                  <i className="input-icon uil uil-phone"></i>
                </div>
                
                <div className="form-group mt-2">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    className="form-style" 
                    placeholder="Mật khẩu" 
                    id="password-register" 
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <i className="input-icon uil uil-lock-alt"></i>
                  <span className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? "Ẩn" : "Hiện"}
                  </span>
                </div>
                
                <button type="submit" className="btn mt-4">Đăng Ký</button>
                
                <p className="mb-0 mt-4 text-center">
                  Đã có tài khoản?
                  <a href="#" className="link" onClick={() => setIsLogin(true)}>Đăng Nhập</a>
                </p>
              </form>
            </div>
          </div>
          
          {/* Forgot Password Card */}
          <div className="card-forgot">
            <div className="center-wrap">
              <form className="section text-center" onSubmit={handleForgotPassword}>
                <h4 className="auth-title">Quên Mật Khẩu</h4>
                {message && <div className="message">{message}</div>}
                
                <div className="form-group">
                  <input 
                    type="email" 
                    className="form-style" 
                    placeholder="Email của bạn" 
                    id="forgot-email" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <i className="input-icon uil uil-at"></i>
                </div>
                
                <button type="submit" className="btn mt-4">Gửi Yêu Cầu</button>
                
                <p className="mb-0 mt-4 text-center">
                  <a href="#" className="link" onClick={() => setShowForgotPassword(false)}>
                    Quay lại Đăng Nhập
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;