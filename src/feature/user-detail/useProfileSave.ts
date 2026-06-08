import { useState } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { updateUser } from "@/app/store/slices/authSlice";

import { 
  useUpdateUserProfileMutation,
} from "@/entities/user/api/userApi";

import { UserProfile } from "@/entities/user/lib";

type SaveProfileParams = {
  username: string;
  email: string;
  bio: string;
  location: string;
  avatarFile: File | null;
  isProfileChanged: boolean;
  currentUser: UserProfile | null;
};

type UseProfileSaveReturn = {
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: string | null;
  saveProfile: (params: SaveProfileParams) => Promise<boolean>;
  clearMessages: () => void;
};

/**
 * Хук useProfileSave
 * 
 * Управляет сохранением профиля пользователя:
 * - Обновление имени/почты/био/локации через мутацию
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
    isProfileChanged,
    currentUser,
  }: SaveProfileParams) => {

    if (!isProfileChanged && !avatarFile) {
      setSaveError("Нет изменений для сохранения");
      return false;
    }

    setIsSaving(true);
    clearMessages();

    try {
      if (avatarFile) {
        throw new Error("Загрузка файла аватара пока не поддержана user-service. Нужен endpoint upload или сохранение публичного avatarUrl.");
      }

      if (isProfileChanged) {
        const result = await updateProfile({ 
          username, 
          email, 
          bio, 
          location 
        }).unwrap();
        
        if (currentUser) {
          dispatch(updateUser({ ...currentUser, ...result.user }));
        }
      }
      
      setSaveSuccess("Профиль успешно обновлён");
      return true;

    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err?.data?.message || err.message || "Ошибка при сохранении");
      return false;
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