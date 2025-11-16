import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAllOrders } from "../../services/orderService";
import "./Statistics.css";

function Statistics() {
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
  });

  const restaurants = [
    { id: "1", name: "Cơm Tấm Sườn Bì Chả" },
    { id: "2", name: "Bún Bò Huế Ngon" },
    { id: "3", name: "KFC Vietnam" },
  ];

  const months = [
    { value: "all", label: "Tất cả các tháng" },
    { value: "1", label: "Tháng 1" },
    { value: "2", label: "Tháng 2" },
    { value: "3", label: "Tháng 3" },
    { value: "4", label: "Tháng 4" },
    { value: "5", label: "Tháng 5" },
    { value: "6", label: "Tháng 6" },
    { value: "7", label: "Tháng 7" },
    { value: "8", label: "Tháng 8" },
    { value: "9", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ];

  const years = ["2025"];

  const COLORS = ["#059669", "#ef4444", "#3b82f6", "#f59e0b"];

  useEffect(() => {
    loadOrders();
  }, [selectedRestaurant, selectedMonth, selectedYear]);

  const loadOrders = () => {
    const allOrders = getAllOrders();
    setOrders(allOrders);
    calculateStats(allOrders);
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter theo năm
    filtered = filtered.filter((order) => {
      const orderYear = new Date(order.createdAt).getFullYear();
      return orderYear === parseInt(selectedYear);
    });

    // Filter theo tháng
    if (selectedMonth !== "all") {
      filtered = filtered.filter((order) => {
        const orderMonth = new Date(order.createdAt).getMonth() + 1;
        return orderMonth === parseInt(selectedMonth);
      });
    }

    // Filter theo nhà hàng
    if (selectedRestaurant !== "all") {
      filtered = filtered.filter(
        (order) => order.restaurantId === selectedRestaurant
      );
    }

    return filtered;
  };

  const calculateStats = (ordersList) => {
    const filtered = ordersList.filter((order) => {
      const orderYear = new Date(order.createdAt).getFullYear();
      const orderMonth = new Date(order.createdAt).getMonth() + 1;

      const yearMatch = orderYear === parseInt(selectedYear);
      const monthMatch =
        selectedMonth === "all" || orderMonth === parseInt(selectedMonth);
      const restaurantMatch =
        selectedRestaurant === "all" ||
        order.restaurantId === selectedRestaurant;

      return yearMatch && monthMatch && restaurantMatch;
    });

    const totalRevenue = filtered.reduce((sum, order) => {
      return order.status === "completed" ? sum + order.total : sum;
    }, 0);

    const totalOrders = filtered.length;
    const completedOrders = filtered.filter(
      (o) => o.status === "completed"
    ).length;
    const cancelledOrders = filtered.filter(
      (o) => o.status === "cancelled"
    ).length;
    const avgOrderValue =
      completedOrders > 0 ? totalRevenue / completedOrders : 0;

    setStats({
      totalRevenue,
      totalOrders,
      completedOrders,
      cancelledOrders,
      avgOrderValue,
    });
  };

  // Dữ liệu cho biểu đồ doanh thu theo tháng
  const getRevenueByMonth = () => {
    const filtered = getFilteredOrders();
    const monthlyData = {};

    // Khởi tạo 12 tháng
    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = {
        month: `T${i}`,
        revenue: 0,
        orders: 0,
      };
    }

    filtered.forEach((order) => {
      if (order.status === "completed") {
        const month = new Date(order.createdAt).getMonth() + 1;
        monthlyData[month].revenue += order.total;
        monthlyData[month].orders += 1;
      }
    });

    return Object.values(monthlyData);
  };

  // Dữ liệu cho biểu đồ đơn hàng theo trạng thái
  const getOrdersByStatus = () => {
    const filtered = getFilteredOrders();
    const statusCount = {
      completed: 0,
      cancelled: 0,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      delivering: 0,
    };

    filtered.forEach((order) => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    return [
      { name: "Hoàn thành", value: statusCount.completed, color: COLORS[0] },
      { name: "Đã hủy", value: statusCount.cancelled, color: COLORS[1] },
      { name: "Chờ xử lý", value: statusCount.pending, color: COLORS[2] },
      {
        name: "Đang xử lý",
        value:
          statusCount.confirmed +
          statusCount.preparing +
          statusCount.delivering,
        color: COLORS[3],
      },
    ].filter((item) => item.value > 0);
  };

  // Dữ liệu cho biểu đồ top nhà hàng
  const getTopRestaurants = () => {
    const filtered = getFilteredOrders().filter(
      (o) => o.status === "completed"
    );
    const restaurantStats = {};

    restaurants.forEach((restaurant) => {
      restaurantStats[restaurant.id] = {
        name: restaurant.name,
        revenue: 0,
        orders: 0,
      };
    });

    filtered.forEach((order) => {
      if (restaurantStats[order.restaurantId]) {
        restaurantStats[order.restaurantId].revenue += order.total;
        restaurantStats[order.restaurantId].orders += 1;
      }
    });

    return Object.values(restaurantStats).sort((a, b) => b.revenue - a.revenue);
  };

  // Dữ liệu cho biểu đồ doanh thu theo ngày (cho tháng được chọn)
  const getRevenueByDay = () => {
    if (selectedMonth === "all") return [];

    const filtered = getFilteredOrders().filter(
      (o) => o.status === "completed"
    );
    const dailyData = {};

    // Lấy số ngày trong tháng
    const daysInMonth = new Date(
      parseInt(selectedYear),
      parseInt(selectedMonth),
      0
    ).getDate();

    // Khởi tạo dữ liệu cho tất cả các ngày
    for (let i = 1; i <= daysInMonth; i++) {
      dailyData[i] = {
        day: `${i}`,
        revenue: 0,
        orders: 0,
      };
    }

    filtered.forEach((order) => {
      const day = new Date(order.createdAt).getDate();
      dailyData[day].revenue += order.total;
      dailyData[day].orders += 1;
    });

    return Object.values(dailyData);
  };

  const revenueByMonth = getRevenueByMonth();
  const ordersByStatus = getOrdersByStatus();
  const topRestaurants = getTopRestaurants();
  const revenueByDay = getRevenueByDay();

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>Thống kê & Báo cáo</h1>
        <p className="subtitle">
          Phân tích dữ liệu kinh doanh và hiệu suất hệ thống
        </p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Nhà hàng:</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả nhà hàng</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Năm:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="filter-select"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tháng:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="filter-select"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Tổng doanh thu</h3>
            <div className="stat-value">
              {stats.totalRevenue.toLocaleString("vi-VN")}đ
            </div>
            <p className="stat-subtitle">
              Từ {stats.completedOrders} đơn hoàn thành
            </p>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Tổng đơn hàng</h3>
            <div className="stat-value">{stats.totalOrders}</div>
            <p className="stat-subtitle">
              {stats.completedOrders} hoàn thành, {stats.cancelledOrders} đã hủy
            </p>
          </div>
        </div>

        <div className="stat-card avg">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Giá trị TB/Đơn</h3>
            <div className="stat-value">
              {stats.avgOrderValue.toLocaleString("vi-VN")}đ
            </div>
            <p className="stat-subtitle">Đơn hàng trung bình</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Tỷ lệ hoàn thành</h3>
            <div className="stat-value">
              {stats.totalOrders > 0
                ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="stat-subtitle">
              {stats.completedOrders}/{stats.totalOrders} đơn
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Doanh thu theo tháng */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>📈 Doanh thu theo tháng</h3>
            <span className="chart-subtitle">Năm {selectedYear}</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => `${value.toLocaleString("vi-VN")}đ`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                strokeWidth={3}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Doanh thu theo ngày (nếu chọn tháng cụ thể) */}
        {selectedMonth !== "all" && revenueByDay.length > 0 && (
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3>📅 Doanh thu theo ngày</h3>
              <span className="chart-subtitle">
                Tháng {selectedMonth}/{selectedYear}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${value.toLocaleString("vi-VN")}đ`}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Đơn hàng theo trạng thái */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🎯 Đơn hàng theo trạng thái</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top nhà hàng theo doanh thu */}
        {selectedRestaurant === "all" && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>🏆 Top nhà hàng theo doanh thu</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topRestaurants}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${value.toLocaleString("vi-VN")}đ`}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#f59e0b" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Số đơn hàng theo tháng */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>📋 Số lượng đơn hàng theo tháng</h3>
            <span className="chart-subtitle">Năm {selectedYear}</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#6366f1" name="Số đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Restaurant Performance Table */}
      {selectedRestaurant === "all" && (
        <div className="performance-table">
          <h3>📊 Hiệu suất theo nhà hàng</h3>
          <table>
            <thead>
              <tr>
                <th>Nhà hàng</th>
                <th>Tổng đơn</th>
                <th>Hoàn thành</th>
                <th>Đã hủy</th>
                <th>Doanh thu</th>
                <th>TB/Đơn</th>
                <th>Tỷ lệ hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => {
                const restaurantOrders = getFilteredOrders().filter(
                  (o) => o.restaurantId === restaurant.id
                );
                const completed = restaurantOrders.filter(
                  (o) => o.status === "completed"
                );
                const cancelled = restaurantOrders.filter(
                  (o) => o.status === "cancelled"
                );
                const revenue = completed.reduce((sum, o) => sum + o.total, 0);
                const avgValue =
                  completed.length > 0 ? revenue / completed.length : 0;
                const successRate =
                  restaurantOrders.length > 0
                    ? (completed.length / restaurantOrders.length) * 100
                    : 0;

                return (
                  <tr key={restaurant.id}>
                    <td>
                      <strong>{restaurant.name}</strong>
                    </td>
                    <td>{restaurantOrders.length}</td>
                    <td className="success">{completed.length}</td>
                    <td className="danger">{cancelled.length}</td>
                    <td className="revenue">
                      {revenue.toLocaleString("vi-VN")}đ
                    </td>
                    <td>{avgValue.toLocaleString("vi-VN")}đ</td>
                    <td>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${successRate}%` }}
                        ></div>
                        <span className="progress-text">
                          {successRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Statistics;
