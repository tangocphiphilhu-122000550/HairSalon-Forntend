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
  const maxRetries = 3; // Số lần thử lại tối đa

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort(); // Hủy yêu cầu sau 2 giây
      }, 5000);

      const response = await fetch("https://hairsalon-m4jx.onrender.com/api/reviews", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId); // Xóa timeout nếu yêu cầu hoàn thành trước 2 giây

      if (!response.ok) {
        throw new Error("Không thể tải đánh giá");
      }

      const data = await response.json();
      const fiveStarReviews = data.filter((review) => review.rating === 5);
      setReviews(fiveStarReviews);
      setError(null);
      setRetryCount(0); // Reset retry count khi thành công
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      if (error.name === "AbortError" && retryCount < maxRetries) {
        // Nếu bị hủy do timeout và chưa vượt quá số lần thử lại
        setRetryCount((prev) => prev + 1);
        setError(`Đang thử lại lần ${retryCount + 1}/${maxRetries}...`);
        fetchReviews(); // Gọi lại API
      } else {
        setError("Không thể tải đánh giá. Vui lòng thử lại sau.");
        setLoading(false);
      }
    } finally {
      if (retryCount >= maxRetries || !error) {
        setLoading(false); // Chỉ dừng loading khi hết lượt thử hoặc thành công
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