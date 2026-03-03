import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../services/api/productApi";

interface WishlistState {
  items: Product[];
}

const initialState: WishlistState = { items: [] };

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<Product>) => {
      if (!state.items.some((p) => p.id === action.payload.id)) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(action.payload);
      }
    },
  },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
