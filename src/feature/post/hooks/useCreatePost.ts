import { useState, useCallback } from "react";
import { useCreatePostMutation } from "@/entities/post/api";
import { UseCreatePostReturn } from "../lib";

const MAX_CONTENT_LENGTH = 10000;
const MAX_INLINE_IMAGE_BYTES = 500 * 1024;

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

const getApiErrorMessage = (err: unknown): string => {
  if (!err || typeof err !== "object" || !("data" in err)) {
    return "Не удалось создать пост";
  }

  const data = (err as { data?: { error?: { message?: string }; message?: string } }).data;
  return data?.error?.message ?? data?.message ?? "Не удалось создать пост";
};

/**
 * Хук useCreatePost
 *
 * Управляет состоянием формы создания поста:
 * - Открытие/закрытие формы
 * - Валидация текста и изображений
 * - Отправка данных на сервер через мутацию
 * - Обработка ошибок и сброс формы
 */
export const useCreatePost = (): UseCreatePostReturn => {
  const [createPost, { isLoading }] = useCreatePostMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const openForm = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  const closeForm = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleImageSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) return;

      validFiles.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);

        if (newPreviews.length === validFiles.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages((prev) => [...prev, ...validFiles]);
    setError(null);
  }, []);

  const clearForm = useCallback(() => {
    setContent("");
    setImages([]);
    setImagePreviews([]);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && images.length === 0) {
      setError("Добавьте текст или изображения");
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`Текст слишком длинный (макс. ${MAX_CONTENT_LENGTH} символов)`);
      return;
    }

    try {
      setError(null);

      let imageUrl: string | undefined;

      if (images.length > 0) {
        const firstImage = images[0];

        if (firstImage.size > MAX_INLINE_IMAGE_BYTES) {
          setError("Изображение слишком большое (макс. 500 КБ)");
          return;
        }

        imageUrl = await readFileAsDataUrl(firstImage);
      }

      const trimmedContent = content.trim();

      await createPost({
        ...(trimmedContent ? { content: trimmedContent } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        isPublished: true,
      }).unwrap();

      closeForm();
      clearForm();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    }
  }, [content, images, createPost, closeForm, clearForm]);

  return {
    isOpen,
    content,
    images,
    imagePreviews,
    isLoading,
    error,
    openForm,
    closeForm,
    setContent,
    handleImageSelect,
    removeImage,
    handleSubmit,
    clearForm,
  };
};
