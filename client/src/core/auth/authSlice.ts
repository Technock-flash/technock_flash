import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RegisterInput } from "../../services/api/authApi";
import { authApi } from "../../services/api/authApi";

export interface User {
  id: string;
  email: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isHydrated: false,
  isLoading: false,
  error: null,
};

export const hydrateAuth = createAsyncThunk(
  "auth/hydrate",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.refresh();
      return res;
    } catch {
      return rejectWithValue(null);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await authApi.login(email, password);
      return res;
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error ?? "Login failed"
          : "Login failed";
      return rejectWithValue(msg);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (input: RegisterInput, { rejectWithValue }) => {
    try {
      const res = await authApi.register(input);
      return res;
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string | Record<string, unknown> } } })
              .response?.data?.error ?? "Registration failed"
          : "Registration failed";
      return rejectWithValue(
        typeof msg === "string" ? msg : "Registration failed"
      );
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: { payload: string }) => {
      state.accessToken = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Hydrate
      .addCase(hydrateAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isLoading = false;
        state.isHydrated = true;
        state.error = null;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isLoading = false;
        state.isHydrated = true;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string" ? action.payload : "Login failed";
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string" ? action.payload : "Registration failed";
      })
      // Logout
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const { setAccessToken, clearError } = authSlice.actions;
export default authSlice.reducer;
