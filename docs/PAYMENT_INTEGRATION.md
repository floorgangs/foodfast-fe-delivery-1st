# 💳 Payment Gateway Integration Guide

## 🎯 Sandbox Credentials

### VNPay Sandbox

```env
VNPAY_TMN_CODE=CGQT26W9
VNPAY_HASH_SECRET=FGZXUFIRDFOYEMSHZYBXNJTRJVSCZKRG
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payment/vnpay-return
```

**Test Card**: Bất kỳ thông tin thẻ hợp lệ (sandbox không charge thật)

- Card Number: 9704198526191432198
- Card Holder: NGUYEN VAN A
- Expiry Date: 07/15
- OTP: 123456 (hoặc bất kỳ)

### MoMo Sandbox

```env
MOMO_PARTNER_CODE=MOMOBKUN20180529
MOMO_ACCESS_KEY=klm05TvNBzhg7h7j
MOMO_SECRET_KEY=at67qH6mk8w5Y1NH7yMXYMHWrUwcb5r
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:5173/payment/momo-return
MOMO_IPN_URL=http://localhost:5000/api/payments/momo/ipn
```

**Test Account**: Scan QR trong sandbox MoMo app (test mode)

---

## 🔄 Payment Flow

### 1. Customer Checkout

```
Customer Web → Checkout Page
  ↓ Chọn phương thức thanh toán
  ├─ COD: Tạo order ngay, status = pending
  ├─ VNPay: Redirect → sandbox.vnpayment.vn
  └─ MoMo: Redirect → test-payment.momo.vn
```

### 2. Backend Create Payment Session

```javascript
POST /api/payments/vnpay/create
Body: {
  orderId: "xxx",
  amount: 125000,
  orderInfo: "Thanh toán đơn hàng #FF123"
}

Response: {
  success: true,
  data: {
    paymentUrl: "https://sandbox.vnpayment.vn/...",
    orderId: "xxx"
  }
}
```

### 3. Redirect to Gateway

```
Customer → Click "Thanh toán"
  ↓
Backend generates payment URL
  ↓
Redirect browser to VNPay/MoMo
  ↓
Customer enters card/wallet info
  ↓
Payment Gateway processes
  ↓
Redirect back to returnUrl with query params
```

### 4. Payment Return Handling

```
Gateway → http://localhost:5173/payment/vnpay-return?
  vnp_ResponseCode=00&
  vnp_TxnRef=orderId_timestamp&
  vnp_SecureHash=xxx...

Frontend → PaymentReturn component
  ↓
Call backend to verify signature
  ↓
Backend → Update Order status
  - paymentStatus: "paid"
  - status: "confirmed"
  - timeline: add "Thanh toán thành công"
  ↓
Display success/failed message
```

---

## 📂 File Structure

```
backend/
├── services/
│   ├── vnpayService.js       # VNPay utilities
│   └── momoService.js        # MoMo utilities
├── controllers/
│   └── paymentController.js  # Payment endpoints
└── routes/
    └── paymentRoutes.js      # /api/payments/*

customer-web/
├── pages/
│   ├── Checkout/
│   │   └── Checkout.jsx      # Payment method selection
│   └── PaymentReturn/
│       ├── PaymentReturn.jsx # Handle return from gateway
│       └── PaymentReturn.css
└── App.jsx                   # Add /payment/*-return routes
```

---

## 🚀 Setup Instructions

### 1. Update Backend .env

Copy từ `.env.example` và điền credentials:

```bash
cd backend
cp .env.example .env
# Edit .env với VNPay và MoMo credentials
```

### 2. Install Dependencies

```bash
cd backend
npm install moment qs
```

### 3. Restart Backend

```bash
npm start
```

### 4. Test Payment Flow

#### Test VNPay:

1. Customer-web → Thêm món vào giỏ
2. Checkout → Chọn "Thanh toán VNPay"
3. Click "Đặt hàng" → Redirect sang sandbox VNPay
4. Nhập thông tin thẻ test (xem trên)
5. Nhập OTP: 123456
6. Redirect về `/payment/vnpay-return`
7. Xem kết quả thanh toán

#### Test MoMo:

1. Checkout → Chọn "Thanh toán MoMo"
2. Click "Đặt hàng" → Redirect sang test-payment.momo.vn
3. Scan QR bằng MoMo app (test mode)
4. Xác nhận thanh toán
5. Redirect về `/payment/momo-return`
6. Xem kết quả

---

## 🔒 Security Notes

### ✅ Implemented:

- HMAC-SHA512 signature verification (VNPay)
- HMAC-SHA256 signature verification (MoMo)
- Payment session expiration (15 minutes)
- Order validation before payment
- Signature check on return URL

### ⚠️ Production Recommendations:

1. **Use HTTPS**: Payment gateways require HTTPS in production
2. **Environment Variables**: Store credentials in secure vault (AWS Secrets Manager, Azure Key Vault)
3. **IP Whitelist**: Configure gateway IP whitelist
4. **Webhook IPN**: Implement MoMo IPN handler (already done: `/api/payments/momo/ipn`)
5. **Retry Logic**: Handle gateway timeouts
6. **Logging**: Log all payment transactions for audit
7. **Rate Limiting**: Prevent payment spam

---

## 🐛 Troubleshooting

### Error: "Chữ ký không hợp lệ"

- **Cause**: VNPAY_HASH_SECRET or MOMO_SECRET_KEY incorrect
- **Fix**: Check .env values match sandbox credentials

### Error: "Không thể tạo thanh toán"

- **Cause**: MoMo API endpoint down or credentials wrong
- **Fix**: Check `MOMO_ENDPOINT` and keys in .env

### Payment success but order not updated

- **Cause**: Return URL not hitting backend
- **Fix**: Check `VNPAY_RETURN_URL` and `MOMO_RETURN_URL` are correct

### Redirect loop on payment return

- **Cause**: Frontend route not configured
- **Fix**: Check App.jsx has `/payment/vnpay-return` and `/payment/momo-return` routes

---

## 📊 Database Impact

### Order Model Changes:

```javascript
{
  paymentMethod: "banking" | "momo" | "cod",
  paymentProvider: "VNPay" | "MoMo" | null,
  paymentSessionId: "orderId_timestamp",
  paymentSessionExpiresAt: Date,
  paymentStatus: "pending" | "paid" | "failed",
  status: "pending" | "confirmed" | ...,
  timeline: [
    { status: "confirmed", note: "Thanh toán VNPay thành công" }
  ]
}
```

---

## ✅ Next Steps

- [ ] Update Checkout.jsx UI for payment selection
- [ ] Test COD flow (create order → restaurant receives)
- [ ] Test VNPay flow (redirect → pay → return)
- [ ] Test MoMo flow (redirect → pay → return)
- [ ] Implement Socket.io notification to restaurant when payment confirmed
- [ ] Add payment history to customer profile
- [ ] Handle payment refund API (for cancelled orders)
