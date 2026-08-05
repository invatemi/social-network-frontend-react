import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";

import { baseApi } from "./api/baseApi";
import type { UserProfile } from "@/entities/user/lib";
import type { AccountSummary } from "./slices/authSlice";

type AuthState = {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  accounts: AccountSummary[];
};

type PresenceState = {
  byUserId: Record<string, boolean>;
};

export type RootState = {
  auth: AuthState;
  presence: PresenceState;
  [baseApi.reducerPath]: ReturnType<typeof baseApi.reducer>;
};

export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;
