# Product Requirements Document (PRD) - FoodFast FE

## 1. Giới thiệu

FoodFast là ứng dụng frontend mô phỏng quá trình **đặt và quản lý món ăn trực tuyến**, gồm:

- Web: đặt món, xem giỏ hàng, thanh toán.
- Mobile: đặt món, theo dõi đơn hàng.

Dự án chỉ phát triển **Frontend**, không có Backend thật. Toàn bộ dữ liệu dùng file JSON (mock data).

---

## 2. Mục tiêu

- Xây dựng giao diện đặt hàng thân thiện trên web và mobile.
- Cho phép người dùng đăng nhập (demo), xem danh sách nhà hàng, thêm món vào giỏ.
- Cung cấp luồng cơ bản để test UX/UI.

---

## 3. Phạm vi

| Module        | Mô tả                              |
| ------------- | ---------------------------------- |
| Login         | Form đăng nhập (client validation) |
| Home          | Danh sách nhà hàng (mock JSON)     |
| Restaurant    | Danh sách món ăn                   |
| Cart          | Xem và chỉnh sửa giỏ hàng          |
| Order Summary | Hiển thị tổng đơn hàng (mock)      |

---

## 4. Người dùng mục tiêu

- Người dùng cuối (khách hàng đặt món).
- Không có phần Admin hoặc nhân viên giao hàng.

---

## 5. Mock data mẫu

```json
{
  "restaurants": [
    { "id": 1, "name": "Cơm Tấm Sài Gòn", "rating": 4.5 },
    { "id": 2, "name": "Bún Bò Huế 24H", "rating": 4.7 }
  ]
}
```
