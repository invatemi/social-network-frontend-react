import { useState, useCallback } from "react";
import {
  useCreatePostMutation,
  useLazyGetPostImageUploadUrlQuery,
} from "@/entities/post/api";
import { UseCreatePostReturn } from "../lib";
import { uploadPostImageToStorage } from "../lib/uploadPostImage";

const MAX_CONTENT_LENGTH = 10000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const getApiErrorMessage = (err: unknown): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

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
 * - Загрузка изображения в MinIO и создание поста
 * - Обработка ошибок и сброс формы
 */
export const useCreatePost = (): UseCreatePostReturn => {
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [getPostImageUploadUrl] = useLazyGetPostImageUploadUrlQuery();

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
      if (file.size > MAX_IMAGE_BYTES) return;

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

    if (images.length > 1) {
      setError("Можно прикрепить только одно изображение");
      return;
    }

    try {
      setError(null);

      let imageUrl: string | undefined;

      if (images.length > 0) {
        const firstImage = images[0];

        if (firstImage.size > MAX_IMAGE_BYTES) {
          setError("Изображение слишком большое (макс. 10 МБ)");
          return;
        }

        imageUrl = await uploadPostImageToStorage(firstImage, (args) =>
          getPostImageUploadUrl(args).unwrap()
        );
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
  }, [content, images, createPost, getPostImageUploadUrl, closeForm, clearForm]);

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
