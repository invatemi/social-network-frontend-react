/**
 * Пропсы для компонента карточки поста.
 * 
 * @description
 * Отображает пост с контентом, изображениями, статистикой и действиями
 * (лайк, удаление). Поддерживает проверку прав на редактирование.
 */
export type PostCardProps = {
  post: Post;
  onLike?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  currentUserId?: number;
};

/**
 * Представляет автора поста.
 */
export type PostAuthor = {
  id: number;
  username: string;
  avatarUrl?: string | null;
};

/**
 * Структура поста в приложении.
 */
export type Post = {
  id: number;
  content: string;
  images?: string[];
  isPublished?: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  author: PostAuthor;
  isLiked?: boolean;
};

/**
 * Структура ответа API при получении списка постов с пагинацией.
 */
export type PostListResponse = {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};