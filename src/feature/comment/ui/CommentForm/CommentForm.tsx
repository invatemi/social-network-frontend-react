import { useId } from "react";
import { useCommentForm } from "../../hooks";
import { SendIcon } from "@/entities/post/ui/icons";
import style from "./CommentForm.module.css";

type CommentFormProps = {
  postId: number;
};

/**
 * CommentForm — форма комментария с кнопкой отправки внутри поля
 */
const CommentForm = ({ postId }: CommentFormProps) => {
  const gradientId = useId().replace(/:/g, "");
  const { content, setContent, handleSubmit, isLoading, error } = useCommentForm(postId);

  return (
    <form
      className={style.form}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className={style.inputBar}>
        <input
          id={`comment-${postId}`}
          className={style.input}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Сообщение"
          disabled={isLoading}
          maxLength={2000}
          aria-label="Текст комментария"
        />

        <button
          type="submit"
          className={style.sendButton}
          disabled={isLoading || !content.trim()}
          aria-label="Отправить комментарий"
        >
          <SendIcon gradientId={gradientId} className={style.sendIcon} />
        </button>
      </div>

      {error && <p className={style.error}>{error}</p>}
    </form>
  );
};

export default CommentForm;
