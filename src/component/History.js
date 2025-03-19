import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhone, FaMapMarkerAlt, FaStar, FaTrash, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import api from '../utils/api';
import { getToken, getUsername } from '../utils/tokenStorage';
import "./AppointmentHistory.css";

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const shopInfo = {
    name: "Barber Shop",
    address: "290 ĐT743B, Tân Đông Hiệp, Dĩ An, Bình Dương, Vietnam",
    mapUrl: "https://maps.app.goo.gl/Qf8zZdd3zNybjBrD9",
    payments: [
      { name: "Tiền mặt", icon: "💵" },
      { name: "MoMo", icon: "💳" },
      { name: "Chuyển khoản", icon: "🏦" },
      { name: "Visa/Mastercard", icon: "💳" }
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const username = await getUsername();
        
        if (!username) {
          setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }
        
        const appointmentsResponse = await api.get(`/api/appointments/${username}`);
        
        // Sắp xếp dữ liệu theo created_at giảm dần (mới nhất lên đầu)
        const sortedAppointments = appointmentsResponse.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setAppointments(sortedAppointments);
        setFilteredAppointments(sortedAppointments);
        
        const initialRatings = {};
        const initialComments = {};
        sortedAppointments.forEach(appointment => {
          initialRatings[appointment.id] = appointment.rating || 0;
          initialComments[appointment.id] = appointment.review_text || '';
        });
        setRatings(initialRatings);
        setComments(initialComments);
        
        setLoading(false);
      } catch (err) {
        console.error('Chi tiết lỗi:', err.response ? err.response.data : err.message);
        setError('Không thể tải lịch sử cuộc hẹn. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const applyDateFilter = () => {
    if (!filterStartDate && !filterEndDate) {
      setFilteredAppointments(appointments);
      return;
    }

    let filtered = [...appointments];

    if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(app => {
        const appDate = new Date(app.appointment_date);
        return appDate >= startDate;
      });
    }

    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(app => {
        const appDate = new Date(app.appointment_date);
        return appDate <= endDate;
      });
    }

    setFilteredAppointments(filtered);
    
    setNotification({
      show: true,
      message: `Tìm thấy ${filtered.length} lịch hẹn trong khoảng thời gian đã chọn`,
      type: 'success'
    });
    
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const resetFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilteredAppointments(appointments);
    setShowFilters(false);
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.put(`/api/appointments/update/${appointmentId}`, {
        status: 'cancelled'
      });

      const updatedAppointments = appointments.map(app => 
        app.id === appointmentId ? { ...app, status: 'cancelled' } : app
      ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sắp xếp lại sau khi cập nhật
      
      const updatedFilteredAppointments = filteredAppointments.map(app => 
        app.id === appointmentId ? { ...app, status: 'cancelled' } : app
      ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sắp xếp lại sau khi cập nhật
      
      setAppointments(updatedAppointments);
      setFilteredAppointments(updatedFilteredAppointments);

      setNotification({
        show: true,
        message: 'Đã hủy lịch hẹn thành công!',
        type: 'success'
      });

      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);

    } catch (err) {
      console.error('Chi tiết lỗi hủy lịch:', err.response ? err.response.data : err.message);

      setNotification({
        show: true,
        message: 'Không thể hủy lịch hẹn. Vui lòng thử lại sau.',
        type: 'error'
      });

      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const openGoogleMaps = () => {
    window.open(shopInfo.mapUrl, '_blank');
  };

  const handleRatingChange = (appointmentId, value) => {
    setRatings(prev => ({
      ...prev,
      [appointmentId]: value
    }));
  };
  
  const handleCommentChange = (appointmentId, value) => {
    setComments(prev => ({
      ...prev,
      [appointmentId]: value
    }));
  };

  const submitReview = async (appointmentId) => {
    const rating = ratings[appointmentId];
    const comment = comments[appointmentId];
    
    if (rating === 0) {
      setNotification({
        show: true,
        message: 'Vui lòng đánh giá số sao',
        type: 'error'
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      return;
    }

    try {
      await api.post(`/api/appointments/${appointmentId}/review`, {
        rating: rating,
        review_text: comment
      });
      
      setNotification({
        show: true,
        message: 'Cảm ơn bạn đã đánh giá dịch vụ!',
        type: 'success'
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === appointmentId) {
          return { 
            ...appointment, 
            has_review: true,
            rating: rating,
            review_text: comment
          };
        }
        return appointment;
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sắp xếp lại sau khi đánh giá
      
      setAppointments(updatedAppointments);
      setFilteredAppointments(
        filteredAppointments.map(appointment => {
          if (appointment.id === appointmentId) {
            return {
              ...appointment,
              has_review: true,
              rating: rating,
              review_text: comment
            };
          }
          return appointment;
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sắp xếp lại sau khi đánh giá
      );
      
    } catch (err) {
      console.error('Chi tiết lỗi đánh giá:', err.response ? err.response.data : err.message);
      
      setNotification({
        show: true,
        message: 'Không thể gửi đánh giá. Vui lòng thử lại sau.',
        type: 'error'
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-confirmed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'completed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('vi-VN', options);
  };

  const canReview = (appointment) => {
    return appointment.status === 'pending';
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
    </div>
  );
  
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="appointment-container max-w-4xl mx-auto p-4 relative">
      {notification.show && (
        <div className="notification-overlay">
          <div className={`notification ${notification.type === 'success' ? 'notification-success' : 'notification-error'}`}>
            <p>{notification.message}</p>
          </div>
        </div>
      )}
      
      <h1 className="page-title">Lịch sử đặt lịch</h1>
      
      <div className="filter-toggle">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-secondary mb-4"
        >
          <FaFilter className="btn-icon" /> {showFilters ? 'Ẩn bộ lọc' : 'Lọc theo thời gian'}
        </button>
      </div>
      
      {showFilters && (
        <div className="filter-container mb-6 p-4 border rounded-lg shadow-sm bg-white">
          <h3 className="filter-title flex items-center mb-3">
            <FaCalendarAlt className="mr-2" /> Lọc theo khoảng thời gian
          </h3>
          
          <div className="date-filters grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="filter-group">
              <label htmlFor="start-date" className="block mb-1 font-medium">Từ ngày:</label>
              <input
                type="date"
                id="start-date"
                className="filter-input w-full p-2 border rounded"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="end-date" className="block mb-1 font-medium">Đến ngày:</label>
              <input
                type="date"
                id="end-date"
                className="filter-input w-full p-2 border rounded"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="filter-actions flex gap-2">
            <button 
              onClick={applyDateFilter}
              className="btn btn-primary"
            >
              Áp dụng
            </button>
            <button 
              onClick={resetFilters}
              className="btn btn-outline"
            >
              Đặt lại
            </button>
          </div>
          
          {filterStartDate || filterEndDate ? (
            <div className="filter-summary mt-3 text-sm">
              <p>
                {filterStartDate && filterEndDate && (
                  <span>Lọc từ {new Date(filterStartDate).toLocaleDateString('vi-VN')} đến {new Date(filterEndDate).toLocaleDateString('vi-VN')}</span>
                )}
                {filterStartDate && !filterEndDate && (
                  <span>Lọc từ {new Date(filterStartDate).toLocaleDateString('vi-VN')}</span>
                )}
                {!filterStartDate && filterEndDate && (
                  <span>Lọc đến {new Date(filterEndDate).toLocaleDateString('vi-VN')}</span>
                )}
              </p>
              <p className="font-medium mt-1">
                Tìm thấy: {filteredAppointments.length} lịch hẹn
              </p>
            </div>
          ) : null}
        </div>
      )}
      
      <div className="shop-card">
        <h2 className="shop-name">{shopInfo.name}</h2>
        <p className="shop-address">
          <FaMapMarkerAlt className="mr-2" /> {shopInfo.address}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            onClick={openGoogleMaps}
            className="btn btn-primary"
          >
            <FaMapMarkerAlt className="btn-icon" /> Chỉ đường
          </button>
          
          <button 
            onClick={() => handleCall('0343894612')}
            className="btn btn-success"
          >
            <FaPhone className="btn-icon" /> Liên hệ
          </button>
        </div>
        
        <div className="payment-methods">
          <h3 className="payment-title">Phương thức thanh toán:</h3>
          <div className="flex flex-wrap gap-3">
            {shopInfo.payments.map((payment, index) => (
              <div key={index} className="payment-pill">
                <span className="payment-icon">{payment.icon}</span> {payment.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <p className="empty-text">
            {(filterStartDate || filterEndDate) 
              ? 'Không tìm thấy lịch hẹn nào trong khoảng thời gian đã chọn.'
              : 'Bạn chưa có lịch hẹn nào.'}
          </p>
          <button 
            onClick={() => navigate('/book-appointment')}
            className="btn btn-primary"
          >
            Đặt lịch ngay
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAppointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-card-content">
                <div className="appointment-header">
                  <div>
                    <h3 className="appointment-service">{appointment.service_name}</h3>
                    <p className="appointment-barber">Thợ cắt: {appointment.barber_name}</p>
                  </div>
                  <span className={`appointment-status ${getStatusClass(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                
                <div className="appointment-details">
                  <div className="detail-group">
                    <p className="detail-label">Ngày giờ:</p>
                    <p className="detail-value">{formatDate(appointment.appointment_date)}</p>
                  </div>
                  <div className="detail-group">
                    <p className="detail-label">Giá:</p>
                    <p className="detail-value appointment-price">
                      {appointment.total_amount 
                        ? parseInt(appointment.total_amount).toLocaleString('vi-VN') 
                        : '0'}đ
                    </p>
                  </div>
                </div>
                
                <div className="appointment-actions">
                  {appointment.status === 'pending' && (
                    <button 
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="btn btn-danger"
                    >
                      <FaTrash className="btn-icon" /> Hủy lịch
                    </button>
                  )}
                </div>
              </div>
              
              {canReview(appointment) && (
                <div className="review-section">
                  <h4 className="review-title">Đánh giá dịch vụ</h4>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FaStar 
                        key={star}
                        className={`star ${star <= ratings[appointment.id] ? 'star-filled' : 'star-empty'}`}
                        onClick={() => handleRatingChange(appointment.id, star)}
                      />
                    ))}
                  </div>
                  <textarea
                    id={`textarea-${appointment.id}`}
                    className="review-textarea"
                    value={comments[appointment.id]}
                    onChange={(e) => handleCommentChange(appointment.id, e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                  ></textarea>
                  <div className="review-actions">
                    <button 
                      onClick={() => submitReview(appointment.id)}
                      className="btn btn-submit"
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;