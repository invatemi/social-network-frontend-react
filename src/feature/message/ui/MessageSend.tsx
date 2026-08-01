import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import { CloseIcon, PaperclipIcon } from "@/shared/ui/icons";
import { MessageSendProps } from "../lib";
import style from "./MessageSend.module.css";

const MIN_TEXTAREA_HEIGHT_PX = 44;
const MAX_TEXTAREA_HEIGHT_PX = 200;
const HEIGHT_ANIMATION_MS = 240;
const MAX_ATTACHMENTS = 5;
const ACCEPT =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z";

type PendingFile = {
  id: string;
  file: File;
  previewUrl: string | null;
};

/**
 * MessageSend — форма отправки сообщения с вложениями
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
  onComposerHeightChange,
}: MessageSendProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isComposing, setIsComposing] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipAnimateRef = useRef(true);
  const heightRafRef = useRef<number>(0);

  const notifyHeightChange = useCallback(() => {
    onComposerHeightChange?.();
  }, [onComposerHeightChange]);

  const trackHeightDuringTransition = useCallback(() => {
    if (heightRafRef.current) {
      cancelAnimationFrame(heightRafRef.current);
    }

    const startedAt = performance.now();
    const tick = (now: number) => {
      notifyHeightChange();
      if (now - startedAt < HEIGHT_ANIMATION_MS) {
        heightRafRef.current = requestAnimationFrame(tick);
      } else {
        heightRafRef.current = 0;
        notifyHeightChange();
      }
    };

    heightRafRef.current = requestAnimationFrame(tick);
  }, [notifyHeightChange]);

  const resizeTextarea = useCallback(
    (animate: boolean) => {
      const el = textareaRef.current;
      if (!el) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const shouldAnimate = animate && !reduceMotion && !skipAnimateRef.current;

      const currentHeight = el.offsetHeight;
      // Сброс в 0, а не auto: иначе в flex-раскладке scrollHeight раздувается
      el.style.transition = "none";
      el.style.height = "0px";
      el.style.overflowY = "hidden";
      const nextHeight = Math.min(
        Math.max(el.scrollHeight, MIN_TEXTAREA_HEIGHT_PX),
        MAX_TEXTAREA_HEIGHT_PX
      );
      const needsScroll = el.scrollHeight > MAX_TEXTAREA_HEIGHT_PX;

      if (!shouldAnimate || currentHeight === nextHeight) {
        el.style.height = `${nextHeight}px`;
        el.style.overflowY = needsScroll ? "auto" : "hidden";
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.style.transition = "";
          }
          notifyHeightChange();
        });
        return;
      }

      el.style.height = `${currentHeight}px`;
      void el.offsetHeight;
      el.style.transition = "";
      el.style.height = `${nextHeight}px`;
      el.style.overflowY = needsScroll ? "auto" : "hidden";
      trackHeightDuringTransition();
    },
    [notifyHeightChange, trackHeightDuringTransition]
  );

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) textareaRef.current.focus();
  }, [autoFocus]);

  useLayoutEffect(() => {
    resizeTextarea(true);
    skipAnimateRef.current = false;
  }, [localValue, pendingFiles.length, resizeTextarea]);

  useEffect(() => {
    const onResize = () => resizeTextarea(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resizeTextarea]);

  useEffect(
    () => () => {
      if (heightRafRef.current) cancelAnimationFrame(heightRafRef.current);
      setPendingFiles((prev) => {
        prev.forEach((item) => {
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        });
        return prev;
      });
    },
    []
  );

  const clearPendingFiles = useCallback(() => {
    setPendingFiles((prev) => {
      prev.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleAttachClick = () => {
    if (disabled || isLoading) return;
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length === 0) return;

    setLocalError(null);
    setPendingFiles((prev) => {
      const room = MAX_ATTACHMENTS - prev.length;
      if (room <= 0) {
        setLocalError(`Можно прикрепить не более ${MAX_ATTACHMENTS} файлов`);
        return prev;
      }
      const nextBatch = selected.slice(0, room).map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      }));
      if (selected.length > room) {
        setLocalError(`Можно прикрепить не более ${MAX_ATTACHMENTS} файлов`);
      }
      return [...prev, ...nextBatch];
    });
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSend = async () => {
    const text = localValue.trim();
    const files = pendingFiles.map((item) => item.file);
    if ((!text && files.length === 0) || isLoading || disabled || isComposing) {
      return;
    }

    try {
      setLocalError(null);
      await onSend(chatId, text, files.length > 0 ? files : undefined);
      setLocalValue("");
      onChange?.("");
      clearPendingFiles();
      textareaRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message:", err);
      setLocalError(
        err instanceof Error ? err.message : "Не удалось отправить сообщение"
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingChars = maxLength - localValue.length;
  const displayError = error || localError;
  const isSendDisabled =
    disabled ||
    isLoading ||
    remainingChars < 0 ||
    isComposing ||
    (!localValue.trim() && pendingFiles.length === 0);

  return (
    <div
      className={[style.container, displayError ? style.hasError : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {pendingFiles.length > 0 ? (
        <ul className={style.previewList} aria-label="Выбранные файлы">
          {pendingFiles.map((item) => (
            <li key={item.id} className={style.previewItem}>
              {item.previewUrl ? (
                <img
                  src={item.previewUrl}
                  alt=""
                  className={style.previewThumb}
                />
              ) : (
                <span className={style.previewFileIcon} aria-hidden />
              )}
              <span className={style.previewName} title={item.file.name}>
                {item.file.name}
              </span>
              <button
                type="button"
                className={style.previewRemove}
                onClick={() => removePendingFile(item.id)}
                aria-label={`Убрать ${item.file.name}`}
                disabled={disabled || isLoading}
              >
                <CloseIcon size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        className={style.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        aria-label="Форма отправки сообщения"
      >
        <input
          ref={fileInputRef}
          type="file"
          className={style.hiddenInput}
          accept={ACCEPT}
          multiple
          onChange={handleFilesSelected}
          tabIndex={-1}
        />

        <button
          type="button"
          className={style.attachButton}
          onClick={handleAttachClick}
          disabled={disabled || isLoading}
          aria-label="Прикрепить файл"
        >
          <PaperclipIcon size={18} />
        </button>

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
      {displayError ? <p className={style.errorText}>{displayError}</p> : null}
    </div>
  );
};

export default MessageSend;
