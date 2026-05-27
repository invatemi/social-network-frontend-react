import { useState } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { updateUser } from "@/app/store/slices/authSlice";

import { 
  useUpdateUserProfileMutation, 
  useUploadAvatarMutation, 
  useConfirmPasswordMutation,
  useNotifyEmailChangedMutation,
} from "@/entities/user/api/userApi";

import { UserProfile } from "@/entities/user/lib";

type SaveProfileParams = {
  username: string;
  email: string;
  bio: string;
  location: string;
  avatarFile: File | null;
  confirmPassword: string;
  isProfileChanged: boolean;
  currentUser: UserProfile | null;
};

type UseProfileSaveReturn = {
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: string | null;
  saveProfile: (params: SaveProfileParams) => Promise<void>;
  clearMessages: () => void;
};

/**
 * Хук useProfileSave
 * 
 * Управляет сохранением профиля пользователя:
 * - Валидация изменений и подтверждение паролем
 * - Обновление имени/почты/био/локации через мутацию
 * - Загрузка аватара с синхронизацией Redux
 * - Отправка уведомления о смене почты
 * - Обработка ошибок и статусов
 * 
 * @returns Объект с состояниями сохранения и методом saveProfile
 */
export const useProfileSave = (): UseProfileSaveReturn => {
  const dispatch = useAppDispatch();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [updateProfile] = useUpdateUserProfileMutation();
  const [uploadAvatar] = useUploadAvatarMutation();
  const [confirmPasswordMutation] = useConfirmPasswordMutation();
  const [notifyEmailChanged] = useNotifyEmailChangedMutation();

  const clearMessages = () => {
    setSaveError(null);
    setSaveSuccess(null);
  };

  const saveProfile = async ({
    username,
    email,
    bio,
    location,
    avatarFile,
    confirmPassword,
    isProfileChanged,
    currentUser,
  }: SaveProfileParams) => {

    if (isProfileChanged && !confirmPassword) {
      setSaveError("Введите текущий пароль для подтверждения");
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      if (isProfileChanged) {
        await confirmPasswordMutation({ password: confirmPassword }).unwrap();
      }

      if (isProfileChanged) {
        await updateProfile({ 
          username, 
          email, 
          bio, 
          location 
        }).unwrap();
        
        if (email !== currentUser?.email) {
          await notifyEmailChanged({ newEmail: email }).unwrap();
        }
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        
        const result = await uploadAvatar(formData).unwrap();
        
        if (result?.avatarUrl && currentUser) {
          dispatch(updateUser({ ...currentUser, avatarUrl: result.avatarUrl }));
        }
      }
      
      setSaveSuccess("✅ Профиль успешно обновлён!");

    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err?.data?.message || err.message || "Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveError,
    saveSuccess,
    saveProfile,
    clearMessages,
  };
};