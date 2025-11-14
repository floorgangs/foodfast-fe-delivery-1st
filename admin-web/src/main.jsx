import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./index.css";
import App from "./App.jsx";

// Clear auth data on dev startup (only runs once per dev session)
if (import.meta.env.DEV && !sessionStorage.getItem("dev_initialized")) {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  sessionStorage.setItem("dev_initialized", "true");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
