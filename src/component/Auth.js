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
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [message, setMessage] = useState(""); // Thêm state cho thông báo thành công
  const [errorMessage, setErrorMessage] = useState(""); // Thêm state cho thông báo lỗi
  const recaptchaRef = useRef();
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Tự động ẩn thông báo sau 3 giây
    if (message || errorMessage) {
      const timer = setTimeout(() => {
        setMessage("");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, errorMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "username") {
      setErrors((prev) => ({
        ...prev,
        username: isValidUsername(value) ? "" : "Username chỉ được chứa chữ cái và số",
      }));
    }
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    if (name === "password") {
      setPasswordFocused(false);
    }

    if (name === "username" && value.trim() !== "") {
      setErrors((prev) => ({
        ...prev,
        username: isValidUsername(value) ? "" : "Username chỉ được chứa chữ cái và số",
      }));
    } else if (name === "username" && value.trim() === "") {
      setErrors((prev) => ({ ...prev, username: "" }));
    }

    if (name === "password" && value.trim() !== "") {
      setErrors((prev) => ({
        ...prev,
        password: isValidPassword(value) ? "" : "Mật khẩu chưa đủ mạnh",
      }));
    } else if (name === "password" && value.trim() === "") {
      setErrors((prev) => ({ ...prev, password: "" }));
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
    setTouched({ username: false, password: false });
    setCaptchaToken(null);
    setPasswordFocused(false);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username);
  };

  const checkPasswordConditions = (password) => {
    return {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
      isValid:
        password.length >= 6 &&
        /[A-Z]/.test(password) &&
        /[!@#$%^&*]/.test(password) &&
        /[0-9]/.test(password) &&
        /[a-zA-Z]/.test(password),
    };
  };

  const isValidPassword = (password) => {
    const conditions = checkPasswordConditions(password);
    return conditions.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setErrorMessage("Vui lòng xác minh rằng bạn không phải robot!");
      return;
    }

    if (!isLogin) {
      setTouched({
        username: true,
        password: true,
      });

      if (!isValidUsername(form.username)) {
        setErrors((prev) => ({
          ...prev,
          username: "Username chỉ được chứa chữ cái và số",
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

      // Hiển thị thông báo thành công
      setMessage(res.data.message);
      setErrorMessage(""); // Xóa thông báo lỗi nếu có

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
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đã xảy ra lỗi, vui lòng thử lại!";
      setErrorMessage(errorMsg); // Hiển thị thông báo lỗi
      setMessage(""); // Xóa thông báo thành công nếu có
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
      setMessage(res.data.message); // Hiển thị thông báo thành công
      setErrorMessage("");
      setForgotEmail("");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Đã xảy ra lỗi, vui lòng thử lại!";
      setErrorMessage(errorMsg); // Hiển thị thông báo lỗi
      setMessage("");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordConditions = checkPasswordConditions(form.password);
  const shouldShowPasswordConditions = passwordFocused || (form.password && touched.password);

  return (
    <div className="auth-container">
      {/* Hiển thị thông báo thành công */}
      {message && (
        <div className="notification success">
          <span>{message}</span>
        </div>
      )}
      {/* Hiển thị thông báo lỗi */}
      {errorMessage && (
        <div className="notification error">
          <span>{errorMessage}</span>
        </div>
      )}
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
              <div className="input-container">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={touched.username && errors.username ? "input-error" : ""}
                />
                {touched.username && errors.username && <span className="auth-error-message">{errors.username}</span>}
              </div>
              <div className="input-container">
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handlePasswordFocus}
                    required
                    className={touched.password && errors.password ? "input-error" : ""}
                  />
                  <span className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>
                {touched.password && errors.password && <span className="auth-error-message">{errors.password}</span>}
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
                  onBlur={handleBlur}
                  required
                  className={touched.username && errors.username ? "input-error" : ""}
                />
                {touched.username && errors.username && <span className="auth-error-message">{errors.username}</span>}
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
              <div className="input-container">
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handlePasswordFocus}
                    required
                    className={touched.password && errors.password ? "input-error" : ""}
                  />
                  <span className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>
                {touched.password && errors.password && <span className="auth-error-message">{errors.password}</span>}
                {shouldShowPasswordConditions && (
                  <div className="password-conditions">
                    <span className={passwordConditions.minLength && passwordConditions.hasLetter && passwordConditions.hasNumber ? "valid" : "invalid"}>
                      Ít nhất 6 ký tự (bao gồm chữ và số)
                    </span>
                    <span className={passwordConditions.hasUpperCase ? "valid" : "invalid"}>
                      Có 1 chữ cái in hoa
                    </span>
                    <span className={passwordConditions.hasSpecialChar ? "valid" : "invalid"}>
                      Có 1 ký tự đặc biệt (!@#$%^&*)
                    </span>
                    <span className={passwordConditions.hasNumber ? "valid" : "invalid"}>
                      Có ít nhất 1 chữ số
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