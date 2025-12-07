# 🍕 FoodFast - Nền tảng giao hàng bằng Drone

Hệ thống **giao hàng món ăn đầy đủ với công nghệ Drone**, bao gồm ứng dụng di động, web cho khách hàng, nhà hàng, quản trị viên và backend API.

**[Xem chi tiết kiến trúc hệ thống](./SYSTEM_ARCHITECTURE_DRAWIO.md)**

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan-dự-án)
- [Tech Stack](#-tech-stack)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Hướng dẫn nhanh](#-hướng-dẫn-nhanh)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Tính năng](#-tính-năng)
- [Hướng dẫn chi tiết](#-hướng-dẫn-chi-tiết)
- [Khắc phục sự cố](#-khắc-phục-sự-cố)

---

## 🎯 Tổng quan dự án

FoodFast là nền tảng giao hàng đầy đủ với các tính năng:

- **Ứng dụng di động khách hàng** - Duyệt nhà hàng, đặt hàng, theo dõi giao hàng (React Native + Expo)
- **Web khách hàng** - Giao diện web hiện đại cho khách hàng (React + Vite)
- **Portal quản lý nhà hàng** - Quản lý thực đơn, đơn hàng, nhân viên, khuyến mãi (React + Vite)
- **Dashboard quản trị** - Quản lý hệ thống, phân tích, quản lý đội drone (React + Vite)
- **Hệ thống thanh toán** - PayPal, thẻ, mã giảm giá
- **Giao tiếp thời gian thực** - Socket.io cho thông báo và cập nhật đơn hàng

### 📊 Thống kê

- **76 thành phần** trên 3 ứng dụng frontend
- **60+ trang** (Khách: 25, Nhà hàng: 19, Admin: 16)
- **16 mô-đun API backend** với 50+ endpoints
- **12 bộ sưu tập MongoDB** để quản lý dữ liệu
- **Hệ thống đa vai trò** (Khách hàng, Nhà hàng, Quản trị, Nhân viên, Drone)

---

## 🛠️ Tech Stack

### Frontend

| Lớp                  | Công nghệ                                      | Mục đích                       |
| -------------------- | ---------------------------------------------- | ------------------------------ |
| **Ứng dụng di động** | React Native (Expo), TypeScript                | Ứng dụng iOS/Android cho khách |
| **Web khách hàng**   | React, Vite, Redux Toolkit                     | Giao diện web khách hàng       |
| **Web nhà hàng**     | React, Vite, Redux Toolkit                     | Portal quản lý nhà hàng        |
| **Web admin**        | React, Vite, Redux Toolkit                     | Dashboard quản trị hệ thống    |
| **Styling**          | Tailwind CSS, CSS Modules                      | Giao diện phản ứng             |
| **Định tuyến**       | React Router (Web), React Navigation (Di động) | Điều hướng trang               |
| **Trạng thái**       | Redux Toolkit                                  | Quản lý trạng thái toàn cục    |
| **HTTP Client**      | Axios                                          | Giao tiếp API                  |
| **Real-time**        | Socket.io Client                               | Cập nhật trực tiếp & thông báo |
| **Bản đồ**           | Google Maps API                                | Theo dõi giao hàng & vị trí    |

### Backend

| Thành phần          | Công nghệ            | Mục đích                    |
| ------------------- | -------------------- | --------------------------- |
| **Runtime**         | Node.js (Express.js) | REST API server             |
| **Database**        | MongoDB              | Lưu trữ dữ liệu             |
| **Real-time**       | Socket.io            | Phát sóng sự kiện trực tiếp |
| **Xác thực**        | JWT (jsonwebtoken)   | Xác thực dựa trên token     |
| **Thanh toán**      | PayPal API           | Xử lý thanh toán            |
| **Tải lên file**    | Multer               | Xử lý hình ảnh/file         |
| **Biến môi trường** | dotenv               | Quản lý cấu hình            |

### DevOps & Tools

- **Version Control**: Git/GitHub
- **Task Runner**: npm scripts
- **Code Quality**: ESLint, Prettier
- **Environment**: .env configuration
- **Deployment**: Expo (di động), Vite (web), Node.js (backend)

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    LỚNG GIAO DIỆN                            │
├──────────────────┬──────────────────┬──────────────────────┤
│  Web Khách       │ Web Nhà hàng     │    Web Admin          │
│   (25 trang)     │   (19 trang)     │   (16 trang)         │
│  React + Vite    │  React + Vite    │  React + Vite        │
│  Redux + Socket  │  Redux + Socket  │  Redux + Socket      │
└──────────────────┴──────────────────┴──────────────────────┘
          │                 │                     │
          └─────────────────┼─────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Ứng dụng DĐ   │
                    │  (Expo/RN)     │
                    │   (25+ màn)    │
                    └───────┬────────┘
                            │
                ┌───────────┴────────────┐
                │                        │
    ┌───────────▼──────────┐  ┌─────────▼──────────┐
    │   API BACKEND        │  │   Real-time        │
    │   (Express.js)       │  │   (Socket.io)      │
    │   16 Mô-đun định tuyến│  │   (Thông báo)      │
    │   50+ Endpoints      │  │                    │
    └───────────┬──────────┘  └─────────┬──────────┘
                │                       │
                │    ┌──────────────────┘
                │    │
    ┌───────────▼────▼──────────┐
    │    Cơ sở dữ liệu MongoDB   │
    │    12 Bộ sưu tập           │
    │   (Users, Orders, etc)     │
    └────────────────────────────┘

Dịch vụ ngoài:
├─ PayPal API (Thanh toán)
├─ Google Maps API (Vị trí)
└─ NGROK (Tunneling phát triển)
```

**Xem chi tiết kiến trúc:** [SYSTEM_ARCHITECTURE_DRAWIO.md](./SYSTEM_ARCHITECTURE_DRAWIO.md)

---

## 🚀 Hướng dẫn nhanh

### Yêu cầu

- **Node.js** 16+ ([Download](https://nodejs.org))
- **MongoDB** chạy cục bộ hoặc Atlas URI trong `.env`
- **Git**
- Cho di động: **Expo CLI** (`npm install -g expo-cli`)

### Cài đặt (Tất cả dịch vụ)

```bash
# 1. Clone kho lưu trữ
git clone https://github.com/floorgangs/foodfast-fe-delivery-1st.git
cd foodfast-fe-delivery-1st

# 2. Cài đặt các gói backend
cd backend
npm install

# 3. Cài đặt các gói web khách hàng
cd ../customer-web
npm install

# 4. Cài đặt các gói web nhà hàng
cd ../restaurant-web
npm install

# 5. Cài đặt các gói web admin
cd ../admin-web
npm install

# 6. Cài đặt các gói ứng dụng di động
cd ../customer-mobile-app
npm install
```

### Cấu hình

**Backend (.env)**

```bash
cd backend
cp .env.example .env
# Chỉnh sửa .env với MongoDB URI, JWT secret, khóa PayPal, v.v.
```

**Ứng dụng di động (.env)**

```bash
cd customer-mobile-app
cp .env.example .env
# Cập nhật EXPO_PUBLIC_LAN_IP hoặc EXPO_PUBLIC_NGROK_URL
```

### Chạy tất cả dịch vụ

```bash
# Terminal 1: Backend (cổng 5000)
cd backend
npm run dev

# Terminal 2: Web Khách (cổng 5173)
cd customer-web
npm run dev

# Terminal 3: Web Nhà hàng (cổng 5174)
cd restaurant-web
npm run dev

# Terminal 4: Web Admin (cổng 5175)
cd admin-web
npm run dev

# Terminal 5: Ứng dụng di động (Expo)
cd customer-mobile-app
npm start
```

**Điểm truy cập:**

- 🏠 Web Khách: `http://localhost:5173`
- 🍽️ Web Nhà hàng: `http://localhost:5174`
- 👨‍💼 Web Admin: `http://localhost:5175`
- 📱 Ứng dụng di động: Expo Go (quét mã QR)
- 🔌 API Backend: `http://localhost:5000/api`

---

## 📁 Cấu trúc dự án

```
foodfast-fe-delivery-1st/
├── 📚 Tài liệu
│   ├── SYSTEM_ARCHITECTURE_DRAWIO.md    (Chi tiết 76 thành phần)
│   ├── COMPONENT_ARCHITECTURE.md        (Thành phần UI & tái sử dụng)
│   ├── SECURITY_AND_CODE_AUDIT_REPORT.md
│   └── README.md (tập tin này)
│
├── 🖥️ CÁC ỨNG DỤNG FRONTEND
│   ├── customer-web/                    (25 trang)
│   │   ├── src/
│   │   │   ├── pages/       (Đăng nhập, Trang chủ, Nhà hàng, v.v.)
│   │   │   ├── components/  (RestaurantCard, MenuItem, Cart, v.v.)
│   │   │   ├── services/    (Gọi API, socket.io)
│   │   │   ├── store/       (Redux slices)
│   │   │   └── styles/
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   ├── restaurant-web/                  (19 trang)
│   │   ├── src/
│   │   │   ├── pages/       (Dashboard, MenuManagement, Orders, v.v.)
│   │   │   ├── components/  (Các thành phần UI tái sử dụng)
│   │   │   ├── services/    (API, socket.io)
│   │   │   ├── store/       (Redux state)
│   │   │   └── styles/
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   ├── admin-web/                       (16 trang)
│   │   ├── src/
│   │   │   ├── pages/       (Dashboard, UserMgmt, RestaurantMgmt, v.v.)
│   │   │   ├── components/  (DataTable, Forms, Charts)
│   │   │   ├── services/    (API, socket.io)
│   │   │   ├── store/       (Redux)
│   │   │   └── data/        (vietnamLocations.js, constants)
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   └── customer-mobile-app/             (25+ màn, React Native)
│       ├── src/
│       │   ├── screens/     (Home, Restaurant, Cart, Checkout, Tracking)
│       │   ├── components/  (Các thành phần UI tái sử dụng)
│       │   ├── services/    (API, socket.io)
│       │   ├── store/       (Redux state)
│       │   ├── hooks/       (Custom React hooks)
│       │   └── constants/   (Cấu hình ứng dụng)
│       ├── app.json         (Cấu hình Expo)
│       ├── API_SETUP.md     (⭐ QUAN TRỌNG: Hướng dẫn cấu hình API)
│       ├── .env.example
│       ├── babel.config.js
│       └── package.json
│
├── 🔌 API BACKEND (Node.js + Express)
│   ├── controllers/         (Lôgic kinh doanh)
│   │   ├── authController.js
│   │   ├── restaurantController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── droneController.js
│   │   └── ... (16+ controllers)
│   │
│   ├── routes/              (Các điểm cuối API)
│   │   ├── authRoutes.js
│   │   ├── restaurantRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── ... (16 tệp định tuyến)
│   │
│   ├── models/              (Lược đồ Mongoose)
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Drone.js
│   │   └── ... (12 mô hình)
│   │
│   ├── middleware/          (Xác thực, xác nhận)
│   │   ├── auth.js          (Xác minh JWT)
│   │   ├── errorHandler.js
│   │   └── validation.js
│   │
│   ├── config/              (Cấu hình)
│   │   ├── database.js      (Kết nối MongoDB)
│   │   └── constants.js
│   │
│   ├── utils/               (Các hàm trợ giúp)
│   │   ├── imageUpload.js
│   │   ├── orderCleanup.js
│   │   └── ... (utilities)
│   │
│   ├── server.js            (Điểm vào chính)
│   ├── .env.example
│   └── package.json
│
├── 🗄️ CƠ SỞ DỮ LIỆU
│   └── Bộ sưu tập MongoDB (12 tổng)
│       ├── users            (Khách hàng, Nhà hàng, Admin, tài khoản Staff)
│       ├── restaurants      (Thông tin nhà hàng, cài đặt thực đơn, tuân thủ)
│       ├── products         (Các mục thực đơn, giá cả, mô tả)
│       ├── orders           (Bản ghi đơn hàng, trạng thái, timeline)
│       ├── payments         (Giao dịch thanh toán, trạng thái)
│       ├── vouchers         (Mã giảm giá, khuyến mãi)
│       ├── reviews          (Xếp hạng & bình luận khách hàng)
│       ├── drones           (Đội drone, vị trí, trạng thái)
│       ├── carts            (Giỏ hàng của người dùng)
│       ├── notifications    (Thông báo của người dùng, tin nhắn)
│       ├── transactions     (Bản ghi tài chính)
│       └── staff            (Gán nhiệm vụ cho nhân viên)
│
├── 📱 KIỂM TRA E2E
│   └── e2e/                 (Kiểm tra Playwright)
│       ├── AddItemTest.spec.ts
│       ├── BrowseItemTest.spec.ts
│       ├── RemoveItemTest.spec.ts
│       └── login.setup.ts
│
├── 🏗️ TRIỂN KHAI & XÂY DỰNG
│   ├── build/               (Cấu hình Docker, manifests)
│   │   ├── acr-build/       (Azure Container Registry)
│   │   └── multiarch-manifests/
│   │
│   ├── .github/             (GitHub Actions CI/CD)
│   │   └── workflows/
│   │       ├── ci.yml       (Kiểm tra & xây dựng tự động)
│   │       └── ... (workflows khác)
│   │
│   └── START_ALL.bat        (Batch Windows để khởi động tất cả dịch vụ)
│
└── 📄 Tệp cấu hình
    ├── .gitignore
    ├── .gitattributes       (Chuẩn hóa kết thúc dòng)
    ├── .env.example         (Mẫu cho các biến môi trường)
    ├── docker-compose.yml   (Tùy chọn: containerization)
    ├── package.json         (Tập lệnh gốc không gian làm việc)
    └── eShop.slnx           (Tệp giải pháp tham khảo)
```

---

## ✨ Tính năng

### 👥 Tính năng khách hàng

- ✅ Đăng ký & đăng nhập người dùng với JWT
- ✅ Duyệt nhà hàng với bộ lọc & tìm kiếm
- ✅ Xem các mục thực đơn với giá & mô tả
- ✅ Thêm mục vào giỏ hàng với kiểm soát số lượng
- ✅ Thanh toán với lựa chọn địa chỉ giao hàng
- ✅ Nhiều phương pháp thanh toán (PayPal, thẻ)
- ✅ Áp dụng mã giảm giá & mã khuyến mãi
- ✅ Theo dõi đơn hàng theo thời gian thực với hoạt ảnh drone
- ✅ Lịch sử đơn hàng & bình luận
- ✅ Địa chỉ giao hàng đã lưu
- ✅ Thông báo đẩy cho cập nhật đơn hàng
- ✅ Đa nền tảng: Web + Ứng dụng di động

### 🍽️ Tính năng nhà hàng

- ✅ Quản lý thực đơn (CRUD hoạt động)
- ✅ Hàng đợi đơn hàng với cập nhật thời gian thực
- ✅ Cập nhật trạng thái đơn hàng (Chuẩn bị → Sẵn sàng → Hoàn tất)
- ✅ Quản lý nhân viên & gán vai trò
- ✅ Tạo & quản lý khuyến mãi
- ✅ Xem bình luận & xếp hạng khách hàng
- ✅ Phân tích bán hàng & báo cáo doanh thu
- ✅ Phối hợp đội drone
- ✅ Quản lý giờ cao điểm
- ✅ Cài đặt nhà hàng tùy chỉnh

### 👨‍💼 Tính năng Admin

- ✅ Quản lý tài khoản người dùng (Tạo, Đọc, Cập nhật, Xóa)
- ✅ Tích hợp nhà hàng & xác minh tuân thủ
- ✅ Giám sát đơn hàng & giải quyết sự cố
- ✅ Quản lý đội drone & gán nhiệm vụ
- ✅ Theo dõi giao dịch tài chính
- ✅ Phân tích hệ thống & báo cáo
- ✅ Quản lý nhân viên trên nhiều nhà hàng
- ✅ Cài đặt hệ thống & cấu hình
- ✅ Xác minh thanh toán & đối sánh

### 🤖 Hệ thống Drone

- ✅ Tối ưu hóa tuyến đường giao hàng tự động
- ✅ Theo dõi vị trí thời gian thực
- ✅ Giám sát trạng thái đội
- ✅ Cảnh báo pin & bảo trì
- ✅ Tích hợp thời tiết (tương lai)
- ✅ Thủ tục hạ cánh khẩn cấp

### 🔐 Bảo mật

- ✅ Xác thực dựa trên JWT
- ✅ Hashing mật khẩu (bcrypt)
- ✅ Kiểm soát truy cập dựa trên vai trò (RBAC)
- ✅ Xác nhận & vệ sinh dữ liệu đầu vào
- ✅ Bảo vệ CORS
- ✅ Bảo vệ biến môi trường

---

## 🔧 Hướng dẫn chi tiết

### Cấu hình Backend

```bash
cd backend

# 1. Cài đặt các gói
npm install

# 2. Tạo tệp .env
cp .env.example .env

# 3. Cấu hình các biến môi trường
MONGODB_URI=mongodb://localhost:27017/foodfast
JWT_SECRET=your_jwt_secret_key
PAYPAL_CLIENT_ID=your_paypal_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PORT=5000

# 4. Khởi động backend
npm run dev
```

### Cấu hình Frontend (Web)

```bash
# Cho bất kỳ web app nào (customer-web, restaurant-web, admin-web):

# 1. Cài đặt các gói
npm install

# 2. Khởi động máy chủ phát triển
npm run dev

# 3. Xây dựng cho sản xuất
npm run build

# 4. Xem trước bản dựng sản xuất
npm run preview
```

### Cấu hình Ứng dụng di động ⚠️ QUAN TRỌNG

```bash
cd customer-mobile-app

# 1. Cài đặt các gói
npm install

# 2. Cấu hình API
cp .env.example .env

# 3. Chỉnh sửa .env với IP backend hoặc URL NGROK
# Xem API_SETUP.md để có hướng dẫn chi tiết

# 4. Khởi động Expo
npm start
# Sau đó nhấn:
# - 'a' cho Android
# - 'i' cho iOS
# - 'w' cho web
```

**🔴 QUAN TRỌNG:** Đọc [`customer-mobile-app/API_SETUP.md`](./customer-mobile-app/API_SETUP.md) trước khi chạy ứng dụng di động!

---

## 🐛 Khắc phục sự cố

### Vấn đề kết nối Backend

**"Không thể kết nối với MongoDB"**

```bash
# Xác minh MongoDB đang chạy
mongod

# Hoặc sử dụng MongoDB Atlas (đám mây)
# Cập nhật MONGODB_URI trong .env thành URI Atlas của bạn
```

**"Cổng 5000 đã được sử dụng"**

```bash
# Kết thúc quy trình trên cổng 5000
# Windows:
netstat -ano | findstr 5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### Vấn đề Frontend

**Lỗi "Module not found"**

```bash
# Xóa node_modules và cài đặt lại
rm -rf node_modules package-lock.json
npm install
```

**Lỗi "CORS"**

```bash
# Đảm bảo cấu hình CORS backend bao gồm URL frontend
# Trong backend/server.js, kiểm tra mảng allowedOrigins
```

### Vấn đề Ứng dụng di động

**"Network Error" hoặc màn hình trắng**

- ❌ KHÔNG PHẢI LỖI MÃ - Đây là vấn đề kết nối API
- ✅ Làm theo [`customer-mobile-app/API_SETUP.md`](./customer-mobile-app/API_SETUP.md)
- ✅ Xác minh IP/URL NGROK trong `.env`
- ✅ Đảm bảo backend đang chạy

**"Ứng dụng Expo Go bị sập"**

```bash
npm start -- --clear  # Xóa bộ nhớ đệm
npm install           # Cài đặt lại các gói
```

**"Không thể giải quyết mô-đun"**

```bash
# Đảm bảo các gói phụ thuộc được cài đặt
npm install
# Kiểm tra package.json cho lỗi đánh máy
```

---

## 📊 Tài liệu API

### Điểm cuối xác thực

```
POST   /api/auth/register        (Tạo tài khoản người dùng)
POST   /api/auth/login           (Đăng nhập người dùng)
POST   /api/auth/logout          (Đăng xuất người dùng)
POST   /api/auth/refresh-token   (Làm mới token JWT)
GET    /api/auth/me              (Lấy người dùng hiện tại)
PUT    /api/auth/profile         (Cập nhật hồ sơ)
```

### Điểm cuối Nhà hàng

```
GET    /api/restaurants                (Lấy tất cả nhà hàng)
GET    /api/restaurants/:id            (Lấy một nhà hàng)
POST   /api/restaurants                (Tạo nhà hàng)
PUT    /api/restaurants/:id            (Cập nhật nhà hàng)
DELETE /api/restaurants/:id            (Xóa nhà hàng)
POST   /api/restaurants/admin/create-with-owner  (Admin tạo)
```

### Điểm cuối Đơn hàng

```
POST   /api/orders                    (Tạo đơn hàng)
GET    /api/orders/user/:userId       (Đơn hàng của người dùng)
GET    /api/orders/:orderId           (Chi tiết đơn hàng)
PUT    /api/orders/:orderId/status    (Cập nhật trạng thái đơn hàng)
DELETE /api/orders/:orderId           (Hủy đơn hàng)
```

**Tài liệu API đầy đủ:** Xem `backend/routes/` cho tất cả 50+ điểm cuối

---

## 🚀 Triển khai

### Bản dựa sản xuất

```bash
# Backend
cd backend
npm run build (nếu có thể áp dụng)
npm start

# Web Apps
cd customer-web
npm run build
# Triển khai thư mục 'dist' để lưu trữ

# Ứng dụng di động
cd customer-mobile-app
eas build --platform ios    # Xây dựng iOS
eas build --platform android # Xây dựng Android
```

### Docker (Tùy chọn)

```bash
docker-compose up -d
# Điều này bắt đầu MongoDB + Backend trong các container
```

### GitHub Actions (CI/CD)

Xem `.github/workflows/ci.yml` để kiểm tra & triển khai tự động

---

## 📞 Hỗ trợ & Liên hệ

- 📧 Email: support@foodfast.dev
- 🐛 Issues: [GitHub Issues](https://github.com/floorgangs/foodfast-fe-delivery-1st/issues)
- 📚 Tài liệu: [SYSTEM_ARCHITECTURE_DRAWIO.md](./SYSTEM_ARCHITECTURE_DRAWIO.md)

---

## 📄 Giấy phép

Dự án này là tư nhân. Liên hệ với chủ sở hữu để được cấp quyền sử dụng.

---

## 👥 Nhóm

- **Nhà phát triển:** floorgangs
- **Stack:** Full-Stack MERN (MongoDB, Express, React, Node.js)
- **Trạng thái:** Phát triển hoạt động 🚀

---

## 🎉 Tham chiếu nhanh

| Tác vụ                      | Lệnh                                                             |
| --------------------------- | ---------------------------------------------------------------- |
| Khởi động tất cả dịch vụ    | Xem phần Hướng dẫn nhanh                                         |
| Chạy kiểm tra               | `npm test` (trong thư mục tương ứng)                             |
| Định dạng mã                | `npm run format`                                                 |
| Kiểm tra linting            | `npm run lint`                                                   |
| Xây dựng cho sản xuất       | `npm run build`                                                  |
| Xem tài liệu API            | Kiểm tra `backend/routes/`                                       |
| Kiểm tra kiến trúc hệ thống | [SYSTEM_ARCHITECTURE_DRAWIO.md](./SYSTEM_ARCHITECTURE_DRAWIO.md) |

**Chúc bạn code vui vẻ! 🍕🚀**

## Thành viên

| Họ tên           | MSSV       |
| ---------------- | ---------- |
| Phạm Thanh Phong | 3122411151 |
| Trần Hữu Nam     | 3122411131 |

## Tài liệu

| Tài liệu                                       | Mô tả                     |
| ---------------------------------------------- | ------------------------- |
| \[PRD_FE_FoodFast.md](docs/PRD_FE_FoodFast.md) | Tài liệu yêu cầu sản phẩm |
| \[FE_Design.md](docs/FE_Design.md)             | Mô tả thiết kế giao diện  |
| \[Test_Scenarios.md](docs/Test_Scenarios.md)   | Kịch bản kiểm thử         |
| CongNghePhanMem.docx                           | Tài liệu báo cáo          |

## Tính năng đặc biệt

- 🚁 **Giao hàng bằng Drone**: Animation theo dõi drone giao hàng real-time
- 📊 **Dashboard đa cấp**: Customer, Restaurant, Admin có dashboard riêng
- 🔄 **State Management**: Redux Toolkit cho toàn bộ ứng dụng
- 📱 **Responsive Design**: Giao diện thân thiện trên mọi thiết bị
- ⏱️ **Real-time Updates**: Cập nhật trạng thái đơn hàng tự động
- 🎨 **Modern UI/UX**: Thiết kế hiện đại, dễ sử dụng

## Demo Account

Tất cả ứng dụng sử dụng mock authentication - nhập bất kỳ email/password để đăng nhập.

## Tiến độ

- 2025-10-05: Khởi tạo repo + tạo cấu trúc thư mục + viết README
- 2025-10-18: Tạo file báo cáo, nội dung gồm phân tích thiết kế, sơ đồ use case
- 2025-10-20: Push file báo cáo lên github
- 2025-11-09: Hoàn thành 3 frontend apps (Customer, Restaurant, Admin)

## Use case

### Tiếp nhận và xử lý đơn hàng

<img width="771" height="1183" alt="image" src="https://github.com/user-attachments/assets/df693b0a-91f2-4579-887e-6e0ad942e230" />

### Quản lý thực đơn và thông tin nhà hàng

![usecase1](images/ucql-Trang-1.png)
![usecase2](images/ucql-Trang-2.png)
![usecase3](images/ucql-Trang-3.png)
