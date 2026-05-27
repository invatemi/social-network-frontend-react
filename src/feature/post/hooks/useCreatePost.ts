import { useState, useCallback } from "react";
import { useCreatePostMutation } from "@/entities/post/api";
import { UseCreatePostReturn } from "../lib";

/**
 * Хук useCreatePost
 * 
 * Управляет состоянием формы создания поста:
 * - Открытие/закрытие формы
 * - Валидация текста и изображений
 * - Отправка данных на сервер через мутацию
 * - Обработка ошибок и сброс формы
 * 
 * @returns Объект с состояниями и методами для управления формой
 */
export const useCreatePost = (): UseCreatePostReturn => {

  const [createPost, { isLoading }] = useCreatePostMutation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  /** Открыть форму создания поста */
  const openForm = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  /** Закрыть форму и очистить ошибку */
  const closeForm = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  /** Удалить изображение по индексу (из файлов и превью) */
  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Обработать выбор файлов из input
   * - Фильтрует только изображения
   * - Проверяет размер (макс. 10MB)
   * - Создаёт превью через FileReader
   */
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

  /**
   * Отправить пост на сервер
   * - Валидирует контент (текст или изображения)
   * - Формирует FormData для multipart-запроса
   * - Отправляет через мутацию
   * - При успехе: закрывает форму и сбрасывает поля
   * - При ошибке: показывает сообщение пользователю
   */
  const handleSubmit = useCallback(async () => {
    // Валидация: должен быть текст ИЛИ изображения
    if (!content.trim() && images.length === 0) {
      setError("Добавьте текст или изображения");
      return;
    }

    if (content.length > 5000) {
      setError("Текст слишком длинный (макс. 5000 символов)");
      return;
    }

    try {
      setError(null);

      const formData = new FormData();
      formData.append("content", content);
      images.forEach((image) => {
        formData.append("images", image);
      });
      await createPost(formData).unwrap();

      closeForm();
      clearForm();

    } catch (err: any) {
      setError(err?.data?.message || "Не удалось создать пост");
    }
  }, [content, images, createPost, closeForm, clearForm]);
  
  return {
    // Состояния
    isOpen,
    content,
    images,
    imagePreviews,
    isLoading,
    error,
    
    // Методы
    openForm,
    closeForm,
    setContent,
    handleImageSelect,
    removeImage,
    handleSubmit,
    clearForm,
  };
};