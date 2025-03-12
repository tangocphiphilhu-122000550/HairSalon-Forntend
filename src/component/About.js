import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";

const About = () => {
  const navigate = useNavigate();
  const sectionRefs = {
    hero: useRef(null),
    history: useRef(null),
    team: useRef(null),
    values: useRef(null),
    services: useRef(null),
  };
  const [visible, setVisible] = useState({});

  // Kiểm tra khi cuộn để hiển thị animation
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.2,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible((prev) => ({
            ...prev,
            [entry.target.id]: true,
          }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Đăng ký quan sát tất cả các section
    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      Object.values(sectionRefs).forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  const handleBookingClick = () => {
    navigate("/Service");
  };

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section id="hero" ref={sectionRefs.hero} className={`hero-section ${visible.hero ? "visible" : ""}`}>
        <div className="hero-content">
          <h1 className="hero-title">Barber Shop</h1>
          <p className="hero-subtitle">Nơi phong cách gặp gỡ sự hoàn hảo</p>
          <button className="booking-button" onClick={handleBookingClick}>
            Đặt Lịch Ngay
          </button>
        </div>
        <div className="hero-image">
          <div className="image-container">
            <img src="/baberHoai.jpg" alt="Barber Shop" />
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id="history" ref={sectionRefs.history} className={`history-section ${visible.history ? "visible" : ""}`}>
        <div className="section-title">
          <h2>Lịch Sử Hình Thành</h2>
          <div className="title-underline"></div>
        </div>
        <div className="history-timeline">
          <div className="timeline-item left">
            <div className="timeline-content">
              <div className="year">2005</div>
              <h3>Khởi Đầu</h3>
              <p>Barber Shop của chúng tôi được thành lập với một tiệm nhỏ và ý tưởng lớn về việc mang lại trải nghiệm cắt tóc cao cấp cho nam giới.</p>
            </div>
          </div>
          <div className="timeline-item right">
            <div className="timeline-content">
              <div className="year">2010</div>
              <h3>Mở Rộng</h3>
              <p>Sau 5 năm thành công, chúng tôi đã mở thêm 3 chi nhánh tại các quận trung tâm, đồng thời đào tạo thêm nhiều thợ cắt tóc chuyên nghiệp.</p>
            </div>
          </div>
          <div className="timeline-item left">
            <div className="timeline-content">
              <div className="year">2015</div>
              <h3>Đổi Mới</h3>
              <p>Chúng tôi đưa vào áp dụng các công nghệ đặt lịch trực tuyến và mở rộng dịch vụ sang chăm sóc da và tóc cao cấp.</p>
            </div>
          </div>
          <div className="timeline-item right">
            <div className="timeline-content">
              <div className="year">2023</div>
              <h3>Hiện Tại</h3>
              <p>Với hơn 15 năm kinh nghiệm, chúng tôi tự hào là điểm đến hàng đầu cho các quý ông tìm kiếm phong cách và sự tự tin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" ref={sectionRefs.team} className={`team-section ${visible.team ? "visible" : ""}`}>
        <div className="section-title">
          <h2>Đội Ngũ Chuyên Nghiệp</h2>
          <div className="title-underline"></div>
        </div>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image">
              <img src="/baberHoai.jpg" alt="Trần Văn A" />
            </div>
            <div className="member-info">
              <h3>Nguyễn Văn Hoài</h3>
              <p>Giám đốc & Thợ cắt tóc</p>
              <p>15 năm kinh nghiệm</p>
            </div>
          </div>
          <div className="team-member">
            <div className="member-image">
              <img src="/baberHoai.jpg" alt="Phạm Văn D" />
            </div>
            <div className="member-info">
              <h3>Phạm Văn D</h3>
              <p>Chuyên gia chăm sóc da</p>
              <p>7 năm kinh nghiệm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" ref={sectionRefs.values} className={`values-section ${visible.values ? "visible" : ""}`}>
        <div className="section-title">
          <h2>Giá Trị Cốt Lõi</h2>
          <div className="title-underline"></div>
        </div>
        <div className="values-grid">
          <div className="value-item">
            <div className="value-icon">✂️</div>
            <h3>Chất Lượng</h3>
            <p>Chúng tôi luôn đặt chất lượng lên hàng đầu trong mọi dịch vụ, từ cắt tóc đến chăm sóc khách hàng.</p>
          </div>
          <div className="value-item">
            <div className="value-icon">👨‍🎓</div>
            <h3>Chuyên Nghiệp</h3>
            <p>Đội ngũ của chúng tôi được đào tạo bài bản và liên tục cập nhật các xu hướng mới nhất.</p>
          </div>
          <div className="value-item">
            <div className="value-icon">🤝</div>
            <h3>Tôn Trọng</h3>
            <p>Chúng tôi tôn trọng thời gian, sở thích và phong cách cá nhân của mỗi khách hàng.</p>
          </div>
          <div className="value-item">
            <div className="value-icon">💎</div>
            <h3>Sáng Tạo</h3>
            <p>Không ngừng đổi mới và sáng tạo để mang đến những kiểu tóc phù hợp nhất cho khách hàng.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" ref={sectionRefs.services} className={`services-section ${visible.services ? "visible" : ""}`}>
        <div className="section-title">
          <h2>Dịch Vụ Của Chúng Tôi</h2>
          <div className="title-underline"></div>
        </div>
        <div className="services-grid">
          <div className="service-item">
            <div className="service-image">
              <img src="/DVCatToc.jpg" alt="Cắt tóc nam" />
            </div>
            <div className="service-info">
              <h3>Cắt Tóc Nam</h3>
              <p>Dịch vụ cắt tóc chuyên nghiệp với nhiều kiểu dáng phù hợp với khuôn mặt và phong cách của bạn.</p>
            </div>
          </div>
          <div className="service-item">
            <div className="service-image">
              <img src="/DVCaoRau.jpg" alt="Cạo râu" />
            </div>
            <div className="service-info">
              <h3>Cạo Râu & Tỉa Râu</h3>
              <p>Dịch vụ cạo râu truyền thống kết hợp với các kỹ thuật hiện đại giúp bạn có vẻ ngoài chỉn chu.</p>
            </div>
          </div>
          <div className="service-item">
            <div className="service-image">
              <img src="/DVChamDa.jpg" alt="Chăm sóc da" />
            </div>
            <div className="service-info">
              <h3>Chăm Sóc Da</h3>
              <p>Các dịch vụ chăm sóc da chuyên nghiệp giúp làn da của bạn khỏe mạnh và tươi sáng.</p>
            </div>
          </div>
          <div className="service-item">
            <div className="service-image">
              <img src="/DVNhuomToc.png" alt="Nhuộm tóc" />
            </div>
            <div className="service-info">
              <h3>Nhuộm Tóc Nam</h3>
              <p>Dịch vụ nhuộm tóc với nhiều màu sắc thời thượng, phù hợp với nhiều phong cách khác nhau.</p>
            </div>
          </div>
        </div>
        <div className="cta-container">
          <button className="booking-button" onClick={handleBookingClick}>
            Trải Nghiệm Ngay
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;