import { createSelector } from '@reduxjs/toolkit';

// Basic input selector to get the auth slice
// Use 'any' or your specific RootState type here
const selectAuth = (state: any) => state.auth;

/**
 * Selects the user object. Returns stable reference from state.
 */
export const selectUser = createSelector(
  [selectAuth],
  (auth) => auth?.user || null
);

/**
 * Selects the access token string.
 */
export const selectToken = createSelector(
  [selectAuth],
  (auth) => auth?.token || null
);

/**
 * Memoized compound selector for AppShell-like requirements.
 * This only returns a new object reference if user or token actually change.
 */
export const selectAuthData = createSelector(
  [selectUser, selectToken],
  (user, token) => ({ user, token })
);