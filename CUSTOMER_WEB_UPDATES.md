# Customer Web - Cập nhật nghiệp vụ theo Mobile App

## Tổng quan
Đã cập nhật toàn bộ `customer-web` để có **nghiệp vụ backend và database giống y hệt** với `customer-mobile-app`, nhưng giữ nguyên giao diện web.

## Các thay đổi chính

### 1. Services Layer (`src/services/`)

#### `api.js`
- ✅ Cập nhật response interceptor để xử lý lỗi 401 và clear storage
- ✅ Thêm timeout 15000ms
- ✅ Thêm đầy đủ các API endpoints:
  - `voucherAPI` - Quản lý voucher
  - `droneAPI` - Thông tin drone
  - `reviewAPI` - Đánh giá
  - `paymentAPI` - Xác nhận thanh toán
  - `notificationAPI` - Thông báo
  - `cartAPI` - Giỏ hàng (đồng bộ với server)
  - `savedOrderAPI` - Đơn hàng đã lưu
- ✅ Chuẩn hóa response format giống mobile app

#### `socket.js`
- ✅ Chuyển từ class-based sang functional approach
- ✅ Thêm các helper functions:
  - `initSocket()` - Khởi tạo socket
  - `getSocket()` - Lấy instance socket
  - `disconnectSocket()` - Ngắt kết nối
  - `joinCustomerRoom()` - Join room customer
  - `onOrderStatusUpdate()` - Listen order updates
  - `onDroneLocationUpdate()` - Listen drone location
  - `offOrderStatusUpdate()` - Remove listeners
  - `offDroneLocationUpdate()` - Remove listeners

### 2. Redux Store (`src/store/`)

#### `store.js`
- ✅ Đổi tên reducer từ `order` → `orders` để khớp với mobile app
- ✅ Export default store

#### `slices/authSlice.js`
- ✅ Đổi tên actions:
  - `loginUser` → `login`
  - `registerUser` → `register`
  - `fetchUserProfile` → `loadUser`
- ✅ Thêm `updateProfile` action
- ✅ Thêm `setUser` reducer
- ✅ Chuẩn hóa response payload với `extractAuthPayload()`
- ✅ Thêm `persistAuthPayload()` helper

#### `slices/cartSlice.js`
- ✅ **Thay đổi lớn**: Chuyển từ localStorage sang **đồng bộ với server**
- ✅ Thêm các async thunks:
  - `fetchCart` - Tải giỏ hàng từ server
  - `persistCart` - Lưu giỏ hàng lên server
- ✅ Thêm state mới:
  - `currentRestaurantId` (thay `restaurantId`)
  - `currentRestaurantName`
  - `isLoading`
  - `isSyncing`
  - `lastSyncedAt`
- ✅ Chuẩn hóa cart items với helpers:
  - `normalizeCartItemFromServer()`
  - `normalizeCartResponse()`
  - `serializeCartForServer()`
- ✅ Cart actions mới:
  - `addToCart()` - Thêm và sync với server
  - `removeFromCart()` - Xóa và sync
  - `updateQuantity()` - Cập nhật và sync
  - `clearCart()` - Xóa và sync
  - `synchronizeCart()` - Đồng bộ với server

#### `slices/orderSlice.js`
- ✅ Đổi tên slice từ `order` → `orders`
- ✅ Thêm các trường mới trong order:
  - `isReviewed`
  - `rating`
  - `reviewComment`
- ✅ Thêm action `submitOrderReview()`
- ✅ Thêm action `setOrders()`

### 3. App.jsx
- ✅ Import `loadUser`, `setUser`, `fetchCart` từ slices
- ✅ Khởi tạo app với:
  - Load user từ localStorage
  - Fetch fresh data từ server
  - Load cart từ server

### 4. Pages

#### `Login.jsx`
- ✅ Đổi action `loginUser` → `login`
- ✅ Import socket helpers: `initSocket`, `joinCustomerRoom`
- ✅ Khởi tạo socket sau khi login
- ✅ Fetch cart từ server sau login

#### `Register.jsx`
- ✅ Đổi action `registerUser` → `register`
- ✅ Import socket helpers
- ✅ Khởi tạo socket sau khi đăng ký
- ✅ Fetch cart từ server

#### `Cart.jsx`
- ✅ Sử dụng `currentRestaurantName` từ state
- ✅ Hiển thị tên nhà hàng
- ✅ Cập nhật `updateQuantity` với `{ id, quantity }`
- ✅ Sử dụng `item.id` thay vì `item._id || item.id`
- ✅ Xử lý async cho tất cả cart actions
- ✅ Hiển thị `restaurantName` từ item

#### `RestaurantDetail.jsx`
- ✅ Import APIs từ `services/api`
- ✅ Sử dụng `restaurantAPI.getById()`
- ✅ Sử dụng `productAPI.getByRestaurant()`
- ✅ Sử dụng `reviewAPI.getAll()`
- ✅ Chuẩn hóa response data
- ✅ `handleAddToCart` với payload đúng format:
  ```js
  {
    id, productId, name, price,
    restaurantId, restaurantName, image
  }
  ```

#### `Home.jsx`
- ✅ Import `restaurantAPI`
- ✅ Sử dụng `restaurantAPI.getAll()`
- ✅ Chuẩn hóa response data

#### `Checkout.jsx`
- ✅ Import APIs: `orderAPI`, `voucherAPI`, `restaurantAPI`, `api`
- ✅ Đổi `checkAuth()` → `loadUser()`
- ✅ Sử dụng `voucherAPI.getAll()`
- ✅ Sử dụng `restaurantAPI.getById()`
- ✅ Sử dụng `orderAPI.create()`
- ✅ Chuẩn hóa order payload với `productId`
- ✅ Xử lý payment APIs qua `api.post()`
- ✅ Đổi `restaurantId` → `currentRestaurantId`

#### `Orders.jsx`
- ✅ Import `orderAPI`
- ✅ Sử dụng `orderAPI.getMyOrders()`
- ✅ Chuẩn hóa response data

#### `OrderTracking.jsx`
- ✅ Import `orderAPI` và `api`
- ✅ Sử dụng `orderAPI.getById()`
- ✅ Sử dụng `api.get()` cho delivery tracking
- ✅ Sử dụng `api.patch()` cho confirm received

#### `EditProfile.jsx`
- ✅ Đổi `fetchUserProfile` → `loadUser`
- ✅ Sử dụng `updateProfile` action
- ✅ Dispatch actions qua Redux thunk

## Nghiệp vụ Backend/Database

### ✅ Giống 100% với Mobile App

1. **Authentication**
   - Login/Register với JWT token
   - Store token in localStorage
   - Auto-refresh user data

2. **Cart Management**
   - **Server-side cart**: Đồng bộ với database
   - Auto-sync khi thêm/xóa/update
   - Load cart từ server khi login
   - Restaurant switching logic
   - Item normalization

3. **Order Flow**
   - Tạo order qua API
   - Real-time tracking qua Socket.IO
   - Payment integration (VNPay, MoMo, COD)
   - Order status updates
   - Review & rating

4. **Socket.IO**
   - Real-time order updates
   - Drone location tracking
   - Join customer room
   - Event listeners

5. **Vouchers**
   - Fetch available vouchers
   - Apply voucher validation
   - Discount calculation

6. **Reviews**
   - Fetch restaurant reviews
   - Submit order reviews
   - Rating system

## Frontend - Khác biệt với Mobile

Frontend giữ nguyên:
- ✅ React Router cho navigation (web)
- ✅ CSS styling cho desktop/responsive
- ✅ Layout components (Header, Footer, Sidebar)
- ✅ Form validation và UX web
- ✅ Modal/Dialog patterns
- ✅ Desktop-optimized UI/UX

## Testing

```bash
cd customer-web
npm install
npm run dev
```

### Test Cases
1. ✅ Login/Register
2. ✅ Browse restaurants
3. ✅ Add to cart (sync to server)
4. ✅ View cart (load from server)
5. ✅ Checkout flow
6. ✅ Payment methods
7. ✅ Order tracking
8. ✅ Real-time updates
9. ✅ Profile management
10. ✅ Logout

## Kết luận

Customer Web hiện tại:
- ✅ **Backend logic**: Giống 100% với mobile app
- ✅ **Database operations**: Giống 100% với mobile app
- ✅ **API calls**: Giống 100% với mobile app
- ✅ **State management**: Cấu trúc tương tự mobile app
- ✅ **Socket.IO**: Real-time features giống mobile
- ✅ **Frontend UI**: Tối ưu cho web (khác mobile)

**Không có thay đổi nào trong `customer-mobile-app`** ✅
