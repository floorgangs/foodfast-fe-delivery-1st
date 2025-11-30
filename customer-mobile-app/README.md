# FoodFast Customer Mobile App

Mobile app khách hàng cho hệ thống giao hàng bằng Drone FoodFast.

## 🚀 Công nghệ

- **React Native**: Framework phát triển mobile app
- **Expo**: Platform phát triển React Native
- **React Navigation**: Điều hướng giữa các màn hình
- **Redux Toolkit**: Quản lý state toàn cục
- **AsyncStorage**: Lưu trữ dữ liệu local
- **TypeScript**: Type-safe JavaScript

## 📱 Tính năng

### 1. Đăng nhập
- Form đăng nhập với email và mật khẩu
- Giao diện ShopeeFood style (màu đỏ #EA5034)
- Tự động lưu thông tin đăng nhập

### 2. Trang chủ
- Danh sách nhà hàng với hình ảnh, rating, thời gian giao
- Tìm kiếm nhà hàng
- Lọc theo danh mục (Việt Nam, Thái Lan, Nhật Bản, Ý, Fastfood)
- Header với logo và icon profile

### 3. Chi tiết nhà hàng
- Thông tin nhà hàng đầy đủ
- Danh sách món ăn với hình ảnh, giá
- Thêm món vào giỏ hàng

### 4. Giỏ hàng
- Danh sách món đã chọn
- Điều chỉnh số lượng (+/-)
- Xóa món khỏi giỏ
- Hiển thị tổng tiền
- Nút đặt hàng

### 5. Theo dõi đơn hàng
- Timeline trạng thái đơn hàng (Xác nhận → Chuẩn bị → Đang giao → Hoàn thành)
- Animation drone bay khi đang giao
- Chi tiết đơn hàng
- Mã đơn hàng

### 6. Tài khoản
- Thông tin người dùng
- Menu tính năng (Thông tin, Địa chỉ, Thanh toán, Ưu đãi)
- Lịch sử đơn hàng
- Nút đăng xuất

## 🎨 Thiết kế

- Màu chủ đạo: **#EA5034** (Đỏ ShopeeFood)
- Background: **#fafafa** (Xám nhạt)
- Font: System default
- Icon: Emoji native
- Shadow: Subtle với elevation 3
- Border radius: 8-12px

## 📦 Cài đặt

**⚠️ LƯU Ý QUAN TRỌNG: Đọc [SETUP_GUIDE.md](./SETUP_GUIDE.md) để biết cách cấu hình kết nối backend!**

```bash
# Di chuyển vào thư mục mobile app
cd customer-mobile-app

# Cài đặt dependencies
npm install

# Chạy với Expo (khuyên dùng --tunnel để test trên nhiều máy)
npx expo start --tunnel
```

### 🔧 Cấu hình Backend

App này cần kết nối tới backend API. Có 3 cách:

1. **Dùng Ngrok (Khuyên dùng)** - Hoạt động mọi máy, mọi mạng
2. **Dùng IP LAN** - Phải cùng WiFi
3. **Cấu hình trong app** - Vào Profile > Cấu hình Server

📖 **Chi tiết xem file [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

## 🗂️ Cấu trúc thư mục

```
customer-mobile-app/
├── App.tsx                 # Entry point, navigation setup
├── src/
│   ├── store/             # Redux store
│   │   ├── index.ts       # Store configuration
│   │   └── slices/        # Redux slices
│   │       ├── authSlice.ts
│   │       ├── cartSlice.ts
│   │       └── orderSlice.ts
│   ├── screens/           # Màn hình
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── RestaurantDetailScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── OrderTrackingScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── data/              # Mock data
│       └── mockData.ts
├── package.json
├── app.json
├── babel.config.js
└── tsconfig.json
```

## 🔄 State Management

### Auth State
```typescript
{
  user: { id, name, email, phone } | null,
  isAuthenticated: boolean
}
```

### Cart State
```typescript
{
  items: [{ id, name, price, quantity, restaurantId, restaurantName, image }],
  total: number
}
```

### Orders State
```typescript
{
  orders: [...],
  currentOrder: { id, items, restaurantId, restaurantName, status, total } | null
}
```

## 📊 Mock Data

- **8 nhà hàng**: Phở, Bún Chả, Cơm Tấm, Lẩu Thái, Sushi, Pizza, Gà Rán, Burger
- **24 món ăn**: Mỗi nhà hàng có 2-3 món
- **Categories**: Tất cả, Việt Nam, Thái Lan, Nhật Bản, Ý, Fastfood

## 🚁 Tính năng đặc biệt

1. **Animation Drone**: Drone bay lên xuống khi đang giao hàng
2. **Timeline Status**: Hiển thị trực quan trạng thái đơn hàng
3. **AsyncStorage**: Tự động lưu/khôi phục giỏ hàng và user
4. **Bottom Tab Navigation**: Điều hướng nhanh giữa các tab chính
5. **Responsive Design**: Tối ưu cho mọi kích thước màn hình

## 🔧 Scripts

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web"
}
```

## 📝 Notes

- App sử dụng mock data, không kết nối backend thật
- Login chấp nhận bất kỳ email/password nào
- Giỏ hàng và user được lưu trong AsyncStorage
- Animation sử dụng Animated API của React Native

## 🎯 Đồng bộ với Web App

Mobile app được thiết kế đồng bộ hoàn toàn với web app:
- **Giao diện**: Giống web (màu sắc, layout, typography)
- **Chức năng**: Các tính năng giống hệt web
- **State Management**: Redux store structure giống web
- **Mock Data**: Cùng data với web app
- **User Flow**: Trải nghiệm người dùng tương tự

## ⚠️ Yêu cầu

- Node.js 16+
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android)
- Xcode (cho iOS)
- Expo Go app (để test trên thiết bị thật)
