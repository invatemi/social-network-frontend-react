import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, Button, Input } from "@/shared";
import { useAppSelector } from "@/app/store/hooks";
import { selectUser } from "@/app/store/slices/authSlice";
import { 
  useRequestPasswordCodeMutation, 
  useVerifyPasswordCodeMutation 
} from "@/app/store/api";
import { env } from "@/shared/config/env";
import style from "./ChangePasswordPage.module.css";

/**
 * ChangePasswordPage — смена пароля
 */
const ChangePasswordPage = (): ReactElement => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const [requestCode, { isLoading: isRequesting }] = useRequestPasswordCodeMutation();
  const [verifyCode, { isLoading: isVerifying }] = useVerifyPasswordCodeMutation();
  
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const codeError = verificationCode && verificationCode.length !== 4 
    ? "! code_must_be_4_digits" 
    : undefined;
    
  const passwordError = newPassword && newPassword.length < 8 
    ? "! min_8_chars_required" 
    : undefined;
    
  const confirmError = confirmPassword && newPassword !== confirmPassword 
    ? "! passwords_mismatch" 
    : undefined;

  const getErrorMessage = (err: any, fallback: string): string =>
    err?.data?.message ||
    err?.data?.error?.message ||
    err?.message ||
    fallback;

  const handleRequestCode = async () => {
    setLocalError(null);
    setSuccess(null);
    try {
      await requestCode().unwrap();
      setStep("verify");
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(`Код отправлен на ${user?.email || "ваш email"}`);
    } catch (err: any) {
      setLocalError(getErrorMessage(err, "Не удалось отправить код"));
    }
  };

  const handleRequestCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleRequestCode();
  };

  const handleChangePassword = async () => {
    if (verificationCode.length !== 4) {
      setLocalError("! code_must_be_4_digits");
      return;
    }
    if (newPassword.length < 8) {
      setLocalError("! min_8_chars_required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("! passwords_mismatch");
      return;
    }

    setLocalError(null);
    try {
      await verifyCode({ code: verificationCode, newPassword }).unwrap();
      setSuccess("Пароль успешно изменён");
      setTimeout(() => navigate("/user"), env.ui.passwordRedirectDelayMs);
    } catch (err: any) {
      setLocalError(getErrorMessage(err, "Не удалось изменить пароль"));
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void handleChangePassword();
  };

  const handleBack = () => navigate("/user/settings");
  
  const isLoading = isRequesting || isVerifying;

  return (
    <PageLayout
      isLoading={isLoading}
      contentClassName={style.contentWrapper}
      hideFooter={true}
    >
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack} 
        className={style.backButton}
      >
        {`[<] settings`}
      </Button>

      {success && <div className={style.success}>{success}</div>}
      {localError && (
        <div className={style.error}>
          {localError}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocalError(null)} 
            className={style.errorCloseBtn}
            aria-label="Закрыть уведомление"
          >
            {`[X]`}
          </Button>
        </div>
      )}

      <div className={style.card}>
        {step === "request" && (
          <form className={style.step} onSubmit={handleRequestCodeSubmit}>
            <p className={style.description}>
              {`Код будет отправлен на: ${user?.email}`}
            </p>
            <Button 
              type="submit"
              variant="primary" 
              size="md" 
              fullWidth
              loading={isRequesting}
              disabled={isLoading}
              className={style.actionButton}
            >
              {isRequesting ? "Отправка..." : "Отправить код"}
            </Button>
          </form>
        )}

        {step === "verify" && (
          <form className={style.step} onSubmit={handleChangePasswordSubmit}>
            <div className={style.codeInput}>
              <label htmlFor="verification-code">{`Код подтверждения`}</label>
              <Input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setVerificationCode(val);
                }}
                error={codeError}
                placeholder="0000"
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
                fullWidth
                autoComplete="one-time-code"
                helperText={codeError ? undefined : "4 цифры из письма. При повторной отправке старый код недействителен."}
              />
            </div>

            <div className={style.passwordInput}>
              <label htmlFor="new-password">{`Новый пароль`}</label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passwordError}
                placeholder="минимум 8 символов"
                minLength={8}
                fullWidth
                helperText={passwordError ? undefined : "минимум 8 символов"}
                autoComplete="new-password"
              />
            </div>

            <div className={style.passwordInput}>
              <label htmlFor="confirm-password">{`Подтверждение пароля`}</label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmError}
                placeholder="повторите пароль"
                fullWidth
                helperText={confirmError ? undefined : "должен совпадать с новым паролем"}
                autoComplete="new-password"
              />
            </div>

            <div className={style.actions}>
              <Button 
                type="button"
                variant="secondary" 
                size="md"
                onClick={() => {
                  setStep("request");
                  setVerificationCode("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setLocalError(null);
                  setSuccess(null);
                }}
                disabled={isLoading}
                className={style.actionButton}
              >
                Назад
              </Button>

              <Button 
                type="submit"
                variant="primary" 
                size="md"
                loading={isVerifying}
                disabled={
                  isLoading || 
                  verificationCode.length !== 4 || 
                  !newPassword || 
                  !confirmPassword ||
                  !!passwordError ||
                  !!confirmError
                }
                className={style.actionButton}
              >
                {isVerifying ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageLayout>
  );
};

export default ChangePasswordPage;