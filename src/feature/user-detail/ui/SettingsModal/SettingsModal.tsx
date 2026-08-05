import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { env } from "@/shared/config/env";
import { useUserProfile } from "@/feature/profile";
import { useAvatarUpload } from "../../useAvatarUpload";
import { useProfileSave } from "../../useProfileSave";
import { useUserDetailForm } from "../../useUserDetailForm";
import { useChangePassword } from "../../useChangePassword";
import style from "./SettingsModal.module.css";

export type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ImagePlaceholderIcon = () => (
  <svg
    className={style.avatarPlaceholder}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
    <path
      d="M3 16l5-4 3 2.5L16 10l5 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * SettingsModal — редактирование профиля и смена пароля
 */
const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useUserProfile();

  const {
    username,
    email,
    bio,
    location,
    setUsername,
    setEmail,
    setBio,
    setLocation,
    isProfileChanged,
  } = useUserDetailForm(user);

  const {
    avatarPreview,
    avatarFile,
    openFilePicker,
    handleFileChange,
    reset: resetAvatar,
    error: avatarError,
    fileInputRef,
  } = useAvatarUpload(user?.avatarUrl || null);

  const { isSaving, saveError, saveSuccess, saveProfile, clearMessages } =
    useProfileSave();

  const password = useChangePassword();

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || isSaving || password.isLoading) return;
      e.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSaving, password.isLoading, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current) modalRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      password.reset();
      clearMessages();
      resetAvatar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only on close
  }, [isOpen]);

  useEffect(() => {
    if (!saveSuccess && !saveError) return;
    const timer = setTimeout(clearMessages, env.ui.profileMessageTimeoutMs);
    return () => clearTimeout(timer);
  }, [saveSuccess, saveError, clearMessages]);

  const handleSave = async () => {
    const saved = await saveProfile({
      username,
      email,
      bio,
      location,
      avatarFile,
      isProfileChanged,
      currentUser: user,
    });

    if (saved) {
      resetAvatar();
      setTimeout(() => onClose(), env.ui.profileRedirectDelayMs);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSaving && !password.isLoading) {
      onClose();
    }
  };

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    void password.requestCode();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    void password.changePassword();
  };

  if (!isOpen) return null;

  const busy = isSaving || password.isLoading || loading;

  const content = (
    <div
      className={style.overlay}
      onClick={handleOverlayClick}
      role="presentation"
      data-testid="settings-modal-overlay"
    >
      <div
        ref={modalRef}
        className={style.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        tabIndex={-1}
        data-testid="settings-modal"
      >
        <h2 id="settings-modal-title" className={style.title}>
          Настройки
        </h2>

        <div className={style.body}>
          <div className={style.avatarColumn}>
            <button
              type="button"
              className={style.avatarBox}
              onClick={openFilePicker}
              aria-label="Сменить фото"
              disabled={busy}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt=""
                  className={style.avatarImg}
                />
              ) : (
                <ImagePlaceholderIcon />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className={style.fileInput}
            />
            <button
              type="button"
              className={style.changePhotoBtn}
              onClick={openFilePicker}
              disabled={busy}
            >
              Сменить фото
            </button>
          </div>

          <div className={style.formColumn}>
            <div className={style.messages}>
              {saveSuccess && (
                <div className={style.success} role="status">
                  {saveSuccess}
                </div>
              )}
              {(saveError || avatarError) && (
                <div className={style.error} role="alert">
                  {saveError || avatarError}
                </div>
              )}
              {password.success && (
                <div className={style.success} role="status">
                  {password.success}
                </div>
              )}
              {password.error && (
                <div className={style.error} role="alert">
                  {password.error}
                </div>
              )}
            </div>

            <label className={style.field}>
              <span className={style.label}>Никнейм</span>
              <input
                className={style.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Никнейм"
                maxLength={20}
                disabled={busy}
                autoComplete="username"
              />
            </label>

            <label className={style.field}>
              <span className={style.label}>Email</span>
              <input
                className={style.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                disabled={busy}
                autoComplete="email"
              />
            </label>

            <label className={style.field}>
              <span className={style.label}>Статус</span>
              <input
                className={style.input}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Статус"
                maxLength={200}
                disabled={busy}
              />
            </label>

            <label className={style.field}>
              <span className={style.label}>Локация</span>
              <input
                className={style.input}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Локация"
                maxLength={100}
                disabled={busy}
              />
            </label>

            <div className={style.passwordSection}>
              <h3 className={style.passwordTitle}>Сменить пароль</h3>

              {password.step === "request" ? (
                <form onSubmit={handleRequestCode}>
                  <p className={style.passwordHint}>
                    Код будет отправлен на: {password.email || "ваш email"}
                  </p>
                  <button
                    type="submit"
                    className={style.passwordBtn}
                    disabled={busy}
                  >
                    {password.isRequesting ? "Отправка..." : "Отправить код"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleChangePassword}>
                  <label className={style.field}>
                    <span className={style.label}>Код подтверждения</span>
                    <input
                      className={style.input}
                      value={password.verificationCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        password.setVerificationCode(val);
                      }}
                      placeholder="0000"
                      maxLength={4}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      disabled={busy}
                    />
                    {password.codeError && (
                      <span className={style.error}>{password.codeError}</span>
                    )}
                  </label>

                  <label className={style.field}>
                    <span className={style.label}>Новый пароль</span>
                    <input
                      className={style.input}
                      type="password"
                      value={password.newPassword}
                      onChange={(e) => password.setNewPassword(e.target.value)}
                      placeholder="минимум 8 символов"
                      minLength={8}
                      autoComplete="new-password"
                      disabled={busy}
                    />
                    {password.passwordError && (
                      <span className={style.error}>
                        {password.passwordError}
                      </span>
                    )}
                  </label>

                  <label className={style.field}>
                    <span className={style.label}>Подтверждение пароля</span>
                    <input
                      className={style.input}
                      type="password"
                      value={password.confirmPassword}
                      onChange={(e) =>
                        password.setConfirmPassword(e.target.value)
                      }
                      placeholder="повторите пароль"
                      autoComplete="new-password"
                      disabled={busy}
                    />
                    {password.confirmError && (
                      <span className={style.error}>
                        {password.confirmError}
                      </span>
                    )}
                  </label>

                  <div className={style.passwordActions}>
                    <button
                      type="button"
                      className={style.passwordSecondaryBtn}
                      onClick={password.goToRequestStep}
                      disabled={busy}
                    >
                      Назад
                    </button>
                    <button
                      type="submit"
                      className={style.passwordBtn}
                      disabled={
                        busy ||
                        password.verificationCode.length !== 4 ||
                        !password.newPassword ||
                        !password.confirmPassword ||
                        !!password.passwordError ||
                        !!password.confirmError
                      }
                    >
                      {password.isVerifying ? "Сохранение..." : "Сохранить пароль"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <button
              type="button"
              className={style.saveBtn}
              onClick={() => void handleSave()}
              disabled={
                busy || (!isProfileChanged && !avatarFile)
              }
            >
              {isSaving ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default SettingsModal;
