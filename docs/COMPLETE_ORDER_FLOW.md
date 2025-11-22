# 🚁 FoodFast - Complete Order Flow

## 📱 GIAI ĐOẠN 1: KHÁCH HÀNG ĐẶT HÀNG

### 1.1 Customer chọn nhà hàng & món ăn

- **Trang chủ (customer-web)**: Hiển thị danh sách nhà hàng từ API `/restaurants`
- **Filter**: Chỉ hiển thị nhà hàng `isApproved: true` và đang mở cửa
- **Click vào nhà hàng**: Xem menu từ API `/products?restaurant=:id`
- **Add to cart**: Lưu vào Redux state

### 1.2 Checkout & Đặt hàng

- **Input**: Địa chỉ giao hàng, SĐT, ghi chú
- **Chọn phương thức thanh toán**: MoMo, ZaloPay, Banking, DronePay
- **Apply voucher** (optional)
- **Click "Đặt hàng"**:
  - POST `/api/orders`
  - Backend tạo order với `status: "pending"`
  - Backend emit Socket.io: `new_order` → restaurant room

---

## 🍽️ GIAI ĐOẠN 2: NHÀ HÀNG XỬ LÝ

### 2.1 Nhận đơn hàng mới (restaurant-web)

- **Real-time**: Socket.io nhận event `new_order`
- **Hiển thị**: Popup notification + sound alert
- **Trang Order Management**: Hiển thị order với status `pending`

### 2.2 Xác nhận đơn hàng

- **Action**: Restaurant click "Xác nhận đơn"
- **API**: PUT `/api/orders/:id/status` với `status: "confirmed"`
- **Backend**:
  - Update order status
  - Add timeline: `{ status: "confirmed", note: "Nhà hàng đã xác nhận" }`
  - Emit Socket.io: `order_updated` → customer

### 2.3 Chuẩn bị món ăn

- **Action**: Restaurant click "Bắt đầu chuẩn bị"
- **API**: PUT `/api/orders/:id/status` với `status: "preparing"`
- **UI**: Hiển thị estimated time (dựa vào số món)
- **Backend emit**: `order_updated` → customer

### 2.4 Món ăn sẵn sàng

- **Action**: Restaurant click "Sẵn sàng giao"
- **API**: PUT `/api/orders/:id/status` với `status: "ready"`
- **Backend**: Trigger tìm drone khả dụng

---

## 🚁 GIAI ĐOẠN 3: DRONE DELIVERY

### 3.1 Lựa chọn Drone

**Restaurant-web UI**:

```
┌─ Chọn Drone Giao Hàng ────────┐
│ Đơn hàng: #FF1732200000       │
│ Khoảng cách: 2.5km            │
│ Trọng lượng: 1.2kg            │
│                               │
│ ✅ Drone #D001 (Pin: 95%)    │
│    Phạm vi: 5km               │
│    Tải trọng: 2kg             │
│                               │
│ ⚠️ Drone #D002 (Pin: 45%)     │
│    Không đủ pin cho chuyến bay│
│                               │
│ [Giao cho D001] [Hủy]        │
└───────────────────────────────┘
```

**Backend logic**:

```javascript
// Auto-suggest drones
GET /api/drones/available?
  restaurantId=xxx&
  distance=2.5&
  weight=1.2

Response:
{
  available: [
    {
      id: "D001",
      battery: 95,
      maxRange: 5,
      canComplete: true
    },
    {
      id: "D002",
      battery: 45,
      maxRange: 3,
      canComplete: false,
      reason: "Insufficient battery"
    }
  ]
}
```

### 3.2 Gán Drone

- **Action**: Restaurant chọn drone → Click "Giao hàng"
- **API**: POST `/api/deliveries`

```json
{
  "orderId": "xxx",
  "droneId": "yyy",
  "startLocation": {
    "coordinates": [106.xxx, 10.xxx],
    "address": "123 Restaurant St"
  },
  "endLocation": {
    "coordinates": [106.yyy, 10.yyy],
    "address": "456 Customer St"
  }
}
```

- **Backend**:
  - Create Delivery document với `status: "assigned"`
  - Update Order: `status: "delivering"`, link `drone` field
  - Update Drone: `status: "busy"`, `currentOrder: orderId`
  - Emit Socket.io: `order_updated` + `drone_assigned` → customer

### 3.3 Drone khởi hành

- **Backend cron job** (hoặc manual trigger):
  - Update Delivery: `status: "picked_up"`
  - Add Order timeline: "Drone đã lấy hàng"
  - Start tracking: Emit `drone_location` every 2s

### 3.4 Đang vận chuyển

- **Customer-web/app**: Hiển thị map real-time
  - Vị trí drone (update mỗi 2s)
  - Estimated arrival time
  - Flight path

### 3.5 Giao hàng thành công

- **Backend** (auto khi drone đến địa điểm):
  - Update Delivery: `status: "delivered"`, `deliveredAt: Date.now()`
  - Update Order: `status: "delivered"`, `actualDeliveryTime: Date.now()`
  - Update Drone: `status: "available"`, `currentOrder: null`
  - Emit Socket.io: `order_completed` → customer, restaurant

---

## 📊 GIAI ĐOẠN 4: HOÀN TẤT & ĐÁNH GIÁ

### 4.1 Customer xác nhận nhận hàng

- **Customer-web**: Hiển thị "Đánh giá đơn hàng"
- **API**: POST `/api/reviews`

```json
{
  "orderId": "xxx",
  "restaurantId": "yyy",
  "rating": 5,
  "comment": "Ngon, ship nhanh!",
  "images": ["url1", "url2"]
}
```

### 4.2 Restaurant xem review

- **Restaurant-web → Reviews page**
- **API**: GET `/api/reviews?restaurant=:id`

---

## 🎯 CÁC API CẦN FIX/BỔ SUNG

### 1. Customer-web Home page

**File**: `customer-web/src/pages/Home/Home.jsx`
**Fix**: Thay mockData bằng API call

```javascript
useEffect(() => {
  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(`${API_URL}/restaurants`);
      if (res.data.success) {
        // Filter: chỉ hiển thị nhà hàng approved
        const approved = res.data.data.filter((r) => r.isApproved);
        setRestaurantList(approved);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };
  fetchRestaurants();
}, []);
```

### 2. Backend: Drone availability API

**File**: `backend/controllers/droneController.js`
**Add**:

```javascript
export const getAvailableDrones = async (req, res) => {
  try {
    const { restaurantId, distance, weight } = req.query;

    // Tìm drones gần nhà hàng và đủ điều kiện
    const drones = await Drone.find({
      restaurant: restaurantId,
      status: "available",
    });

    const available = drones.map((drone) => {
      const maxRange = (drone.batteryLevel / 100) * drone.maxFlightDistance;
      const canComplete = maxRange >= distance * 2; // round trip

      return {
        ...drone.toObject(),
        canComplete,
        reason: !canComplete ? "Insufficient battery" : null,
      };
    });

    res.json({ success: true, data: available });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### 3. Backend: Create Delivery API

**File**: `backend/controllers/deliveryController.js`
**Create new file**:

```javascript
import Delivery from "../models/Delivery.js";
import Order from "../models/Order.js";
import Drone from "../models/Drone.js";

export const createDelivery = async (req, res) => {
  try {
    const { orderId, droneId, startLocation, endLocation } = req.body;

    // Validate order & drone
    const order = await Order.findById(orderId);
    const drone = await Drone.findById(droneId);

    if (!order || !drone) {
      return res.status(404).json({
        success: false,
        message: "Order or Drone not found",
      });
    }

    // Create delivery
    const delivery = await Delivery.create({
      deliveryId: `DL${Date.now()}`,
      orderId,
      droneId,
      startLocation,
      endLocation,
      status: "assigned",
    });

    // Update order
    order.status = "delivering";
    order.drone = droneId;
    order.droneDeliveryDetails.assignedAt = new Date();
    order.timeline.push({
      status: "delivering",
      note: `Drone ${drone.droneId} đã được gán`,
    });
    await order.save();

    // Update drone
    drone.status = "busy";
    drone.currentOrder = orderId;
    await drone.save();

    // Socket.io emit
    req.io.to(`customer_${order.customer}`).emit("order_updated", order);
    req.io.to(`restaurant_${order.restaurant}`).emit("order_updated", order);
    req.io.to("admin").emit("drone_assigned", { order, drone, delivery });

    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1: Fix Customer-web data loading ✅

- [ ] Home.jsx: Load restaurants from API
- [ ] RestaurantDetail.jsx: Load products from API (đã fix)
- [ ] Remove all mockData imports

### Phase 2: Order Creation Flow ✅

- [ ] Checkout: POST /api/orders
- [ ] Backend: Create order + emit Socket
- [ ] Restaurant-web: Listen Socket + display new order

### Phase 3: Restaurant Order Management

- [ ] OrderManagement: Fetch orders from API
- [ ] Status buttons: Confirm, Prepare, Ready
- [ ] Each action: PUT /api/orders/:id/status

### Phase 4: Drone Assignment

- [ ] Backend: GET /api/drones/available
- [ ] Restaurant-web: Drone selection UI
- [ ] Backend: POST /api/deliveries
- [ ] Update Order + Drone status

### Phase 5: Delivery Tracking

- [ ] Backend: Simulate drone movement (cron/interval)
- [ ] Socket.io: Emit drone_location every 2s
- [ ] Customer-web: Map component với real-time tracking

### Phase 6: Complete & Review

- [ ] Backend: Auto-complete delivery when arrived
- [ ] Customer-web: Review form
- [ ] Restaurant-web: Display reviews

---

## 🚀 BẮT ĐẦU TỪ ĐÂU?

**Ưu tiên 1**: Fix Customer-web load data từ database
**Ưu tiên 2**: Test order creation flow
**Ưu tiên 3**: Implement restaurant order management
**Ưu tiên 4**: Drone assignment UI
**Ưu tiên 5**: Delivery tracking

Bạn muốn mình bắt đầu từ phase nào?
