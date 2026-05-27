import { useRef, useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { Input, Button } from '@/shared';
import { MessageSendProps } from '../lib';
import style from './MessageSend.module.css';

/**
 * текстовая стрелка
 */
const SendIcon = () => (
  <span className={style.sendIcon}>{`->`}</span>
);

/**
 * MessageSend — форма отправки сообщения
 * 
 * @example
 * <MessageSend 
 *   chatId={1}
 *   value={message}
 *   onChange={setMessage}
 *   onSend={handleSend}
 *   isLoading={isSending}
 * />
 */
const MessageSend = ({
  chatId,
  value = '',
  onChange,
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = '> введите сообщение...',
  maxLength = 2000,
  error,
  className = '',
  autoFocus = false,
}: MessageSendProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setLocalValue(value); }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) textareaRef.current.focus();
  }, [autoFocus]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleSend = async () => {
    const text = localValue.trim();
    if (!text || isLoading || disabled || isComposing) return;

    try {
      await onSend(chatId, text);
      setLocalValue('');
      onChange?.('');
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
    if (e.nativeEvent.isComposing) setIsComposing(true);
  };

  const handleCompositionEnd = () => setIsComposing(false);

  const remainingChars = maxLength - localValue.length;
  const showCharCounter = remainingChars <= 200;

  const isSendDisabled = 
    disabled || isLoading || !localValue.trim() || remainingChars < 0 || isComposing;

  return (
    <div className={`${style.container} ${error ? style.error : ''} ${className}`}>
      <form 
        className={style.form} 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        aria-label="Форма отправки сообщения"
      >
        <div className={style.inputWrapper}>
          <Input
            ref={textareaRef}
            as="textarea"
            id={`message-input-${chatId}`}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={1}
            disabled={disabled || isLoading}
            error={error ? `! ${error}` : undefined}
            fullWidth
            className={style.textarea}
            aria-label="Текст сообщения"
            helperText={showCharCounter ? `[${remainingChars}]` : undefined}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isLoading}
          disabled={isSendDisabled}
          onClick={handleSend}
          className={style.sendButton}
          aria-label="Отправить сообщение"
        >
          {isLoading ? `[..]` : <SendIcon />}
        </Button>
      </form>
    </div>
  );
};

export default MessageSend;