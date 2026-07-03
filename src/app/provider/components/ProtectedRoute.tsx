import { ReactElement, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/store/hooks";
import {
  selectIsAuthenticated,
  selectIsAuthInitialized,
} from "@/app/store/slices/authSlice";

type ProtectedRouteProps = {
  children: ReactElement;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthInitialized = useAppSelector(selectIsAuthInitialized);

  useEffect(() => {
    if (isAuthInitialized && !isAuthenticated) {
      navigate("/autorization", {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, isAuthInitialized, navigate, location]);

  if (!isAuthInitialized || !isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
