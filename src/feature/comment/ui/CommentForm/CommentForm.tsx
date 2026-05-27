import { Button, Input } from "@/shared";
import { useCommentForm } from "../../hooks";
import style from "./CommentForm.module.css";

type CommentFormProps = {
  postId: number;
};

/**
 * CommentForm — форма комментария
 * 
 * @param postId - ID поста для привязки комментария
 * @returns JSX-элемент формы комментария
 */
const CommentForm = ({ postId }: CommentFormProps) => {
  const { content, setContent, handleSubmit, isLoading, error } = useCommentForm(postId);

  return (
    <form className={style.form} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <Input
        as="textarea"
        id={`comment-${postId}`}
        value={content ?? undefined}
        onChange={(e) => setContent(e.target.value)}
        placeholder={"> введите текст комментария..."}
        error={error ? `! ${error}` : undefined}
        disabled={isLoading}
        rows={3}
        maxLength={2000}
        fullWidth
        helperText={`[${content?.length ?? 0}/2000]`}
      />

      <div className={style.footer}>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={isLoading}
          disabled={!content.trim()}
          className={style.submitBtn}
        >
          {`[send]`}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;