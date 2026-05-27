import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { disconnectSocket } from '@/app/lib/socket';
import { authApi } from "@/app/store/api/authApi";
import { UserProfile } from "@/entities/user/lib";
import type { RootState } from "@/app/store/types";

/**
 * Состояние модуля аутентификации.
 */
type AuthState = {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
};

/**
 * Загружает данные аутентификации из localStorage.
 * 
 * @returns Объект с токенами и данными пользователя, или `null` при ошибке парсинга
 */
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem("auth_tokens");
    const userRaw = localStorage.getItem("user");
    return {
      tokens: raw ? JSON.parse(raw) : null,
      user: userRaw ? JSON.parse(userRaw) : null,
    };
  } catch {
    return { tokens: null, user: null };
  }
};

const { tokens: storedTokens, user: storedUser } = loadFromStorage();

const initialState: AuthState = {
  user: storedUser,
  accessToken: storedTokens?.accessToken || null,
  refreshToken: storedTokens?.refreshToken || null,
  isAuthenticated: !!storedTokens?.accessToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Устанавливает полные данные аутентификации: токены и профиль пользователя.
     * Сохраняет данные в localStorage для персистентности между сессиями.
     * 
     * @param state - Текущее состояние среза
     * @param action - Payload с токенами и данными пользователя
     */
    setAuth: (state, action: PayloadAction<{ 
      accessToken: string; 
      refreshToken: string; 
      user: UserProfile;
    }>) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;
      
      localStorage.setItem("auth_tokens", JSON.stringify({ accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(user));
    },

    /**
     * Обновляет только пару токенов доступа без изменения данных профиля.
     * Используется при автоматическом рефреше токенов.
     * 
     * @param state - Текущее состояние среза
     * @param action - Payload с новыми токенами
     */
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("auth_tokens", JSON.stringify(action.payload));
    },

    /**
     * Частично обновляет данные профиля текущего пользователя.
     * 
     * @param state - Текущее состояние среза
     * @param action - Payload с частичными данными профиля (`Partial<UserProfile>`)
     */
    updateUser: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    /**
     * Выполняет выход из системы: очищает состояние, удаляет данные из localStorage
     * и завершает активное WebSocket-соединение.
     * 
     * @param state - Текущее состояние среза
     */
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth_tokens");
      localStorage.removeItem("user");
      
      disconnectSocket();
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action: PayloadAction<{ 
        accessToken: string; 
        refreshToken: string; 
        user: UserProfile; 
      }>) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        
        localStorage.setItem("auth_tokens", JSON.stringify({ 
          accessToken: action.payload.accessToken, 
          refreshToken: action.payload.refreshToken 
        }));
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    );
  },
});

/**
 * Селектор профиля текущего пользователя.
 * @param state - RootState приложения
 * @returns Объект `UserProfile` или `null`, если пользователь не аутентифицирован
 */
export const selectUser = (state: RootState) => state.auth.user;

/**
 * Селектор статуса аутентификации.
 * @param state - RootState приложения
 * @returns `true`, если пользователь вошёл в систему
 */
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

/**
 * Селектор текущего access-токена.
 * @param state - RootState приложения
 * @returns Строка токена или `null`
 */
export const selectAccessToken = (state: RootState) => state.auth.accessToken;

/**
 * Селектор текущего refresh-токена.
 * @param state - RootState приложения
 * @returns Строка токена или `null`
 */
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;

export const { setAuth, setTokens, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;