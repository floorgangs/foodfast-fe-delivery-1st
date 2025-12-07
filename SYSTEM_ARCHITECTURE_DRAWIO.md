# 🏗️ FoodFast Full-Stack Component Architecture

## 📊 Complete System Overview

### Total Component Count

- **Customer Web:** 25 pages/components
- **Restaurant Web:** 19 pages/components
- **Admin Web:** 16 pages/components
- **Backend:** 16+ route modules
- **TOTAL:** 76 components + routes

---

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FoodFast Complete System                      │
│                        (76 Components)                           │
└─────────────────────────────────────────────────────────────────┘
              │                    │                    │
              │                    │                    │
    ┌─────────▼──────────┐ ┌──────▼────────────┐ ┌─────▼──────────┐
    │  CUSTOMER-WEB      │ │ RESTAURANT-WEB    │ │   ADMIN-WEB     │
    │   (25 pages)       │ │   (19 pages)      │ │   (16 pages)    │
    │                    │ │                   │ │                 │
    ├────────────────────┤ ├───────────────────┤ ├─────────────────┤
    │ • Home             │ │ • Dashboard       │ │ • Dashboard     │
    │ • RestaurantDetail │ │ • OrderManagement │ │ • UserMgmt      │
    │ • Cart             │ │ • MenuManagement  │ │ • RestaurantMgmt│
    │ • Checkout         │ │ • Analytics       │ │ • OrderMonitor  │
    │ • OrderTracking    │ │ • Promotions      │ │ • DroneManager  │
    │ • MyOrders         │ │ • Staff           │ │ • Analytics     │
    │ • Profile          │ │ • Settings        │ │ • Transactions  │
    │ • Notifications    │ │ • Login           │ │ • Settings      │
    │ • Payments         │ │ • RestaurantHub   │ │ • Login         │
    │ • Vouchers         │ │ • PartnerHub      │ │                 │
    │ • Login/Register   │ │ • Reviews         │ │                 │
    └────────────────────┘ └───────────────────┘ └─────────────────┘
              │                    │                    │
              └────────────────────┬────────────────────┘
                                   │
                    ┌──────────────▼─────────────────┐
                    │     BACKEND API (Express)      │
                    │     (16 Route Modules)         │
                    │                                │
                    ├────────────────────────────────┤
                    │ • Auth Routes                  │
                    │ • Restaurant Routes            │
                    │ • Product Routes               │
                    │ • Order Routes                 │
                    │ • Payment Routes               │
                    │ • Voucher Routes               │
                    │ • Review Routes                │
                    │ • Drone Routes                 │
                    │ • Dashboard Routes             │
                    │ • Notification Routes          │
                    │ • Cart Routes                  │
                    │ • Delivery Routes              │
                    │ • Transaction Routes           │
                    │ • Staff Routes                 │
                    │ • Admin Settings Routes        │
                    │ • PayPal Routes                │
                    │ • Saved Orders Routes          │
                    └────────────────────────────────┘
                                   │
                    ┌──────────────▼─────────────────┐
                    │   MongoDB Database             │
                    │  (Collections & Models)        │
                    │                                │
                    ├────────────────────────────────┤
                    │ • User Collection              │
                    │ • Restaurant Collection        │
                    │ • Product Collection           │
                    │ • Order Collection             │
                    │ • Payment Collection           │
                    │ • Voucher Collection           │
                    │ • Review Collection            │
                    │ • Drone Collection             │
                    │ • Cart Collection              │
                    │ • Notification Collection      │
                    │ • Transaction Collection       │
                    │ • Staff Collection             │
                    └────────────────────────────────┘
```

---

## 📋 Detailed Component Breakdown

### CUSTOMER-WEB (25 Pages)

```
Customer-Web
├── Auth Pages (2)
│   ├── Login
│   └── Register
├── Browsing Pages (3)
│   ├── Home (RestaurantCard ×5)
│   ├── RestaurantDetail (MenuItemCard ×10)
│   └── Vouchers
├── Cart & Checkout (3)
│   ├── Cart (CartItem ×5)
│   ├── Checkout (CheckoutForm)
│   └── PaymentGateway
├── Payment Pages (3)
│   ├── PayPalPayment
│   ├── PaymentReturn
│   └── PayPalReturn
├── Order Pages (4)
│   ├── OrderTracking (OrderStatus, DroneMap)
│   ├── Orders (OrderCard ×10)
│   ├── Review (ReviewForm)
│   └── ActiveOrderBanner
├── User Pages (3)
│   ├── Profile (UserInfo, AddressCard ×3)
│   ├── EditProfile (EditForm)
│   └── PaymentMethods
└── System Pages (4)
    ├── Notifications (NotificationCard ×10)
    ├── PrivateRoute
    ├── ActiveOrderBanner
    └── DroneMap

Component Reuse:
├── RestaurantCard: 3 uses (Home, Search, Favorites)
├── MenuItemCard: 15 uses (Restaurant detail)
├── CartItem: 5-10 uses (Cart, Summary)
├── OrderCard: 10+ uses (Orders list)
├── Button: 50+ uses
├── Input: 40+ uses
├── Card: 30+ uses
└── Modal: 15+ uses
```

### RESTAURANT-WEB (19 Pages)

```
Restaurant-Web
├── Auth (2)
│   ├── Login
│   └── Login_new (variant)
├── Onboarding (1)
│   └── Onboarding
├── Management Pages (6)
│   ├── MenuManagement (MenuItem CRUD)
│   ├── OrderManagement (Order Queue)
│   ├── Staff (Employee management)
│   ├── Promotions (Voucher management)
│   ├── Reviews (Customer reviews)
│   └── AccountSettings
├── Hub Pages (2)
│   ├── RestaurantHub (Main dashboard)
│   └── PartnerHub (Partner portal)
├── Selection (1)
│   └── RestaurantSelection (Multi-restaurant)
├── Analytics Pages (3)
│   ├── Dashboard (Stats & metrics)
│   ├── Analytics (Detailed charts)
│   └── Statistics (Reports)
├── Advanced (3)
│   ├── Drones (Fleet management)
│   ├── Layout (Main wrapper)
│   └── ...other features
└── System (1)
    └── PrivateRoute equivalent

Component Reuse:
├── OrderCard: 10+ uses (Order queue)
├── MenuItem: 8+ uses (Menu list)
├── Chart: 5+ uses (Analytics)
├── Button: 40+ uses
├── Modal: 10+ uses
└── Table: 8+ uses (Data display)
```

### ADMIN-WEB (16 Pages)

```
Admin-Web
├── Auth (1)
│   └── Login
├── Dashboard & Analytics (3)
│   ├── Dashboard (Overview)
│   ├── Analytics (Charts)
│   └── Statistics
├── Management Pages (7)
│   ├── UserManagement (UserTable, UserForm)
│   ├── RestaurantManagement (RestaurantTable, RestaurantForm)
│   ├── RestaurantOwners (OwnerTable, OwnerForm)
│   ├── OrderManagement (OrderTable, OrderDetail)
│   ├── OrderMonitoring (Live tracking)
│   ├── DroneManagement (DroneTable, DroneStatus)
│   ├── StaffManagement (StaffTable, StaffForm)
│   └── TransactionManagement (TransactionTable)
├── Settings (1)
│   └── AccountSettings
├── Layout (1)
│   └── Layout (Main wrapper)
└── System (3)
    ├── PrivateRoute
    └── Auth helpers

Component Reuse:
├── DataTable: 6+ uses (User, Restaurant, Order, etc)
├── Form: 5+ uses (Create/Edit)
├── Card: 8+ uses (Stats cards)
├── Chart: 4+ uses (Analytics)
├── Button: 35+ uses
├── Modal: 8+ uses
└── Badge: 10+ uses (Status indicators)
```

### BACKEND API Routes (16 Modules)

```
Backend Routes
├── Authentication (authRoutes)
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   └── POST /refresh-token
├── Restaurant (restaurantRoutes)
│   ├── GET /all
│   ├── GET /:id
│   ├── POST / (create)
│   ├── PUT /:id (update)
│   └── DELETE /:id
├── Products (productRoutes)
│   ├── GET /restaurant/:restaurantId
│   ├── POST / (create)
│   ├── PUT /:id (update)
│   └── DELETE /:id
├── Orders (orderRoutes)
│   ├── POST / (create order)
│   ├── GET /user/:userId
│   ├── GET /:orderId
│   ├── PUT /:orderId/status
│   └── DELETE /:orderId
├── Payments (paymentRoutes)
│   ├── POST /create
│   ├── POST /verify
│   ├── GET /:paymentId
│   └── PUT /:paymentId/status
├── PayPal (paypalRoutes)
│   ├── POST /create-order
│   ├── POST /capture-order
│   └── GET /return
├── Vouchers (voucherRoutes)
│   ├── GET /all
│   ├── POST /validate
│   ├── POST / (create)
│   └── PUT /:id
├── Reviews (reviewRoutes)
│   ├── POST / (create)
│   ├── GET /:restaurantId
│   └── DELETE /:reviewId
├── Drones (droneRoutes)
│   ├── GET /all
│   ├── GET /:droneId/location
│   ├── PUT /:droneId/status
│   └── POST /dispatch
├── Notifications (notificationRoutes)
│   ├── GET /user/:userId
│   ├── POST / (create)
│   └── PUT /:notificationId/read
├── Cart (cartRoutes)
│   ├── GET /user/:userId
│   ├── POST /add-item
│   ├── PUT /update-item
│   └── DELETE /remove-item
├── Deliveries (deliveryRoutes)
│   ├── GET /:orderId
│   ├── PUT /:orderId/track
│   └── POST /complete
├── Dashboard (dashboardRoutes)
│   ├── GET /stats
│   ├── GET /revenue
│   └── GET /top-products
├── Transactions (transactionRoutes)
│   ├── GET /all
│   ├── GET /:id
│   └── GET /user/:userId
├── Staff (staffRoutes)
│   ├── GET /restaurant/:restaurantId
│   ├── POST / (create)
│   └── DELETE /:staffId
└── Admin Settings (adminSettingsRoutes)
    ├── GET /settings
    ├── PUT /settings
    └── GET /logs
```

---

## 🎨 DRAW.IO XML CODE - Copy & Paste to Draw.io

```xml
<mxfile host="app.diagrams.net" modified="2025-12-06T12:00:00.000Z" agent="5.0" etag="ABC123">
  <diagram id="foodfast-system" name="FoodFast System Architecture">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="1600" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title -->
        <mxCell id="title" value="FoodFast Complete System Architecture (76 Components)" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;fontSize=24;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="200" y="20" width="800" height="40" as="geometry" />
        </mxCell>

        <!-- FRONTEND LAYER -->
        <mxCell id="frontend-title" value="FRONTEND LAYER" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=#E8F4F8;fontSize=16;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="50" y="100" width="1100" height="30" as="geometry" />
        </mxCell>

        <!-- CUSTOMER-WEB Box -->
        <mxCell id="customer" value="CUSTOMER-WEB (25 Pages)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#B3E5FC;strokeColor=#01579B;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="50" y="150" width="300" height="200" as="geometry" />
        </mxCell>

        <mxCell id="customer-content" value="Auth: 2
├ Login, Register
Browsing: 3
├ Home, RestaurantDetail, Vouchers
Cart: 3
├ Cart, Checkout, Payment
Orders: 4
├ OrderTracking, Orders, Review, Banner
Payments: 3
├ PayPal, Return, Status
Users: 3
├ Profile, Edit, PaymentMethods
System: 4
├ Notifications, Private Route" style="text;html=1;align=left;verticalAlign=top;fontSize=11;fontFamily=monospace;" vertex="1" parent="1">
          <mxGeometry x="60" y="160" width="280" height="180" as="geometry" />
        </mxCell>

        <!-- RESTAURANT-WEB Box -->
        <mxCell id="restaurant" value="RESTAURANT-WEB (19 Pages)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#C8E6C9;strokeColor=#1B5E20;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="400" y="150" width="300" height="200" as="geometry" />
        </mxCell>

        <mxCell id="restaurant-content" value="Auth: 2
├ Login, Login_new
Onboarding: 1
├ Onboarding
Management: 6
├ Menu, Orders, Staff, Promotions
├ Reviews, Settings
Hub: 2
├ RestaurantHub, PartnerHub
Selection: 1
├ RestaurantSelection
Analytics: 3
├ Dashboard, Analytics, Statistics
Other: 4
├ Drones, Layout" style="text;html=1;align=left;verticalAlign=top;fontSize=11;fontFamily=monospace;" vertex="1" parent="1">
          <mxGeometry x="410" y="160" width="280" height="180" as="geometry" />
        </mxCell>

        <!-- ADMIN-WEB Box -->
        <mxCell id="admin" value="ADMIN-WEB (16 Pages)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFE0B2;strokeColor=#E65100;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="750" y="150" width="300" height="200" as="geometry" />
        </mxCell>

        <mxCell id="admin-content" value="Auth: 1
├ Login
Dashboard: 3
├ Dashboard, Analytics, Statistics
Management: 7
├ User, Restaurant, RestaurantOwner
├ Order, OrderMonitor, Drone
├ Staff, Transactions
Settings: 1
├ AccountSettings
System: 4
├ Layout, PrivateRoute, Auth" style="text;html=1;align=left;verticalAlign=top;fontSize=11;fontFamily=monospace;" vertex="1" parent="1">
          <mxGeometry x="760" y="160" width="280" height="180" as="geometry" />
        </mxCell>

        <!-- Arrows from FE to Backend -->
        <mxCell id="arrow-cust-back" edge="1" parent="1" source="customer" target="backend">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="arrow-rest-back" edge="1" parent="1" source="restaurant" target="backend">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="arrow-admin-back" edge="1" parent="1" source="admin" target="backend">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- BACKEND LAYER -->
        <mxCell id="backend-title" value="BACKEND LAYER" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=#F3E5F5;fontSize=16;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="50" y="400" width="1100" height="30" as="geometry" />
        </mxCell>

        <!-- BACKEND API Box -->
        <mxCell id="backend" value="BACKEND API (Express.js) - 16 Route Modules" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#E1BEE7;strokeColor=#4A148C;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="50" y="450" width="1100" height="300" as="geometry" />
        </mxCell>

        <mxCell id="backend-content" value="┌─ Auth Routes ────────────┬─ Restaurant Routes ────┬─ Product Routes ─────────┬─ Order Routes ──────────┐
│ • POST /register         │ • GET /all             │ • GET /restaurant/:id  │ • POST / (create)      │
│ • POST /login            │ • GET /:id             │ • POST / (create)      │ • GET /user/:userId    │
│ • POST /logout           │ • POST / (create)      │ • PUT /:id (update)    │ • PUT /:id/status      │
│ • POST /refresh-token    │ • PUT /:id (update)    │ • DELETE /:id          │ • DELETE /:id          │
└──────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┘

┌─ Payment Routes ─────────┬─ PayPal Routes ────────┬─ Voucher Routes ─────────┬─ Review Routes ────────┐
│ • POST /create           │ • POST /create-order   │ • GET /all              │ • POST / (create)      │
│ • POST /verify           │ • POST /capture-order  │ • POST /validate        │ • GET /:restaurantId   │
│ • GET /:paymentId        │ • GET /return          │ • POST / (create)       │ • DELETE /:reviewId    │
│ • PUT /:id/status        │                        │ • PUT /:id (update)     │                        │
└──────────────────────────┴────────────────────────┴─────────────────────────┴────────────────────────┘

┌─ Drone Routes ───────────┬─ Notification Routes ──┬─ Cart Routes ──────────┬─ Delivery Routes ──────┐
│ • GET /all               │ • GET /user/:userId    │ • GET /user/:userId   │ • GET /:orderId        │
│ • GET /:id/location      │ • POST / (create)      │ • POST /add-item      │ • PUT /:id/track       │
│ • PUT /:id/status        │ • PUT /:id/read        │ • PUT /update-item    │ • POST /complete       │
│ • POST /dispatch         │                        │ • DELETE /remove-item │                        │
└──────────────────────────┴────────────────────────┴───────────────────────┴────────────────────────┘

┌─ Dashboard Routes ───────┬─ Transaction Routes ───┬─ Staff Routes ─────────┬─ Admin Settings Routes─┐
│ • GET /stats             │ • GET /all             │ • GET /restaurant/:id │ • GET /settings        │
│ • GET /revenue           │ • GET /:id             │ • POST / (create)     │ • PUT /settings        │
│ • GET /top-products      │ • GET /user/:userId    │ • DELETE /:staffId    │ • GET /logs            │
│ • POST /report           │                        │ • PUT /:id (update)   │                        │
└──────────────────────────┴────────────────────────┴───────────────────────┴────────────────────────┘" style="text;html=1;align=left;verticalAlign=top;fontSize=9;fontFamily=monospace;whiteSpace=pre;" vertex="1" parent="1">
          <mxGeometry x="60" y="460" width="1080" height="280" as="geometry" />
        </mxCell>

        <!-- Arrow from Backend to DB -->
        <mxCell id="arrow-back-db" edge="1" parent="1" source="backend" target="database">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- DATABASE LAYER -->
        <mxCell id="db-title" value="DATABASE LAYER" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=#EFEBE9;fontSize=16;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="50" y="820" width="1100" height="30" as="geometry" />
        </mxCell>

        <!-- MongoDB Box -->
        <mxCell id="database" value="MongoDB - 12 Collections" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#D7CCC8;strokeColor=#3E2723;strokeWidth=2;" vertex="1" parent="1">
          <mxGeometry x="50" y="870" width="1100" height="150" as="geometry" />
        </mxCell>

        <mxCell id="db-content" value="Users │ Restaurants │ Products │ Orders │ Payments │ Vouchers │ Reviews │ Drones │ Carts │ Notifications │ Transactions │ Staff" style="text;html=1;align=center;verticalAlign=middle;fontSize=12;fontFamily=monospace;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="60" y="880" width="1080" height="130" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

## 📐 COMPONENT HIERARCHY DIAGRAM (Alternative Draw.io Format)

```xml
<mxfile host="app.diagrams.net">
  <diagram id="component-hierarchy" name="Component Hierarchy">
    <mxGraphModel dx="1000" dy="1200" grid="1">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Level 1: System -->
        <mxCell id="system" value="FoodFast System (76 Components)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFD54F;strokeWidth=3;" vertex="1" parent="1">
          <mxGeometry x="300" y="20" width="400" height="50" as="geometry" />
        </mxCell>

        <!-- Level 2: Applications -->
        <mxCell id="cust-web" value="Customer-Web\n25 Pages" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#B3E5FC;" vertex="1" parent="1">
          <mxGeometry x="50" y="120" width="200" height="80" as="geometry" />
        </mxCell>
        <mxCell id="rest-web" value="Restaurant-Web\n19 Pages" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#C8E6C9;" vertex="1" parent="1">
          <mxGeometry x="400" y="120" width="200" height="80" as="geometry" />
        </mxCell>
        <mxCell id="admin-web" value="Admin-Web\n16 Pages" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFE0B2;" vertex="1" parent="1">
          <mxGeometry x="750" y="120" width="200" height="80" as="geometry" />
        </mxCell>
        <mxCell id="backend" value="Backend API\n16 Route Modules" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#E1BEE7;" vertex="1" parent="1">
          <mxGeometry x="300" y="250" width="400" height="80" as="geometry" />
        </mxCell>

        <!-- Level 3: Component Categories (Customer) -->
        <mxCell id="cust-auth" value="Auth (2)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#81D4FA;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="20" y="280" width="60" height="40" as="geometry" />
        </mxCell>
        <mxCell id="cust-browse" value="Browse (3)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#81D4FA;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="90" y="280" width="60" height="40" as="geometry" />
        </mxCell>
        <mxCell id="cust-cart" value="Cart (3)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#81D4FA;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="160" y="280" width="60" height="40" as="geometry" />
        </mxCell>

        <!-- Level 3: Component Categories (Restaurant) -->
        <mxCell id="rest-mgmt" value="Mgmt (6)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#A5D6A7;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="370" y="280" width="60" height="40" as="geometry" />
        </mxCell>
        <mxCell id="rest-analytics" value="Analytics (3)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#A5D6A7;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="440" y="280" width="70" height="40" as="geometry" />
        </mxCell>

        <!-- Level 3: Component Categories (Admin) -->
        <mxCell id="admin-mgmt" value="Mgmt (7)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFD699;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="720" y="280" width="60" height="40" as="geometry" />
        </mxCell>
        <mxCell id="admin-dash" value="Dashboard (3)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFD699;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="790" y="280" width="70" height="40" as="geometry" />
        </mxCell>

        <!-- Level 4: Reusable Components -->
        <mxCell id="reusable-title" value="Reusable Components" style="text;html=1;align=center;fontSize=12;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="300" y="380" width="400" height="30" as="geometry" />
        </mxCell>

        <mxCell id="button-comp" value="Button ⭐⭐⭐⭐⭐\n50+ uses" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF176;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="50" y="440" width="100" height="60" as="geometry" />
        </mxCell>
        <mxCell id="input-comp" value="Input ⭐⭐⭐⭐⭐\n40+ uses" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF176;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="180" y="440" width="100" height="60" as="geometry" />
        </mxCell>
        <mxCell id="card-comp" value="Card ⭐⭐⭐⭐⭐\n35+ uses" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF176;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="310" y="440" width="100" height="60" as="geometry" />
        </mxCell>
        <mxCell id="modal-comp" value="Modal ⭐⭐⭐⭐\n15+ uses" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF176;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="440" y="440" width="100" height="60" as="geometry" />
        </mxCell>
        <mxCell id="loading-comp" value="Loading ⭐⭐⭐⭐\n30+ uses" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF176;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="570" y="440" width="100" height="60" as="geometry" />
        </mxCell>
        <mxCell id="badge-comp" value="Badge ⭐⭐⭐⭐\n20+ uses" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFF176;fontSize=10;" vertex="1" parent="1">
          <mxGeometry x="700" y="440" width="100" height="60" as="geometry" />
        </mxCell>

        <!-- Arrows -->
        <mxCell id="edge1" edge="1" parent="1" source="system" target="cust-web" style="edgeStyle=orthogonalEdgeStyle;" />
        <mxCell id="edge2" edge="1" parent="1" source="system" target="rest-web" style="edgeStyle=orthogonalEdgeStyle;" />
        <mxCell id="edge3" edge="1" parent="1" source="system" target="admin-web" style="edgeStyle=orthogonalEdgeStyle;" />
        <mxCell id="edge4" edge="1" parent="1" source="system" target="backend" style="edgeStyle=orthogonalEdgeStyle;" />
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

## 📊 COMPONENT REUSABILITY MATRIX (Detailed)

| Component       | Customer-Web | Restaurant-Web | Admin-Web | Total Uses | Reusability         |
| --------------- | ------------ | -------------- | --------- | ---------- | ------------------- |
| Button          | 50           | 40             | 35        | **125+**   | ⭐⭐⭐⭐⭐ CRITICAL |
| Input           | 40           | 30             | 25        | **95+**    | ⭐⭐⭐⭐⭐ CRITICAL |
| Card            | 30           | 25             | 20        | **75+**    | ⭐⭐⭐⭐⭐ CRITICAL |
| Loading/Spinner | 25           | 20             | 15        | **60+**    | ⭐⭐⭐⭐⭐ CRITICAL |
| Modal           | 15           | 12             | 10        | **37+**    | ⭐⭐⭐⭐ HIGH       |
| Badge           | 15           | 12             | 15        | **42+**    | ⭐⭐⭐⭐ HIGH       |
| Toast           | 12           | 10             | 8         | **30+**    | ⭐⭐⭐⭐ HIGH       |
| RestaurantCard  | 5            | -              | -         | **5**      | ⭐⭐⭐ MEDIUM       |
| MenuItemCard    | 10           | 5              | -         | **15**     | ⭐⭐⭐ MEDIUM       |
| CartItem        | 8            | -              | -         | **8**      | ⭐⭐ LOW            |
| OrderCard       | 10           | 8              | 5         | **23**     | ⭐⭐⭐ MEDIUM       |
| DataTable       | -            | 5              | 6         | **11**     | ⭐⭐ LOW-MED        |
| Form            | 8            | 6              | 7         | **21**     | ⭐⭐⭐ MEDIUM       |

---

## 🎯 Summary Statistics

```
SYSTEM TOTALS:
├─ Total Components: 76
├─ Frontend Pages: 60 (Customer:25 + Restaurant:19 + Admin:16)
├─ Backend Routes: 16
├─ Database Collections: 12
│
REUSABILITY BREAKDOWN:
├─ Hyper-reusable (50+ uses): 3 components
├─ Highly reusable (20+ uses): 4 components
├─ Moderately reusable (5-19 uses): 6 components
├─ Low reusable (1-4 uses): 63+ components
│
COMPONENT CATEGORIES:
├─ Common UI: 8 (HIGH reuse)
├─ Feature-specific: 15 (MEDIUM reuse)
├─ Page containers: 37 (LOW reuse)
└─ System/Route: 16 (Backend)
```

---

## 🚀 How to Use Draw.io Codes

1. Go to **https://draw.io**
2. Click **Create New Diagram**
3. Choose **File → Import from → XML**
4. Paste the XML code above
5. Click **Import**
6. Customize colors/layout as needed
7. Export as image/PDF for your assignment

**Done! Bạn có sơ đồ chi tiết toàn hệ thống! 🎉**
