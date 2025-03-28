import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./StatsManagement.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatsManagement = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [dailyData, setDailyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [quarterlyData, setQuarterlyData] = useState({});
  const [yearlyData, setYearlyData] = useState({});
  const [viewMode, setViewMode] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Theo dõi chiều rộng màn hình

  // Theo dõi kích thước màn hình để điều chỉnh biểu đồ
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const usersRes = await api.get("/api/users/all");
        setTotalUsers(usersRes.data.length);

        const appointmentsRes = await api.get("/api/appointments/all");
        const appointments = appointmentsRes.data;
        setTotalAppointments(appointments.length);

        const ordersRes = await api.get("/api/orders/all");
        const orders = ordersRes.data;

        const dailyStats = {};
        const monthlyStats = {};
        const quarterlyStats = {};
        const yearlyStats = {};

        appointments.forEach((appt) => {
          if (appt.status === "completed") {
            const apptDate = new Date(appt.created_at);
            const dayKey = apptDate.toISOString().split("T")[0];
            const monthKey = `${apptDate.getFullYear()}-${apptDate.getMonth() + 1}`;
            const quarterKey = `${apptDate.getFullYear()}-Q${Math.floor(apptDate.getMonth() / 3) + 1}`;
            const yearKey = `${apptDate.getFullYear()}`;

            dailyStats[dayKey] = dailyStats[dayKey] || { appointments: 0, orders: 0 };
            monthlyStats[monthKey] = monthlyStats[monthKey] || { appointments: 0, orders: 0 };
            quarterlyStats[quarterKey] = quarterlyStats[quarterKey] || { appointments: 0, orders: 0 };
            yearlyStats[yearKey] = yearlyStats[yearKey] || { appointments: 0, orders: 0 };

            const price = Number(appt.total_amount || 0);
            dailyStats[dayKey].appointments += price;
            monthlyStats[monthKey].appointments += price;
            quarterlyStats[quarterKey].appointments += price;
            yearlyStats[yearKey].appointments += price;
          }
        });

        orders.forEach((order) => {
          if (order.status === "completed") {
            const orderDate = new Date(order.created_at);
            const dayKey = orderDate.toISOString().split("T")[0];
            const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
            const quarterKey = `${orderDate.getFullYear()}-Q${Math.floor(orderDate.getMonth() / 3) + 1}`;
            const yearKey = `${orderDate.getFullYear()}`;

            dailyStats[dayKey] = dailyStats[dayKey] || { appointments: 0, orders: 0 };
            monthlyStats[monthKey] = monthlyStats[monthKey] || { appointments: 0, orders: 0 };
            quarterlyStats[quarterKey] = quarterlyStats[quarterKey] || { appointments: 0, orders: 0 };
            yearlyStats[yearKey] = yearlyStats[yearKey] || { appointments: 0, orders: 0 };

            const amount = Number(order.total_amount || 0);
            dailyStats[dayKey].orders += amount;
            monthlyStats[monthKey].orders += amount;
            quarterlyStats[quarterKey].orders += amount;
            yearlyStats[yearKey].orders += amount;
          }
        });

        setDailyData(dailyStats);
        setMonthlyData(monthlyStats);
        setQuarterlyData(quarterlyStats);
        setYearlyData(yearlyStats);

        setError("");
      } catch (err) {
        setError("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Hàm lấy dữ liệu biểu đồ với logic responsive
  const getChartData = () => {
    let labels = [];
    let appointmentsData = [];
    let ordersData = [];
    let title = `Doanh thu năm ${selectedYear} (VNĐ)`;

    if (viewMode === "day") {
      const daysInMonth = new Date(selectedYear, new Date().getMonth() + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = `${selectedYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        labels.push(`${day}/${new Date().getMonth() + 1}`);
        appointmentsData.push(dailyData[dayKey]?.appointments || 0);
        ordersData.push(dailyData[dayKey]?.orders || 0);
      }
      title = `Doanh thu theo ngày (Tháng ${new Date().getMonth() + 1}/${selectedYear})`;
    } else if (viewMode === "month") {
      for (let month = 1; month <= 12; month++) {
        const monthKey = `${selectedYear}-${month}`;
        labels.push(`Tháng ${month}`);
        appointmentsData.push(monthlyData[monthKey]?.appointments || 0);
        ordersData.push(monthlyData[monthKey]?.orders || 0);
      }
      title = `Doanh thu theo tháng (${selectedYear})`;
    } else if (viewMode === "quarter") {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterKey = `${selectedYear}-Q${quarter}`;
        labels.push(`Q${quarter}`);
        appointmentsData.push(quarterlyData[quarterKey]?.appointments || 0);
        ordersData.push(quarterlyData[quarterKey]?.orders || 0);
      }
      title = `Doanh thu theo quý (${selectedYear})`;
    } else if (viewMode === "year") {
      for (let i = 4; i >= 0; i--) {
        const year = selectedYear - i;
        const yearKey = `${year}`;
        labels.push(`Năm ${year}`);
        appointmentsData.push(yearlyData[yearKey]?.appointments || 0);
        ordersData.push(yearlyData[yearKey]?.orders || 0);
      }
      title = `Doanh thu 5 năm từ ${selectedYear - 4} đến ${selectedYear}`;
    }

    return {
      labels,
      datasets: [
        {
          label: "Doanh thu lịch hẹn (VNĐ)",
          data: appointmentsData,
          backgroundColor: "#4caf50",
          borderColor: "#45a049",
          borderWidth: 1,
        },
        {
          label: "Doanh thu đơn hàng (VNĐ)",
          data: ordersData,
          backgroundColor: "#007bff",
          borderColor: "#0069d9",
          borderWidth: 1,
        },
      ],
      title,
    };
  };

  // Tùy chỉnh chart options dựa trên kích thước màn hình
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Cho phép biểu đồ co giãn tự do
    plugins: {
      legend: {
        position: windowWidth <= 768 ? "bottom" : "top", // Chuyển legend xuống dưới trên mobile
        labels: {
          font: {
            size: windowWidth <= 480 ? 10 : 12, // Giảm font-size trên mobile nhỏ
          },
        },
      },
      title: {
        display: true,
        text: getChartData().title,
        font: {
          size: windowWidth <= 480 ? 14 : 16, // Giảm font-size tiêu đề trên mobile nhỏ
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString("vi-VN")} VNĐ`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: windowWidth <= 768 ? 45 : 0, // Xoay nhãn trục x trên mobile
          minRotation: windowWidth <= 768 ? 45 : 0,
          font: {
            size: windowWidth <= 480 ? 10 : 12, // Giảm font-size trên mobile nhỏ
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString("vi-VN"),
          font: {
            size: windowWidth <= 480 ? 10 : 12, // Giảm font-size trên mobile nhỏ
          },
        },
      },
    },
  };

  // Doanh thu hiện tại
  const now = new Date();
  const currentKey =
    viewMode === "day"
      ? `${selectedYear}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
      : viewMode === "month"
      ? `${selectedYear}-${now.getMonth() + 1}`
      : viewMode === "quarter"
      ? `${selectedYear}-Q${Math.floor(now.getMonth() / 3) + 1}`
      : `${selectedYear}`;
  const currentAppointments =
    (viewMode === "day"
      ? dailyData[currentKey]?.appointments
      : viewMode === "month"
      ? monthlyData[currentKey]?.appointments
      : viewMode === "quarter"
      ? quarterlyData[currentKey]?.appointments
      : yearlyData[currentKey]?.appointments) || 0;
  const currentOrders =
    (viewMode === "day"
      ? dailyData[currentKey]?.orders
      : viewMode === "month"
      ? monthlyData[currentKey]?.orders
      : viewMode === "quarter"
      ? quarterlyData[currentKey]?.orders
      : yearlyData[currentKey]?.orders) || 0;

  return (
    <div className="stats-management-tab">
      <h2>Thống kê</h2>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p className="stats-error">{error}</p>
      ) : (
        <>
          <div className="stats-controls">
            <div className="filter-group">
              <label>Chọn năm: </label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                min="2000"
                max={new Date().getFullYear()}
                className="year-select"
              />
            </div>
            <div className="filter-group">
              <label>Chọn chế độ xem: </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="view-mode-select"
              >
                <option value="day">Theo ngày</option>
                <option value="month">Theo tháng</option>
                <option value="quarter">Theo quý</option>
                <option value="year">Theo năm</option>
              </select>
            </div>
          </div>
          <div className="stats-gridTK">
            <div className="stat-card">
              <h3>Tổng người dùng</h3>
              <p>{totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Tổng doanh thu {viewMode === "day" ? "ngày" : viewMode === "month" ? "tháng" : viewMode === "quarter" ? "quý" : "năm"} (Lịch hẹn)</h3>
              <p>{currentAppointments.toLocaleString("vi-VN")} VNĐ</p>
            </div>
            <div className="stat-card">
              <h3>Tổng doanh thu {viewMode === "day" ? "ngày" : viewMode === "month" ? "tháng" : viewMode === "quarter" ? "quý" : "năm"} (Đơn hàng)</h3>
              <p>{currentOrders.toLocaleString("vi-VN")} VNĐ</p>
            </div>
            <div className="stat-card">
              <h3>Tổng lượt đặt lịch</h3>
              <p>{totalAppointments}</p>
            </div>
          </div>
          <div className="stats-chart">
            <Bar data={getChartData()} options={chartOptions} height={windowWidth <= 768 ? 300 : 400} />
          </div>
        </>
      )}
    </div>
  );
};

export default StatsManagement;