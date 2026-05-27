import { useNavigate } from "react-router-dom";

/**
 * Хук usePasswordNavigation
 * 
 * Управляет навигацией в разделе смены пароля:
 * - Переход на страницу изменения пароля
 * - Возврат к настройкам профиля
 * 
 * @returns Объект с методами навигации
 */
export const usePasswordNavigation = () => {
  const navigate = useNavigate();

  const goToPasswordChange = () => {
    navigate("/user/settings/password");
  };

  const goBack = () => {
    navigate("/user");
  };

  return {
    goToPasswordChange,
    goBack,
  };
};