// Dữ liệu demo cho nhà hàng Bún Bò Huế 24H (khớp với customer-web)
// Restaurant ID: "2"

// Menu items - khớp với customer-web mockData.js
export const demoMenuItems = [
  {
    id: "201",
    restaurantId: "2",
    name: "Bún Bò Huế Đặc Biệt",
    price: 45000,
    category: "Món chính",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300",
    description: "Bún bò Huế với đầy đủ topping",
    available: true,
    isPopular: true,
    preparationTime: 15, // phút
    createdAt: "2024-01-15T08:00:00.000Z",
  },
  {
    id: "202",
    restaurantId: "2",
    name: "Bún Riêu Cua",
    price: 40000,
    category: "Món chính",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300",
    description: "Bún riêu cua thơm ngon",
    available: true,
    isPopular: false,
    preparationTime: 12,
    createdAt: "2024-01-15T08:00:00.000Z",
  },
  {
    id: "203",
    restaurantId: "2",
    name: "Bún Thịt Nướng",
    price: 38000,
    category: "Món chính",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300",
    description: "Bún với thịt nướng",
    available: true,
    isPopular: true,
    preparationTime: 10,
    createdAt: "2024-01-15T08:00:00.000Z",
  },
  {
    id: "204",
    restaurantId: "2",
    name: "Bún Bò Huế Thường",
    price: 35000,
    category: "Món chính",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300",
    description: "Bún bò Huế size thường",
    available: true,
    isPopular: false,
    preparationTime: 12,
    createdAt: "2024-01-15T08:00:00.000Z",
  },
  {
    id: "205",
    restaurantId: "2",
    name: "Chả Giò (3 cuốn)",
    price: 25000,
    category: "Món phụ",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300",
    description: "Chả giò chiên giòn",
    available: true,
    isPopular: false,
    preparationTime: 8,
    createdAt: "2024-01-15T08:00:00.000Z",
  },
  {
    id: "206",
    restaurantId: "2",
    name: "Nước Ngọt Coca (Lon)",
    price: 15000,
    category: "Đồ uống",
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300",
    description: "Coca Cola lon 330ml",
    available: true,
    isPopular: false,
    preparationTime: 1,
    createdAt: "2024-01-15T08:00:00.000Z",
  },
  {
    id: "207",
    restaurantId: "2",
    name: "Trà Đá",
    price: 5000,
    category: "Đồ uống",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300",
    description: "Trà đá tươi mát",
    available: true,
    isPopular: true,
    preparationTime: 2,
    createdAt: "2024-01-15T08:00:00.000Z",
  },
];

// Promotions/Vouchers - mã khuyến mãi cho nhà hàng
export const demoPromotions = [
  {
    id: "promo-bunbo-001",
    restaurantId: "2",
    name: "Giảm 20% cho đơn từ 100k",
    code: "BUNBO20",
    type: "percentage", // percentage, fixed, freeship
    value: 20, // 20%
    minOrder: 100000,
    maxDiscount: 30000,
    startDate: "2024-11-01",
    endDate: "2024-12-31",
    usageLimit: 100,
    usedCount: 23,
    status: "active", // active, expired, upcoming
    description: "Giảm 20% tối đa 30k cho đơn hàng từ 100k",
    createdAt: "2024-11-01T00:00:00.000Z",
  },
  {
    id: "promo-bunbo-002",
    restaurantId: "2",
    name: "Miễn phí ship đơn 150k",
    code: "FREESHIP150",
    type: "freeship",
    value: 0,
    minOrder: 150000,
    maxDiscount: 25000,
    startDate: "2024-11-01",
    endDate: "2024-12-31",
    usageLimit: 50,
    usedCount: 18,
    status: "active",
    description: "Miễn phí vận chuyển cho đơn từ 150k",
    createdAt: "2024-11-01T00:00:00.000Z",
  },
  {
    id: "promo-bunbo-003",
    restaurantId: "2",
    name: "Giảm 40k cho khách mới",
    code: "NEWBUNBO40",
    type: "fixed",
    value: 40000,
    minOrder: 100000,
    maxDiscount: 40000,
    startDate: "2024-11-15",
    endDate: "2024-12-15",
    usageLimit: 200,
    usedCount: 45,
    status: "active",
    description: "Giảm 40k cho khách hàng đặt lần đầu",
    createdAt: "2024-11-15T00:00:00.000Z",
  },
  {
    id: "promo-bunbo-004",
    restaurantId: "2",
    name: "Flash Sale cuối tuần",
    code: "WEEKEND30",
    type: "percentage",
    value: 30,
    minOrder: 80000,
    maxDiscount: 50000,
    startDate: "2024-10-25",
    endDate: "2024-10-31",
    usageLimit: 50,
    usedCount: 50,
    status: "expired",
    description: "Giảm 30% cuối tuần (đã hết hạn)",
    createdAt: "2024-10-25T00:00:00.000Z",
  },
];

// Demo orders - đơn hàng mẫu
export const demoOrders = [
  {
    id: "order-001",
    restaurantId: "2",
    customerName: "Nguyễn Văn B",
    customerPhone: "0912345678",
    customerAddress: "234 Nguyễn Thị Minh Khai, Q.3, TP.HCM",
    items: [
      {
        id: "201",
        name: "Bún Bò Huế Đặc Biệt",
        price: 45000,
        quantity: 2,
        note: "Ít ớt",
      },
      {
        id: "206",
        name: "Nước Ngọt Coca (Lon)",
        price: 15000,
        quantity: 1,
        note: "",
      },
    ],
    subtotal: 105000,
    shippingFee: 20000,
    discount: 0,
    voucherCode: null,
    total: 125000,
    paymentMethod: "cash",
    status: "pending", // pending, confirmed, preparing, delivering, completed, cancelled
    orderTime: "2024-11-15T10:30:00.000Z",
    estimatedDelivery: "2024-11-15T11:00:00.000Z",
    note: "Giao trước 11h",
  },
  {
    id: "order-002",
    restaurantId: "2",
    customerName: "Trần Thị C",
    customerPhone: "0923456789",
    customerAddress: "567 Lê Văn Sỹ, Q.3, TP.HCM",
    items: [
      {
        id: "203",
        name: "Bún Thịt Nướng",
        price: 38000,
        quantity: 1,
        note: "",
      },
      {
        id: "205",
        name: "Chả Giò (3 cuốn)",
        price: 25000,
        quantity: 1,
        note: "",
      },
      {
        id: "207",
        name: "Trà Đá",
        price: 5000,
        quantity: 2,
        note: "",
      },
    ],
    subtotal: 73000,
    shippingFee: 15000,
    discount: 14600, // 20% của subtotal
    voucherCode: "BUNBO20",
    total: 73400,
    paymentMethod: "vnpay",
    status: "confirmed",
    orderTime: "2024-11-15T09:15:00.000Z",
    estimatedDelivery: "2024-11-15T09:45:00.000Z",
    note: "",
  },
  {
    id: "order-003",
    restaurantId: "2",
    customerName: "Lê Văn D",
    customerPhone: "0934567890",
    customerAddress: "789 Cách Mạng Tháng 8, Q.10, TP.HCM",
    items: [
      {
        id: "202",
        name: "Bún Riêu Cua",
        price: 40000,
        quantity: 3,
        note: "Thêm rau",
      },
    ],
    subtotal: 120000,
    shippingFee: 25000,
    discount: 24000, // 20% của subtotal
    voucherCode: "BUNBO20",
    total: 121000,
    paymentMethod: "momo",
    status: "preparing",
    orderTime: "2024-11-15T11:00:00.000Z",
    estimatedDelivery: "2024-11-15T11:30:00.000Z",
    note: "",
  },
  {
    id: "order-004",
    restaurantId: "2",
    customerName: "Phạm Thị E",
    customerPhone: "0945678901",
    customerAddress: "321 Hoàng Văn Thụ, Q.Tân Bình, TP.HCM",
    items: [
      {
        id: "201",
        name: "Bún Bò Huế Đặc Biệt",
        price: 45000,
        quantity: 1,
        note: "",
      },
      {
        id: "204",
        name: "Bún Bò Huế Thường",
        price: 35000,
        quantity: 1,
        note: "",
      },
    ],
    subtotal: 80000,
    shippingFee: 0, // Freeship
    discount: 0,
    voucherCode: null,
    total: 80000,
    paymentMethod: "cash",
    status: "completed",
    orderTime: "2024-11-14T18:30:00.000Z",
    estimatedDelivery: "2024-11-14T19:00:00.000Z",
    deliveredTime: "2024-11-14T18:55:00.000Z",
    note: "",
  },
];

// Hàm khởi tạo dữ liệu demo menu và promotions vào localStorage
export function initDemoRestaurantData() {
  const menuKey = "foodfastRestaurantMenu_2";
  const promotionsKey = "foodfastRestaurantPromotions_2";
  const ordersKey = "foodfastRestaurantOrders_2";

  // Kiểm tra xem đã có dữ liệu chưa
  const existingMenu = window.localStorage.getItem(menuKey);
  const existingPromotions = window.localStorage.getItem(promotionsKey);
  const existingOrders = window.localStorage.getItem(ordersKey);

  // Chỉ load dữ liệu demo nếu chưa có
  if (!existingMenu) {
    window.localStorage.setItem(menuKey, JSON.stringify(demoMenuItems));
  }

  if (!existingPromotions) {
    window.localStorage.setItem(promotionsKey, JSON.stringify(demoPromotions));
  }

  if (!existingOrders) {
    window.localStorage.setItem(ordersKey, JSON.stringify(demoOrders));
  }
}
