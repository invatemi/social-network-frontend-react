/**
 * Данные для создания нового поста.
 * 
 * @description
 * Используется как входные параметры для мутации создания поста
 * или как состояние формы в хуках управления созданием контента.
 */
export type PostData = {
  content: string;
  images: File[];
};

/**
 * Возвращаемое значение хука управления формой создания поста.
 * 
 * @description
 * Предоставляет состояние формы, обработчики изменений и методы
 * для открытия/закрытия модального окна, работы с изображениями
 * и отправки поста на сервер.
 */
export type UseCreatePostReturn = {
  isOpen: boolean;
  content: string;
  images: File[];
  imagePreviews: string[];
  isLoading: boolean;
  error: string | null;
  openForm: () => void;
  closeForm: () => void;
  setContent: (content: string) => void;
  handleImageSelect: (files: FileList | null) => void;
  removeImage: (index: number) => void;
  handleSubmit: () => Promise<void>;
  clearForm: () => void;
};