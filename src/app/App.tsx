import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { AppRouter } from "./provider";
import { store } from "./store";
import { initSocket, disconnectSocket } from "@/app/lib/socket";
import { selectAccessToken } from "@/app/store/slices/authSlice";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import "./style/index.css";

const AppWithRealtime = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (accessToken) {
      initSocket(accessToken, dispatch);
    }

    return () => {
      disconnectSocket();
    };
  }, [accessToken, dispatch]);

  return <AppRouter />;
};

export const App = () => {
  return (
    <Provider store={store}>
      <AppWithRealtime />
    </Provider>
  );
};
