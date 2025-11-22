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
    canCancel: true,
    cancelTimeout: Date.now() + 5 * 60 * 1000, // 5 minutes to cancel after creation
  };

  console.log("New order created:", newOrder);

  orders.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  console.log("Order saved to localStorage. Total orders:", orders.length);

  // Trigger update event
  triggerOrderUpdate(newOrder.id, "created");

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

  // Nếu confirm hoặc preparing thì không cho cancel nữa
  if (
    [
      "confirmed",
      "preparing",
      "ready_for_delivery",
      "delivering",
      "completed",
    ].includes(newStatus)
  ) {
    orders[orderIndex].canCancel = false;
  }

  // Nếu giao hàng thì set thời gian bắt đầu giao
  if (newStatus === "delivering" && !orders[orderIndex].deliveryStartTime) {
    orders[orderIndex].deliveryStartTime = new Date().toISOString();
  }

  // Nếu hoàn thành thì set thời gian hoàn thành
  if (newStatus === "completed") {
    orders[orderIndex].completedAt = new Date().toISOString();
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
