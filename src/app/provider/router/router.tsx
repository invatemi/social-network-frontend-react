import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "../../provider";
import { 
    AutorizationPage,
    RegistrationPage,
    MainPage,
    ErrorPage,
    UserPage,
    UserDetailPage,
    ChangePasswordPage,
    CommentPage,
    PublicPage,
    FriendPage,
    FollowerPage,
    MessagePage
} from "@/page";

const ProtectedOutlet = () => (
  <ProtectedRoute>
    <Outlet />
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
        <Route path="/user/settings" element={<UserDetailPage />} />
        <Route path="/user/settings/password" element={<ChangePasswordPage />} />
        <Route path="/post/:postId/comments" element={<CommentPage />} />
        <Route path="/user/:userId" element={<PublicPage />} />
        <Route path="/friends/:userId?" element={<FriendPage />} />
        <Route path="/followers/:userId?" element={<FollowerPage />} />
        <Route path="/messages" element={<MessagePage />} />
        <Route path="/messages/:chatId" element={<MessagePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/error" replace />} />
    </Routes>
  );
};