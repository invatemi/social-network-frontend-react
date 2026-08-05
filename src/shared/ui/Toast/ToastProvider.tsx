import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import style from "./Toast.module.css";

interface ToastItem {
  id: number;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, []);

  const showToast = useCallback((message: string, durationMs = DEFAULT_DURATION_MS) => {
    const id = Date.now() + Math.random();

    setToasts((current) => [...current.slice(-1), { id, message }]);

    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, durationMs);
    timersRef.current.add(timer);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className={style.container} aria-live="polite" aria-atomic="true">
          {toasts.map((toast) => (
            <div key={toast.id} className={style.toast} role="status">
              {toast.message}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
