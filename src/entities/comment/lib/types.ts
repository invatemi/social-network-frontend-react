/**
 * Представляет автора комментария.
 */
export type CommentAuthor = {
  id: number;
  username: string;
  avatarUrl?: string | null;
};

/**
 * Структура комментария к посту.
 */
export type Comment = {
  id: number;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  postId: number;
};

/**
 * Данные, необходимые для создания нового комментария.
 */
export type CreateCommentInput = {
  content: string;
  postId: number;
};

/**
 * Структура ответа API при получении списка комментариев.
 */
export type CommentListResponse = {
  comments: Comment[];
};

export type CommentCardProps = {
  comment: Comment;
  isOwner: boolean;
  onDeleteSuccess : ()=> void
};