# FoodFast Restaurant Web App

Ứng dụng web cho nhà hàng quản lý thực đơn và đơn hàng.

## Công nghệ sử dụng

- React 18+
- Vite
- React Router DOM
- Redux Toolkit
- React Redux

## Tính năng

### 1. Dashboard
- Tổng quan thống kê (đơn hàng, doanh thu)
- Danh sách đơn hàng gần đây
- Biểu đồ theo thời gian

### 2. Quản lý thực đơn
- Danh sách món ăn
- Thêm/sửa/xóa món ăn
- Đánh dấu món còn/hết hàng
- Phân loại theo danh mục

### 3. Quản lý đơn hàng
- Danh sách đơn hàng real-time
- Cập nhật trạng thái đơn hàng
- Xác nhận/từ chối đơn hàng
- Đánh dấu sẵn sàng giao

### 4. Thống kê
- Thống kê theo ngày/tuần/tháng
- Món bán chạy nhất
- Doanh thu

## Cài đặt và chạy

```bash
# Di chuyển vào thư mục
cd restaurant-web

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

Ứng dụng sẽ chạy tại: http://localhost:3001

## Đăng nhập Demo

Nhập bất kỳ email và password để đăng nhập.

## Cấu trúc thư mục

```
restaurant-web/
├── src/
│   ├── components/
│   │   └── Layout/          # Layout với sidebar
│   ├── pages/
│   │   ├── Login/           # Đăng nhập
│   │   ├── Dashboard/       # Tổng quan
│   │   ├── MenuManagement/  # Quản lý thực đơn
│   │   ├── OrderManagement/ # Quản lý đơn hàng
│   │   └── Statistics/      # Thống kê
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

Redux Toolkit với 3 slices:
- **authSlice**: Authentication
- **menuSlice**: Quản lý thực đơn
- **orderSlice**: Quản lý đơn hàng

## UI/UX Features

- Sidebar navigation
- Real-time order updates
- Status badges với màu sắc
- Responsive layout
