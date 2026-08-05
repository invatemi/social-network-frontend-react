import type { AppDispatch } from "@/app/store/types";
import { baseApi } from "@/app/store/api/baseApi";
import {
  setAuth,
  setAccounts,
  setUser,
  type AccountSummary,
} from "@/app/store/slices/authSlice";
import type { AuthUserPayload } from "@/app/store/api/authApi";
import type { UserProfile } from "@/entities/user/lib";
import { userApi } from "@/entities/user/api";

export type AccountSessionPayload = {
  accessToken: string;
  user: AuthUserPayload | UserProfile;
  accounts?: AccountSummary[];
};

const toUserProfile = (user: AuthUserPayload | UserProfile): UserProfile => ({
  id: user.id,
  username: user.username,
  email: user.email,
  avatarUrl: "avatarUrl" in user ? user.avatarUrl : undefined,
  bio: "bio" in user ? user.bio : undefined,
  location: "location" in user ? user.location : undefined,
});

/**
 * Применяет сессию другого аккаунта: Redux auth + сброс RTK cache.
 * Socket переподключится в App.tsx по новому accessToken.
 */
export const applyAccountSession = (
  dispatch: AppDispatch,
  session: AccountSessionPayload,
): void => {
  dispatch(
    setAuth({
      accessToken: session.accessToken,
      user: toUserProfile(session.user),
    }),
  );

  if (session.accounts) {
    dispatch(setAccounts(session.accounts));
  }

  dispatch(baseApi.util.resetApiState());
};

/**
 * Подтягивает полный профиль активного пользователя после switch/add/bootstrap.
 */
export const hydrateActiveUserProfile = async (
  dispatch: AppDispatch,
  fetchProfile: () => Promise<UserProfile>,
): Promise<void> => {
  try {
    const profile = await fetchProfile();
    dispatch(setUser(profile));
  } catch {
    // Access token already applied; profile can load later.
  }
};

/**
 * Обогащает список аккаунтов vault публичными avatarUrl из user-service.
 */
export const enrichAccountsWithAvatars = async (
  dispatch: AppDispatch,
  accounts: AccountSummary[],
): Promise<AccountSummary[]> => {
  if (accounts.length === 0) {
    return accounts;
  }

  return Promise.all(
    accounts.map(async (account) => {
      if (account.avatarUrl) {
        return account;
      }

      try {
        const profile = await dispatch(
          userApi.endpoints.getUserPublicProfile.initiate(
            { userId: account.id },
            { subscribe: false },
          ),
        ).unwrap();

        return {
          ...account,
          avatarUrl: profile.avatarUrl ?? null,
        };
      } catch {
        return account;
      }
    }),
  );
};

/** Загружает accounts и обогащает аватарами, затем кладёт в authSlice. */
export const hydrateAccounts = async (
  dispatch: AppDispatch,
  accounts: AccountSummary[],
): Promise<AccountSummary[]> => {
  const enriched = await enrichAccountsWithAvatars(dispatch, accounts);
  dispatch(setAccounts(enriched));
  return enriched;
};
