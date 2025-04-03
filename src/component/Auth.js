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
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const recaptchaRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Kiểm tra lỗi ngay khi người dùng nhập
    if (name === "username" && !isLogin) {
      setErrors((prev) => ({
        ...prev,
        username: isValidUsername(value) ? "" : "Chỉ dùng chữ cái không dấu và số, không khoảng trắng",
      }));
    }

    if (name === "password" && !isLogin) {
      setErrors((prev) => ({
        ...prev,
        password: isValidPassword(value) ? "" : "Mật khẩu chưa đủ mạnh",
      }));
    }
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      phone: "",
    });
    setErrors({ username: "", password: "" });
    setCaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  // Kiểm tra định dạng username
  const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username);
  };

  // Kiểm tra từng điều kiện mật khẩu
  const checkPasswordConditions = (password) => {
    return {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password),
    };
  };

  // Kiểm tra toàn bộ mật khẩu
  const isValidPassword = (password) => {
    const conditions = checkPasswordConditions(password);
    return conditions.minLength && conditions.hasUpperCase && conditions.hasSpecialChar;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("Vui lòng xác minh rằng bạn không phải robot!");
      return;
    }

    if (!isLogin) {
      if (!isValidUsername(form.username)) {
        setErrors((prev) => ({
          ...prev,
          username: "Chỉ dùng chữ cái không dấu và số, không khoảng trắng",
        }));
        return;
      }

      if (!isValidPassword(form.password)) {
        setErrors((prev) => ({
          ...prev,
          password: "Mật khẩu chưa đủ mạnh",
        }));
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
      alert(res.data.message);

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
      alert(errorMessage);
      resetForm();
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `${API_URL}/forgot-password`,
        { email: forgotEmail },
        { withCredentials: true }
      );
      alert(res.data.message);
      setForgotEmail("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại!";
      alert(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordConditions = checkPasswordConditions(form.password);

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
              <div className="input-container">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className={errors.username ? "input-error" : ""}
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>
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
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                  className={errors.password ? "input-error" : ""}
                />
                <span className="password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? "Hide" : "Show"}
                </span>
                {isPasswordFocused && (
                  <div className="password-conditions">
                    <span className={passwordConditions.minLength ? "valid" : "invalid"}>
                      Ít nhất 6 ký tự
                    </span>
                    <span className={passwordConditions.hasUpperCase ? "valid" : "invalid"}>
                      Có 1 chữ cái in hoa
                    </span>
                    <span className={passwordConditions.hasSpecialChar ? "valid" : "invalid"}>
                      Có 1 ký tự đặc biệt
                    </span>
                  </div>
                )}
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