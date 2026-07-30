import { useState } from "react";
import { useAppSelector } from "@/app/store/hooks";
import { selectUser } from "@/app/store/slices/authSlice";
import {
  useRequestPasswordCodeMutation,
  useVerifyPasswordCodeMutation,
} from "@/app/store/api";

type PasswordStep = "request" | "verify";

type UseChangePasswordReturn = {
  step: PasswordStep;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
  setVerificationCode: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  codeError: string | undefined;
  passwordError: string | undefined;
  confirmError: string | undefined;
  error: string | null;
  success: string | null;
  isRequesting: boolean;
  isVerifying: boolean;
  isLoading: boolean;
  email: string | undefined;
  requestCode: () => Promise<void>;
  changePassword: () => Promise<boolean>;
  goToRequestStep: () => void;
  clearMessages: () => void;
  reset: () => void;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as {
    data?: { message?: string; error?: { message?: string } };
    message?: string;
  };
  return e?.data?.message || e?.data?.error?.message || e?.message || fallback;
};

/**
 * useChangePassword — смена пароля (request code → verify)
 */
export const useChangePassword = (): UseChangePasswordReturn => {
  const user = useAppSelector(selectUser);
  const [requestCodeMutation, { isLoading: isRequesting }] =
    useRequestPasswordCodeMutation();
  const [verifyCodeMutation, { isLoading: isVerifying }] =
    useVerifyPasswordCodeMutation();

  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<PasswordStep>("request");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const codeError =
    verificationCode && verificationCode.length !== 4
      ? "Код должен содержать 4 цифры"
      : undefined;

  const passwordError =
    newPassword && newPassword.length < 8
      ? "Минимум 8 символов"
      : undefined;

  const confirmError =
    confirmPassword && newPassword !== confirmPassword
      ? "Пароли не совпадают"
      : undefined;

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const goToRequestStep = () => {
    setStep("request");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    clearMessages();
  };

  const reset = () => {
    goToRequestStep();
  };

  const requestCode = async () => {
    clearMessages();
    try {
      await requestCodeMutation().unwrap();
      setStep("verify");
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(`Код отправлен на ${user?.email || "ваш email"}`);
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось отправить код"));
    }
  };

  const changePassword = async (): Promise<boolean> => {
    if (verificationCode.length !== 4) {
      setError("Код должен содержать 4 цифры");
      return false;
    }
    if (newPassword.length < 8) {
      setError("Минимум 8 символов");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return false;
    }

    clearMessages();
    try {
      await verifyCodeMutation({
        code: verificationCode,
        newPassword,
      }).unwrap();
      setSuccess("Пароль успешно изменён");
      setStep("request");
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось изменить пароль"));
      return false;
    }
  };

  return {
    step,
    verificationCode,
    newPassword,
    confirmPassword,
    setVerificationCode,
    setNewPassword,
    setConfirmPassword,
    codeError,
    passwordError,
    confirmError,
    error,
    success,
    isRequesting,
    isVerifying,
    isLoading: isRequesting || isVerifying,
    email: user?.email,
    requestCode,
    changePassword,
    goToRequestStep,
    clearMessages,
    reset,
  };
};
