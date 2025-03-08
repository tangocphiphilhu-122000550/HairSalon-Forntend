import React from "react";
import { FaFacebookF, FaPhoneAlt, FaClock, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="map-container">
            <h3 className="footer-heading">
              <FaMapMarkerAlt className="footer-icon" /> Vị Trí Của Chúng Tôi
            </h3>
            <div className="map-wrapper">
            <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1958.8299131213557!2d106.77606430275583!3d10.913436446912723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d900790bd8ed%3A0x7d54c985e4bfa00e!2zTmd1eeG7hW4gSG_DoGkgQmFyYmVyIHNob3A!5e0!3m2!1sen!2s!4v1740751108585!5m2!1sen!2s"
  width="600"
  height="450"
  style={{ border: 0 }}  // ✅ Đúng cú pháp JSX
  allowFullScreen=""
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>

            </div>
            <p className="address">
            290 ĐT743B, Tân Đông Hiệp, Dĩ An, Bình Dương, Vietnam

            </p>
          </div>
        </div>

        <div className="footer-center">
          <div className="footer-info">
            <h3 className="footer-heading">
              <FaClock className="footer-icon" /> Giờ Mở Cửa
            </h3>
            <ul className="opening-hours">
              <li>
                <span className="day">Thứ Hai - Thứ Sáu:</span>
                <span className="hours">8:00 - 20:00</span>
              </li>
              <li>
                <span className="day">Thứ Bảy - Chủ Nhật:</span>
                <span className="hours">8:00 - 21:00</span>
              </li>
              <li>
                <span className="day">Ngày Lễ:</span>
                <span className="hours">9:00 - 18:00</span>
              </li>
            </ul>
          </div>

          <div className="footer-info">
            <h3 className="footer-heading">
              <FaEnvelope className="footer-icon" /> Liên Hệ
            </h3>
            <ul className="contact-info">
              <li>
                <FaPhoneAlt className="contact-icon" />
                <span>0348.214.308</span>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <span>nguyenhoai@barbershop.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-brand">
            <img src="/logo.png" alt="Barbershop Nguyễn Hoài Logo" className="footer-logo" />
            <h2 className="brand-name">Barbershop Nguyễn Hoài</h2>
            <p className="brand-slogan">Nơi tạo nên phong cách của quý ông hiện đại</p>
          </div>
          
          <div className="social-media">
            <h3 className="footer-heading">Kết Nối Với Chúng Tôi</h3>
            <div className="social-icons">
              <a href="https://www.facebook.com/nguyen.van.hoai.395244" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaFacebookF />
              </a>
              <a href="https://zalo.me/0343894612" target="_blank" rel="noopener noreferrer" className="social-link">
                <SiZalo />
              </a>
              <a href="tel:0343894612" className="social-link">
                <FaPhoneAlt />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="copyright">
        <p>&copy; 2025 Barbershop Nguyễn Hoài. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;