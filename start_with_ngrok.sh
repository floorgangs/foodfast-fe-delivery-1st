#!/bin/bash

echo "========================================"
echo "  FoodFast Backend + Ngrok Launcher"
echo "========================================"
echo ""

# Check if ngrok exists
if ! command -v ngrok &> /dev/null; then
    echo "[ERROR] Ngrok chưa được cài đặt!"
    echo ""
    echo "Cài đặt ngrok:"
    echo "  Mac: brew install ngrok"
    echo "  Linux: https://ngrok.com/download"
    echo ""
    exit 1
fi

echo "[1/3] Starting Backend..."
cd backend
npm run dev &
BACKEND_PID=$!

sleep 3

echo "[2/3] Starting Ngrok..."
ngrok http 5000 &
NGROK_PID=$!

echo "[3/3] Done!"
echo ""
echo "========================================"
echo "  Các bước tiếp theo:"
echo "========================================"
echo "1. Đợi 5-10s để backend khởi động"
echo "2. Mở http://127.0.0.1:4040 để xem Ngrok URL"
echo "3. Copy URL (VD: https://abc123.ngrok.io)"
echo "4. Mở file: customer-mobile-app/src/services/api.ts"
echo "5. Paste URL vào: const NGROK_URL = 'https://abc123.ngrok.io';"
echo "6. Restart mobile app"
echo ""
echo "Nhấn Ctrl+C để dừng tất cả"
echo "========================================"

# Wait for both processes
wait $BACKEND_PID $NGROK_PID
