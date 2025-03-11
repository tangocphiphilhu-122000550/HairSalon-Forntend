import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Home.css";
import ReviewSlider from "./ReviewSlider";
import "./Footer.css"; // Import the Footer styles
import FeedbackForm from "./FeedbackForm";




const Home = () => {

    const navigate = useNavigate(); // Khởi tạo useNavigate
  
    const handleBookNow = () => {
      navigate("/Service"); // Chuyển hướng đến trang đặt lịch
    };
  return (
    <div className="home-container">
      


      {/* Banner lớn */}
      <div className="banner">
      <button className="cta-button" onClick={handleBookNow}>
        Đặt lịch ngay
      </button>
      </div>



      {/* Dịch vụ */}
      <section className="services">
        <div className="services-background">
          <div className="overlayhome"></div>
          <div className="services-content">
            <h2 className="services-title">Dịch Vụ Tại Barbershop Nguyễn Hoài</h2>
            <div className="services-grid1">
              <div className="service-item1">
              <img src="/CT1.png" alt="Cắt tóc" />

                <h3>Cắt Tóc Đẹp</h3>
                <p>Đội ngũ chuyên nghiệp giúp bạn có mái tóc phù hợp với phong cách cá nhân.</p>
              </div>
              <div className="service-item1">
                <img src="/CT2.png" alt="Tạo kiểu" />
                <h3>Uốn Tạo Kiểu</h3>
                <p>Uốn tóc hiện đại, phù hợp với phong cách và nhu cầu cá nhân.</p>
              </div>
              <div className="service-item1">
                <img src="/CT3.png" alt="Nhuộm tóc" />
                <h3>Nhuộm Màu Tóc</h3>
                <p>Chuyên nghiệp trong việc tạo màu tóc đẹp với kỹ thuật hiện đại.</p>
              </div>
              <div className="service-item1">
                <img src="/CT4.png" alt="Gội đầu massage" />
                <h3>Gội Đầu Massage</h3>
                <p>Thư giãn tuyệt đối với dịch vụ gội đầu massage tại Barbershop.</p>
              </div>
              <div className="service-item1">
                <img src="/CT5.png" alt="Ép tóc" />
                <h3>Ép Tóc Đẹp</h3>
                <p>Giúp bạn có mái tóc đẹp, suôn mượt với công nghệ tiên tiến.</p>
              </div>
              <div className="service-item1">
                <img src="/CT6.png" alt="Bấm khuyên tai" />
                <h3>Bấm Khuyên Tai</h3>
                <p>Chuyên nghiệp, an toàn với quy trình bấm khuyên tai nhẹ nhàng.</p>
              </div>
            </div>
          </div>
        </div>
      </section>



<section className="hairstyle-gallery">
  <h2 className="hairstyle-title">Mẫu Tóc Đẹp Sáng Tạo</h2>
  <p className="hairstyle-subtitle">Barbershop Nguyễn Hoài luôn mang đến những mẫu tóc đẹp phù hợp với xu hướng hiện đại.</p>
  <div className="hairstyle-grid">
    <div className="hairstyle-card">
      <img src="/MT1.jpg" alt="Mẫu tóc 1" />
      <div className="hairstyle-info">
        <h3 className="hairstyle-name">Undercut Hiện Đại</h3>
        <p className="hairstyle-description">Kiểu tóc nam tính và cá tính</p>
      </div>
    </div>
    
    <div className="hairstyle-card">
      <img src="/MT2.webp" alt="Mẫu tóc 2" />
      <div className="hairstyle-info">
        <h3 className="hairstyle-name">Slick Back</h3>
        <p className="hairstyle-description">Phong cách lịch lãm, chuyên nghiệp</p>
      </div>
    </div>
    
    <div className="hairstyle-card">
      <img src="/MT3.jpg" alt="Mẫu tóc 3" />
      <div className="hairstyle-info">
        <h3 className="hairstyle-name">Textured Crop</h3>
        <p className="hairstyle-description">Kiểu tóc trẻ trung, năng động</p>
      </div>
    </div>
    
    <div className="hairstyle-card">
      <img src="/MT4.webp" alt="Mẫu tóc 4" />
      <div className="hairstyle-info">
        <h3 className="hairstyle-name">Two Block</h3>
        <p className="hairstyle-description">Phong cách cổ điển, sang trọng</p>
      </div>
    </div>
    
    <div className="hairstyle-card">
      <img src="/MT5.jpg" alt="Mẫu tóc 5" />
      <div className="hairstyle-info">
        <h3 className="hairstyle-name">Ivy League</h3>
        <p className="hairstyle-description">Kiểu tóc phồng trẻ trung</p>
      </div>
    </div>
    
    <div className="hairstyle-card">
      <img src="/MT6.jpg" alt="Mẫu tóc 6" />
      <div className="hairstyle-info">
        <h3 className="hairstyle-name">Mullet</h3>
        <p className="hairstyle-description">Phong cách hiện đại, gọn gàng</p>
      </div>
    </div>
    
    <div className="hairstyle-card">
      <img src="/MT7.jpg" alt="Mẫu tóc 7" />
      <div className="hairstyle-info">
        <h3 className="hairstyle-name">layer uốn 7/3</h3>
        <p className="hairstyle-description">Kiểu tóc xoăn tự nhiên, cá tính</p>
      </div>
    </div>
    
    <div className="hairstyle-card">
      <img src="/MT1.jpg" alt="Mẫu tóc 8" />
      <div className="hairstyle-info">
        <h3 className="hairstyle-name">Korean Style</h3>
        <p className="hairstyle-description">Phong cách Hàn Quốc thời thượng</p>
      </div>
    </div>
  </div>
</section>

{/* Nút Zalo */}
      <a
        href="https://zalo.me/0343894612" // Thay bằng số điện thoại Zalo của bạn
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "60px",
          right: "20px",
          zIndex: "9999",
        }}
      >
        <img
          src="./LogoZalo.webp" // Thay bằng URL hình ảnh Zalo của bạn
          alt="Liên hệ Zalo"
          style={{ width: "60px", height: "60px" }}
        />
      </a>
<ReviewSlider />
<FeedbackForm />
      

    </div>
  );
};

export default Home;
