# FoodFast Backend API

Backend API cho nền tảng giao đồ ăn FoodFast, xây dựng với Node.js, Express, MongoDB và Socket.io.

## 🚀 Tính năng

- ✅ Xác thực người dùng (JWT)
- ✅ Quản lý nhà hàng
- ✅ Quản lý sản phẩm/món ăn
- ✅ Đặt hàng và theo dõi đơn hàng
- ✅ Real-time notifications với Socket.io
- ✅ Phân quyền theo role (Customer, Restaurant, Admin)

## 📋 Yêu cầu

- Node.js >= 18.x
- MongoDB Atlas account (hoặc MongoDB local)
- npm hoặc yarn

## 🔧 Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
copy .env.example .env
```

Sau đó chỉnh sửa file `.env` và cập nhật:

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection - Thay đổi username, password và cluster của bạn
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.hd9pp.mongodb.net/foodfast?retryWrites=true&w=majority

# JWT Secret - Đổi thành chuỗi bí mật của bạn
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URLs
CUSTOMER_WEB_URL=http://localhost:5173
RESTAURANT_WEB_URL=http://localhost:5174
ADMIN_WEB_URL=http://localhost:5175
```

### 3. Seed dữ liệu mẫu

Lệnh này sẽ **XÓA TẤT CẢ** dữ liệu cũ và tạo dữ liệu mẫu mới:

```bash
npm run seed
```

Dữ liệu mẫu bao gồm:

- 1 Admin
- 3 Nhà hàng
- 2 Khách hàng
- 8 Món ăn

### 4. Chạy server

Development mode (với nodemon - tự động reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📚 API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại (cần token)
- `PUT /api/auth/profile` - Cập nhật profile (cần token)

### Restaurants (`/api/restaurants`)

- `GET /api/restaurants` - Lấy danh sách nhà hàng
- `GET /api/restaurants/:id` - Lấy thông tin 1 nhà hàng
- `GET /api/restaurants/my-restaurant` - Lấy nhà hàng của tôi (restaurant role)
- `POST /api/restaurants` - Tạo nhà hàng mới (restaurant/admin role)
- `PUT /api/restaurants/:id` - Cập nhật nhà hàng (restaurant/admin role)

### Products (`/api/products`)

- `GET /api/products` - Lấy danh sách món ăn
- `GET /api/products/:id` - Lấy thông tin 1 món ăn
- `POST /api/products` - Tạo món ăn mới (restaurant/admin role)
- `PUT /api/products/:id` - Cập nhật món ăn (restaurant/admin role)
- `DELETE /api/products/:id` - Xóa món ăn (restaurant/admin role)

### Orders (`/api/orders`)

- `POST /api/orders` - Tạo đơn hàng (customer role)
- `GET /api/orders` - Lấy danh sách đơn hàng (theo role)
- `GET /api/orders/:id` - Lấy thông tin 1 đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn (restaurant/admin role)
- `PUT /api/orders/:id/cancel` - Hủy đơn hàng

## 🔐 Authentication

API sử dụng JWT Bearer token. Sau khi đăng nhập, thêm token vào header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 👥 Test Accounts

Sau khi chạy `npm run seed`, bạn có thể dùng các tài khoản sau:

**Admin:**

- Email: `admin@foodfast.com`
- Password: `123456`

**Nhà hàng:**

- Email: `phoviet@restaurant.com` / Password: `123456`
- Email: `lauhaisan@restaurant.com` / Password: `123456`
- Email: `comtam@restaurant.com` / Password: `123456`

**Khách hàng:**

- Email: `customer1@gmail.com` / Password: `123456`
- Email: `customer2@gmail.com` / Password: `123456`

## 🔌 Socket.io Events

### Client → Server

- `join_room` - Join room theo role: `{ userId, role, restaurantId }`

### Server → Client

- `new_order` - Đơn hàng mới (gửi tới restaurant & admin)
- `order_updated` - Đơn hàng được cập nhật
- `order_cancelled` - Đơn hàng bị hủy

## 📁 Cấu trúc thư mục

```
backend/
├── config/
│   └── database.js          # Cấu hình MongoDB
├── controllers/
│   ├── authController.js    # Logic xác thực
│   ├── orderController.js   # Logic đơn hàng
│   ├── productController.js # Logic sản phẩm
│   └── restaurantController.js # Logic nhà hàng
├── middleware/
│   ├── auth.js             # Middleware xác thực
│   └── errorHandler.js     # Xử lý lỗi
├── models/
│   ├── Order.js            # Schema đơn hàng
│   ├── Product.js          # Schema sản phẩm
│   ├── Restaurant.js       # Schema nhà hàng
│   ├── Review.js           # Schema đánh giá
│   └── User.js             # Schema người dùng
├── routes/
│   ├── authRoutes.js       # Routes xác thực
│   ├── orderRoutes.js      # Routes đơn hàng
│   ├── productRoutes.js    # Routes sản phẩm
│   └── restaurantRoutes.js # Routes nhà hàng
├── scripts/
│   └── seedDatabase.js     # Script seed data
├── .env.example            # Mẫu file môi trường
├── .gitignore
├── package.json
└── server.js               # Entry point
```

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (jsonwebtoken) + bcryptjs
- **Real-time:** Socket.io
- **Validation:** express-validator
- **Environment:** dotenv

## 📝 Notes

- Mật khẩu được hash bằng bcryptjs trước khi lưu vào database
- Token JWT có thời hạn 30 ngày
- Socket.io được cấu hình CORS cho 3 frontend apps
- Order number tự động generate theo format: `FF{timestamp}{4digits}`

## 🐛 Troubleshooting

**Lỗi kết nối MongoDB:**

- Kiểm tra MONGODB_URI trong file .env
- Đảm bảo IP của bạn được whitelist trong MongoDB Atlas
- Kiểm tra username/password

**Lỗi Port đã được sử dụng:**

- Đổi PORT trong file .env
- Hoặc kill process đang dùng port 5000

**Socket.io không kết nối:**

- Kiểm tra CORS configuration
- Đảm bảo frontend URLs đúng trong .env
