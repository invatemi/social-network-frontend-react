import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, Button, Input } from "@/shared";
import { useAppSelector } from "@/app/store/hooks";
import { selectUser } from "@/app/store/slices/authSlice";
import { 
  useRequestPasswordCodeMutation, 
  useVerifyPasswordCodeMutation 
} from "@/app/store/api";
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

  const handleRequestCode = async () => {
    setLocalError(null);
    try {
      await requestCode().unwrap();
      setStep("verify");
      setSuccess(`[code_sent] ${user?.email || "your_email"}`);
    } catch (err: any) {
      setLocalError(err?.data?.message || "! code_send_failed");
    }
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
      setSuccess("[password_changed]");
      setTimeout(() => navigate("/user"), 2000);
    } catch (err: any) {
      setLocalError(err?.data?.message || "! password_change_failed");
    }
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
          <div className={style.step}>
            <p className={style.description}>
              {`// code_will_be_sent_to: ${user?.email}`}
            </p>
            <Button 
              variant="primary" 
              size="md" 
              fullWidth
              loading={isRequesting}
              onClick={handleRequestCode}
              disabled={isLoading}
              className={style.actionButton}
            >
              {isRequesting ? `[sending...]` : `[send_code]`}
            </Button>
          </div>
        )}

        {step === "verify" && (
          <div className={style.step}>
            <div className={style.codeInput}>
              <label>{`> VERIFICATION_CODE`}</label>
              <Input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setVerificationCode(val);
                }}
                error={codeError}
                placeholder={"> 0000"}
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
                fullWidth
                helperText={codeError ? undefined : "[4_digits_from_email]"}
              />
            </div>

            <div className={style.passwordInput}>
              <label>{`> NEW_PASSWORD`}</label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passwordError}
                placeholder={"> min_8_chars"}
                minLength={8}
                fullWidth
                helperText={passwordError ? undefined : "[letter+number]"}
                autoComplete="new-password"
              />
            </div>

            <div className={style.passwordInput}>
              <label>{`> CONFIRM_PASSWORD`}</label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmError}
                placeholder={"> repeat_password"}
                fullWidth
                helperText={confirmError ? undefined : "[must_match]"}
                autoComplete="new-password"
              />
            </div>

            <div className={style.actions}>
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => {
                  setStep("request");
                  setVerificationCode("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setLocalError(null);
                }}
                disabled={isLoading}
                className={style.actionButton}
              >
                {`[back]`}
              </Button>

              <Button 
                variant="primary" 
                size="md"
                loading={isVerifying}
                onClick={handleChangePassword}
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
                {isVerifying ? `[saving...]` : `[save_changes]`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ChangePasswordPage;