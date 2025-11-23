# Customer Web - Responsive & Fullscreen Update

## 📱 Tổng quan

Cập nhật giao diện customer-web thành **fullscreen** và **responsive** giống Shopee:
- ✅ **Mobile**: Tối ưu cho màn hình nhỏ
- ✅ **Tablet**: Layout 2 cột
- ✅ **Desktop**: Layout 3-4 cột, toàn màn hình
- ✅ **Không còn background màu hồng/trắng hai bên**

---

## 🎯 Thay đổi chính

### 1. Layout Strategy

#### **Mobile First Approach**
```css
/* Base styles cho mobile */
.container {
  width: 100%;
  padding: 0 16px;
}

/* Tablet & Desktop */
@media (min-width: 768px) {
  .container {
    padding: 0 40px;
  }
}

/* Large Desktop: giới hạn chiều rộng để dễ đọc */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### 2. Navigation Header

#### **Mobile: Icon Only**
- Chỉ hiển thị icons (emoji)
- Text ẩn để tiết kiệm không gian
- Gap nhỏ hơn giữa các items

#### **Desktop: Icon + Text**
- Hiển thị đầy đủ icon và text
- Border và padding lớn hơn
- Underline animation khi hover

```jsx
// Layout.jsx
<Link to="/">
  🏠<span> Trang chủ</span>  {/* span ẩn trên mobile */}
</Link>
```

```css
/* Layout.css */
.nav a span {
  display: none;  /* Mobile: ẩn text */
}

@media (min-width: 768px) {
  .nav a span {
    display: inline;  /* Desktop: hiện text */
  }
}
```

---

## 📐 Breakpoints

| Breakpoint | Width | Layout | Columns |
|-----------|-------|--------|---------|
| **Mobile** | < 640px | Single column | 1 |
| **Small Tablet** | 640px - 767px | Two columns | 2 |
| **Tablet** | 768px - 1023px | Two columns | 2 |
| **Desktop** | 1024px - 1279px | Three columns | 3 |
| **Large Desktop** | 1280px - 1439px | Four columns | 4 |
| **XL Desktop** | ≥ 1440px | Four columns + max-width | 4 |

---

## 🎨 Responsive Components

### Home Page

#### **Hero Section**
```css
/* Mobile */
.hero {
  padding: 2rem 1rem;
  margin: 0 0 1.5rem 0;
}

.hero h1 {
  font-size: 1.75rem;
}

/* Desktop */
@media (min-width: 768px) {
  .hero {
    padding: 3rem 2rem;
  }
  
  .hero h1 {
    font-size: 2.5rem;
  }
}
```

#### **Search Bar**
```css
/* Mobile: Stack vertically */
.search-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Desktop: Horizontal layout */
@media (min-width: 768px) {
  .search-wrapper {
    flex-direction: row;
    align-items: center;
  }
}
```

#### **Restaurant Grid**
```css
/* Progressive grid system */
.restaurants-grid {
  display: grid;
  grid-template-columns: 1fr;  /* Mobile: 1 col */
  gap: 1rem;
}

@media (min-width: 640px) {
  .restaurants-grid {
    grid-template-columns: repeat(2, 1fr);  /* Small tablet: 2 cols */
  }
}

@media (min-width: 1024px) {
  .restaurants-grid {
    grid-template-columns: repeat(3, 1fr);  /* Desktop: 3 cols */
  }
}

@media (min-width: 1280px) {
  .restaurants-grid {
    grid-template-columns: repeat(4, 1fr);  /* Large: 4 cols */
  }
}
```

#### **Restaurant Card**
```css
/* Mobile: compact card */
.restaurant-image {
  height: 160px;
}

.restaurant-card {
  border-radius: 8px;
}

.restaurant-card:hover {
  transform: translateY(-4px);
}

/* Desktop: larger card với animation mạnh hơn */
@media (min-width: 1024px) {
  .restaurant-image {
    height: 220px;
  }
  
  .restaurant-card {
    border-radius: 12px;
  }
  
  .restaurant-card:hover {
    transform: translateY(-8px);
  }
}
```

---

## 📄 Files Updated

### Core Layout
- ✅ `src/index.css` - Global container styles
- ✅ `src/App.css` - Root element fullscreen
- ✅ `src/components/Layout/Layout.jsx` - Icon + text structure
- ✅ `src/components/Layout/Layout.css` - Header, nav, footer responsive

### Pages
- ✅ `src/pages/Home/Home.css` - Hero, search, grid responsive
- ✅ `src/pages/Cart/Cart.css` - Fullscreen container
- ✅ `src/pages/Checkout/Checkout.css` - Fullscreen container
- ✅ `src/pages/Orders/Orders.css` - Fullscreen container
- ✅ `src/pages/OrderTracking/OrderTracking.css` - Fullscreen container
- ✅ `src/pages/Profile/Profile.css` - Fullscreen container
- ✅ `src/pages/EditProfile/EditProfile.css` - Fullscreen container
- ✅ `src/pages/RestaurantDetail/RestaurantDetail.css` - Fullscreen container

---

## 🔍 So sánh Mobile vs Desktop

### Navigation

| Feature | Mobile | Desktop |
|---------|--------|---------|
| **Logo** | 1.1rem | 1.25rem |
| **Nav Items** | Icon only | Icon + Text |
| **Gap** | 0.75rem | 1.5rem |
| **Padding** | 0.4rem | 0.3rem 0 |
| **Logout Button** | Icon (🚪) | Text "Đăng xuất" |
| **Auth Links** | Icons | Text with border |

### Content

| Feature | Mobile | Desktop |
|---------|--------|---------|
| **Container Padding** | 16px | 40px |
| **Hero Padding** | 2rem 1rem | 3rem 2rem |
| **Hero Title** | 1.75rem | 2.5rem |
| **Search Layout** | Vertical stack | Horizontal row |
| **Restaurant Grid** | 1 column | 3-4 columns |
| **Card Border Radius** | 8px | 12px |
| **Card Image Height** | 160px | 220px |

---

## 🎯 Design Philosophy

### 1. **Fullscreen Trên Mọi Thiết Bị**
- Không có max-width cố định ban đầu
- Chỉ giới hạn max-width trên màn hình rất lớn (≥1440px) để dễ đọc
- Background extend toàn màn hình

### 2. **Progressive Enhancement**
```
Mobile (Base) → Tablet → Desktop → Large Desktop
    ↓             ↓         ↓            ↓
  Compact    2 columns  3 columns   4 columns
  Vertical   Horizontal  Spacious   Max Width
```

### 3. **Touch-Friendly Mobile**
- Padding lớn hơn cho touch targets (minimum 44x44px)
- Icon lớn và dễ nhấn
- Gap đủ để tránh nhấn nhầm

### 4. **Desktop Efficiency**
- Tận dụng không gian ngang
- Nhiều cột hơn
- Hover effects rõ ràng

---

## 🧪 Testing Checklist

### Mobile (< 640px)
- [ ] Header icons hiển thị đúng, text ẩn
- [ ] Search bar stack vertically
- [ ] Restaurant grid 1 column
- [ ] Cards compact và dễ scroll
- [ ] Footer padding nhỏ gọn

### Tablet (768px - 1023px)
- [ ] Header có text hiển thị
- [ ] Search bar horizontal
- [ ] Restaurant grid 2 columns
- [ ] Container padding 40px

### Desktop (≥ 1024px)
- [ ] Restaurant grid 3-4 columns
- [ ] Hover effects mượt mà
- [ ] Full layout với spacing thoải mái

### Large Desktop (≥ 1440px)
- [ ] Content centered với max-width 1400px
- [ ] Không có quá nhiều trống ở hai bên

---

## 🚀 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Mobile (Android 8+)

---

## 📱 Mobile-Specific Features

### Touch Gestures
- **Horizontal scroll** cho categories
- **-webkit-overflow-scrolling: touch** cho smooth scrolling
- **Touch target size** ≥ 44x44px

### Performance
- **Smaller images** loaded on mobile
- **Reduced animations** on lower-end devices
- **Lazy loading** cho restaurant cards

---

## 💡 Tips & Best Practices

### 1. **Padding Convention**
```css
/* Mobile: 16px */
padding: 0 16px;

/* Desktop: 40px */
@media (min-width: 768px) {
  padding: 0 40px;
}
```

### 2. **Font Size Scale**
```css
/* Mobile: 0.9x */
font-size: 0.95rem;

/* Desktop: 1x (base) */
@media (min-width: 768px) {
  font-size: 1.1rem;
}
```

### 3. **Grid Pattern**
```css
/* Always start with mobile 1-column */
grid-template-columns: 1fr;

/* Then add breakpoints for larger screens */
@media (min-width: 640px) {
  grid-template-columns: repeat(2, 1fr);
}
```

---

## 🎨 Color & Shadow Adjustments

### Mobile
- Lighter shadows: `0 2px 8px rgba(0, 0, 0, 0.06)`
- Smaller border radius: `8px`

### Desktop
- Deeper shadows: `0 4px 12px rgba(0, 0, 0, 0.08)`
- Larger border radius: `12px`

---

## ✅ Kết luận

Giao diện customer-web giờ đây:
- ✅ **100% fullscreen** - không còn background màu thừa
- ✅ **Responsive hoàn toàn** - từ mobile đến large desktop
- ✅ **UX tối ưu** - giống Shopee mobile vs web
- ✅ **Performance cao** - mobile-first, progressive enhancement
- ✅ **Consistency** - giữ nguyên business logic từ mobile app

**Mobile**: Compact, touch-friendly, icon-based  
**Desktop**: Spacious, hover-rich, text-based  
**Both**: Fullscreen, no wasted space! 🎉
