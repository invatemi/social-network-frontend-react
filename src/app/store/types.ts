import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";

import { baseApi } from "./api/baseApi";
import type { UserProfile } from "@/entities/user/lib";

type AuthState = {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
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
