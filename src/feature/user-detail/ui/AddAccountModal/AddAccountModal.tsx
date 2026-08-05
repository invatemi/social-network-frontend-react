import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useAppDispatch } from "@/app/store/hooks";
import { useAddAccountMutation } from "@/app/store/api/authApi";
import {
  applyAccountSession,
  hydrateAccounts,
} from "@/app/store/lib/applyAccountSession";
import { fetchUserProfileWithRetry } from "@/entities/user/api";
import { Button, Input, useToast } from "@/shared";
import { EmailIcon, LockIcon } from "@/shared/ui";
import { useRateLimitCountdown } from "@/shared/hooks";
import { handleRateLimitError } from "@/shared/lib/api/handleRateLimitError";
import { getRateLimitMessage } from "@/shared/lib/api/parseRateLimitError";
import { authSchema, type AuthFormData } from "@/shared/lib/auth";
import style from "./AddAccountModal.module.css";

export type AddAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ValidationErrorItem = {
  path: (string | number)[];
  message: string;
};

type LoginApiError = {
  data?: {
    errors?: ValidationErrorItem[];
    message?: string;
    retryAfterSeconds?: number;
    error?: { code?: string; message?: string };
  };
};

const getLoginErrorData = (err: unknown): LoginApiError["data"] | undefined => {
  if (typeof err === "object" && err !== null && "data" in err) {
    return (err as LoginApiError).data;
  }
  return undefined;
};

/**
 * AddAccountModal — логин дополнительного аккаунта в device vault
 */
const AddAccountModal = ({ isOpen, onClose }: AddAccountModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [addAccount, { isLoading }] = useAddAccountMutation();
  const { showToast } = useToast();
  const { isBlocked, startCountdown } = useRateLimitCountdown();
  const [formData, setFormData] = useState<AuthFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [credentialsInvalid, setCredentialsInvalid] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: "", password: "" });
      setErrors({});
      setCredentialsInvalid(false);
      return;
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || isLoading) return;
      e.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    modalRef.current?.focus();
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setCredentialsInvalid(false);
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setCredentialsInvalid(false);

    const clientResult = authSchema.safeParse(formData);
    if (!clientResult.success) {
      const formattedErrors: Record<string, string> = {};
      clientResult.error.issues.forEach((err) => {
        formattedErrors[err.path[0] as string] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      const result = await addAccount(formData).unwrap();
      applyAccountSession(dispatch, result);
      await fetchUserProfileWithRetry(dispatch);
      await hydrateAccounts(dispatch, result.accounts);
      showToast("Аккаунт добавлен");
      onClose();
    } catch (err: unknown) {
      if (handleRateLimitError(err, { startCountdown, showToast })) {
        const data = getLoginErrorData(err);
        setErrors({
          global: getRateLimitMessage(data?.retryAfterSeconds ?? 60),
        });
        return;
      }

      const data = getLoginErrorData(err);
      const code = data?.error?.code;
      if (code === "ACCOUNT_ALREADY_LINKED") {
        setErrors({
          global: data?.error?.message ?? "Этот аккаунт уже добавлен",
        });
        return;
      }

      if (data?.errors) {
        const formatted: Record<string, string> = {};
        data.errors.forEach((item) => {
          formatted[String(item.path[0])] = item.message;
        });
        setErrors(formatted);
      } else {
        setCredentialsInvalid(true);
        if (data?.error?.message || data?.message) {
          setErrors({
            global: data.error?.message ?? data.message ?? "Ошибка входа",
          });
        }
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={style.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={style.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-account-title"
        tabIndex={-1}
        data-testid="add-account-modal"
      >
        <div className={style.header}>
          <h2 id="add-account-title" className={style.title}>
            Добавить аккаунт
          </h2>
          <button
            type="button"
            className={style.closeBtn}
            onClick={onClose}
            disabled={isLoading}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <form className={style.form} onSubmit={(e) => void handleSubmit(e)} noValidate>
          {errors.global ? (
            <div className={style.errorGlobal}>{errors.global}</div>
          ) : null}

          <div className={style.field}>
            <label className={style.label} htmlFor="add-account-email">
              Email
            </label>
            <Input
              type="email"
              name="email"
              id="add-account-email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              variant={credentialsInvalid && !errors.email ? "danger" : undefined}
              leftIcon={<EmailIcon />}
              fullWidth
            />
          </div>

          <div className={style.field}>
            <label className={style.label} htmlFor="add-account-password">
              Password
            </label>
            <Input
              type="password"
              name="password"
              id="add-account-password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              variant={credentialsInvalid && !errors.password ? "danger" : undefined}
              leftIcon={<LockIcon />}
              fullWidth
            />
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            disabled={isLoading || isBlocked}
          >
            Войти
          </Button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddAccountModal;
