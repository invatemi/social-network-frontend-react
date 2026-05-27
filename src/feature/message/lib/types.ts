/**
 * Пропсы для компонента отправки сообщения в чате.
 * 
 * @description
 * Предоставляет интерфейс для управления полем ввода и отправкой сообщения:
 * валидация, ограничение длины, состояние загрузки, обработка ошибок
 * и кастомизация через пропсы.
 */
export type MessageSendProps = {
  chatId: number;
  value?: string;
  onChange?: (value: string) => void;
  onSend: (chatId: number, text: string) => Promise<void> | void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  className?: string;
  autoFocus?: boolean;
};