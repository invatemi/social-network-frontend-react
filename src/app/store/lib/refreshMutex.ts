import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { env } from "@/shared/config/env";
import { setAccessToken } from "@/app/store/slices/authSlice";

let refreshPromise: Promise<string | null> | null = null;

const doRefresh = async (api: BaseQueryApi): Promise<string | null> => {
  const refreshResult = await fetchBaseQuery({
    baseUrl: env.apiUrl,
    credentials: "include",
  })(
    {
      url: "/api/auth/refresh",
      method: "POST",
    },
    api,
    {},
  );

  if (refreshResult.data && !refreshResult.error) {
    const { accessToken } = refreshResult.data as { accessToken: string };
    api.dispatch(setAccessToken(accessToken));
    return accessToken;
  }

  return null;
};

export const refreshAccessToken = (api: BaseQueryApi): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = doRefresh(api).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};
