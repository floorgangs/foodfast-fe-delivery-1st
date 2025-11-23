# Customer Web - UI Updates & Mobile App Bug Fix

## Ngày cập nhật: 23/11/2025

## 1. Sửa lỗi Mobile App

### NotificationsScreen.tsx
**Lỗi**: `ERROR Fetch notifications error: [Error: Vui lòng đăng nhập để tiếp tục]`

**Nguyên nhân**: API notifications yêu cầu authentication nhưng screen không kiểm tra trạng thái đăng nhập

**Giải pháp**:
- ✅ Thêm check `isAuthenticated` từ Redux store
- ✅ Skip fetch nếu chưa đăng nhập
- ✅ Hiển thị UI yêu cầu đăng nhập với nút "Đăng nhập"
- ✅ Không hiển thị error console khi chưa login

**Code thay đổi**:
```tsx
// Added auth check
const { isAuthenticated } = useSelector((state: RootState) => state.auth);

// Skip fetch if not authenticated
if (!isAuthenticated) {
  setLoading(false);
  return;
}

// Show login prompt UI
if (!isAuthenticated) {
  return <View>...</View>;
}
```

## 2. Customer Web - Cập nhật UI

### Các trang mới được thêm

#### 2.1. Notifications Page
**File**: `src/pages/Notifications/`
- `Notifications.jsx` - Component chính
- `Notifications.css` - Styling

**Features**:
- ✅ Hiển thị danh sách thông báo
- ✅ Phân loại theo type (order, promo, system)
- ✅ Icon khác nhau cho mỗi loại
- ✅ Hiển thị thời gian (phút/giờ/ngày trước)
- ✅ Đánh dấu đã đọc/chưa đọc
- ✅ Nút "Đọc tất cả"
- ✅ Click vào notification điều hướng đến order tracking
- ✅ Empty state khi chưa có thông báo

**UI Elements**:
- 🔔 Empty icon
- 🚁 Order notification
- 🎁 Promo notification
- 📱 System notification
- Unread dot (màu đỏ)
- Time formatter

#### 2.2. Vouchers Page
**File**: `src/pages/Vouchers/`
- `Vouchers.jsx` - Component chính
- `Vouchers.css` - Styling

**Features**:
- ✅ Danh sách voucher khả dụng
- ✅ Danh sách voucher đã hết hạn
- ✅ Hiển thị code, description, discount
- ✅ Điều kiện tối thiểu (minPurchase)
- ✅ Ngày hết hạn
- ✅ Nút "Sao chép" mã voucher
- ✅ Check voucher active/expired
- ✅ Empty state

**Voucher Card Info**:
- Mã voucher (CODE)
- Mô tả
- Giảm giá (% hoặc số tiền)
- Đơn tối thiểu
- HSD (Hạn sử dụng)
- Nút sao chép

### Cập nhật các trang hiện có

#### 2.3. App.jsx
**Thêm routes**:
```jsx
import Notifications from "./pages/Notifications/Notifications";
import Vouchers from "./pages/Vouchers/Vouchers";

// Routes
<Route path="notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
<Route path="vouchers" element={<PrivateRoute><Vouchers /></PrivateRoute>} />
```

#### 2.4. Layout.jsx
**Thêm navigation links**:
```jsx
{isAuthenticated && (
  <>
    <Link to="/notifications">🔔 Thông báo</Link>
    <Link to="/vouchers">🎫 Voucher</Link>
  </>
)}
```

**Vị trí**: Giữa "Trang chủ" và "Giỏ hàng"

#### 2.5. Profile.jsx
**Thêm quick actions**:
```jsx
<div className="profile-actions">
  <button onClick={() => navigate("/edit-profile")}>
    ✏️ Chỉnh sửa thông tin
  </button>
  <button onClick={() => navigate("/notifications")}>
    🔔 Thông báo
  </button>
  <button onClick={() => navigate("/vouchers")}>
    🎫 Voucher của tôi
  </button>
</div>
```

**CSS**: Flexbox column layout với gap

## 3. Backend/API (Không thay đổi)

Tất cả API endpoints đã có sẵn từ lần cập nhật trước:
- ✅ `notificationAPI.getAll()`
- ✅ `notificationAPI.markAsRead(id)`
- ✅ `notificationAPI.markAllAsRead()`
- ✅ `voucherAPI.getAll()`
- ✅ `voucherAPI.apply(code, orderTotal, restaurantId)`

## 4. Khác biệt giữa Mobile và Web

| Feature | Mobile App | Customer Web |
|---------|-----------|--------------|
| Navigation | Bottom tabs + Stack | Header navbar + React Router |
| Notifications | Screen trong tabs | Page với route riêng |
| Vouchers | Screen trong Profile | Page với route riêng |
| UI Components | React Native (View, Text, etc) | HTML/CSS (div, p, etc) |
| Styling | StyleSheet | CSS files |
| Icons | Emoji | Emoji |
| Auth Check | useSelector + RootState | useSelector + state.auth |
| Empty States | Centered View | Centered div |

## 5. Nghiệp vụ giống 100%

### Authentication Flow
- ✅ Check `isAuthenticated` trước khi fetch
- ✅ Redirect to login nếu chưa đăng nhập
- ✅ Hiển thị UI phù hợp cho mỗi trạng thái

### Notification Logic
- ✅ Fetch từ server qua API
- ✅ Format time (phút/giờ/ngày trước)
- ✅ Icon theo type
- ✅ Đánh dấu đã đọc
- ✅ Click để track order

### Voucher Logic
- ✅ Phân loại active/expired
- ✅ Check ngày bắt đầu, ngày hết hạn
- ✅ Hiển thị điều kiện sử dụng
- ✅ Copy code vào clipboard

## 6. Testing Checklist

### Mobile App
- [ ] Login thành công
- [ ] Vào tab Notifications không còn lỗi
- [ ] Hiển thị "Vui lòng đăng nhập" khi chưa login
- [ ] Hiển thị danh sách notifications khi đã login
- [ ] Click vào notification navigate đúng

### Customer Web
- [ ] Navbar hiển thị "🔔 Thông báo" và "🎫 Voucher"
- [ ] Click vào Notifications page hoạt động
- [ ] Click vào Vouchers page hoạt động
- [ ] Profile page có 3 nút actions
- [ ] Notifications: mark as read hoạt động
- [ ] Notifications: mark all as read hoạt động
- [ ] Vouchers: copy code hoạt động
- [ ] Vouchers: phân loại active/expired đúng

## 7. File Structure

```
customer-mobile-app/
├── src/
│   └── screens/
│       └── NotificationsScreen.tsx ✅ UPDATED

customer-web/
├── src/
│   ├── App.jsx ✅ UPDATED
│   ├── components/
│   │   └── Layout/
│   │       └── Layout.jsx ✅ UPDATED
│   └── pages/
│       ├── Notifications/ ✅ NEW
│       │   ├── Notifications.jsx
│       │   └── Notifications.css
│       ├── Vouchers/ ✅ NEW
│       │   ├── Vouchers.jsx
│       │   └── Vouchers.css
│       └── Profile/
│           ├── Profile.jsx ✅ UPDATED
│           └── Profile.css ✅ UPDATED
```

## 8. Kết luận

✅ **Mobile App**: Đã fix lỗi NotificationsScreen, không còn crash khi chưa đăng nhập

✅ **Customer Web**: Đã thêm đầy đủ tính năng Notifications và Vouchers như mobile app

✅ **UI/UX**: Giữ nguyên các nút và features từ mobile, chỉ điều chỉnh layout cho web

✅ **Backend**: Không có thay đổi, sử dụng API đã có sẵn

✅ **Consistency**: Nghiệp vụ 100% giống mobile app
