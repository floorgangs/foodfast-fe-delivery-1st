# Categories Sync - Web & Mobile App

## ✅ Đã đồng bộ categories

### Trước đây (Web)
- ❌ Tất cả
- ❌ Món Việt  
- ❌ Fastfood
- ❌ Món Á
- ❌ Đồ uống

### Bây giờ (Giống Mobile App)
- ✅ 🍽️ Tất cả
- ✅ 🍕 Pizza
- ✅ 🍔 Burger
- ✅ 🍜 Phở
- ✅ 🍱 Cơm
- ✅ 🍰 Bánh
- ✅ ☕ Đồ uống
- ✅ 🍗 Gà rán
- ✅ 🥗 Salad

## 🎨 UI Updates

### Layout
```jsx
<button>
  <span className="category-icon">🍕</span>
  <span className="category-label">Pizza</span>
</button>
```

### Styles
- **Mobile**: 70px min-width, 1.5rem icon, 0.75rem label
- **Desktop**: 80px min-width, 1.75rem icon, 0.8rem label
- **Active**: Orange background với shadow
- **Hover**: Lift animation + orange border

## 🔍 Filter Logic

### Normalized Matching
```javascript
const normalizedCategory = category.trim().toLowerCase();
const matchesCategory =
  category === "all" ||
  restaurant.cuisine?.some(item => 
    String(item).toLowerCase() === normalizedCategory
  ) ||
  restaurant.name.toLowerCase().includes(normalizedCategory);
```

## 📂 Files Changed
- `customer-web/src/pages/Home/Home.jsx` - Categories list + filter logic
- `customer-web/src/pages/Home/Home.css` - Icon + label layout styles

## ✅ Result
Web và Mobile app giờ có **categories giống hệt nhau**!
