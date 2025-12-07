# Mobile App - API Configuration Guide

Khi clone project, bạn cần configure API endpoint để kết nối với backend.

## 3 cách setup:

### **Cách 1: NGROK (Khuyên dùng - hoạt động mọi nơi)**

1. Cài ngrok: https://ngrok.com/download
2. Chạy backend:
   ```bash
   cd backend
   npm run dev
   ```
3. Mở terminal khác, chạy ngrok:
   ```bash
   ngrok http 5000
   ```
4. Copy URL hiển thị (dạng `https://xxxxx.ngrok.io`)
5. Tạo file `.env` từ `.env.example`:
   ```
   EXPO_PUBLIC_NGROK_URL=https://xxxxx.ngrok.io
   ```
6. Reload app (Ctrl+Shift+R)

### **Cách 2: LAN IP (Cùng mạng WiFi)**

1. Tìm IP của máy chạy backend:

   - **Windows:** `ipconfig` → tìm "IPv4 Address" (dạng `192.168.x.x`)
   - **Mac/Linux:** `ifconfig` → tìm `inet` (not `127.0.0.1`)

2. Tạo `.env` file:

   ```
   EXPO_PUBLIC_LAN_IP=192.168.1.16
   ```

   (Thay `192.168.1.16` với IP của bạn)

3. Đảm bảo điện thoại và máy tính cùng mạng WiFi

4. Reload app

### **Cách 3: Custom URL trong App**

- Mở Profile screen trong app
- Chọn "Cấu hình Server"
- Nhập URL của backend
- Chọn lưu

## Troubleshooting

**Lỗi "Network Error":**

- Kiểm tra backend có chạy không (port 5000)
- Nếu dùng LAN IP: điện thoại có cùng WiFi không?
- Nếu dùng NGROK: ngrok terminal có chạy không?
- Thử dùng NGROK thay vì LAN IP

**Backend trả về HTML error:**

- NGROK endpoint offline - chạy lại `ngrok http 5000`

**Không load được dữ liệu:**

- Check browser console/app logs
- Thử reload app (Ctrl+Shift+R hoặc shake device)
