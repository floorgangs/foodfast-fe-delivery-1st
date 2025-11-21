// Service để quản lý orders qua localStorage (giả lập real-time communication)
// File này được chia sẻ giữa customer-web và restaurant-web

const ORDERS_KEY = "foodfast_orders";
const ORDER_UPDATES_KEY = "foodfast_order_updates";

// Lấy tất cả orders
export const getAllOrders = () => {
  try {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
};

// Lấy order theo ID
export const getOrderById = (orderId) => {
  const orders = getAllOrders();
  return orders.find((order) => order.id === orderId);
};

// Cập nhật order status
export const updateOrderStatus = (orderId, newStatus, additionalData = {}) => {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex((order) => order.id === orderId);

  if (orderIndex === -1) return null;

  orders[orderIndex] = {
    ...orders[orderIndex],
    status: newStatus,
    updatedAt: new Date().toISOString(),
    ...additionalData,
  };

  // Nếu confirm thì không cho cancel nữa
  if (newStatus === "confirmed") {
    orders[orderIndex].canCancel = false;
  }

  // Nếu giao hàng thì set thời gian giao
  if (newStatus === "delivering") {
    orders[orderIndex].deliveryStartTime = Date.now();
    orders[orderIndex].estimatedArrival = Date.now() + 15000; // 15 seconds
  }

  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  // Trigger update event
  triggerOrderUpdate(orderId, newStatus);

  return orders[orderIndex];
};

// Get orders by restaurant ID
export const getOrdersByRestaurant = (restaurantId) => {
  const orders = getAllOrders();
  console.log("=== getOrdersByRestaurant ===");
  console.log("Looking for restaurantId:", restaurantId);
  console.log("All orders:", orders);
  console.log(
    "Orders with restaurantId field:",
    orders.map((o) => ({ id: o.id, restaurantId: o.restaurantId }))
  );

  const filtered = orders.filter(
    (order) => order.restaurantId === restaurantId
  );
  console.log("Filtered orders:", filtered);
  return filtered;
};

// Trigger order update event (giả lập real-time)
const triggerOrderUpdate = (orderId, eventType) => {
  const event = {
    orderId,
    eventType,
    timestamp: Date.now(),
  };

  localStorage.setItem(ORDER_UPDATES_KEY, JSON.stringify(event));

  // Dispatch custom event
  window.dispatchEvent(
    new CustomEvent("orderUpdate", {
      detail: event,
    })
  );
};

// Listen for order updates
export const subscribeToOrderUpdates = (callback) => {
  const handleUpdate = (event) => {
    callback(event.detail);
  };

  window.addEventListener("orderUpdate", handleUpdate);

  // Cũng check localStorage changes từ tab khác
  const handleStorageChange = (e) => {
    if (e.key === ORDER_UPDATES_KEY && e.newValue) {
      try {
        const update = JSON.parse(e.newValue);
        callback(update);
      } catch (error) {
        console.error("Error parsing order update:", error);
      }
    }
  };

  window.addEventListener("storage", handleStorageChange);

  // Return unsubscribe function
  return () => {
    window.removeEventListener("orderUpdate", handleUpdate);
    window.removeEventListener("storage", handleStorageChange);
  };
};

// Resume auto-progression for incomplete orders (sync with customer-web)
export const resumeAutoProgressions = () => {
  const orders = getAllOrders();
  console.log(
    "📡 Restaurant resuming auto-progressions for",
    orders.length,
    "orders"
  );
};
