import axios, { type AxiosError } from "axios";
import { env } from "../../config/env";
import { store } from "../../core/store/store";
import { setAccessToken } from "../../core/auth/authSlice";

export const apiClient = axios.create({
  baseURL: `${env.apiUrl}/api`,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = apiClient
    .post("/auth/refresh")
    .then((res) => {
      refreshPromise = null;
      const token = res.data.accessToken;
      // If we got a successful response but no token, the session is dead
      if (!token) {
        throw new Error("No refresh token available");
      }
      store.dispatch(setAccessToken(token));
      return token;
    })
    .catch((err) => {
      refreshPromise = null;
      throw err;
    });
  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  
  // Do not send the Authorization header for the refresh request itself.
  // The server uses the httpOnly cookie for this endpoint.
  const isRefreshRequest = config.url?.includes("/auth/refresh");

  if (token && !isRefreshRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only set JSON content-type for non-FormData bodies.
  // Axios will set the correct multipart boundary for FormData automatically.
  const hasBody = config.data !== undefined && config.data !== null;
  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
  if (hasBody && !isFormData) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as typeof err.config & { _retry?: boolean };
    if (
      err.response?.status === 401 &&
      !original._retry &&
      // Do not retry for the refresh endpoint itself. Use includes to be safe against baseURLs.
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        if (original.headers) {
          original.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(original);
      } catch (refreshErr) {
        // If the refresh call fails (e.g., 401), clear the auth state
        // and reject the original request so the UI can redirect to login.
        store.dispatch(setAccessToken(null));
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);
