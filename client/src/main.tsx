import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "./core/store/store";
import { hydrateAuth } from "./core/auth/authSlice";
import { router } from "./routes";

import "./index.css";

store.dispatch(hydrateAuth());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => {
        console.info('Service Worker registered:', reg);
      })
      .catch(err => {
        console.warn('Service Worker registration failed:', err);
      });
  });
}
