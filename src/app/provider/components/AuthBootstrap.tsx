import { ReactElement, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setAccessToken,
  setUser,
  setAuthInitialized,
  selectIsAuthInitialized,
} from "@/app/store/slices/authSlice";
import { useRefreshTokensMutation } from "@/app/store/api/authApi";
import { useLazyGetUserProfileQuery } from "@/entities/user/api";
import { Spinner } from "@/shared/ui";

type AuthBootstrapProps = {
  children: ReactElement;
};

export const AuthBootstrap = ({ children }: AuthBootstrapProps) => {
  const dispatch = useAppDispatch();
  const isAuthInitialized = useAppSelector(selectIsAuthInitialized);
  const [refreshTokens] = useRefreshTokensMutation();
  const [fetchUserProfile] = useLazyGetUserProfileQuery();

  useEffect(() => {
    if (isAuthInitialized) {
      return;
    }

    const bootstrap = async () => {
      try {
        const refreshResult = await refreshTokens().unwrap();
        dispatch(setAccessToken(refreshResult.accessToken));

        try {
          const profile = await fetchUserProfile().unwrap();
          dispatch(setUser(profile));
        } catch {
          // Access token restored; profile can load later on protected pages.
        }
      } catch {
        // No valid refresh cookie — user stays unauthenticated.
      } finally {
        dispatch(setAuthInitialized(true));
      }
    };

    void bootstrap();
  }, [dispatch, fetchUserProfile, isAuthInitialized, refreshTokens]);

  if (!isAuthInitialized) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <Spinner />
      </div>
    );
  }

  return children;
};
