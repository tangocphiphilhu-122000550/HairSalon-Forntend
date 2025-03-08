import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getUsername } from '../utils/tokenStorage';
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
      const response = await api.get('/api/appointments/all');
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

  const handleBookingRequest = () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTimeSlot) {
      setError('Vui lòng chọn đầy đủ thông tin');
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

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="appointment-booking">
      <h1>Đặt Dịch Vụ</h1>

      {bookingSuccess && (
        <div className="success-notification">
          <div className="success-message">
            <i className="fas fa-check-circle"></i> Đặt lịch thành công!
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="booking-container">
        <div className="service-selection">
          <h2>Chọn Dịch Vụ</h2>
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <div className="service-list">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <h3>{service.service_name}</h3>
                  <p>{service.description}</p>
                  <div className="service-details">
                    <span>Giá: {service.price.toLocaleString('vi-VN')} VND</span>
                    <span>Thời gian: {service.duration_minutes} phút</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedService && (
          <div className="barber-selection">
            <h2>Chọn Thợ Cắt Tóc</h2>
            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : (
              <div className="barber-list">
                {barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className={`barber-card ${selectedBarber?.id === barber.id ? 'selected' : ''}`}
                    onClick={() => handleBarberSelect(barber)}
                  >
                    <div className="barber-avatar">
                      {barber.image ? (
                        <img src={barber.image} alt={barber.full_name} onError={(e) => e.target.style.display = 'none'} />
                      ) : (
                        <div className="avatar-placeholder">{barber.full_name.charAt(0)}</div>
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
          <div className="date-time-selection">
            <h2>Chọn Ngày và Giờ</h2>

            <div className="date-picker">
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
              <div className="time-slots">
                <h3>Chọn khung giờ cho {formatDate(selectedDate)}</h3>
                <div className="time-slot-legend">
                  <div className="legend-item">
                    <span className="legend-color available"></span>
                    <span>Còn trống</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color booked"></span>
                    <span>Đã đặt</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color past"></span>
                    <span>Đã qua</span>
                  </div>
                </div>

                {loading ? (
                  <div className="loading">Đang tải...</div>
                ) : (
                  <div className="time-slot-grid">
                    {timeSlots.map((timeSlot) => {
                      const status = getTimeSlotStatus(timeSlot);
                      return (
                        <button
                          key={timeSlot}
                          className={`time-slot ${status} ${selectedTimeSlot === timeSlot ? 'selected' : ''}`}
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
              <div className="booking-summary">
                <h3>Tóm tắt đặt lịch</h3>
                <p><strong>Dịch vụ:</strong> {selectedService.service_name}</p>
                <p><strong>Thợ cắt tóc:</strong> {selectedBarber.full_name}</p>
                <p><strong>Ngày:</strong> {formatDate(selectedDate)}</p>
                <p><strong>Giờ:</strong> {selectedTimeSlot}</p>
                <p><strong>Giá:</strong> {selectedService.price.toLocaleString('vi-VN')} VND</p>

                <button
                  className="book-button"
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
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h2>Xác nhận đặt lịch</h2>
            <p>Bạn có chắc chắn muốn đặt lịch với thông tin sau?</p>
            <div className="confirmation-details">
              <p><strong>Dịch vụ:</strong> {selectedService.service_name}</p>
              <p><strong>Thợ cắt tóc:</strong> {selectedBarber.full_name}</p>
              <p><strong>Ngày:</strong> {formatDate(selectedDate)}</p>
              <p><strong>Giờ:</strong> {selectedTimeSlot}</p>
              <p><strong>Giá:</strong> {selectedService.price.toLocaleString('vi-VN')} VND</p>
            </div>
            <div className="confirmation-actions">
              <button
                className="confirm-button"
                onClick={confirmBooking}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              <button
                className="cancel-button"
                onClick={cancelConfirmation}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;