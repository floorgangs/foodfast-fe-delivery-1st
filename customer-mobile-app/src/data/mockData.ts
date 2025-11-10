export const mockRestaurants = [
  {
    id: '1',
    name: 'Phở Hà Nội',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    rating: 4.5,
    deliveryTime: '15-25 phút',
    category: 'Việt Nam',
    description: 'Phở truyền thống Hà Nội'
  },
  {
    id: '2',
    name: 'Bún Chả Hương Liên',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
    rating: 4.8,
    deliveryTime: '20-30 phút',
    category: 'Việt Nam',
    description: 'Bún chả đặc sản Hà Nội'
  },
  {
    id: '3',
    name: 'Cơm Tấm Sài Gòn',
    image: 'https://images.unsplash.com/photo-1603088010296-ec7e99ef1a7a?w=400',
    rating: 4.6,
    deliveryTime: '15-20 phút',
    category: 'Việt Nam',
    description: 'Cơm tấm sườn bì chả'
  },
  {
    id: '4',
    name: 'Lẩu Thái Lan',
    image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400',
    rating: 4.7,
    deliveryTime: '25-35 phút',
    category: 'Thái Lan',
    description: 'Lẩu Thái chua cay'
  },
  {
    id: '5',
    name: 'Sushi Tokyo',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    rating: 4.9,
    deliveryTime: '20-30 phút',
    category: 'Nhật Bản',
    description: 'Sushi Nhật Bản cao cấp'
  },
  {
    id: '6',
    name: 'Pizza Italia',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    rating: 4.4,
    deliveryTime: '25-35 phút',
    category: 'Ý',
    description: 'Pizza Ý truyền thống'
  },
  {
    id: '7',
    name: 'Gà Rán KFC',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
    rating: 4.3,
    deliveryTime: '15-25 phút',
    category: 'Fastfood',
    description: 'Gà rán giòn tan'
  },
  {
    id: '8',
    name: 'Burger King',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    rating: 4.2,
    deliveryTime: '20-30 phút',
    category: 'Fastfood',
    description: 'Burger bò nướng flame'
  },
];

export const mockProducts: Record<string, any[]> = {
  '1': [
    { id: '1-1', name: 'Phở Bò Tái', price: 45000, description: 'Phở bò với thịt tái', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300' },
    { id: '1-2', name: 'Phở Gà', price: 40000, description: 'Phở gà thơm ngon', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300' },
    { id: '1-3', name: 'Phở Đặc Biệt', price: 55000, description: 'Phở với đủ loại topping', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300' },
  ],
  '2': [
    { id: '2-1', name: 'Bún Chả Hà Nội', price: 50000, description: 'Bún chả truyền thống', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300' },
    { id: '2-2', name: 'Nem Cua Bể', price: 35000, description: 'Nem cua bể giòn rụm', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300' },
  ],
  '3': [
    { id: '3-1', name: 'Cơm Tấm Sườn', price: 45000, description: 'Cơm tấm sườn nướng', image: 'https://images.unsplash.com/photo-1603088010296-ec7e99ef1a7a?w=300' },
    { id: '3-2', name: 'Cơm Tấm Bì Chả', price: 42000, description: 'Cơm tấm bì chả', image: 'https://images.unsplash.com/photo-1603088010296-ec7e99ef1a7a?w=300' },
    { id: '3-3', name: 'Cơm Tấm Đặc Biệt', price: 55000, description: 'Cơm tấm đủ loại', image: 'https://images.unsplash.com/photo-1603088010296-ec7e99ef1a7a?w=300' },
  ],
  '4': [
    { id: '4-1', name: 'Lẩu Thái Hải Sản', price: 250000, description: 'Lẩu Thái hải sản (2-3 người)', image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=300' },
    { id: '4-2', name: 'Lẩu Thái Gà', price: 200000, description: 'Lẩu Thái gà (2-3 người)', image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=300' },
  ],
  '5': [
    { id: '5-1', name: 'Sushi Set A', price: 180000, description: '12 miếng sushi cao cấp', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300' },
    { id: '5-2', name: 'Sashimi Set', price: 220000, description: 'Sashimi cá hồi, cá ngừ', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300' },
    { id: '5-3', name: 'Combo Sushi & Sashimi', price: 350000, description: 'Combo sushi và sashimi', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300' },
  ],
  '6': [
    { id: '6-1', name: 'Pizza Margherita', price: 120000, description: 'Pizza phô mai cà chua', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
    { id: '6-2', name: 'Pizza Hải Sản', price: 150000, description: 'Pizza với hải sản tươi', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
    { id: '6-3', name: 'Pizza 4 Seasons', price: 140000, description: 'Pizza 4 mùa đặc biệt', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300' },
  ],
  '7': [
    { id: '7-1', name: 'Gà Rán 1 Miếng', price: 35000, description: 'Gà rán giòn 1 miếng', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300' },
    { id: '7-2', name: 'Gà Rán 3 Miếng', price: 95000, description: 'Gà rán giòn 3 miếng', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300' },
    { id: '7-3', name: 'Combo Gà + Khoai', price: 75000, description: 'Gà rán + Khoai tây chiên', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300' },
  ],
  '8': [
    { id: '8-1', name: 'Whopper Burger', price: 65000, description: 'Burger bò nướng flame', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
    { id: '8-2', name: 'Chicken Burger', price: 55000, description: 'Burger gà giòn', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
    { id: '8-3', name: 'Double Whopper', price: 95000, description: 'Burger bò 2 tầng', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300' },
  ],
};

export const categories = [
  'Tất cả',
  'Việt Nam',
  'Thái Lan',
  'Nhật Bản',
  'Ý',
  'Fastfood',
];
