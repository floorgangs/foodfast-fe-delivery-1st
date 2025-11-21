import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./index.css";
import App from "./App.jsx";

// Error boundary fallback
const ErrorFallback = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h1>⚠️ Có lỗi xảy ra</h1>
    <p>Vui lòng mở Console (F12) để xem chi tiết lỗi</p>
    <button onClick={() => window.location.reload()}>Tải lại trang</button>
  </div>
);

try {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </StrictMode>
  );
} catch (error) {
  console.error("❌ App failed to render:", error);
  createRoot(document.getElementById("root")).render(<ErrorFallback />);
}
