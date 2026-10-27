import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types";

const STORAGE_KEY = "ramjan.session";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

function empty(): AuthState {
  return { accessToken: null, refreshToken: null, user: null };
}

function readSession(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user ?? null,
    };
  } catch {
    return empty();
  }
}

function persist(state: AuthState) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user,
    }),
  );
}

const authSlice = createSlice({
  name: "auth",
  initialState: readSession(),
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string; user: User }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      persist(state);
    },
    tokensRefreshed(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persist(state);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      persist(state);
    },
    clearAuth(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { setCredentials, tokensRefreshed, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
export type { AuthState };
