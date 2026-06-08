import { ReactElement, useEffect } from "react";
import { PageLayout, Button } from "@/shared";

import { 
  useUserProfile, 
  useUserDetailForm, 
  useAvatarUpload, 
  useProfileSave, 
  usePasswordNavigation 
} from "@/feature";

import { 
  UsernameCard,
  EmailCard, 
  ChangePasswordCard,
  DescriptionCard,
  LocationCard
} from "@/entities";
import { env } from "@/shared/config/env";

import style from "./UserDetailPage.module.css";

/**
 * UserDetailPage — редактирование профиля
 */
const UserDetailPage = (): ReactElement => {
  const { user, loading, error, refetch } = useUserProfile();
  
  const { 
    username, 
    email, 
    bio,
    location, 
    setUsername, 
    setEmail, 
    setBio,
    setLocation, 
    isProfileChanged 
  } = useUserDetailForm(user);
  
  const { 
    avatarPreview, 
    avatarFile, 
    openFilePicker, 
    handleFileChange, 
    reset, 
    error: avatarError,
    fileInputRef
   } = useAvatarUpload(user?.avatarUrl || null);
  
  const { isSaving, saveError, saveSuccess, saveProfile, clearMessages } = 
    useProfileSave();
  
  const { goToPasswordChange, goBack } = usePasswordNavigation();

  useEffect(() => {
    if (saveSuccess || saveError) {
      const timer = setTimeout(clearMessages, env.ui.profileMessageTimeoutMs);
      return () => clearTimeout(timer);
    }
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
      reset();
      setTimeout(() => goBack(), env.ui.profileRedirectDelayMs);
    }
  };

  return (
    <PageLayout
      isLoading={loading}
      error={error ? `! ${error}` : null}
      onRetry={refetch}
      mainClassName={style.main}
      contentClassName={style.contentWrapper}
      hideFooter={true}
    >
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={goBack} 
        className={style.backButton}
      >
        {`[<] profile`}
      </Button>

      {saveSuccess && <div className={style.saveSuccess}>{`[saved]`}</div>}
      {(saveError || avatarError) && (
        <div className={style.saveError}>
          {`! ${saveError || avatarError}`}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearMessages} 
            className={style.errorCloseBtn}
            aria-label="Закрыть уведомление"
          >
            {`[X]`}
          </Button>
        </div>
      )}

      <div className={style.bentoGrid}>
        
        <div className={`${style.card} ${style.cardAvatar}`}>
          <h3 className={style.cardTitle}>{`> AVATAR`}</h3>
          <div className={style.avatarSection}>
            <div className={style.avatarContainer} onClick={openFilePicker}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className={style.avatar} />
              ) : (
                <div className={style.avatarPlaceholder}>{`[${username.charAt(0).toUpperCase()}]`}</div>
              )}
              <div className={style.avatarOverlay}><span>{`[change]`}</span></div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={style.fileInput}
              hidden
            />
            <p className={style.avatarHint}>{`// jpg_png_webp_max_5mb`}</p>
          </div>
        </div>

        <UsernameCard value={username} onChange={setUsername} />
        <EmailCard value={email} onChange={setEmail} />
        <DescriptionCard value={bio} onChange={setBio} />
        <LocationCard value={location} onChange={setLocation} />

        <ChangePasswordCard 
          onClick={goToPasswordChange} 
          disabled={isSaving} 
        />

        <div className={`${style.card} ${style.cardActions}`}>
          <div className={style.actionButtons}>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={goBack} 
              disabled={isSaving}
              className={style.actionButton}
            >
              {`[cancel]`}
            </Button>
            <Button 
              variant="primary" 
              size="lg"
              loading={isSaving}
              onClick={handleSave}
              disabled={isSaving || (!isProfileChanged && !avatarFile)}
              className={style.actionButton}
            >
              {isSaving ? `[saving...]` : `[save]`}
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default UserDetailPage;