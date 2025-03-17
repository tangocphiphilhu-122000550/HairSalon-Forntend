import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getUsername, getToken } from '../utils/tokenStorage';
import './AppointmentBooking.css';
import { useNavigate } from 'react-router-dom';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00'
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/services/getall');
        if (Array.isArray(response.data)) {
          setServices(response.data);
        } else {
          console.error('Dữ liệu dịch vụ không hợp lệ:', response.data);
        }
        setLoading(false);
      } catch (error) {
        setError('Không thể tải danh sách dịch vụ: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    const fetchBarbers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/barbers');
        setBarbers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách thợ cắt tóc: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchServices();
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedBarber) {
      fetchAppointments();
    }
  }, [selectedDate, selectedBarber]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await api.get('/api/appointments/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const filteredAppointments = response.data.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_date);
        const selectedDateObj = new Date(selectedDate);
        const isSameDate =
          appointmentDate.getDate() === selectedDateObj.getDate() &&
          appointmentDate.getMonth() === selectedDateObj.getMonth() &&
          appointmentDate.getFullYear() === selectedDateObj.getFullYear();
        return isSameDate && appointment.barber_id === selectedBarber.id;
      });

      setExistingAppointments(filteredAppointments);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải thông tin lịch hẹn: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const getTimeSlotStatus = (timeSlot) => {
    const now = new Date();
    const selectedDateObj = new Date(selectedDate);
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const timeSlotDate = new Date(selectedDate);
    timeSlotDate.setHours(hours, minutes, 0, 0);

    if (
      selectedDateObj.getDate() === now.getDate() &&
      selectedDateObj.getMonth() === now.getMonth() &&
      selectedDateObj.getFullYear() === now.getFullYear() &&
      timeSlotDate < now
    ) {
      return 'past';
    }

    const appointment = existingAppointments.find((app) => {
      const appDate = new Date(app.appointment_date);
      const localHour = appDate.getHours();
      const localMinute = appDate.getMinutes();
      const appTime = `${localHour.toString().padStart(2, '0')}:${localMinute.toString().padStart(2, '0')}`;
      return appTime === timeSlot && app.status === 'pending';
    });

    return appointment ? 'booked' : 'available';
  };

  const isTimeSlotBookable = (timeSlot) => {
    return getTimeSlotStatus(timeSlot) === 'available';
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedTimeSlot(null);
  };

  const handleBarberSelect = (barber) => {
    setSelectedBarber(barber);
    setSelectedTimeSlot(null);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (timeSlot) => {
    if (isTimeSlotBookable(timeSlot)) {
      setSelectedTimeSlot(timeSlot);
    }
  };

  const handleBookingRequest = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTimeSlot) {
      setError('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    const token = await getToken();
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    try {
      setLoading(true);
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);
      const appointmentDateTime = appointmentDate.toISOString();

      const username = await getUsername() || 'guest';

      const bookingData = {
        user_name: username,
        barber_name: selectedBarber.full_name,
        service_name: selectedService.service_name,
        appointment_date: appointmentDateTime,
        status: 'pending',
      };

      await api.post('/api/appointments/create', bookingData);

      setLoading(false);
      setShowConfirmation(false);
      setBookingSuccess(true);
      fetchAppointments();

      setTimeout(() => {
        setBookingSuccess(false);
        navigate('/history');
      }, 2000);
    } catch (err) {
      setError('Không thể đặt lịch: ' + (err.response?.data?.message || err.message));
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    navigate('/auth');
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="appointment-booking17">
      <h1>Đặt Dịch Vụ</h1>

      {bookingSuccess && (
        <div className="success-notification17">
          <div className="success-message17">
            <i className="fas fa-check-circle"></i> Đặt lịch thành công!
          </div>
        </div>
      )}

      {error && <div className="error-message17">{error}</div>}

      <div className="booking-container17">
        <div className="service-selection17">
          <h2>Chọn Dịch Vụ</h2>
          {loading ? (
            <div className="loading17">Đang tải...</div>
          ) : (
            <div className="service-list17">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`service-card17 ${selectedService?.id === service.id ? 'selected17' : ''}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <h3>{service.service_name}</h3>
                  <p>{service.description}</p>
                  <div className="service-details17">
                    <span>Giá: {service.price.toLocaleString('vi-VN')} VND</span>
                    <span>Thời gian: {service.duration_minutes} phút</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedService && (
          <div className="barber-selection17">
            <h2>Chọn Thợ Cắt Tóc</h2>
            {loading ? (
              <div className="loading17">Đang tải...</div>
            ) : (
              <div className="barber-list17">
                {barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className={`barber-card17 ${selectedBarber?.id === barber.id ? 'selected17' : ''}`}
                    onClick={() => handleBarberSelect(barber)}
                  >
                    <div className="barber-avatar17">
                      {barber.image ? (
                        <img src={barber.image} alt={barber.full_name} onError={(e) => e.target.style.display = 'none'} />
                      ) : (
                        <div className="avatar-placeholder17">{barber.full_name.charAt(0)}</div>
                      )}
                    </div>
                    <h3>{barber.full_name}</h3>
                    <p>Kinh nghiệm: {barber.experience_years} năm</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedService && selectedBarber && (
          <div className="date-time-selection17">
            <h2>Chọn Ngày và Giờ</h2>

            <div className="date-picker17">
              <label htmlFor="appointment-date">Ngày đặt lịch:</label>
              <input
                type="date"
                id="appointment-date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={handleDateChange}
                required
              />
            </div>

            {selectedDate && (
              <div className="time-slots17">
                <h3>Chọn khung giờ cho {formatDate(selectedDate)}</h3>
                <div className="time-slot-legend17">
                  <div className="legend-item17">
                    <span className="legend-color17 available17"></span>
                    <span>Còn trống</span>
                  </div>
                  <div className="legend-item17">
                    <span className="legend-color17 booked17"></span>
                    <span>Đã đặt</span>
                  </div>
                  <div className="legend-item17">
                    <span className="legend-color17 past17"></span>
                    <span>Đã qua</span>
                  </div>
                </div>

                {loading ? (
                  <div className="loading17">Đang tải...</div>
                ) : (
                  <div className="time-slot-grid17">
                    {timeSlots.map((timeSlot) => {
                      const status = getTimeSlotStatus(timeSlot);
                      return (
                        <button
                          key={timeSlot}
                          className={`time-slot17 ${status} ${selectedTimeSlot === timeSlot ? 'selected17' : ''}`}
                          onClick={() => handleTimeSlotSelect(timeSlot)}
                          disabled={status !== 'available'}
                        >
                          {timeSlot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectedTimeSlot && (
              <div className="booking-summary17">
                <h3>Tóm tắt đặt lịch</h3>
                <p><strong>Dịch vụ:</strong> {selectedService.service_name}</p>
                <p><strong>Thợ cắt tóc:</strong> {selectedBarber.full_name}</p>
                <p><strong>Ngày:</strong> {formatDate(selectedDate)}</p>
                <p><strong>Giờ:</strong> {selectedTimeSlot}</p>
                <p><strong>Giá:</strong> {selectedService.price.toLocaleString('vi-VN')} VND</p>

                <button
                  className="book-button17"
                  onClick={handleBookingRequest}
                  disabled={loading}
                >
                  Đặt Lịch
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showConfirmation && (
        <div className="confirmation-overlay17">
          <div className="confirmation-dialog17">
            <h2>Xác nhận đặt lịch</h2>
            <p>Bạn có chắc chắn muốn đặt lịch với thông tin sau?</p>
            <div className="confirmation-details17">
              <p><strong>Dịch vụ:</strong> {selectedService.service_name}</p>
              <p><strong>Thợ cắt tóc:</strong> {selectedBarber.full_name}</p>
              <p><strong>Ngày:</strong> {formatDate(selectedDate)}</p>
              <p><strong>Giờ:</strong> {selectedTimeSlot}</p>
              <p><strong>Giá:</strong> {selectedService.price.toLocaleString('vi-VN')} VND</p>
            </div>
            <div className="confirmation-actions17">
              <button
                className="confirm-button17"
                onClick={confirmBooking}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              <button
                className="cancel-button17"
                onClick={cancelConfirmation}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoginPrompt && (
        <div className="login-prompt-overlay17">
          <div className="login-prompt17">
            <p>Bạn cần đăng nhập trước khi đặt lịch!</p>
            <button className="login-button17" onClick={handleLoginRedirect}>
              Đăng nhập ngay
            </button>
            <button className="cancel-button17" onClick={() => setShowLoginPrompt(false)}>
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;