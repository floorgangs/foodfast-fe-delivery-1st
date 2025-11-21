# 📊 PHÂN TÍCH DATABASE - FOODFAST DRONE DELIVERY SYSTEM

## 🎯 TỔNG QUAN HỆ THỐNG

FoodFast là hệ thống giao đồ ăn tự động bằng **DRONE**, với 3 vai trò chính:

- **Customer**: Đặt món, theo dõi đơn hàng
- **Restaurant**: Nhận đơn, chuẩn bị món, điều khiển drone giao hàng
- **Admin**: Quản lý toàn bộ hệ thống, quản lý drone fleet

---

## 🗄️ DATABASE COLLECTIONS (7 collections)

### 1️⃣ **USERS** - Người dùng

Lưu thông tin tất cả người dùng (Customer, Restaurant owner, Admin)

**Khi nào tạo:**

- Customer đăng ký tài khoản mới (Register)
- Restaurant owner đăng ký
- Admin tạo tài khoản admin

**Quan hệ:**

- → Orders (1-n): 1 user có nhiều orders
- → Restaurants (1-1): Restaurant owner có 1 restaurant
- → Vouchers (n-n): Tracking vouchers đã sử dụng

**Schema:**

```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: ['customer', 'restaurant', 'admin'],
  avatar: String,
  addresses: [{
    label, address, city, district, ward,
    coordinates: {lat, lng},
    isDefault
  }],
  favoriteRestaurants: [ObjectId],
  usedVouchers: [{
    voucher: ObjectId,
    usedCount: Number,
    lastUsed: Date
  }],
  loyaltyPoints: Number,
  isActive: Boolean
}
```

---

### 2️⃣ **RESTAURANTS** - Nhà hàng

Thông tin nhà hàng, món ăn, giờ mở cửa

**Khi nào tạo:**

- Restaurant owner đăng ký và tạo nhà hàng
- Admin tạo nhà hàng cho chủ mới

**Quan hệ:**

- → User (n-1): Thuộc về 1 owner
- → Products (1-n): 1 restaurant có nhiều products
- → Orders (1-n): Nhận nhiều orders
- → Drones (1-n): Quản lý nhiều drones

**Schema:**

```javascript
{
  name: String,
  owner: ObjectId (User),
  description: String,
  cuisine: [String],
  avatar, coverImage: String,
  address: {
    street, city, district, ward,
    coordinates: {lat, lng}
  },
  phone, email: String,
  openingHours: {
    monday: {open, close, isOpen},
    // ... các ngày khác
  },
  rating: Number (0-5),
  totalReviews: Number,
  deliveryFee: Number,
  minOrder: Number,
  estimatedDeliveryTime: String,
  isActive, isApproved, isBusy: Boolean,
  tags: [String]
}
```

---

### 3️⃣ **PRODUCTS** - Món ăn

Danh sách món ăn của từng nhà hàng

**Khi nào tạo:**

- Restaurant thêm món mới vào menu
- Admin thêm món cho restaurant

**Quan hệ:**

- → Restaurant (n-1): Thuộc về 1 restaurant
- → Orders (n-n): Có trong nhiều orders

**Schema:**

```javascript
{
  restaurant: ObjectId,
  name: String,
  description: String,
  category: String,
  price: Number,
  originalPrice: Number,
  image: String,
  images: [String],
  isAvailable: Boolean,
  preparationTime: String,
  tags: [String],
  rating: Number,
  totalReviews: Number,
  soldCount: Number,
  options: [{
    name: String,
    choices: [{name, price}],
    required, multiple: Boolean
  }]
}
```

---

### 4️⃣ **ORDERS** - Đơn hàng ⭐ CORE

Đơn hàng từ customer, được giao bằng drone

**Khi nào tạo:**

- Customer checkout và đặt hàng

**Luồng xử lý:**

```
1. Customer đặt hàng → CREATE Order (status: pending)
2. Restaurant xác nhận → UPDATE (status: confirmed)
3. Restaurant chuẩn bị → UPDATE (status: preparing)
4. Món sẵn sàng → UPDATE (status: ready)
5. Restaurant chọn drone → ASSIGN Drone
6. Drone cất cánh → UPDATE (status: delivering, drone launched)
7. Drone giao hàng → UPDATE (status: delivered)
8. Drone về nhà → UPDATE drone location
```

**Quan hệ:**

- → User/Customer (n-1): Thuộc về 1 customer
- → Restaurant (n-1): Đặt từ 1 restaurant
- → Products (n-n): Gồm nhiều products
- → Drone (n-1): Được giao bởi 1 drone
- → Voucher (n-1): Áp dụng 1 voucher (optional)

**Schema:**

```javascript
{
  orderNumber: String (unique, auto),
  customer: ObjectId,
  restaurant: ObjectId,
  items: [{
    product: ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    options: [{name, choice, price}],
    specialInstructions: String
  }],
  subtotal: Number,
  deliveryFee: Number,
  voucher: ObjectId,
  discount: Number,
  total: Number,
  deliveryAddress: {
    label, address, city, district, ward,
    coordinates: {lat, lng},
    phone, note: String
  },
  paymentMethod: ['cash', 'momo', 'zalopay', 'card', 'banking'],
  paymentStatus: ['pending', 'paid', 'failed', 'refunded'],
  status: ['pending', 'confirmed', 'preparing', 'ready',
           'delivering', 'delivered', 'cancelled'],

  // DRONE DELIVERY INFO
  drone: ObjectId,
  droneDeliveryDetails: {
    assignedAt: Date,
    launchedAt: Date,
    arrivedAt: Date,
    returnedAt: Date,
    flightDistance: Number,
    flightDuration: Number,
    batteryUsed: Number
  },

  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  cancelReason: String,
  customerNote: String,
  restaurantNote: String,
  timeline: [{
    status: String,
    timestamp: Date,
    note: String
  }]
}
```

---

### 5️⃣ **DRONES** - Drone giao hàng ⭐ ĐẶC TRƯNG

Quản lý đội drone, trạng thái, vị trí

**Khi nào tạo:**

- Restaurant mua drone mới → Admin/Restaurant thêm vào hệ thống
- Admin cấp phát drone cho restaurant

**Cập nhật khi:**

- Drone được assign cho order → status: busy
- Drone cất cánh → update currentLocation
- Drone đang giao → tracking location real-time
- Drone về nhà → status: available, update statistics
- Drone sạc pin → status: charging
- Drone bảo trì → status: maintenance

**Quan hệ:**

- → Restaurant (n-1): Thuộc về 1 restaurant
- → Orders (1-n): Giao nhiều orders

**Schema:**

```javascript
{
  droneId: String (unique, uppercase),
  name: String,
  model: String,
  restaurant: ObjectId,
  status: ['available', 'busy', 'charging', 'maintenance', 'offline'],
  batteryLevel: Number (0-100),
  maxWeight: Number (grams),
  maxDistance: Number (meters),
  currentLocation: {lat, lng},
  homeLocation: {lat, lng},
  specifications: {
    flightTime: Number (phút),
    speed: Number (km/h),
    manufacturer: String,
    purchaseDate: Date
  },
  statistics: {
    totalDeliveries: Number,
    totalFlightTime: Number,
    totalDistance: Number
  },
  maintenanceHistory: [{
    date, type, description, cost, technician
  }],
  isActive: Boolean
}
```

---

### 6️⃣ **VOUCHERS** - Mã giảm giá

Voucher khuyến mãi do Admin tạo

**Khi nào tạo:**

- Admin tạo campaign khuyến mãi

**Khi nào dùng:**

- Customer nhập mã voucher khi checkout
- System validate voucher (valid date, usage limit, min order)
- Apply discount vào order
- Update voucher.currentUsage++
- Track vào user.usedVouchers

**Quan hệ:**

- → Orders (1-n): Được dùng trong nhiều orders
- → Restaurants (n-n): Áp dụng cho một số restaurant
- → Users (n-n): Tracking users đã dùng

**Schema:**

```javascript
{
  code: String (unique, uppercase),
  name: String,
  description: String,
  type: ['percentage', 'fixed', 'free_delivery'],
  value: Number,
  maxDiscount: Number,
  minOrderValue: Number,
  maxUsage: Number,
  currentUsage: Number,
  maxUsagePerUser: Number,
  applicableRestaurants: [ObjectId],
  validFrom: Date,
  validUntil: Date,
  isActive: Boolean,
  createdBy: ObjectId (Admin)
}
```

---

### 7️⃣ **NOTIFICATIONS** - Thông báo Real-time

Thông báo qua Socket.io

**Khi nào tạo:**

- Order mới → notify Restaurant + Admin
- Order confirmed → notify Customer
- Drone assigned → notify Customer + Restaurant
- Drone launched → notify Customer (tracking)
- Order delivered → notify Customer + Restaurant
- Drone maintenance → notify Admin

**Quan hệ:**

- → User (n-1): Gửi tới 1 user
- → Order (n-1): Liên quan 1 order
- → Drone (n-1): Liên quan 1 drone

**Schema:**

```javascript
{
  recipient: ObjectId (User),
  recipientRole: ['customer', 'restaurant', 'admin'],
  type: ['new_order', 'order_confirmed', 'order_preparing',
         'order_ready', 'drone_assigned', 'drone_launched',
         'order_delivering', 'order_delivered', 'order_cancelled',
         'drone_maintenance', 'payment_received'],
  title: String,
  message: String,
  relatedOrder: ObjectId,
  relatedDrone: ObjectId,
  isRead: Boolean,
  readAt: Date
}
```

---

### 8️⃣ **REVIEWS** - Đánh giá (Optional)

Customer đánh giá restaurant/product sau khi delivered

**Khi nào tạo:**

- Sau khi order delivered → Customer có thể review

---

## 🔄 LUỒNG DỮ LIỆU CHÍNH

### 📝 ĐĂNG KÝ TÀI KHOẢN

```
1. User nhập thông tin → POST /api/auth/register
2. Validate email unique
3. Hash password (bcrypt)
4. CREATE document trong USERS collection
5. Return JWT token
```

### 🛒 ĐẶT HÀNG

```
1. Customer chọn restaurant → GET /api/restaurants/:id
2. Customer chọn món → GET /api/products?restaurantId=xxx
3. Thêm vào cart (Redux store - client side)
4. Checkout → POST /api/orders
   - Validate restaurant, products
   - Calculate subtotal, deliveryFee
   - Apply voucher (if any) → discount
   - Calculate total
   - CREATE Order (status: pending)
   - Emit Socket: 'new_order' → Restaurant + Admin
   - CREATE Notification cho Restaurant
5. Return order data
```

### ✅ XÁC NHẬN & CHUẨN BỊ ĐƠN (Restaurant)

```
1. Restaurant nhận notification
2. Restaurant web hiển thị order mới
3. Restaurant confirm → PUT /api/orders/:id/status
   - UPDATE Order.status = 'confirmed'
   - Emit Socket: 'order_updated' → Customer
   - CREATE Notification cho Customer
4. Restaurant preparing → UPDATE status = 'preparing'
5. Món sẵn sàng → UPDATE status = 'ready'
```

### 🚁 GIAO HÀNG BẰNG DRONE

```
1. Restaurant chọn drone available → PUT /api/orders/:id/assign-drone
   - Validate drone.status = 'available'
   - Validate battery, distance
   - UPDATE Order.drone = droneId
   - UPDATE Order.status = 'delivering'
   - UPDATE Drone.status = 'busy'
   - Emit Socket: 'drone_assigned' → Customer

2. Drone cất cánh → PUT /api/drones/:id/launch
   - UPDATE Order.droneDeliveryDetails.launchedAt
   - UPDATE Drone.currentLocation (real-time tracking)
   - Emit Socket: 'drone_location_update' → Customer

3. Drone đến nơi → PUT /api/drones/:id/deliver
   - UPDATE Order.status = 'delivered'
   - UPDATE Order.droneDeliveryDetails.arrivedAt
   - UPDATE Order.actualDeliveryTime
   - Emit Socket: 'order_delivered' → Customer + Restaurant

4. Drone về nhà → PUT /api/drones/:id/return
   - UPDATE Drone.status = 'available'
   - UPDATE Drone.currentLocation = homeLocation
   - UPDATE Drone.statistics (totalDeliveries++, distance, flight time)
   - UPDATE Order.droneDeliveryDetails.returnedAt
```

### 🎟️ SỬ DỤNG VOUCHER

```
1. Customer nhập code → GET /api/vouchers/validate?code=XXX
   - Validate: validFrom, validUntil, isActive
   - Check: maxUsage, user's usedCount
   - Check: minOrderValue
   - Return discount amount

2. Apply voucher khi checkout → POST /api/orders
   - Calculate discount
   - UPDATE Voucher.currentUsage++
   - UPDATE User.usedVouchers (push new entry)
   - CREATE Order với voucher
```

---

## 📈 STATISTICS & REPORTS

### Restaurant Dashboard

- Total orders (by status)
- Revenue (today, week, month)
- Best selling products
- Drone fleet status
- Average delivery time

### Admin Dashboard

- Total users, restaurants, orders
- Revenue analytics
- Drone fleet overview (all restaurants)
- Order volume by time
- Popular restaurants/products

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Token Flow

```
1. Login → Verify email/password → Generate JWT
2. JWT contains: {id, role, email}
3. Every request → Middleware validates JWT
4. Role-based access control:
   - Customer: create orders, view own orders
   - Restaurant: manage products, orders, drones
   - Admin: full access
```

---

## 🔔 REAL-TIME với Socket.io

### Events

- `new_order` → Restaurant, Admin
- `order_updated` → Customer, Restaurant, Admin
- `drone_location_update` → Customer
- `order_delivered` → Customer, Restaurant
- `order_cancelled` → Restaurant, Admin

### Rooms

- `customer_{userId}` - Room riêng cho mỗi customer
- `restaurant_{restaurantId}` - Room cho mỗi nhà hàng
- `admin` - Room cho tất cả admin

---

## 💾 BACKUP & MAINTENANCE

### Database Indexes (Tối ưu)

```javascript
// Users
email: unique index

// Orders
orderNumber: unique index
customer + createdAt: compound index
restaurant + status: compound index

// Products
restaurant + category: compound index

// Drones
droneId: unique index
restaurant + status: compound index
```

### Data Retention

- Orders: Keep forever (business records)
- Notifications: Delete after 30 days (read)
- Drone locations: Keep last 100 positions

---

## 🎯 KẾT LUẬN

Database được thiết kế để hỗ trợ:
✅ Giao hàng tự động bằng drone
✅ Real-time tracking & notifications
✅ Multi-tenant (nhiều restaurants)
✅ Voucher & loyalty system
✅ Analytics & reporting
✅ Scalable (MongoDB sharding ready)

**7 Collections chính:**

1. Users - Người dùng
2. Restaurants - Nhà hàng
3. Products - Món ăn
4. Orders - Đơn hàng ⭐
5. Drones - Drone giao hàng ⭐
6. Vouchers - Mã giảm giá
7. Notifications - Thông báo real-time
