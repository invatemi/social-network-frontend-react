import { useRef, useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { MessageSendProps } from "../lib";
import style from "./MessageSend.module.css";

/**
 * MessageSend — форма отправки сообщения
 */
const MessageSend = ({
  chatId,
  value = "",
  onChange,
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "Сообщение",
  maxLength = 2000,
  error,
  className = "",
  autoFocus = false,
}: MessageSendProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) textareaRef.current.focus();
  }, [autoFocus]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleSend = async () => {
    const text = localValue.trim();
    if (!text || isLoading || disabled || isComposing) return;

    try {
      await onSend(chatId, text);
      setLocalValue("");
      onChange?.("");
      textareaRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingChars = maxLength - localValue.length;
  const isSendDisabled =
    disabled || isLoading || !localValue.trim() || remainingChars < 0 || isComposing;

  return (
    <div
      className={[style.container, error ? style.hasError : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <form
        className={style.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        aria-label="Форма отправки сообщения"
      >
        <textarea
          ref={textareaRef}
          id={`message-input-${chatId}`}
          className={style.textarea}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={1}
          disabled={disabled || isLoading}
          aria-label="Текст сообщения"
        />

        <button
          type="submit"
          className={style.sendButton}
          disabled={isSendDisabled}
          aria-label="Отправить сообщение"
        >
          <span className={style.sendIcon} aria-hidden />
        </button>
      </form>
      {error ? <p className={style.errorText}>{error}</p> : null}
    </div>
  );
};

export default MessageSend;
