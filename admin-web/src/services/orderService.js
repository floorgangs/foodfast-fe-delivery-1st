// Shared order service - sử dụng localStorage chung giữa customer-web và restaurant-web
const STORAGE_KEY = "foodfast_orders";
const SUBSCRIBERS_KEY = "orderSubscribers";

// Storage event listeners để sync giữa các tabs
let subscribers = [];

// Lắng nghe storage changes từ tabs khác
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      console.log("Order storage changed from another tab");
      notifySubscribers();
    }
  });
}

// Mock data function
const generateMockOrders = () => {
  const now = new Date();
  const mockOrders = [];

  const restaurants = [
    { id: "1", name: "Cơm Tấm Sườn Bì Chả" },
    { id: "2", name: "Bún Bò Huế Ngon" },
    { id: "3", name: "KFC Vietnam" },
  ];

  const customers = [
    { name: "Nguyễn Văn A", phone: "0901234567" },
    { name: "Trần Thị B", phone: "0907654321" },
    { name: "Lê Văn C", phone: "0912345678" },
    { name: "Phạm Thị D", phone: "0923456789" },
    { name: "Hoàng Văn E", phone: "0934567890" },
    { name: "Vũ Thị F", phone: "0945678901" },
  ];

  const menuItems = {
    1: [
      // Cơm Tấm
      { name: "Cơm Tấm Sườn Bì", price: 45000 },
      { name: "Cơm Tấm Sườn Chả", price: 50000 },
      { name: "Cơm Tấm Đặc Biệt", price: 65000 },
      { name: "Trà Đá", price: 5000 },
    ],
    2: [
      // Bún Bò Huế
      { name: "Bún Bò Huế", price: 40000 },
      { name: "Bún Bò Huế Đặc Biệt", price: 55000 },
      { name: "Bún Riêu", price: 35000 },
      { name: "Nước Chanh", price: 10000 },
    ],
    3: [
      // KFC
      { name: "Gà Rán 2 Miếng", price: 89000 },
      { name: "Gà Rán 6 Miếng", price: 189000 },
      { name: "Burger Zinger", price: 69000 },
      { name: "Pepsi", price: 15000 },
    ],
  };

  const statuses = [
    "pending",
    "confirmed",
    "preparing",
    "delivering",
    "completed",
    "cancelled",
  ];
  const addresses = [
    "123 Nguyễn Văn Linh, Q7, TP.HCM",
    "456 Lê Văn Việt, Q9, TP.HCM",
    "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
    "321 Điện Biên Phủ, Q3, TP.HCM",
    "654 Lý Thường Kiệt, Q10, TP.HCM",
  ];

  const paymentMethods = ["Tiền mặt", "VNPay", "MoMo", "ZaloPay"];

  // Tạo 50 đơn hàng với thời gian khác nhau (30 ngày gần đây)
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30); // 0-30 ngày trước
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);

    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);
    orderDate.setHours(orderDate.getHours() - hoursAgo);
    orderDate.setMinutes(orderDate.getMinutes() - minutesAgo);

    const restaurant =
      restaurants[Math.floor(Math.random() * restaurants.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const restaurantMenu = menuItems[restaurant.id];

    // Random 1-4 món
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const orderItems = [];
    let total = 0;

    for (let j = 0; j < itemCount; j++) {
      const item =
        restaurantMenu[Math.floor(Math.random() * restaurantMenu.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      orderItems.push({
        name: item.name,
        price: item.price,
        quantity: quantity,
      });
      total += item.price * quantity;
    }

    // Phân bố status theo thời gian
    let status;
    if (daysAgo === 0 && hoursAgo < 2) {
      // Đơn trong 2 giờ gần đây: pending, confirmed, preparing, delivering
      const recentStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "delivering",
      ];
      status =
        recentStatuses[Math.floor(Math.random() * recentStatuses.length)];
    } else {
      // Đơn cũ hơn: chủ yếu completed hoặc cancelled
      status = Math.random() > 0.2 ? "completed" : "cancelled";
    }

    const discount = Math.random() > 0.7 ? Math.floor(total * 0.1) : 0;

    mockOrders.push({
      id: `ORD${1000 + i}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: addresses[Math.floor(Math.random() * addresses.length)],
      items: orderItems,
      total: total,
      discount: discount,
      status: status,
      paymentMethod:
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      note: Math.random() > 0.7 ? "Không cay, ít rau" : "",
      createdAt: orderDate.toISOString(),
      updatedAt: orderDate.toISOString(),
    });
  }

  // Sort theo thời gian mới nhất
  mockOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return mockOrders;
};

// Khởi tạo mock data nếu chưa có
const initializeMockData = () => {
  try {
    const existingOrders = localStorage.getItem(STORAGE_KEY);
    if (!existingOrders || JSON.parse(existingOrders).length === 0) {
      const mockOrders = generateMockOrders();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders));
      console.log("Mock orders initialized:", mockOrders.length, "orders");
    }
  } catch (error) {
    console.error("Error initializing mock data:", error);
  }
};

// Lấy tất cả orders
export const getAllOrders = () => {
  try {
    // Khởi tạo mock data nếu cần
    initializeMockData();

    const orders = localStorage.getItem(STORAGE_KEY);
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error("Error loading orders:", error);
    return [];
  }
};

// Lấy orders theo restaurant
export const getOrdersByRestaurant = (restaurantId) => {
  const allOrders = getAllOrders();
  return allOrders.filter((order) => order.restaurantId === restaurantId);
};

// Lấy order theo ID
export const getOrderById = (orderId) => {
  const allOrders = getAllOrders();
  return allOrders.find((order) => order.id === orderId);
};

// Tạo order mới
export const createOrder = (orderData) => {
  try {
    const allOrders = getAllOrders();
    const newOrder = {
      ...orderData,
      id: `ORD${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allOrders.push(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));

    // Notify subscribers
    notifySubscribers();

    console.log("Order created:", newOrder);
    return newOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};

// Cập nhật status của order
export const updateOrderStatus = (orderId, newStatus) => {
  try {
    const allOrders = getAllOrders();
    const orderIndex = allOrders.findIndex((order) => order.id === orderId);

    if (orderIndex === -1) {
      console.error("Order not found:", orderId);
      return null;
    }

    allOrders[orderIndex] = {
      ...allOrders[orderIndex],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));

    // Notify subscribers
    notifySubscribers();

    console.log("Order status updated:", orderId, newStatus);
    return allOrders[orderIndex];
  } catch (error) {
    console.error("Error updating order:", error);
    return null;
  }
};

// Subscribe to order updates
export const subscribeToOrderUpdates = (callback) => {
  subscribers.push(callback);

  // Return unsubscribe function
  return () => {
    subscribers = subscribers.filter((sub) => sub !== callback);
  };
};

// Notify all subscribers
const notifySubscribers = () => {
  subscribers.forEach((callback) => {
    try {
      callback();
    } catch (error) {
      console.error("Error in subscriber callback:", error);
    }
  });
};

// Helper function để trigger storage event manually cho cùng tab
export const triggerStorageEvent = () => {
  notifySubscribers();
};
