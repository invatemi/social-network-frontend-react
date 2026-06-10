type DisconnectHandler = () => void;

let disconnectHandler: DisconnectHandler | null = null;

export const registerSocketDisconnectHandler = (handler: DisconnectHandler): void => {
  disconnectHandler = handler;
};

export const disconnectSocket = (): void => {
  disconnectHandler?.();
};
