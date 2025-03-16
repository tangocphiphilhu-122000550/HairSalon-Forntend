import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { setToken, setUsername } from "../utils/tokenStorage";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ReCAPTCHA from "react-google-recaptcha"; // Import reCAPTCHA
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
  const [captchaToken, setCaptchaToken] = useState(null); // Lưu token từ reCAPTCHA
  const recaptchaRef = useRef(); // Ref để reset reCAPTCHA

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
    setCaptchaToken(null); // Reset CAPTCHA sau khi submit
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  // Hàm xử lý khi người dùng xác minh CAPTCHA
  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Kiểm tra xem CAPTCHA đã được xác minh chưa
    if (!captchaToken) {
      setMessage("Vui lòng xác minh rằng bạn không phải robot!");
      setMessageType("error");
      return;
    }

    try {
      const endpoint = isLogin ? "/login" : "/register";
      const data = isLogin
        ? { username: form.username, password: form.password, captchaToken }
        : {
            username: form.username,
            email: form.email,
            password: form.password,
            phone: form.phone,
            captchaToken,
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
        {/* Left panel (Image + Button) */}
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
              {isLogin ? "Register" : "Login"}
            </button>
          </div>
        </div>

        {/* Right panel (Login/Register/Forgot Password Form) */}
        <div
          className="form-panel right-panel"
          style={{
            order: isMobile ? "2" : "unset",
          }}
        >
          {showForgotPassword ? (
            <form className="form" onSubmit={handleForgotPassword}>
              <h2>Forgot Password</h2>
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
                  Back to Login
                </a>
              </p>
            </form>
          ) : isLogin ? (
            <form className="form" onSubmit={handleSubmit}>
              <h2>Login here.</h2>
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
                Forgot Password?
              </a>
              <div className="recaptcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LdIDvYqAAAAABWhCliKOkTk3lG4L4WpzRfsvfJT" // Site Key từ Google reCAPTCHA
                  onChange={handleCaptchaChange}
                />
              </div>
              <button type="submit">Login</button>
            </form>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <h2>Register here.</h2>
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
                  sitekey="6LdIDvYqAAAAABWhCliKOkTk3lG4L4WpzRfsvfJT" // Site Key từ Google reCAPTCHA
                  onChange={handleCaptchaChange}
                />
              </div>
              <button type="submit">Register</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;