// Service để quản lý orders qua localStorage (giả lập real-time communication)

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

// Tạo order mới
export const createOrder = (orderData) => {
  console.log("createOrder called with data:", orderData);

  const orders = getAllOrders();
  const newOrder = {
    ...orderData,
    id: `ORD${Date.now()}`,
    status: "pending", // pending, confirmed, preparing, ready_for_delivery, delivering, completed, cancelled
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedDeliveryTime: 15, // seconds for demo
    canCancel: true,
    cancelTimeout: Date.now() + 20 * 60 * 1000, // 20 minutes from now
  };

  console.log("New order created:", newOrder);

  orders.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  console.log("Order saved to localStorage. Total orders:", orders.length);

  // Trigger update event
  triggerOrderUpdate(newOrder.id, "created");

  // Auto-progress order status every 15 seconds
  startAutoProgression(newOrder.id);

  return newOrder;
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

// Cancel order
export const cancelOrder = (orderId, reason = "") => {
  const order = getOrderById(orderId);

  if (!order) return null;

  // Check if can cancel
  if (!order.canCancel || Date.now() > order.cancelTimeout) {
    return { error: "Không thể hủy đơn hàng này" };
  }

  // Stop auto-progression
  stopAutoProgression(orderId);

  return updateOrderStatus(orderId, "cancelled", {
    cancelReason: reason,
    cancelledAt: new Date().toISOString(),
  });
};

// Confirm received
export const confirmReceived = (orderId) => {
  return updateOrderStatus(orderId, "completed", {
    completedAt: new Date().toISOString(),
  });
};

// Add review
export const addReview = (orderId, reviewData) => {
  const orders = getAllOrders();
  const orderIndex = orders.findIndex((order) => order.id === orderId);

  if (orderIndex === -1) return null;

  // Update order with review
  orders[orderIndex] = {
    ...orders[orderIndex],
    review: reviewData,
    reviewedAt: new Date().toISOString(),
  };

  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  // Save review to separate reviews storage for restaurant display
  const restaurantId = orders[orderIndex].restaurantId;
  const reviews = JSON.parse(localStorage.getItem("foodfast_reviews") || "[]");

  const newReview = {
    id: `review_${Date.now()}`,
    restaurantId: restaurantId,
    orderId: orderId,
    customerName: reviewData.customerName || "Khách hàng",
    rating: reviewData.rating,
    comment: reviewData.comment,
    createdAt: reviewData.createdAt || new Date().toISOString(),
  };

  reviews.push(newReview);
  localStorage.setItem("foodfast_reviews", JSON.stringify(reviews));

  return orders[orderIndex];
};

// Get orders by restaurant ID
export const getOrdersByRestaurant = (restaurantId) => {
  const orders = getAllOrders();
  return orders.filter((order) => order.restaurantId === restaurantId);
};

// Get orders by customer ID
export const getOrdersByCustomer = (customerId) => {
  const orders = getAllOrders();
  return orders.filter((order) => order.customerId === customerId);
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

// Check if order can be cancelled (20 minutes rule)
export const canCancelOrder = (order) => {
  if (!order || order.status !== "pending") return false;
  return Date.now() < order.cancelTimeout;
};

// Get time remaining to cancel (in seconds)
export const getTimeToCancel = (order) => {
  if (!order || !order.cancelTimeout) return 0;
  const remaining = Math.max(0, order.cancelTimeout - Date.now());
  return Math.floor(remaining / 1000);
};

// Auto-progress order through statuses
const orderProgressionTimers = new Map();

const startAutoProgression = (orderId) => {
  // Clear any existing timer for this order
  if (orderProgressionTimers.has(orderId)) {
    clearTimeout(orderProgressionTimers.get(orderId));
  }

  const progressOrder = () => {
    const order = getOrderById(orderId);
    if (!order) return;

    // Don't progress if cancelled or already completed
    if (order.status === "cancelled" || order.status === "completed") {
      orderProgressionTimers.delete(orderId);
      return;
    }

    // Status progression flow
    const statusFlow = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "ready_for_delivery",
      ready_for_delivery: "delivering",
      delivering: "completed",
    };

    const nextStatus = statusFlow[order.status];

    if (nextStatus) {
      console.log(
        `🔄 Auto-progressing order ${orderId}: ${order.status} → ${nextStatus}`
      );
      updateOrderStatus(orderId, nextStatus);

      // Schedule next progression if not completed
      if (nextStatus !== "completed") {
        const timer = setTimeout(progressOrder, 15000); // 15 seconds
        orderProgressionTimers.set(orderId, timer);
      } else {
        orderProgressionTimers.delete(orderId);
      }
    }
  };

  // Start first progression after 15 seconds
  const timer = setTimeout(progressOrder, 15000);
  orderProgressionTimers.set(orderId, timer);
};

// Stop auto-progression (e.g., when order is cancelled)
export const stopAutoProgression = (orderId) => {
  if (orderProgressionTimers.has(orderId)) {
    clearTimeout(orderProgressionTimers.get(orderId));
    orderProgressionTimers.delete(orderId);
  }
};

// Resume auto-progression for incomplete orders (call on app load)
export const resumeAutoProgressions = () => {
  const orders = getAllOrders();
  orders.forEach((order) => {
    // Resume for orders that are not completed or cancelled
    if (order.status !== "completed" && order.status !== "cancelled") {
      console.log(`♻️ Resuming auto-progression for order ${order.id}`);
      startAutoProgression(order.id);
    }
  });
};
