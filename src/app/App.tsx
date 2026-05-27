import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { AppRouter } from "./provider";
import { store } from "./store";
import { initSocket, getSocket } from "@/app/lib/socket";
import { selectAccessToken } from "@/app/store/slices/authSlice";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import "./style/index.css";

const AppWithSocket = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;
    
    if (accessToken && isMounted) {
      const socket = getSocket();
      
      if (!socket?.connected) {
        console.log('Инициализация WebSocket');
        initSocket(accessToken, dispatch);
      }
    }

    return () => {
      isMounted = false;
      console.log('AppWithSocket cleanup');
    };
  }, [accessToken, dispatch]);

  return <AppRouter />;
};

export const App = () => {
  return (
    <Provider store={store}>
      <AppWithSocket />
    </Provider>
  );
};