# 📱 Mobile App Network Setup - Giải pháp cho mọi máy

## 🎯 Vấn đề: App không kết nối được backend

Bạn đang gặp lỗi này:
- ❌ `Error loading restaurants: Network Error`
- ❌ `Error fetching cart: Network Error`
- ❌ App chỉ chạy khi cùng WiFi
- ❌ Đổi máy tính là phải config lại
- ❌ Scan QR code không hoạt động

## ✅ GIẢI PHÁP: DÙNG NGROK

### Tại sao dùng Ngrok?
- ✅ Hoạt động trên **MỌI MÁY TÍNH**
- ✅ Hoạt động trên **MỌI MẠNG** (4G, WiFi công cộng, nhà bạn bè)
- ✅ **KHÔNG CẦN CONFIG** IP
- ✅ QR Code scan được từ mọi nơi
- ✅ HTTPS miễn phí
- ✅ Setup 1 lần dùng mãi

---

## 🚀 Quick Start (5 phút)

### 1. Cài Ngrok (1 lần)
- Windows: Tải từ https://ngrok.com/download
- Mac: `brew install ngrok`
- Linux: Tải từ https://ngrok.com/download

### 2. Chạy Backend + Ngrok

#### Windows:
Double click file: `START_WITH_NGROK.bat`

#### Mac/Linux:
```bash
chmod +x start_with_ngrok.sh
./start_with_ngrok.sh
```

### 3. Copy Ngrok URL
Từ terminal Ngrok, copy URL:
```
Forwarding     https://abc123.ngrok.io -> http://localhost:5000
               ^^^^^^^^^^^^^^^^^^^^^^
               Copy URL này
```

### 4. Cập nhật trong App
Mở: `customer-mobile-app/src/services/api.ts`

Tìm dòng:
```typescript
const NGROK_URL = '';
```

Thay thành:
```typescript
const NGROK_URL = 'https://abc123.ngrok.io';  // Paste URL vừa copy
```

### 5. Restart App
- Trong Metro Bundler nhấn `r`
- Hoặc reload app

### 6. ✅ XONG!
App bây giờ:
- ✅ Chạy trên 4G/5G
- ✅ Scan QR từ máy khác
- ✅ Dùng ở nhà bạn, quán cafe
- ✅ Không cần config lại khi đổi máy

---

## 📚 Tài liệu chi tiết

- 📖 [NGROK_SETUP.md](./customer-mobile-app/NGROK_SETUP.md) - Hướng dẫn đầy đủ về Ngrok
- 📖 [SETUP_NETWORK.md](./customer-mobile-app/SETUP_NETWORK.md) - Troubleshooting network
- 📖 [ORIENTATION.md](./customer-mobile-app/ORIENTATION.md) - Cấu hình xoay màn hình

---

## 🔄 Workflow hàng ngày

```bash
# 1. Start backend + ngrok
START_WITH_NGROK.bat   # Windows
./start_with_ngrok.sh  # Mac/Linux

# 2. Copy URL từ Ngrok (chỉ khi URL thay đổi)

# 3. Start mobile app
cd customer-mobile-app
npm start

# 4. Scan QR code từ Expo Go
# XONG! Bạn có thể dùng 4G và di chuyển tự do!
```

---

## ⚠️ Lưu ý

### Ngrok URL thay đổi khi:
- Restart ngrok
- Sau 2 giờ (với free plan)

**Khi URL thay đổi:**
1. Copy URL mới từ terminal Ngrok
2. Paste vào `NGROK_URL` trong `api.ts`
3. Reload app (nhấn `r`)

### Muốn URL cố định?
Upgrade Ngrok Pro ($8/tháng):
- URL cố định: `https://your-app.ngrok.io`
- Không timeout
- Không cần update code

---

## 🆚 So sánh với LAN IP

| Tính năng | Ngrok | LAN IP |
|-----------|-------|--------|
| Hoạt động mọi máy | ✅ | ❌ |
| Hoạt động mọi mạng | ✅ | ❌ |
| Dùng 4G/5G | ✅ | ❌ |
| QR code remote | ✅ | ❌ |
| Không cần config IP | ✅ | ❌ |
| HTTPS | ✅ | ❌ |
| Setup 1 lần | ✅ | ❌ |

---

## 🐛 Troubleshooting

### Backend không chạy
```bash
cd backend
npm install
npm run dev
```

### Ngrok không chạy
```bash
# Kill processes
taskkill /F /IM ngrok.exe   # Windows
pkill ngrok                  # Mac/Linux

# Restart
ngrok http 5000
```

### App vẫn báo lỗi
1. ✅ Backend đang chạy: Mở http://localhost:5000/api/restaurants
2. ✅ Ngrok forwarding: Mở http://127.0.0.1:4040
3. ✅ NGROK_URL đúng trong api.ts
4. ✅ Đã restart app (nhấn `r`)

---

## 💡 Tips

### Debug Ngrok Requests
Mở: http://127.0.0.1:4040
- Xem tất cả requests từ app
- Response status codes
- Request/response body
- Timing information

### Test Backend trước khi dùng Ngrok
```bash
# Local
curl http://localhost:5000/api/restaurants

# Qua Ngrok
curl https://abc123.ngrok.io/api/restaurants
```

### Share với team
Gửi Ngrok URL cho team members:
- Họ paste vào `NGROK_URL`
- Restart app
- Tất cả dùng chung backend của bạn!

---

## 📞 Hỗ trợ

- Ngrok docs: https://ngrok.com/docs
- Video tutorials: https://www.youtube.com/results?search_query=ngrok+react+native
- Issues: https://github.com/inconshreveable/ngrok/issues

---

## ✨ Kết luận

**Dùng Ngrok = Không còn đau đầu với network!**

- Bạn có thể dev ở bất kỳ đâu
- Team members scan QR code từ xa
- Demo client không cần setup gì
- Production-like HTTPS
- Tập trung vào code, không phải config network!

🎉 Happy coding!
