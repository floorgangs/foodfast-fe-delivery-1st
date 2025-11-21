// Tài khoản demo đã được duyệt sẵn
export const demoAccounts = [
  {
    id: "partner-bunbo",
    fullName: "Nguyễn Văn A",
    email: "bunbo@gmail.com",
    phone: "0901234567",
    password: "123456",
    createdAt: "2024-01-15T08:00:00.000Z",
  },
];

// Nhà hàng tương ứng - PHẢI KHỚP với customer-web mockData.js (id: "2")
export const demoRestaurants = [
  {
    id: "2", // ID khớp với customer-web
    ownerId: "partner-bunbo",
    ownerEmail: "bunbo@gmail.com",
    ownerName: "Nguyễn Văn A",
    name: "Bún Bò Huế 24H", // Tên khớp với customer-web
    phone: "0901234567",
    email: "bunbo@gmail.com",
    location: "456 Lê Lợi, Q.1, TP.HCM", // Address khớp
    cuisine: "Ẩm thực Việt",
    taxCode: "0123456789",
    taxRate: "4.5",
    approved: true,
    description: "Bún bò Huế, bún riêu, bún thịt nướng",
    rating: 4.7,
    deliveryTime: "10-15 phút",
    priceRange: "35.000đ - 55.000đ",
    avgPrice: 45000,
    freeShipping: true,
    createdAt: "2024-01-15T08:00:00.000Z",
  },
];

// Hàm khởi tạo dữ liệu demo vào localStorage
export const initDemoData = () => {
  const existingAccounts = window.localStorage.getItem(
    "foodfastPartnerAccounts"
  );
  const existingRestaurants = window.localStorage.getItem(
    "foodfastRegisteredRestaurants"
  );

  if (!existingAccounts) {
    window.localStorage.setItem(
      "foodfastPartnerAccounts",
      JSON.stringify(demoAccounts)
    );
  }

  if (!existingRestaurants) {
    window.localStorage.setItem(
      "foodfastRegisteredRestaurants",
      JSON.stringify(demoRestaurants)
    );
  }
};
