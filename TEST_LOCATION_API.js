// Test Location API
// Sử dụng với Thunder Client, Postman, hoặc curl

// 1. Lấy droneId từ database (drone vừa tạo)
// droneId: 692c24e083b1ad49c727c5ab

// 2. Cập nhật vị trí drone (gọi API này mỗi 5-10 giây khi drone đang bay)
/*
PATCH http://localhost:5000/api/delivery/drone/692c24e083b1ad49c727c5ab/location

Body (JSON):
{
  "latitude": 10.762622,
  "longitude": 106.660172,
  "altitude": 50
}
*/

// 3. Di chuyển drone (mô phỏng bay từ nhà hàng đến điểm giao)
// Gọi liên tục với tọa độ thay đổi:

// Vị trí 1: Xuất phát từ nhà hàng
// { "latitude": 10.762622, "longitude": 106.660172, "altitude": 50 }

// Vị trí 2: Đang bay
// { "latitude": 10.765000, "longitude": 106.665000, "altitude": 100 }

// Vị trí 3: Gần đến
// { "latitude": 10.767000, "longitude": 106.670000, "altitude": 80 }

// Vị trí 4: Đích đến
// { "latitude": 10.770000, "longitude": 106.675000, "altitude": 20 }

// 4. Xem lịch sử vị trí
/*
GET http://localhost:5000/api/delivery/drone/692c24e083b1ad49c727c5ab/location-history?limit=100
*/
