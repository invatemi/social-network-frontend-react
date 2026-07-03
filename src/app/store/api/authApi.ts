import { baseApi } from "./baseApi";
import { UserProfile } from "@/entities/user/lib";

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

    logout: builder.mutation<{ message: string }, void>({
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
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokensMutation,
  useLogoutMutation,
} = authApi;
