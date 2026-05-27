import { ReactElement, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/store/hooks";
import { selectIsAuthenticated } from "@/app/store/slices/authSlice";

type ProtectedRouteProps = {
  children: ReactElement;
};

/**
 * Компонент защиты маршрутов
 * 
 * Проверяет авторизацию пользователя перед рендером дочернего контента:
 * - Если пользователь не аутентифицирован — перенаправляет на страницу входа
 * - Сохраняет исходный путь в state для возврата после успешного логина
 * - Возвращает null во время проверки, чтобы избежать мелькания контента
 * 
 * @param children - Защищённый контент для рендера
 * @returns JSX-элемент детей или null
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/autorization", {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, location]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;