import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { setToken, setUsername } from "../utils/tokenStorage";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Auth.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';

const API_URL = "https://hairsalon-m4jx.onrender.com/api/auth";

// Background image path from public folder
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
  const [messageType, setMessageType] = useState("success"); // success or error

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
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
      setMessage(error.response?.data?.message || "An error occurred");
      setMessageType("error");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.post(`${API_URL}/forgot-password`, { email: forgotEmail });
      setMessage(res.data.message);
      setMessageType("success");
      setForgotEmail("");
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
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
        style={isMobile ? {flexDirection: 'column'} : {}}
      >
        {/* Left panel (Image + Button) */}
        <div 
          className="overlay-panel left-panel"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            order: isMobile ? '1' : 'unset'
          }}
        >
          <div className="overlay-content">
            <h1>Hello friends</h1>
            <p>If you {isLogin ? "don't have an account, register here" : "already have an account, login here"}</p>
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
            order: isMobile ? '2' : 'unset'
          }}
        >
          {showForgotPassword ? (
            <form className="form" onSubmit={handleForgotPassword}>
              <h2>Forgot Password</h2>
              {message && <div className={`message ${messageType === "error" ? "error" : ""}`}>{message}</div>}
              <input
                type="email"
                placeholder="Your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <button type="submit">Send Request</button>
              <p>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPassword(false);
                }}>
                  Back to Login
                </a>
              </p>
            </form>
          ) : isLogin ? (
            <form className="form" onSubmit={handleSubmit}>
              <h2>Login here.</h2>
              {message && <div className={`message ${messageType === "error" ? "error" : ""}`}>{message}</div>}
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
              <a href="#" onClick={(e) => {
                e.preventDefault();
                setShowForgotPassword(true);
              }}>
                Forgot Password?
              </a>
              <button type="submit">Login</button>
              
             
            </form>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <h2>Register here.</h2>
              {message && <div className={`message ${messageType === "error" ? "error" : ""}`}>{message}</div>}
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
              <button type="submit">Register</button>
              
             
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;