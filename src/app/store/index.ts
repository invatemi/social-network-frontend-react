import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import authReducer from "@/app/store/slices/authSlice";
import { baseApi } from "@/app/store/api/baseApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["auth.user.avatarFile", "auth.user"],
      },
    }).concat(baseApi.middleware),
});

setupListeners(store.dispatch);