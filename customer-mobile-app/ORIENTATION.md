# Cấu hình Orientation (Xoay màn hình)

## Trạng thái hiện tại
App đã được cấu hình **CHỈ CHẠY CHẾ ĐỘ DỌC (Portrait)** - không xoay ngang.

## Cấu hình trong app.json
```json
{
  "expo": {
    "orientation": "portrait",  // Toàn app chỉ dọc
    "ios": {
      "requireFullScreen": true  // iOS: bắt buộc fullscreen
    },
    "android": {
      "screenOrientation": "portrait"  // Android: khóa dọc
    }
  }
}
```

## Kiểm tra
1. Mở app trên điện thoại
2. Xoay ngang điện thoại
3. App sẽ giữ nguyên chế độ dọc, không xoay theo

## Nếu muốn cho phép xoay
Thay đổi trong `app.json`:
```json
"orientation": "default"  // Cho phép cả dọc và ngang
```

Hoặc:
```json
"orientation": "landscape"  // Chỉ ngang
```

## Lưu ý
- Sau khi thay đổi `app.json`, cần restart app (reload không đủ)
- Nếu build native app, có thể cần rebuild
- Với Expo Go, thay đổi có hiệu lực ngay khi restart

## Orientation options
- `"portrait"` - Chỉ dọc ✅ (Đang dùng)
- `"landscape"` - Chỉ ngang
- `"default"` - Cho phép cả hai

## Platform-specific
### iOS
- `requireFullScreen: true` - App luôn fullscreen, không chia màn hình

### Android  
- `screenOrientation: "portrait"` - Khóa orientation ở Android
- Các giá trị: "portrait", "landscape", "sensorPortrait", "sensorLandscape", "userPortrait", "userLandscape", "sensor", "user", "behind", "nosensor", "fullSensor"
