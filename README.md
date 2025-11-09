# FoodFast - Hệ thống giao hàng bằng Drone

## Mục tiêu

Hệ thống **đặt món ăn trực tuyến với giao hàng bằng Drone** gồm 3 ứng dụng frontend:

* **Customer Web App**: Ứng dụng web cho khách hàng đặt món
* **Restaurant Web App**: Ứng dụng web quản lý nhà hàng
* **Admin Web App**: Ứng dụng web quản trị hệ thống
* Dự án chỉ gồm **Frontend**, sử dụng **Mock data (JSON)** thay cho Backend.

---

## Cấu trúc dự án

```
foodfast-fe-delivery-1st/
├── customer-web/          # App khách hàng (React.js + Vite)
├── restaurant-web/        # App nhà hàng (React.js + Vite)
├── admin-web/             # App admin (React.js + Vite)
├── docs/                  # Tài liệu
│   ├── PRD_FE_FoodFast.md
│   ├── FE_Design.md
│   └── Test_Scenarios.md
└── images/                # Hình ảnh, use cases
```

## Ứng dụng

### 1. Customer Web App (Port 3000)
- Đăng nhập/Đăng xuất
- Trang chủ với danh sách nhà hàng
- Chi tiết nhà hàng & thực đơn
- Giỏ hàng
- Theo dõi đơn hàng với animation drone
- Trang cá nhân & lịch sử đơn hàng

### 2. Restaurant Web App (Port 3001)
- Dashboard thống kê nhà hàng
- Quản lý thực đơn (thêm/sửa/xóa món)
- Quản lý đơn hàng (xác nhận, chuẩn bị, giao)
- Thống kê doanh thu và món bán chạy

### 3. Admin Web App (Port 3002)
- Dashboard tổng quan hệ thống
- Quản lý người dùng
- Quản lý nhà hàng
- Giám sát đơn hàng
- Quản lý đội drone (trạng thái, pin, vị trí)

---

## Công nghệ

* React 18+
* Vite (Build tool)
* React Router DOM (Routing)
* Redux Toolkit (State management)
* React Redux
* CSS3 (Custom styling)

---

## Cách chạy dự án

### Customer Web App

```bash
cd customer-web
npm install
npm run dev
# Chạy tại http://localhost:3000
```

### Restaurant Web App

```bash
cd restaurant-web
npm install
npm run dev
# Chạy tại http://localhost:3001
```

### Admin Web App

```bash
cd admin-web
npm install
npm run dev
# Chạy tại http://localhost:3002
```

### Chạy tất cả cùng lúc

Mở 3 terminal và chạy từng ứng dụng như trên.

## Thành viên

| Họ tên           | MSSV       |
| ---------------- | ---------- |
| Phạm Thanh Phong | 3122411151 |
| Trần Hữu Nam     | 3122411131 |

## Tài liệu

| Tài liệu                                      | Mô tả                     |
| --------------------------------------------- | ------------------------- |
| \[PRD\_FE\_FoodFast.md](docs/PRD\_FE\_FoodFast.md) | Tài liệu yêu cầu sản phẩm |
| \[FE\_Design.md](docs/FE\_Design.md)             | Mô tả thiết kế giao diện  |
| \[Test\_Scenarios.md](docs/Test\_Scenarios.md)   | Kịch bản kiểm thử         |
| CongNghePhanMem.docx                             | Tài liệu báo cáo          |
## Tính năng đặc biệt

- 🚁 **Giao hàng bằng Drone**: Animation theo dõi drone giao hàng real-time
- 📊 **Dashboard đa cấp**: Customer, Restaurant, Admin có dashboard riêng
- 🔄 **State Management**: Redux Toolkit cho toàn bộ ứng dụng
- 📱 **Responsive Design**: Giao diện thân thiện trên mọi thiết bị
- ⏱️ **Real-time Updates**: Cập nhật trạng thái đơn hàng tự động
- 🎨 **Modern UI/UX**: Thiết kế hiện đại, dễ sử dụng

## Demo Account

Tất cả ứng dụng sử dụng mock authentication - nhập bất kỳ email/password để đăng nhập.

## Tiến độ

* 2025-10-05: Khởi tạo repo + tạo cấu trúc thư mục + viết README
* 2025-10-18: Tạo file báo cáo, nội dung gồm phân tích thiết kế, sơ đồ use case
* 2025-10-20: Push file báo cáo lên github
* 2025-11-09: Hoàn thành 3 frontend apps (Customer, Restaurant, Admin)

## Use case
### Tiếp nhận và xử lý đơn hàng
<img width="771" height="1183" alt="image" src="https://github.com/user-attachments/assets/df693b0a-91f2-4579-887e-6e0ad942e230" />

### Quản lý thực đơn và thông tin nhà hàng

![usecase1](images/ucql-Trang-1.png)
![usecase2](images/ucql-Trang-2.png)
![usecase3](images/ucql-Trang-3.png)

