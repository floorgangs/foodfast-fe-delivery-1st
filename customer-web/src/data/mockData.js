// Mock data for restaurants
export const restaurants = [
  {
    id: "1",
    name: "Cơm Tấm Sài Gòn",
    cuisine: "Cơm tấm, sườn nướng, bì chả",
    category: "vietnamese",
    rating: 4.5,
    deliveryTime: "15-20 phút",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500",
    isOpen: true,
    priceRange: "30.000đ - 50.000đ",
    avgPrice: 40000,
    freeShipping: false,
    dishes: ["cơm tấm", "sườn nướng", "bì chả", "gà nướng"],
  },
  {
    id: "2",
    name: "Bún Bò Huế 24H",
    cuisine: "Bún bò Huế, bún riêu, bún thịt nướng",
    category: "vietnamese",
    rating: 4.7,
    deliveryTime: "10-15 phút",
    address: "456 Lê Lợi, Q.1, TP.HCM",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500",
    isOpen: true,
    priceRange: "35.000đ - 55.000đ",
    avgPrice: 45000,
    freeShipping: true,
    dishes: ["bún bò", "bún riêu", "bún thịt nướng", "bún huế"],
  },
  {
    id: "3",
    name: "KFC Vietnam",
    cuisine: "Gà rán, burger, khoai tây chiên",
    category: "fastfood",
    rating: 4.3,
    deliveryTime: "20-25 phút",
    address: "789 Võ Văn Tần, Q.3, TP.HCM",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500",
    isOpen: true,
    priceRange: "50.000đ - 150.000đ",
    avgPrice: 95000,
    freeShipping: false,
    dishes: ["gà rán", "burger", "khoai tây chiên", "gà giòn", "combo gà"],
  },
  {
    id: "4",
    name: "Phở Hà Nội",
    cuisine: "Phở bò, phở gà, bánh cuốn",
    category: "vietnamese",
    rating: 4.6,
    deliveryTime: "15-20 phút",
    address: "234 Pasteur, Q.1, TP.HCM",
    image: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=500",
    isOpen: true,
    priceRange: "40.000đ - 60.000đ",
    avgPrice: 48000,
    freeShipping: true,
    dishes: ["phở bò", "phở gà", "bánh cuốn", "phở tái", "phở chín"],
  },
  {
    id: "5",
    name: "Trà Sữa Thai Tea",
    cuisine: "Trà sữa, trà trái cây, smoothie",
    category: "drink",
    rating: 4.4,
    deliveryTime: "10-15 phút",
    address: "567 Hai Bà Trưng, Q.1, TP.HCM",
    image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=500",
    isOpen: true,
    priceRange: "25.000đ - 45.000đ",
    avgPrice: 32000,
    freeShipping: false,
    dishes: ["trà sữa", "trà xanh", "smoothie", "trà trái cây", "trà vải"],
  },
  {
    id: "6",
    name: "Sushi Tokyo",
    cuisine: "Sushi, sashimi, ramen",
    category: "asian",
    rating: 4.8,
    deliveryTime: "25-30 phút",
    address: "890 Nguyễn Đình Chiểu, Q.3, TP.HCM",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500",
    isOpen: true,
    priceRange: "80.000đ - 200.000đ",
    avgPrice: 135000,
    freeShipping: true,
    dishes: ["sushi", "sashimi", "ramen", "cá hồi", "cá ngừ"],
  },
  {
    id: "7",
    name: "Pizza Hut",
    cuisine: "Pizza, pasta, salad",
    category: "fastfood",
    rating: 4.2,
    deliveryTime: "30-35 phút",
    address: "321 Trần Hưng Đạo, Q.5, TP.HCM",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
    isOpen: false,
    priceRange: "100.000đ - 300.000đ",
    avgPrice: 185000,
    freeShipping: true,
    dishes: ["pizza", "pasta", "salad", "pizza hải sản", "pizza gà"],
  },
  {
    id: "8",
    name: "Bánh Mì Hòa Mã",
    cuisine: "Bánh mì thịt, trứng, chả cá",
    category: "vietnamese",
    rating: 4.5,
    deliveryTime: "5-10 phút",
    address: "654 Lý Thường Kiệt, Q.10, TP.HCM",
    image: "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=500",
    isOpen: true,
    priceRange: "15.000đ - 30.000đ",
    avgPrice: 20000,
    freeShipping: false,
    dishes: ["bánh mì", "bánh mì thịt", "bánh mì trứng", "chả cá"],
  },
];

// Mock data for products by restaurant
export const products = {
  1: [
    // Cơm Tấm Sài Gòn
    {
      id: "101",
      name: "Cơm Tấm Sườn Nướng",
      price: 35000,
      image:
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300",
      description: "Cơm tấm với sườn nướng thơm ngon",
    },
    {
      id: "102",
      name: "Cơm Tấm Sườn Bì Chả",
      price: 40000,
      image:
        "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300",
      description: "Combo đầy đủ sườn, bì, chả",
    },
    {
      id: "103",
      name: "Cơm Tấm Đặc Biệt",
      price: 45000,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300",
      description: "Cơm tấm với tất cả topping",
    },
    {
      id: "104",
      name: "Cơm Tấm Gà Nướng",
      price: 38000,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300",
      description: "Cơm tấm với gà nướng sả",
    },
  ],
  2: [
    // Bún Bò Huế
    {
      id: "201",
      name: "Bún Bò Huế Đặc Biệt",
      price: 45000,
      image:
        "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300",
      description: "Bún bò Huế với đầy đủ topping",
    },
    {
      id: "202",
      name: "Bún Riêu Cua",
      price: 40000,
      image:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300",
      description: "Bún riêu cua thơm ngon",
    },
    {
      id: "203",
      name: "Bún Thịt Nướng",
      price: 38000,
      image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300",
      description: "Bún với thịt nướng",
    },
  ],
  3: [
    // KFC
    {
      id: "301",
      name: "Combo Gà Rán (3 miếng)",
      price: 89000,
      image:
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300",
      description: "3 miếng gà + khoai tây + pepsi",
    },
    {
      id: "302",
      name: "Burger Gà Cay",
      price: 45000,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
      description: "Burger gà giòn cay",
    },
    {
      id: "303",
      name: "Khoai Tây Chiên (Lớn)",
      price: 35000,
      image:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300",
      description: "Khoai tây chiên giòn size lớn",
    },
    {
      id: "304",
      name: "Combo Family (6 miếng)",
      price: 159000,
      image:
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300",
      description: "6 miếng gà + 2 khoai + 2 pepsi",
    },
  ],
  4: [
    // Phở Hà Nội
    {
      id: "401",
      name: "Phở Bò Tái",
      price: 45000,
      image:
        "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=300",
      description: "Phở bò với thịt tái",
    },
    {
      id: "402",
      name: "Phở Bò Chín",
      price: 45000,
      image:
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300",
      description: "Phở bò với thịt chín",
    },
    {
      id: "403",
      name: "Phở Gà",
      price: 42000,
      image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300",
      description: "Phở gà thơm ngon",
    },
    {
      id: "404",
      name: "Phở Đặc Biệt",
      price: 55000,
      image:
        "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=300",
      description: "Phở với đầy đủ topping",
    },
  ],
  5: [
    // Trà Sữa
    {
      id: "501",
      name: "Trà Sữa Truyền Thống",
      price: 30000,
      image:
        "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=300",
      description: "Trà sữa truyền thống",
    },
    {
      id: "502",
      name: "Trà Sữa Thái Xanh",
      price: 32000,
      image:
        "https://images.unsplash.com/photo-1578899952107-9d9d8c1a5e55?w=300",
      description: "Trà sữa thái vị trà xanh",
    },
    {
      id: "503",
      name: "Trà Trái Vải",
      price: 28000,
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300",
      description: "Trà trái vải tươi mát",
    },
    {
      id: "504",
      name: "Smoothie Xoài",
      price: 35000,
      image:
        "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300",
      description: "Smoothie xoài ngọt",
    },
  ],
  6: [
    // Sushi
    {
      id: "601",
      name: "Sushi Set A (8 miếng)",
      price: 120000,
      image:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300",
      description: "Set sushi mix 8 miếng",
    },
    {
      id: "602",
      name: "Sashimi Mix",
      price: 150000,
      image:
        "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=300",
      description: "Sashimi các loại cá tươi",
    },
    {
      id: "603",
      name: "Ramen Nhật Bản",
      price: 85000,
      image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300",
      description: "Ramen truyền thống Nhật",
    },
  ],
  8: [
    // Bánh Mì
    {
      id: "801",
      name: "Bánh Mì Thịt",
      price: 20000,
      image:
        "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba0?w=300",
      description: "Bánh mì thịt nguội",
    },
    {
      id: "802",
      name: "Bánh Mì Trứng",
      price: 18000,
      image:
        "https://images.unsplash.com/photo-1599759066293-1b0a0e212d0a?w=300",
      description: "Bánh mì trứng ốp la",
    },
    {
      id: "803",
      name: "Bánh Mì Chả Cá",
      price: 22000,
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300",
      description: "Bánh mì chả cá Nha Trang",
    },
  ],
};

// Mock orders
export const mockOrders = [];
