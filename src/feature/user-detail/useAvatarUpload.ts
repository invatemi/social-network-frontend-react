import { useEffect, useState, useRef } from "react";

type UseAvatarUploadReturn = {
  avatarPreview: string | null;
  avatarFile: File | null;
  openFilePicker: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reset: () => void;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Хук useAvatarUpload
 * 
 * Управляет загрузкой и предпросмотром аватара:
 * - Валидация файла (тип, размер)
 * - Создание превью через FileReader
 * - Управление input[type="file"] через ref
 * - Сброс состояния после успешной загрузки
 * 
 * @param initialAvatarUrl - Текущий аватар пользователя (для начального превью)
 * @returns Объект с состояниями и методами для управления загрузкой аватара
 */
export const useAvatarUpload = (initialAvatarUrl: string | null): UseAvatarUploadReturn => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(initialAvatarUrl);
    }
  }, [avatarFile, initialAvatarUrl]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      setError("Файл слишком большой. Максимум 5MB");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Только изображения: JPG, PNG, WEBP");
      return;
    }

    setAvatarFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setAvatarFile(null);
    setError(null);
  };

  return {
    avatarPreview,
    avatarFile,
    openFilePicker,
    handleFileChange,
    reset,
    error,
    fileInputRef,
  };
};