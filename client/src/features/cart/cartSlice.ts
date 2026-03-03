import { createSlice, createSelector, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../core/store/store";

export interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
  vendorId: string;
  slug?: string;
}

interface CartState {
  items: Record<string, CartItem>;
}

const initialState: CartState = { items: {} };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const { productId, quantity } = action.payload;
      const existing = state.items[productId];
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items[productId] = { ...action.payload };
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items[productId];
      if (!item) return;
      if (quantity <= 0) {
        delete state.items[productId];
      } else {
        item.quantity = quantity;
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
    },
    clearCart: () => initialState,
  },
});

export const { addItem, updateQuantity, removeItem, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (s: RootState) =>
  Object.values(s.cart.items);

export const selectCartTotals = createSelector(selectCartItems, (items) => {
  const subtotalCents = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotalCents, itemCount };
});
