import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { AppRouter } from "./provider";
import { store } from "./store";
import { initSocket, disconnectSocket } from "@/app/lib/socket";
import { selectAccessToken, selectIsAuthInitialized } from "@/app/store/slices/authSlice";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { ToastProvider } from "@/shared/ui/Toast";
import { AuthBootstrap } from "@/app/provider/components/AuthBootstrap";
import "./style/index.css";

const AppWithRealtime = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const isAuthInitialized = useAppSelector(selectIsAuthInitialized);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthInitialized) {
      return;
    }

    if (accessToken) {
      initSocket(accessToken, dispatch);
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [accessToken, dispatch, isAuthInitialized]);

  return (
    <AuthBootstrap>
      <AppRouter />
    </AuthBootstrap>
  );
};

export const App = () => {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppWithRealtime />
      </ToastProvider>
    </Provider>
  );
};
