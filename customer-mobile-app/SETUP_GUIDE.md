# 🚀 Hướng dẫn Setup Mobile App

## 📋 Yêu cầu
- Node.js (v16 trở lên)
- Expo Go app (cài trên điện thoại)
- Backend đang chạy

## 🎯 Cách chạy (3 phương án)

### ⭐ PHƯƠNG ÁN 1: Dùng Ngrok (Khuyên dùng - Hoạt động mọi máy, mọi mạng)

**Bước 1: Cài Ngrok**
```bash
# Windows: Download từ https://ngrok.com/download
# Mac: brew install ngrok
# Linux: snap install ngrok
```

**Bước 2: Chạy Backend**
```bash
cd backend
npm install
npm run dev
```

**Bước 3: Chạy Ngrok**
```bash
# Trong terminal khác
ngrok http 5000
```

**Bước 4: Copy URL từ Ngrok**
- Ngrok sẽ hiển thị URL dạng: `https://abc123.ngrok.io`
- Copy URL này

**Bước 5: Chạy Mobile App**
```bash
cd customer-mobile-app
npm install
npx expo start --tunnel
```

**Bước 6: Cấu hình trong App**
- Scan QR code bằng Expo Go
- Vào **Profile** > **Cấu hình Server**
- Dán Ngrok URL (VD: `https://abc123.ngrok.io`)
- Nhấn **Lưu**

---

### 💻 PHƯƠNG ÁN 2: Dùng IP LAN (Phải cùng WiFi)

**Bước 1: Tìm IP máy tính**
```bash
# Windows
ipconfig
# Tìm dòng "IPv4 Address" (VD: 192.168.1.100)

# Mac/Linux
ifconfig
# Tìm inet (VD: 192.168.1.100)
```

**Bước 2: Chạy Backend**
```bash
cd backend
npm install
npm run dev
```

**Bước 3: Chạy Mobile App**
```bash
cd customer-mobile-app
npm install
npx expo start
```

**Bước 4: Cấu hình trong App**
- Đảm bảo điện thoại và máy tính **cùng WiFi**
- Scan QR code
- Vào **Profile** > **Cấu hình Server**
- Nhập: `http://192.168.1.100:5000` (thay IP của bạn)
- Nhấn **Lưu**

---

### ⚙️ PHƯƠNG ÁN 3: Hardcode URL (Nếu muốn)

**Edit file:** `customer-mobile-app/src/services/api.ts`

```typescript
// Dòng 22: Điền Ngrok URL
const NGROK_URL = 'https://abc123.ngrok.io';

// HOẶC dòng 26: Điền IP LAN
const DEFAULT_LAN_IP = '192.168.1.100';
```

Sau đó chạy app:
```bash
npx expo start --tunnel
```

---

## ❓ Troubleshooting

### Lỗi "Network Error"
✅ Kiểm tra backend đã chạy: `http://localhost:5000/api/restaurants`
✅ Kiểm tra URL trong app: Profile > Cấu hình Server
✅ Nếu dùng IP LAN: Đảm bảo cùng WiFi

### Lỗi "Failed to download remote update"
✅ Chạy: `npx expo start --tunnel` (thêm `--tunnel`)
✅ Xóa cache: Settings > Clear cache trong Expo Go
✅ Kiểm tra internet trên điện thoại

### App không kết nối backend
✅ Vào Profile > Cấu hình Server
✅ Nhập đúng URL (có http:// hoặc https://)
✅ Restart app sau khi lưu URL

---

## 📝 Lưu ý

1. **Ngrok URL thay đổi mỗi lần restart** (free tier)
   - Nếu restart ngrok, phải cập nhật URL mới trong app

2. **IP LAN có thể thay đổi**
   - Nếu reconnect WiFi, IP có thể đổi

3. **Ưu tiên cấu hình**
   - Custom URL (trong app) > NGROK_URL (code) > DEFAULT_LAN_IP (code)

4. **Để push lên GitHub**
   - Để `NGROK_URL = ''` và `DEFAULT_LAN_IP = ''`
   - Mỗi người tự cấu hình trong app

---

## 🎉 Done!

Giờ bạn có thể:
- ✅ Chạy app trên bất kỳ máy nào
- ✅ Không cần sửa code
- ✅ Cấu hình dễ dàng trong app
