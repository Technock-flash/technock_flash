import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../auth/authSlice";
import cartReducer from "../../features/cart/cartSlice";
import wishlistReducer from "../../features/products/wishlistSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
