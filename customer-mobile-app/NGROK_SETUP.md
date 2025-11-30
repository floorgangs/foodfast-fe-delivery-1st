# Hướng dẫn dùng Ngrok - Kết nối từ mọi máy, mọi nơi

## Tại sao dùng Ngrok?

### ❌ Vấn đề với LAN IP
- Phải cùng mạng WiFi
- IP thay đổi khi đổi máy/mạng
- Phải cập nhật code mỗi lần
- QR code không hoạt động từ xa

### ✅ Ưu điểm Ngrok
- Hoạt động từ MỌI NƠI (4G, WiFi công cộng, nhà khác)
- URL cố định trong session
- Scan QR code bất kỳ đâu
- Không cần cấu hình firewall
- HTTPS miễn phí
- Dùng được trên mọi máy tính

---

## Cài đặt Ngrok

### Bước 1: Tải Ngrok
1. Truy cập: https://ngrok.com/download
2. Đăng ký tài khoản miễn phí (hoặc dùng luôn)
3. Tải file phù hợp:
   - Windows: `ngrok.exe`
   - Mac: `ngrok`
   - Linux: `ngrok`

### Bước 2: Giải nén và cài đặt

#### Windows:
1. Giải nén `ngrok.zip`
2. Copy `ngrok.exe` vào thư mục dễ tìm (VD: `C:\ngrok\`)
3. Thêm vào PATH (không bắt buộc):
   - Chuột phải "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Thêm `C:\ngrok\` vào PATH

#### Mac/Linux:
```bash
# Giải nén
unzip ngrok.zip

# Di chuyển vào /usr/local/bin
sudo mv ngrok /usr/local/bin/

# Cấp quyền thực thi
sudo chmod +x /usr/local/bin/ngrok
```

### Bước 3: Xác thực (Optional nhưng khuyên dùng)
```bash
ngrok authtoken YOUR_AUTH_TOKEN
```
Token lấy từ: https://dashboard.ngrok.com/get-started/your-authtoken

---

## Sử dụng Ngrok

### Bước 1: Chạy Backend
```bash
cd backend
npm run dev
```
Backend chạy trên port 5000

### Bước 2: Mở Terminal mới, chạy Ngrok
```bash
ngrok http 5000
```

Hoặc nếu chưa thêm vào PATH (Windows):
```bash
C:\ngrok\ngrok.exe http 5000
```

### Bước 3: Copy URL từ Ngrok
Terminal sẽ hiển thị:
```
ngrok                                                                    
                                                                         
Session Status                online                                    
Account                       your@email.com (Plan: Free)              
Version                       3.x.x                                     
Region                        United States (us)                        
Latency                       50ms                                      
Web Interface                 http://127.0.0.1:4040                    
Forwarding                    https://abc123.ngrok.io -> http://localhost:5000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy URL này**: `https://abc123.ngrok.io`

### Bước 4: Cập nhật trong App
Mở file: `customer-mobile-app/src/services/api.ts`

Tìm dòng:
```typescript
const NGROK_URL = '';
```

Thay thành:
```typescript
const NGROK_URL = 'https://abc123.ngrok.io';
```

### Bước 5: Restart App
- Trong Metro Bundler nhấn `r`
- Hoặc thoát app và mở lại

### Bước 6: Test
App bây giờ kết nối qua Ngrok! Bạn có thể:
- Dùng 4G thay vì WiFi
- Scan QR từ máy khác
- Di chuyển đến nơi khác
- Đổi máy tính mà không cần config lại

---

## Lưu ý quan trọng

### URL Ngrok thay đổi khi:
- Restart ngrok
- Đóng terminal chạy ngrok
- Sau 2 giờ (với free plan)

**Giải pháp**: Khi URL thay đổi, chỉ cần:
1. Copy URL mới từ terminal ngrok
2. Paste vào `NGROK_URL`
3. Restart app (nhấn `r`)

### Ngrok Free Plan
- ✅ Bandwidth: 1GB/tháng (đủ cho dev)
- ✅ HTTPS miễn phí
- ✅ 1 tunnel cùng lúc
- ❌ URL thay đổi mỗi lần restart
- ❌ Session timeout 2h

### Upgrade để có URL cố định
Ngrok Pro ($8/tháng):
- URL cố định (VD: `https://yourapp.ngrok.io`)
- Không timeout
- 3 tunnels cùng lúc

---

## Troubleshooting

### Lỗi: "tunnel not found"
```bash
# Kill ngrok đang chạy
pkill ngrok   # Mac/Linux
taskkill /F /IM ngrok.exe   # Windows

# Chạy lại
ngrok http 5000
```

### Lỗi: "failed to start tunnel"
- Kiểm tra backend có chạy trên port 5000 không
- Thử port khác: `ngrok http 5001`

### App vẫn báo Network Error
1. Check backend đang chạy: `curl http://localhost:5000/api/restaurants`
2. Check ngrok forwarding đúng: mở http://127.0.0.1:4040
3. Check NGROK_URL trong api.ts có đúng không
4. Restart app hoàn toàn

### Ngrok Web Interface (Debug tool)
Mở: http://127.0.0.1:4040
- Xem tất cả requests
- Response time
- Request/response headers
- Body content

---

## So sánh các phương pháp

| Phương pháp | Ưu điểm | Nhược điểm | Khuyên dùng |
|-------------|---------|------------|-------------|
| **Ngrok** | • Mọi máy, mọi nơi<br>• Không config<br>• HTTPS<br>• QR code hoạt động | • URL thay đổi<br>• Cần chạy thêm process | ✅ **TỐT NHẤT** |
| **LAN IP** | • Nhanh<br>• Không cần tool thêm | • Phải cùng WiFi<br>• IP thay đổi<br>• Config mỗi máy | ⚠️ Chỉ khi cùng WiFi |
| **Production** | • Stable<br>• Không cần local server | • Cần deploy<br>• Chậm update | 📦 Khi release |

---

## Quick Start (TL;DR)

```bash
# 1. Tải ngrok
https://ngrok.com/download

# 2. Chạy backend
cd backend && npm run dev

# 3. Chạy ngrok (terminal mới)
ngrok http 5000

# 4. Copy URL (VD: https://abc123.ngrok.io)

# 5. Paste vào api.ts
const NGROK_URL = 'https://abc123.ngrok.io';

# 6. Restart app
# Xong! App hoạt động mọi nơi!
```

---

## Video hướng dẫn
- Ngrok official: https://www.youtube.com/watch?v=jC9hGXRj3Xo
- React Native + Ngrok: https://www.youtube.com/results?search_query=ngrok+react+native

---

## Support
- Ngrok docs: https://ngrok.com/docs
- Discord: https://ngrok.com/slack
- GitHub Issues: https://github.com/inconshreveable/ngrok/issues
