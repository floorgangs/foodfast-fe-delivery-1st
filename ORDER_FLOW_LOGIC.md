# Order Flow Logic - FoodFast Drone Delivery

## 📋 Luồng đặt hàng hoàn chỉnh

### 1. Customer Mobile App → Backend

#### Bước 1: Customer chọn món và thanh toán
```
Mobile: CheckoutScreen
  ↓
  ├── Chọn địa chỉ giao hàng
  ├── Nhập voucher (optional)
  ├── Chọn phương thức thanh toán
  ├── Xem tổng tiền
  └── Bấm "Đặt hàng"
```

#### Bước 2: Mobile gọi API tạo order
```javascript
POST /api/orders
Headers: {
  Authorization: Bearer <customer_token>
}
Body: {
  restaurant: "restaurantId",
  items: [
    { product: "productId", quantity: 2, price: 50000 }
  ],
  deliveryAddress: {
    street: "123 ABC",
    city: "TP.HCM",
    district: "Quận 1",
    ward: "Phường 1"
  },
  paymentMethod: "momo",
  note: "Ghi chú đặt hàng",
  voucherCode: "WELCOME50",
  subtotal: 100000,
  deliveryFee: 15000,
  discount: 50000,
  totalAmount: 65000
}
```

#### Bước 3: Backend xử lý
```javascript
// orderController.js - createOrder()
1. Validate restaurant exists
2. Validate products & tính toán lại giá (security)
3. Generate order number: FD<timestamp>
4. Create order với status: "pending"
5. Save timeline: [{ status: "pending", note: "Đơn hàng đã được tạo" }]
6. Populate order data (customer, restaurant, products)
7. Emit Socket.io events:
   - socket.to(`restaurant_${restaurantId}`).emit("new_order", order)
   - socket.to("admin").emit("new_order", order)
8. Return order to mobile app
```

#### Bước 4: Mobile nhận response
```javascript
Response: {
  success: true,
  data: {
    _id: "orderId",
    orderNumber: "FD1732200000",
    customer: { name, phone },
    restaurant: { name, address },
    items: [...],
    status: "pending",
    total: 65000,
    ...
  }
}
```

Mobile app:
- Dispatch Redux action `createOrder`
- Clear cart
- Show success modal
- Navigate to Orders screen

---

### 2. Restaurant Web App nhận order real-time

#### Bước 1: Restaurant Web kết nối Socket.io
```javascript
// Khi restaurant login thành công
import { initSocket, joinRestaurantRoom, onNewOrder } from '../services/socket';

// Init socket
const socket = initSocket();

// Join restaurant room
joinRestaurantRoom(restaurantId);

// Listen for new orders
onNewOrder((order) => {
  console.log('🔔 Đơn hàng mới:', order);
  
  // Show notification
  showNotification('Đơn hàng mới', order.orderNumber);
  
  // Play sound
  playOrderSound();
  
  // Update orders list
  dispatch(addNewOrder(order));
});
```

#### Bước 2: Restaurant xem chi tiết đơn
```
Restaurant Dashboard:
  ├── Hiển thị danh sách orders (status: pending)
  ├── Click vào order để xem chi tiết
  ├── Thông tin:
  │   ├── Order Number
  │   ├── Customer (name, phone, address)
  │   ├── Items (món ăn, số lượng, giá)
  │   ├── Total amount
  │   └── Delivery address
  └── Actions:
      ├── [Chấp nhận] → Confirm order
      ├── [Từ chối] → Cancel order
      └── [Gán drone] → Assign drone
```

#### Bước 3: Restaurant xác nhận đơn
```javascript
// Restaurant clicks "Chấp nhận"
PUT /api/orders/:id/status
Headers: {
  Authorization: Bearer <restaurant_token>
}
Body: {
  status: "confirmed",
  note: "Đơn hàng đã được xác nhận, đang chuẩn bị"
}
```

#### Bước 4: Backend cập nhật status
```javascript
// orderController.js - updateOrderStatus()
1. Find order by ID
2. Check permissions (restaurant owner)
3. Update order.status = "confirmed"
4. Add timeline entry
5. Save order
6. Emit Socket.io events:
   - socket.to(`customer_${customerId}`).emit("order_updated", order)
   - socket.to(`restaurant_${restaurantId}`).emit("order_updated", order)
   - socket.to("admin").emit("order_updated", order)
7. Return updated order
```

---

### 3. Order Status Flow

```
pending → confirmed → preparing → ready → delivering → delivered
                ↓
            cancelled
```

#### Status và ý nghĩa:
- **pending**: Đơn mới tạo, chờ nhà hàng xác nhận
- **confirmed**: Nhà hàng đã xác nhận, bắt đầu chuẩn bị
- **preparing**: Đang chuẩn bị món ăn
- **ready**: Món ăn đã sẵn sàng, chờ drone
- **delivering**: Drone đang giao hàng
- **delivered**: Đã giao thành công
- **cancelled**: Đơn hàng bị hủy

#### Restaurant actions cho từng status:
```javascript
const statusActions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivering"],  // After assigning drone
  delivering: ["delivered"],
  delivered: [],  // Terminal state
  cancelled: []   // Terminal state
};
```

---

### 4. Drone Assignment Logic

#### Bước 1: Restaurant gán drone
```javascript
// Restaurant Dashboard → Order Detail
1. Click "Gán drone"
2. Modal hiển thị danh sách drones available
3. Filter: status === "available" && batteryLevel > 20%
4. Restaurant chọn drone
5. Click "Xác nhận gán"
```

#### Bước 2: API assign drone
```javascript
PUT /api/orders/:id/assign-drone
Body: {
  droneId: "droneId"
}

Backend:
1. Update order.assignedDrone = droneId
2. Update order.status = "delivering"
3. Update drone.status = "busy"
4. Update drone.currentOrder = orderId
5. Add timeline entry
6. Emit socket events
```

#### Bước 3: Drone tracking
```javascript
// Drone sends location updates (simulated)
PUT /api/drones/:id/location
Body: {
  lat: 10.762622,
  lng: 106.660172
}

Backend:
1. Update drone.currentLocation = { lat, lng }
2. Emit socket: drone_location_updated
3. Mobile app nhận và cập nhật map real-time
```

---

### 5. Mobile App Tracking

#### Order Tracking Screen
```javascript
import { onOrderUpdate, onDroneLocationUpdate } from '../services/socket';

useEffect(() => {
  // Listen for order updates
  onOrderUpdate((updatedOrder) => {
    if (updatedOrder._id === currentOrder._id) {
      setOrder(updatedOrder);
      // Update UI: status badge, timeline
    }
  });

  // Listen for drone location
  onDroneLocationUpdate((data) => {
    if (data.droneId === order.assignedDrone) {
      setDroneLocation(data.location);
      // Update map marker
    }
  });

  return () => {
    offOrderUpdate();
    offDroneLocationUpdate();
  };
}, [order]);
```

---

### 6. Complete API Endpoints

#### Orders
```
POST   /api/orders                  - Create order (Customer)
GET    /api/orders                  - Get orders (filtered by role)
GET    /api/orders/:id              - Get order detail
PUT    /api/orders/:id/status       - Update order status (Restaurant/Admin)
PUT    /api/orders/:id/cancel       - Cancel order (Customer/Restaurant)
PUT    /api/orders/:id/assign-drone - Assign drone (Restaurant)
```

#### Drones
```
GET    /api/drones                     - Get all drones
GET    /api/drones/restaurant/:id     - Get restaurant drones
GET    /api/drones/:id                - Get drone detail
POST   /api/drones                    - Create drone (Restaurant/Admin)
PUT    /api/drones/:id                - Update drone
PUT    /api/drones/:id/status         - Update drone status
PUT    /api/drones/:id/location       - Update drone location
DELETE /api/drones/:id                - Delete drone
```

#### Vouchers
```
GET    /api/vouchers           - Get active vouchers
POST   /api/vouchers/apply     - Apply voucher code
POST   /api/vouchers           - Create voucher (Admin)
PUT    /api/vouchers/:id       - Update voucher (Admin)
DELETE /api/vouchers/:id       - Delete voucher (Admin)
```

---

### 7. Socket.io Events

#### Rooms
```javascript
// Customer
socket.emit('join_room', { userId: customerId, role: 'customer' });
// Room name: `customer_${customerId}`

// Restaurant
socket.emit('join_room', { restaurantId, role: 'restaurant' });
// Room name: `restaurant_${restaurantId}`

// Admin
socket.emit('join_room', { role: 'admin' });
// Room name: `admin`
```

#### Events
```javascript
// New order created
socket.to(`restaurant_${restaurantId}`).emit('new_order', order);
socket.to('admin').emit('new_order', order);

// Order status updated
socket.to(`customer_${customerId}`).emit('order_updated', order);
socket.to(`restaurant_${restaurantId}`).emit('order_updated', order);

// Order cancelled
socket.to(`restaurant_${restaurantId}`).emit('order_cancelled', order);

// Drone location updated
socket.emit('drone_location_updated', { droneId, location });
```

---

### 8. Database Schema References

#### Order Model
```javascript
{
  orderNumber: String,         // FD1732200000
  customer: ObjectId → User,
  restaurant: ObjectId → Restaurant,
  items: [{
    product: ObjectId → Product,
    name: String,
    price: Number,
    quantity: Number
  }],
  subtotal: Number,
  deliveryFee: Number,
  discount: Number,
  total: Number,
  status: enum,
  deliveryAddress: {...},
  paymentMethod: String,
  voucherCode: String,
  assignedDrone: ObjectId → Drone,
  timeline: [{
    status: String,
    note: String,
    timestamp: Date
  }]
}
```

---

### 9. Tài khoản Test

```
Customer:
- customer1@gmail.com / 123456
- customer2@gmail.com / 123456

Restaurant:
- phoviet@restaurant.com / 123456
- lauhaisan@restaurant.com / 123456
- comtam@restaurant.com / 123456

Admin:
- admin@foodfast.com / 123456
```

---

### 10. Testing Flow

#### Test đặt hàng hoàn chỉnh:
1. **Mobile App**: Login customer1@gmail.com
2. **Mobile**: Browse restaurants → Pick Phở Việt
3. **Mobile**: Add items to cart → Checkout
4. **Mobile**: Apply voucher WELCOME50
5. **Mobile**: Place order
6. **Restaurant Web**: Login phoviet@restaurant.com
7. **Restaurant**: Nhận notification đơn mới
8. **Restaurant**: Xác nhận đơn → Status: confirmed
9. **Mobile**: Nhận notification "Đơn đã xác nhận"
10. **Restaurant**: Cập nhật → preparing → ready
11. **Restaurant**: Gán drone → Status: delivering
12. **Mobile**: Track order với map real-time
13. **Restaurant**: Cập nhật → delivered
14. **Mobile**: Order completed

---

**Last updated**: November 21, 2025  
**Status**: ✅ Full stack integrated với real-time updates
