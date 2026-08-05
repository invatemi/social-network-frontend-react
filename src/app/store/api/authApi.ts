import { baseApi } from "./baseApi";
import { UserProfile } from "@/entities/user/lib";
import type { AccountSummary } from "@/app/store/slices/authSlice";

export type AuthUserPayload = {
  id: number;
  username: string;
  email: string;
  role?: string;
};

export type AccountSessionResponse = {
  accessToken: string;
  user: AuthUserPayload;
  accounts: AccountSummary[];
};

export type LogoutResponse =
  | { message: string; switched: false }
  | (AccountSessionResponse & { switched: true; message?: string });

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { accessToken: string; user: UserProfile },
      { email: string; password: string }
    >({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    register: builder.mutation<
      { accessToken: string; user: UserProfile },
      { username: string; email: string; password: string }
    >({
      query: (body) => ({
        url: "/api/auth/register",
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    refreshTokens: builder.mutation<{ accessToken: string }, void>({
      query: () => ({
        url: "/api/auth/refresh",
        method: "POST",
        credentials: "include",
      }),
    }),

    getAccounts: builder.query<{ accounts: AccountSummary[] }, void>({
      query: () => ({
        url: "/api/auth/accounts",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Auth"],
    }),

    addAccount: builder.mutation<
      AccountSessionResponse,
      { email: string; password: string }
    >({
      query: (body) => ({
        url: "/api/auth/accounts/add",
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    switchAccount: builder.mutation<AccountSessionResponse, { userId: number }>({
      query: (body) => ({
        url: "/api/auth/accounts/switch",
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["User", "Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokensMutation,
  useLogoutMutation,
  useGetAccountsQuery,
  useLazyGetAccountsQuery,
  useAddAccountMutation,
  useSwitchAccountMutation,
} = authApi;
