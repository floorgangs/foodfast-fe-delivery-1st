# FoodFast Admin Web App

Ứng dụng quản trị hệ thống FoodFast.

## Công nghệ sử dụng

- React 18+
- Vite
- React Router DOM
- Redux Toolkit
- React Redux

## Tính năng

### 1. Dashboard
- Tổng quan toàn hệ thống
- Thống kê người dùng, nhà hàng, đơn hàng
- Trạng thái drone hoạt động
- Biểu đồ và top nhà hàng

### 2. Quản lý người dùng
- Danh sách tất cả người dùng
- Xem thông tin chi tiết
- Quản lý trạng thái tài khoản

### 3. Quản lý nhà hàng
- Danh sách nhà hàng
- Thêm/sửa thông tin nhà hàng
- Xem rating và số đơn hàng
- Quản lý trạng thái hoạt động

### 4. Giám sát đơn hàng
- Theo dõi tất cả đơn hàng
- Xem chi tiết đơn hàng
- Track drone đang giao
- Lịch sử đơn hàng

### 5. Quản lý Drone
- Danh sách tất cả drone
- Trạng thái hoạt động (Sẵn sàng, Đang giao, Đang sạc, Bảo trì)
- Mức pin
- Vị trí hiện tại
- Số đơn đã giao

## Cài đặt và chạy

```bash
# Di chuyển vào thư mục
cd admin-web

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

Ứng dụng sẽ chạy tại: http://localhost:3002

## Đăng nhập Demo

Nhập bất kỳ email và password để đăng nhập với quyền admin.

## Cấu trúc thư mục

```
admin-web/
├── src/
│   ├── components/
│   │   └── Layout/               # Layout với sidebar
│   ├── pages/
│   │   ├── Login/                # Đăng nhập admin
│   │   ├── Dashboard/            # Tổng quan hệ thống
│   │   ├── UserManagement/       # Quản lý người dùng
│   │   ├── RestaurantManagement/ # Quản lý nhà hàng
│   │   ├── OrderMonitoring/      # Giám sát đơn hàng
│   │   └── DroneManagement/      # Quản lý drone
│   ├── store/
│   │   ├── store.js
│   │   └── slices/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## State Management

Redux Toolkit với authSlice để quản lý authentication.

## Drone Management Features

- Real-time status tracking
- Battery monitoring (cảnh báo pin yếu)
- Location tracking
- Maintenance scheduling
- Delivery history

## UI Theme

- Dark sidebar với gradient
- Professional admin interface
- Color-coded status badges
- Comprehensive data tables
- Card-based layout cho drone

## Security Note

Đây là ứng dụng demo. Trong production, cần implement:
- JWT authentication
- Role-based access control
- API security
- Data encryption
