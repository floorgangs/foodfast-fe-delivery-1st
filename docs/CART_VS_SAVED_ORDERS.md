# Architecture: Cart vs Saved Orders

## Vấn đề cũ
Trước đây gộp chung 2 concepts khác nhau vào 1 model `Cart`:
- `items[]` - giỏ hàng đang mua
- `savedCarts[]` - đơn tạm đã lưu

→ **Sai thiết kế** vì 2 thứ này có mục đích, lifecycle và pattern sử dụng hoàn toàn khác nhau.

---

## Kiến trúc mới

### 1. **Cart** - Giỏ hàng hiện tại
**File:** `backend/models/Cart.js`

**Mục đích:** 
- Giỏ hàng đang active, chưa checkout
- Thay đổi thường xuyên (thêm/xóa/sửa món)
- Sync real-time giữa devices

**Schema:**
```javascript
{
  user: ObjectId,
  items: [CartItem],
  total: Number,
  currentRestaurantId: String,
  currentRestaurantName: String,
  metadata: { lastClientUpdate, clientDevice }
}
```

**APIs:** `/api/cart`
- `GET /cart` - Lấy giỏ hiện tại
- `PUT /cart` - Sync giỏ lên server
- `DELETE /cart` - Xóa giỏ

**Use cases:**
- User thêm món vào giỏ
- User sửa số lượng
- User checkout → xóa giỏ
- Sync multi-device

---

### 2. **SavedOrder** - Đơn tạm/Đơn lưu
**File:** `backend/models/SavedOrder.js`

**Mục đích:**
- Lưu cấu hình đơn hàng hoàn chỉnh để đặt lại sau
- Ít thay đổi, lưu lâu dài
- Có metadata phong phú (tags, orderCount, lastOrderedAt)

**Schema:**
```javascript
{
  user: ObjectId,
  restaurant: ObjectId,  // ← Reference thật
  restaurantName: String,
  items: [{
    productId: ObjectId,  // ← Reference thật
    name, price, quantity, image
  }],
  total: Number,
  
  // Thông tin đặt hàng đầy đủ
  deliveryAddress: {...},
  note: String,
  voucherCode: String,
  discount: Number,
  deliveryFee: Number,
  
  // Metadata để quản lý
  displayName: String,      // "Cơm tấm Sài Gòn - 23/11/2025"
  tags: [String],           // ['yêu thích', 'cuối tuần']
  orderCount: Number,       // Đã đặt 5 lần
  lastOrderedAt: Date
}
```

**APIs:** `/api/saved-orders`
- `GET /saved-orders` - Danh sách đơn tạm
- `POST /saved-orders` - Lưu đơn mới
- `PUT /saved-orders/:id` - Cập nhật (đổi tên, tags, items)
- `DELETE /saved-orders/:id` - Xóa đơn
- `POST /saved-orders/:id/order` - Đặt hàng từ đơn tạm

**Use cases:**
- User click "Lưu đơn" khi đang ở màn giỏ hàng
- User xem danh sách đơn đã lưu
- User click "Đặt lại" → load thông tin → checkout
- User đổi tên đơn: "Combo ăn sáng thứ 7"
- User thêm tag "yêu thích" vào đơn hay đặt

---

## So sánh

| Aspect | Cart | SavedOrder |
|--------|------|------------|
| **Mục đích** | Đang mua | Đã setup, chờ đặt lại |
| **Lifecycle** | Ephemeral (xóa sau checkout) | Long-lived |
| **Thay đổi** | Thường xuyên | Hiếm |
| **Metadata** | Minimal | Rich (tags, count, dates) |
| **References** | String IDs | ObjectId refs |
| **Sync** | Real-time multi-device | On-demand |
| **UI** | CartScreen | OrdersScreen → tab "Đơn tạm" |

---

## Luồng sử dụng

### Scenario 1: Đổi nhà hàng giữa chừng
```
1. User có giỏ với món từ Nhà hàng A
2. User thêm món từ Nhà hàng B
3. Mobile app:
   - Show alert: "Bạn có muốn lưu giỏ A không?"
   - Nếu YES:
     → POST /saved-orders (giỏ A)
     → PUT /cart (giỏ B mới)
   - Nếu NO:
     → PUT /cart (giỏ B, thay thế A)
```

### Scenario 2: Lưu combo ăn thường xuyên
```
1. User setup giỏ: Cơm tấm + Trà đá
2. User click "Lưu đơn này"
3. Mobile: POST /saved-orders
   - displayName: "Combo ăn trưa"
   - tags: ['công việc', 'nhanh']
4. Lần sau:
   - User mở "Đơn tạm"
   - Click "Đặt lại"
   - POST /saved-orders/:id/order
   - → Load thông tin → màn checkout
```

---

## Migration từ code cũ

### Backend
- ✅ Tách SavedOrder model riêng
- ✅ Bỏ `savedCarts[]` khỏi Cart model
- ✅ Tạo controller + routes riêng
- ⚠️ Frontend cần refactor logic

### Frontend Mobile
- ⚠️ Xóa `savedCarts` khỏi cartSlice
- ⚠️ Tạo savedOrderSlice mới
- ⚠️ OrdersScreen tab "Đơn tạm" gọi SavedOrder API
- ⚠️ Logic "đổi nhà hàng" → gọi `savedOrderAPI.create()`

---

## APIs cần implement frontend

```typescript
// customer-mobile-app/src/services/api.ts
export const savedOrderAPI = {
  getAll: (params?) => api.get('/saved-orders', { params }),
  create: (payload) => api.post('/saved-orders', payload),
  update: (id, payload) => api.put(`/saved-orders/${id}`, payload),
  delete: (id) => api.delete(`/saved-orders/${id}`),
  orderFrom: (id) => api.post(`/saved-orders/${id}/order`),
};

// Redux slice mới
// customer-mobile-app/src/store/slices/savedOrderSlice.ts
export const fetchSavedOrders = createAsyncThunk(...);
export const createSavedOrder = createAsyncThunk(...);
export const deleteSavedOrder = createAsyncThunk(...);
export const orderFromSaved = createAsyncThunk(...);
```

---

## Kết luận

Tách riêng Cart và SavedOrder giúp:
- ✅ **Rõ ràng về mặt ngữ nghĩa** - 2 concepts khác nhau
- ✅ **Dễ scale** - Có thể thêm features vào SavedOrder (share, schedule)
- ✅ **Performance tốt hơn** - Cart nhẹ, không vướng saved data
- ✅ **Flexible** - SavedOrder có thể thêm nhiều metadata

