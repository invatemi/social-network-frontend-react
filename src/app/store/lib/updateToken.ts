import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { env } from "@/shared/config/env";
import { parseRetryAfterSeconds } from "@/shared/lib/api/parseRateLimitError";
import { enrichRateLimitErrorData } from "@/shared/lib/api/handleRateLimitError";
import { logout } from "@/app/store/slices/authSlice";
import { refreshAccessToken } from "./refreshMutex";

const AUTH_SKIP_REFRESH_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
];

const shouldSkipRefresh = (args: string | FetchArgs): boolean => {
  const url = typeof args === "string" ? args : args.url;
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));
};

const baseQuery = fetchBaseQuery({
  baseUrl: env.apiUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState, endpoint }) => {
    if (endpoint === "searchUsers") {
      return headers;
    }

    const state = getState() as { auth: { accessToken: string | null } };
    const token = state.auth.accessToken;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 429) {
    const retryAfterSeconds = parseRetryAfterSeconds(result.meta?.response);
    return {
      error: {
        ...result.error,
        data: enrichRateLimitErrorData(result.error.data, retryAfterSeconds),
      },
    };
  }

  if (result.error?.status === 401 && !shouldSkipRefresh(args)) {
    const newAccessToken = await refreshAccessToken(api);

    if (newAccessToken) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};
