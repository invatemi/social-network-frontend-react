import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "../../provider";
import { ProfileSettingsProvider } from "@/feature";
import { 
    AutorizationPage,
    RegistrationPage,
    MainPage,
    ErrorPage,
    UserPage,
    PublicPage,
    FriendPage,
    FollowerPage,
    MessagePage,
    PhotoPage
} from "@/page";

const ProtectedOutlet = () => (
  <ProtectedRoute>
    <ProfileSettingsProvider>
      <Outlet />
    </ProfileSettingsProvider>
  </ProtectedRoute>
);

/**
 * Главный роутер приложения
 * 
 * Конфигурирует маршрутизацию:
 * - Публичные страницы (доступны без авторизации)
 * - Защищённые страницы (обёрнуты в ProtectedRoute)
 * - Динамические маршруты с параметрами URL
 * - Fallback для неизвестных путей
 * 
 * @returns JSX-элемент с конфигурацией маршрутов
 */
export const AppRouter = () => {
  return (
    <Routes>
      {/* Публичные */}
      <Route path="/autorization" element={<AutorizationPage />} />
      <Route path="/registration" element={<RegistrationPage />} />
      <Route path="/error" element={<ErrorPage />} />

      {/* Защищённая группа */}
      <Route element={<ProtectedOutlet />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/user/settings" element={<Navigate to="/user" replace />} />
        <Route path="/user/settings/password" element={<Navigate to="/user" replace />} />
        <Route path="/user/:userId" element={<PublicPage />} />
        <Route path="/friends/:userId?" element={<FriendPage />} />
        <Route path="/followers/:userId?" element={<FollowerPage />} />
        <Route path="/messages/:chatId?" element={<MessagePage />} />
        <Route path="/photos" element={<PhotoPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/error" replace />} />
    </Routes>
  );
};