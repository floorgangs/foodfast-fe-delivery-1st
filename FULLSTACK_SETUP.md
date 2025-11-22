# FoodFast - Full Stack Setup Guide

## ✅ Hoàn thành

Dự án đã được tích hợp full stack với:
- ✅ Backend Node.js + Express
- ✅ MongoDB Atlas Database
- ✅ Socket.io Real-time
- ✅ Mobile App React Native (Expo)
- ✅ Drone & Voucher APIs
- ✅ Authentication với JWT

## 🚀 Cách chạy dự án

### 1. Backend (Đã chạy)

Backend đang chạy trên `http://localhost:5000` và đã kết nối với MongoDB Atlas.

```bash
cd backend
npm install
npm run dev
```

**MongoDB Connection:**
- Database: `foodfast`
- Cluster: `cluster0.hd9pp.mongodb.net`
- Status: ✅ Connected

**Seed Data:** ✅ Hoàn tất
- 6 users (admin, restaurants, customers)
- 3 restaurants (Phở Việt, Lẩu Hải Sản, Cơm Tấm)
- 8 products
- 5 drones
- 4 vouchers

### 2. Mobile App

```bash
cd customer-mobile-app
npm install
npx expo start
```

**Cấu hình API:**
- API URL: `http://172.24.176.1:5000/api`
- Socket URL: `http://172.24.176.1:5000`

**Lưu ý:** Nếu IP máy bạn thay đổi, cập nhật trong:
- `src/services/api.ts`
- `src/services/socket.ts`

### 3. Tài khoản Demo

**Customer Accounts:**
- Email: `customer1@gmail.com` / Password: `123456`
- Email: `customer2@gmail.com` / Password: `123456`

**Restaurant Accounts:**
- Email: `phoviet@restaurant.com` / Password: `123456`
- Email: `lauhaisan@restaurant.com` / Password: `123456`
- Email: `comtam@restaurant.com` / Password: `123456`

**Admin Account:**
- Email: `admin@foodfast.com` / Password: `123456`

### 4. Voucher Codes

- `WELCOME50` - Giảm 50K cho đơn đầu
- `FREEDEL` - Miễn phí giao hàng
- `FLASH30` - Giảm 30%
- `SAVE50K` - Giảm 50K

## 📱 Chức năng đã tích hợp

### Mobile App
- ✅ Login/Register với real API
- ✅ Home screen fetch restaurants từ MongoDB
- ✅ Real-time order tracking với Socket.io
- ✅ Voucher system
- ✅ Cart management
- ✅ Order placement
- ⏳ Restaurant Detail (cần cập nhật)
- ⏳ Order Tracking Screen (cần cập nhật)

### Backend APIs
- ✅ `/api/auth` - Authentication
- ✅ `/api/restaurants` - Nhà hàng
- ✅ `/api/products` - Sản phẩm
- ✅ `/api/orders` - Đơn hàng
- ✅ `/api/drones` - Drone management
- ✅ `/api/vouchers` - Voucher system

### Real-time Events (Socket.io)
- ✅ `order_status_updated` - Cập nhật trạng thái đơn
- ✅ `drone_location_updated` - Vị trí drone real-time
- ✅ `drone_status_updated` - Trạng thái drone

## 🔧 Cần làm tiếp

1. **Restaurant Detail Screen**
   - Fetch products từ API
   - Hiển thị menu real-time
   - Drone tracking

2. **Order Screens**
   - Create order với API
   - Track order real-time
   - Order history

3. **Restaurant Web App**
   - Đồng bộ với backend
   - Quản lý đơn hàng
   - Drone assignment

## 📁 Cấu trúc dự án

```
foodfast-fe-delivery-1st/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── droneController.js ✅ NEW
│   │   ├── voucherController.js ✅ NEW
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── restaurantController.js
│   ├── routes/
│   │   ├── droneRoutes.js ✅ NEW
│   │   ├── voucherRoutes.js ✅ NEW
│   │   └── ...
│   ├── models/
│   │   ├── Drone.js
│   │   ├── Voucher.js
│   │   └── ...
│   ├── .env ✅ NEW (MongoDB Atlas config)
│   └── server.js ✅ UPDATED (Mobile CORS)
│
└── customer-mobile-app/
    ├── src/
    │   ├── services/
    │   │   ├── api.ts ✅ NEW (Real API)
    │   │   └── socket.ts ✅ NEW (Socket.io)
    │   ├── store/
    │   │   └── slices/
    │   │       └── authSlice.ts ✅ UPDATED (Real API)
    │   └── screens/
    │       ├── HomeScreen.tsx ✅ UPDATED (Real API)
    │       └── LoginScreen.tsx ✅ UPDATED (Real API)
    └── package.json (added axios, socket.io-client)
```

## 🐛 Troubleshooting

### Mobile không kết nối được backend

1. Kiểm tra backend đang chạy: `http://localhost:5000`
2. Kiểm tra IP máy: `ipconfig` (Windows) hoặc `ifconfig` (Mac/Linux)
3. Cập nhật IP trong `src/services/api.ts` và `socket.ts`
4. Đảm bảo máy và điện thoại cùng mạng WiFi

### MongoDB không kết nối

1. Kiểm tra `.env` có `MONGODB_URI` đúng
2. Kiểm tra IP whitelist trên MongoDB Atlas
3. Test connection: `node scripts/seedDatabase.js`

### Seed data lỗi

```bash
cd backend
node scripts/seedDatabase.js
```

## 📞 Support

Nếu có vấn đề, kiểm tra:
1. Backend logs: Terminal chạy `npm run dev`
2. Mobile logs: Expo console
3. MongoDB logs: MongoDB Compass

---

**Last updated:** November 21, 2025
**Status:** ✅ Backend và Mobile đã tích hợp, đang chạy thành công
