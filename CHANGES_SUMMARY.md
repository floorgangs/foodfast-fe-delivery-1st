# Tóm tắt các thay đổi đã thực hiện

## 1. Loại bỏ trạng thái "Đang chuẩn bị" (preparing)

### Mobile App (customer-mobile-app)
- ✅ `src/store/slices/orderSlice.ts`: Xóa 'preparing' khỏi type definition
- ✅ `src/constants/index.ts`: Xóa 'preparing' khỏi ORDER_STATUS, LABELS, COLORS
- ✅ `src/screens/OrdersScreen.tsx`: Xóa case 'preparing' trong status rendering
- ✅ `src/screens/OrderTrackingScreen.tsx`: Xóa 'preparing' khỏi STATUS_STEPS

### Restaurant Web
- ✅ `src/pages/OrderManagement/OrderManagement.jsx`: 
  - Xóa nút "Bắt đầu chuẩn bị"
  - Nút "Xác nhận" → chuyển thẳng sang "Sẵn sàng giao"
  - Xóa 'preparing' khỏi filters và counts

### Backend
- ✅ `models/Order.js`: Xóa 'preparing' khỏi enum status
- ✅ `controllers/orderController.js`: Thêm logic auto-assign drone khi status = 'delivering'

## 2. Fix Drone Status Update

### Backend (controllers/orderController.js)
- ✅ Khi order status → "delivering": Tự động tìm drone available và cập nhật:
  - `drone.status = 'delivering'`
  - `drone.currentOrder = orderId`
  - `order.drone = droneId`
  
- ✅ Khi order status → "delivered": Giải phóng drone:
  - `drone.status = 'available'`
  - `drone.currentOrder = null`

## 3. Giải thích về Database

### Lịch sử đơn hàng
- **Collection**: `orders`
- **Field quan trọng**: `timeline` - Array chứa tất cả các event thay đổi status
- Mỗi timeline entry có: `{ status, timestamp, note }`
- Tất cả đơn hàng (pending, delivered, cancelled) đều được lưu trong collection này

### Đánh giá món ăn
- **Collection**: `reviews`
- **Fields chính**:
  - `order`: Reference đến order đã giao
  - `customer`: Người đánh giá
  - `restaurant`: Nhà hàng được đánh giá
  - `product`: Món ăn cụ thể (optional)
  - `rating`: 1-5 sao
  - `comment`: Nội dung đánh giá
  - `restaurantReply`: { comment, timestamp } - Phản hồi từ nhà hàng
  
- **Order model** cũng có field `customerReview` lưu thông tin review trực tiếp

## 4. Review Feature - Đã có sẵn đầy đủ

### Backend
- ✅ Controller: `backend/controllers/reviewController.js`
  - `createReview`: Tạo đánh giá mới
  - `replyToReview`: Nhà hàng phản hồi đánh giá
  - `getReviews`: Lấy danh sách đánh giá
  - `getSummary`: Thống kê đánh giá

- ✅ Routes: `backend/routes/reviewRoutes.js`
  - POST `/api/reviews` - Tạo review
  - GET `/api/reviews` - Lấy danh sách
  - GET `/api/reviews/summary` - Thống kê
  - POST `/api/reviews/:id/reply` - Phản hồi

### Restaurant Web
- ✅ Page: `src/pages/Reviews/Reviews.jsx` - Hiển thị và phản hồi đánh giá
- ✅ API: `src/services/api.js` - reviewAPI.getAll(), getSummary(), reply()

### Mobile App
- ✅ Screen: `src/screens/OrdersScreen.tsx` - Có modal đánh giá đơn hàng
- ✅ Redux: `src/store/slices/orderSlice.ts` - submitOrderReview action

## 5. Cách kiểm tra Review

### Tạo review từ mobile app:
1. Đặt đơn hàng và chờ status = "delivered"
2. Vào tab "Đánh giá" trong OrdersScreen
3. Chọn đơn hàng → nhập rating + comment → Submit
4. Review sẽ được lưu vào database collection `reviews`

### Xem và phản hồi từ restaurant web:
1. Login vào restaurant web
2. Vào menu "Đánh giá"
3. Danh sách reviews sẽ hiển thị (nếu có)
4. Click "Phản hồi" để trả lời customer

### Nếu không thấy review:
- Kiểm tra: Review đã được tạo chưa? (query MongoDB collection `reviews`)
- Kiểm tra: `review.restaurant` có khớp với restaurant ID đang login không?
- Kiểm tra: Console log lỗi API khi load reviews

## 6. Cần làm gì tiếp theo

1. **Restart Backend**: Để áp dụng thay đổi Order model và drone logic
   ```bash
   cd backend
   npm start
   ```

2. **Test flow đơn hàng mới**:
   - Mobile app: Đặt đơn mới
   - Restaurant web: Xác nhận → Sẵn sàng giao → Bắt đầu giao
   - Kiểm tra: Drone status có chuyển sang "delivering" không?
   
3. **Test review**:
   - Mobile: Đánh giá đơn hàng đã delivered
   - Restaurant web: Vào trang Reviews xem có hiển thị không
   - Nếu không có: Check console log và MongoDB

4. **Fix địa chỉ map** (vấn đề ban đầu):
   - Tạo đơn hàng MỚI sau khi backend restart
   - Logic parse địa chỉ mới sẽ lưu đúng ward/district/city
   - Map tracking sẽ hiển thị đúng tọa độ
