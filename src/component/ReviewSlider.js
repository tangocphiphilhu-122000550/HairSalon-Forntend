import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import "./ReviewSlider.css";

const ReviewSlider = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);

      const response = await fetch("https://hairsalon-m4jx.onrender.com/api/reviews", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Không thể tải đánh giá");
      }

      const data = await response.json();
      const fiveStarReviews = data.filter((review) => review.rating === 5);
      setReviews(fiveStarReviews);
      setError(null);
      setRetryCount(0);
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      if (error.name === "AbortError" && retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        setError(`Đang thử lại lần ${retryCount + 1}/${maxRetries}...`);
        fetchReviews();
      } else {
        setError("Không thể tải đánh giá. Vui lòng thử lại sau.");
        setLoading(false);
      }
    } finally {
      if (retryCount >= maxRetries || !error) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="testimonial-section">
        <div className="testimonial-right">
          <div className="skeleton-slide">
            <div className="skeleton-text" />
            <div className="skeleton-avatar" />
            <div className="skeleton-author" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="testimonial-section" style={{ justifyContent: "center", alignItems: "center" }}>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <section className="testimonial-section">
      <div className="testimonial-left">
        {/* Thêm div cho ảnh nền thay vì ::before */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "url('/kingkong.jpg') no-repeat center center",
            backgroundSize: "70%",
            opacity: 0.1,
            zIndex: -1,
          }}
        />
        <h2 className="testimonial-title">Đánh Giá Từ Khách Hàng</h2>
        <p className="testimonial-subtitle">
          Quý khách hàng đến với KingKong Barber Shop luôn hài lòng với dịch vụ và sản phẩm của chúng tôi.
        </p>
      </div>

      <div className="testimonial-right">
        {reviews.length > 0 ? (
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            loop={true}
            modules={[Autoplay, Pagination]}
            className="testimonial-slider"
          >
            {reviews.map((review, index) => {
              let imageUrl = "/default-avatar.png";
              if (review.image_url) {
                imageUrl = review.image_url.startsWith("http")
                  ? review.image_url
                  : `https://hairsalon-m4jx.onrender.com${review.image_url}`;
              }

              return (
                <SwiperSlide key={index} className="testimonial-slide">
                  <div className="testimonial-quote">
                    <p className="testimonial-text">"{review.comment}"</p>
                  </div>
                  <div className="testimonial-author">
                    <img src={imageUrl} alt="User avatar" className="testimonial-avatar" />
                    <div className="testimonial-author-info">
                      <h4 className="testimonial-author-name">{review.username}</h4>
                      <p className="testimonial-author-location">{review.location || "Khách hàng"}</p>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div className="empty-reviews">
            <p>Hiện chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewSlider;