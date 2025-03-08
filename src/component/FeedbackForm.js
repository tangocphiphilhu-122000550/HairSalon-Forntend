import React, { useState, useEffect } from 'react';
import './FeedbackForm.css';
import api from '../utils/api'; // Import api instance
import { getUsername } from '../utils/tokenStorage';

const FeedbackForm = () => {
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Lấy username từ localStorage khi component được tải
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUsername = await getUsername(); // Lấy username từ IndexedDB
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
      }
    };

    checkAuthStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra các trường bắt buộc
    if (!username.trim()) {
      setMessage('Vui lòng đăng nhập để gửi đánh giá');
      setMessageType('error');
      return;
    }

    if (!comment.trim()) {
      setMessage('Vui lòng nhập nội dung góp ý');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await api.post('/api/reviews/create', {
        username: username,
        rating: rating,
        comment: comment
      });

      if (response.status === 200 || response.status === 201) {
        setMessage('Cảm ơn bạn đã góp ý. Chúng tôi sẽ tiếp thu và cải thiện dịch vụ!');
        setMessageType('success');
        setComment('');
        setRating(5);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
        'Đã xảy ra lỗi khi gửi góp ý. Vui lòng thử lại.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="feedback-section">
      <div className="feedback-container">
        <h2 className="feedback-title">Góp Ý & Đánh Giá</h2>
        <p className="feedback-subtitle">Hãy cho chúng tôi biết cảm nhận của bạn để Barbershop Nguyễn Hoài phục vụ bạn tốt hơn!</p>
        
        {message && (
          <div className={`feedback-message ${messageType}`}>
            {message}
          </div>
        )}
        
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="rating-container">
            <label className="rating-label">Đánh giá của bạn:</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? 'selected' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="comment">Nội dung góp ý:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Hãy chia sẻ trải nghiệm của bạn tại Barbershop Nguyễn Hoài phục vụ bạn tốt hơn..."
              rows={4}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting || !username}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi góp ý'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default FeedbackForm;