# Hướng dẫn khắc phục lỗi Network Error

## Vấn đề
App báo lỗi: `Error loading restaurants: Network Error` hoặc `Error fetching cart: Network Error`

## 🎯 Giải pháp Tốt nhất: DÙNG NGROK

**Ngrok cho phép app hoạt động KHÔNG CẦN cùng WiFi, không cần config IP!**

### ⚡ Quick Start với Ngrok (5 phút)
```bash
# 1. Tải ngrok: https://ngrok.com/download
# 2. Chạy backend
cd backend && npm run dev

# 3. Terminal mới, chạy ngrok
ngrok http 5000

# 4. Copy URL (VD: https://abc123.ngrok.io)
# 5. Paste vào customer-mobile-app/src/services/api.ts:
const NGROK_URL = 'https://abc123.ngrok.io';

# 6. Restart app - XONG!
```

📖 **Xem hướng dẫn chi tiết:** [NGROK_SETUP.md](./NGROK_SETUP.md)

---

## 🔧 Cách 2: Dùng LAN IP (Không khuyến khích)

### Nguyên nhân
- Backend chưa chạy
- IP trong file `api.ts` không đúng
- Máy tính và điện thoại không cùng mạng WiFi

## ⚠️ LƯU Ý KHI ĐỔI MÁY TÍNH
**Nếu bạn chạy backend trên máy tính khác, BẮT BUỘC phải:**
1. Tìm IP của máy mới (theo hướng dẫn bên dưới)
2. Cập nhật IP trong file `api.ts`
3. Restart app hoàn toàn

**IP thay đổi khi:**
- Đổi máy tính chạy backend
- Kết nối mạng WiFi khác
- Khởi động lại router
- Máy tính được cấp IP mới từ DHCP

## Cách khắc phục

### Bước 1: Kiểm tra Backend đã chạy chưa
```bash
cd backend
npm run dev
```
Backend phải chạy trên cổng 5000: `Server is running on port 5000`

### Bước 2: Tìm IP máy tính

#### Windows:
1. Mở Command Prompt (CMD)
2. Gõ lệnh: `ipconfig`
3. Tìm dòng `IPv4 Address` trong phần WiFi/Ethernet đang kết nối
4. Ví dụ: `192.168.1.85`

#### Mac/Linux:
1. Mở Terminal
2. Gõ lệnh: `ifconfig`
3. Tìm địa chỉ IP trong phần WiFi đang kết nối
4. Ví dụ: `192.168.1.85`

### Bước 3: Cập nhật IP trong app

1. Mở file: `customer-mobile-app/src/services/api.ts`
2. Tìm dòng: `const DEFAULT_LAN_IP = '192.168.1.85';`
3. Thay `192.168.1.85` bằng IP máy bạn vừa tìm được
4. Save file
5. Restart app (nhấn `r` trong Metro Bundler hoặc thoát app và mở lại)

### Bước 4: Kiểm tra cùng mạng WiFi
- Máy tính và điện thoại phải kết nối cùng một mạng WiFi
- Tắt VPN nếu đang bật
- Tắt firewall nếu đang chặn cổng 5000

### Bước 5: Test kết nối

Mở trình duyệt trên điện thoại, truy cập:
```
http://[IP_CỦA_BẠN]:5000/api/restaurants
```
Ví dụ: `http://192.168.1.85:5000/api/restaurants`

Nếu hiển thị dữ liệu JSON => Kết nối OK
Nếu không load được => Kiểm tra lại firewall/WiFi

## Lưu ý
- Sau khi đổi IP, phải restart app hoàn toàn
- Không dùng `localhost` hay `127.0.0.1` vì đó là IP của điện thoại, không phải máy tính
- IP có thể thay đổi khi bạn kết nối mạng WiFi khác

## Debug logs
Khi app khởi động, console sẽ hiển thị:
```
=================================
🌐 API URL: http://192.168.1.85:5000/api
📱 Platform: android
⚠️  Nếu không kết nối được, hãy đổi IP trong api.ts
=================================
```

Kiểm tra IP có đúng không trong log này.
