import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { setToken, setUsername } from "../utils/tokenStorage";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ReCAPTCHA from "react-google-recaptcha";
import "./Auth.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons";

const API_URL = "https://hairsalon-m4jx.onrender.com/api/auth";
const backgroundImage = "/login.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
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
  const [messageType, setMessageType] = useState("success");
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => setMessage("");
  }, [isLogin, showForgotPassword]);

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
    setCaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  // Hàm kiểm tra định dạng username
  const isValidUsername = (username) => {
    // Biểu thức chính quy: chỉ cho phép chữ cái không dấu (a-z, A-Z), số (0-9), và không có khoảng trắng
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Kiểm tra CAPTCHA
    if (!captchaToken) {
      setMessage("Vui lòng xác minh rằng bạn không phải robot!");
      setMessageType("error");
      return;
    }

    // Kiểm tra username khi đăng ký
    if (!isLogin) {
      if (!isValidUsername(form.username)) {
        setMessage("Username không hợp lệ! Chỉ được dùng chữ cái không dấu và số, không có khoảng trắng.");
        setMessageType("error");
        return;
      }
    }

    try {
      const endpoint = isLogin ? "/login" : "/register";
      const data = isLogin
        ? { username: form.username, password: form.password, recaptchaToken: captchaToken }
        : {
            username: form.username,
            email: form.email,
            password: form.password,
            phone: form.phone,
            recaptchaToken: captchaToken,
          };

      const res = await api.post(`${API_URL}${endpoint}`, data, {
        withCredentials: true,
      });
      setMessage(res.data.message);
      setMessageType("success");

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
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đã xảy ra lỗi, vui lòng thử lại!";
      setMessage(errorMessage);
      setMessageType("error");
      resetForm();
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.post(
        `${API_URL}/forgot-password`,
        { email: forgotEmail },
        { withCredentials: true }
      );
      setMessage(res.data.message);
      setMessageType("success");
      setForgotEmail("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại!";
      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div
        className={`container ${!isLogin ? "right-panel-active" : ""} ${
          showForgotPassword ? "forgot-active" : ""
        }`}
        style={isMobile ? { flexDirection: "column" } : {}}
      >
        <div
          className="overlay-panel left-panel"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            order: isMobile ? "1" : "unset",
          }}
        >
          <div className="overlay-content">
            <h1>Hello friends</h1>
            <p>
              If you {isLogin ? "don't have an account, register here" : "already have an account, login here"}
            </p>
            <button
              className="ghost-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setShowForgotPassword(false);
                resetForm();
              }}
            >
              {isLogin ? "Đăng Ký" : "Đăng Nhập"}
            </button>
          </div>
        </div>

        <div
          className="form-panel right-panel"
          style={{
            order: isMobile ? "2" : "unset",
          }}
        >
          {showForgotPassword ? (
            <form className="form" onSubmit={handleForgotPassword}>
              <h2>Quên Mật Khẩu</h2>
              {message && (
                <div className={`message ${messageType === "error" ? "error" : ""}`}>
                  {message}
                </div>
              )}
              <input
                type="email"
                placeholder="Your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <button type="submit">Send Request</button>
              <p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(false);
                  }}
                >
                  Quay Về Đăng Nhập
                </a>
              </p>
            </form>
          ) : isLogin ? (
            <form className="form" onSubmit={handleSubmit}>
              <h2>Đăng Nhập</h2>
              {message && (
                <div className={`message ${messageType === "error" ? "error" : ""}`}>
                  {message}
                </div>
              )}
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <span className="password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPassword(true);
                }}
              >
                Quên Mật Khẩu ?
              </a>
              <div className="recaptcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LeUJfYqAAAAAO6afJrKKKgBuNb1_08zpfNoe1kq"
                  onChange={handleCaptchaChange}
                />
              </div>
              <button type="submit">Đăng Nhập</button>
            </form>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <h2>Đăng Ký</h2>
              {message && (
                <div className={`message ${messageType === "error" ? "error" : ""}`}>
                  {message}
                </div>
              )}
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
              />
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <span className="password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
              <div className="recaptcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LeUJfYqAAAAAO6afJrKKKgBuNb1_08zpfNoe1kq"
                  onChange={handleCaptchaChange}
                />
              </div>
              <button type="submit">Đăng Ký</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;