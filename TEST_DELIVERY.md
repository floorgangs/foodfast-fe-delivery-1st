# Test Delivery & Location Tracking

## Luồng tạo Delivery

### 1. Tạo Order (status: pending)
```bash
POST /api/orders
# Order được tạo với status = "pending"
```

### 2. Thanh toán (status: paid)
```bash
POST /api/orders/confirm-payment
# Order chuyển sang "paid"
```

### 3. Nhà hàng xác nhận (status: confirmed)
```bash
PATCH /api/orders/:orderId/status
Body: { "status": "confirmed" }
# Order chuyển sang "confirmed"
```

### 4. Chuẩn bị món (status: preparing)
```bash
PATCH /api/orders/:orderId/status
Body: { "status": "preparing" }
# Order chuyển sang "preparing"
```

### 5. Bắt đầu giao hàng (status: delivering) ⭐
```bash
PATCH /api/orders/:orderId/status
Body: { "status": "delivering" }
# Order chuyển sang "delivering"
# ✅ Delivery record được TẠO trong collection "deliveries"
# ✅ Drone được assign và status = "delivering"
```

### 6. Hoàn thành (status: delivered)
```bash
PATCH /api/orders/:orderId/status
Body: { "status": "delivered" }
# Order chuyển sang "delivered"
# ✅ Delivery được UPDATE status = "delivered", deliveredAt
# ✅ Drone trở về status = "available"
```

---

## Test Location Tracking

### Cập nhật vị trí drone (mỗi 5-10 giây)
```bash
PATCH /api/delivery/drone/:droneId/location
Body: {
  "latitude": 10.762622,
  "longitude": 106.660172,
  "altitude": 50
}
# ✅ Location record được TẠO trong collection "locations"
# ✅ Drone currentLocation được cập nhật
# ✅ Socket.io emit event "drone_location_update"
```

### Lấy lịch sử vị trí
```bash
GET /api/delivery/drone/:droneId/location-history?limit=100
# Trả về 100 vị trí gần nhất của drone
```

---

## Kiểm tra Database

### Collection: deliveries
```javascript
// Sau khi order chuyển sang "delivering"
db.deliveries.find({}).pretty()

// Kết quả mong đợi:
{
  _id: ObjectId("..."),
  deliveryId: "DEL-673a2...-1733123456789",
  orderId: ObjectId("673a2..."),
  droneId: ObjectId("673a1..."),
  startLocation: {
    type: "Point",
    coordinates: [106.660172, 10.762622], // [lng, lat]
    address: "123 Nguyen Hue, Q1, HCM"
  },
  endLocation: {
    type: "Point",
    coordinates: [106.670000, 10.770000],
    address: "456 Le Loi, Q1, HCM"
  },
  status: "in_transit", // hoặc "delivered"
  deliveredAt: ISODate("2024-12-02T10:30:00Z"),
  createdAt: ISODate("2024-12-02T10:00:00Z")
}
```

### Collection: locations
```javascript
// Sau khi gọi API updateDroneLocation
db.locations.find({}).sort({ recordedAt: -1 }).limit(10).pretty()

// Kết quả mong đợi:
{
  _id: ObjectId("..."),
  locationId: "673a1...-1733123456789",
  droneId: ObjectId("673a1..."),
  longitude: 106.660172,
  latitude: 10.762622,
  altitude: 50,
  recordedAt: ISODate("2024-12-02T10:15:30Z")
}
```

---

## Lưu ý

1. **Delivery chỉ được tạo khi order chuyển sang "delivering"**
   - Nếu order vẫn ở "pending", "confirmed", "preparing" → KHÔNG có Delivery

2. **Location chỉ được lưu khi gọi API updateDroneLocation**
   - Cần gọi API này định kỳ (mỗi 5-10 giây) khi drone đang giao hàng
   - Hoặc tích hợp với GPS tracker thực tế

3. **Để test nhanh:**
   - Tạo order mới
   - Dùng Postman/Thunder Client update status từng bước
   - Hoặc dùng Restaurant Web UI để update status

4. **Query nhanh MongoDB Compass:**
   ```javascript
   // Deliveries của order cụ thể
   { orderId: ObjectId("YOUR_ORDER_ID") }
   
   // Locations của drone cụ thể
   { droneId: ObjectId("YOUR_DRONE_ID") }
   ```
