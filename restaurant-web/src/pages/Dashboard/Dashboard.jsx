import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import { orderAPI } from "../../services/api";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const { restaurant } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    avgOrderValue: 0,
    newCustomers: 0,
    topDishes: [],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    if (restaurant?._id) {
      loadDashboardData();
    }
  }, [restaurant]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("restaurant_token");

      // Load orders
      const ordersResponse = await orderAPI.getMyOrders();

      if (ordersResponse?.success) {
        const orders = ordersResponse.data || [];

        // Calculate today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });

        const pendingOrders = orders.filter(
          (order) => order.status === "pending"
        );
        const completedToday = todayOrders.filter(
          (order) => order.status === "completed"
        );

        const todayRevenue = todayOrders.reduce(
          (sum, order) => sum + (order.totalAmount || 0),
          0
        );

        // Calculate month revenue
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const monthOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= thisMonth;
        });

        const monthRevenue = monthOrders.reduce(
          (sum, order) => sum + (order.totalAmount || 0),
          0
        );

        const avgOrderValue =
          todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

        // Top dishes
        const dishMap = {};
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const dishName = item.product?.name || item.name;
            if (!dishMap[dishName]) {
              dishMap[dishName] = { name: dishName, orders: 0, revenue: 0 };
            }
            dishMap[dishName].orders += item.quantity;
            dishMap[dishName].revenue += item.price * item.quantity;
          });
        });

        const topDishes = Object.values(dishMap)
          .sort((a, b) => b.orders - a.orders)
          .slice(0, 5);

        // Recent orders (last 5)
        const recent = orders.slice(0, 5).map((order) => ({
          id: order.orderNumber || order._id,
          customer:
            order.customer?.name || order.deliveryInfo?.name || "Khách hàng",
          total: order.totalAmount,
          status: order.status,
          time: new Date(order.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          items: order.items.length,
        }));

        // Last 7 days revenue
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);

          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const dayOrders = orders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= date && orderDate < nextDate;
          });

          const dayRevenue = dayOrders.reduce(
            (sum, order) => sum + (order.totalAmount || 0),
            0
          );

          last7Days.push(dayRevenue);
        }

        setStats({
          todayOrders: todayOrders.length,
          pendingOrders: pendingOrders.length,
          completedOrders: completedToday.length,
          todayRevenue,
          monthRevenue,
          avgOrderValue,
          newCustomers: 0, // Would need customer API to calculate
          topDishes,
        });

        setRecentOrders(recent);
        setRevenueData(last7Days);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Revenue chart data for last 7 days
  const revenueChartData = {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        data: revenueData,
        borderColor: "#ff6b35",
        backgroundColor: "rgba(255, 107, 53, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#333",
        bodyColor: "#666",
        borderColor: "#eee",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString("vi-VN")}đ`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${(value / 1000000).toFixed(1)}M`,
        },
        grid: {
          color: "#f0f0f0",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Tổng quan</h1>
          <p className="welcome-text">Chào mừng đến với {restaurant?.name}</p>
        </div>
        <div className="date-selector">
          <select className="date-range">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>Tháng này</option>
            <option>Tháng trước</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card today">
          <div className="stat-header">
            <span className="stat-trend up">+12%</span>
          </div>
          <div className="stat-content">
            <p className="stat-number">{stats.todayOrders}</p>
            <h3>Đơn hôm nay</h3>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-header">
            <span className="stat-badge">{stats.pendingOrders} mới</span>
          </div>
          <div className="stat-content">
            <p className="stat-number">{stats.pendingOrders}</p>
            <h3>Đơn chờ xử lý</h3>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-header">
            <span className="stat-icon">💰</span>
            <span className="stat-trend up">+8%</span>
          </div>
          <div className="stat-content">
            <p className="stat-number">
              {(stats.todayRevenue / 1000000).toFixed(1)}M
            </p>
            <h3>Doanh thu hôm nay</h3>
            <p className="stat-detail">
              Tháng: {(stats.monthRevenue / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        <div className="stat-card avg">
          <div className="stat-header">
            <span className="stat-icon">📊</span>
            <span className="stat-trend up">+5%</span>
          </div>
          <div className="stat-content">
            <p className="stat-number">
              {(stats.avgOrderValue / 1000).toFixed(0)}K
            </p>
            <h3>Giá trị TB/đơn</h3>
            <p className="stat-detail">{stats.newCustomers} khách mới</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="revenue-chart-section">
          <div className="section-header">
            <h2>Biểu đồ doanh thu</h2>
            <span className="chart-period">7 ngày qua</span>
          </div>
          <div className="chart-container">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        <div className="top-dishes-section">
          <div className="section-header">
            <h2>Món bán chạy</h2>
            <a href="/menu-management" className="view-all">
              Xem tất cả →
            </a>
          </div>
          <div className="dishes-list">
            {stats.topDishes.map((dish, index) => (
              <div key={index} className="dish-item">
                <div className="dish-rank">{index + 1}</div>
                <div className="dish-info">
                  <h4>{dish.name}</h4>
                  <p>
                    {dish.orders} đơn • {dish.revenue.toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <div className="dish-chart">
                  <div
                    className="dish-bar"
                    style={{ width: `${(dish.orders / 18) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <div className="section-header">
          <h2>Đơn hàng gần đây</h2>
          <a href="/order-management" className="view-all">
            Xem tất cả →
          </a>
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Số món</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="order-row">
                <td className="order-id">#{order.id}</td>
                <td className="customer-name">{order.customer}</td>
                <td>{order.items} món</td>
                <td className="order-total">
                  {order.total.toLocaleString("vi-VN")}đ
                </td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status === "pending" && "Chờ xác nhận"}
                    {order.status === "preparing" && "Đang chuẩn bị"}
                    {order.status === "delivering" && "Đang giao"}
                    {order.status === "completed" && "✓ Hoàn thành"}
                  </span>
                </td>
                <td className="order-time">{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
