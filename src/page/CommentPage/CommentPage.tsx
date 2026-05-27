import { ReactElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout, Button } from "@/shared";
import { CommentList } from "@/widget";
import style from "./CommentPage.module.css";

/**
 * CommentPage — страница комментариев
 * 
 * @route /post/:postId/comments
 */
const CommentPage = (): ReactElement => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();

  const handleBack = () => navigate(-1);

  if (!postId || isNaN(Number(postId))) {
    return (
      <PageLayout
        title={"> comments"}
        error={"! invalid_post_id"}
        onRetry={handleBack}
        hideFooter={true}
      >
        <Button variant="primary" size="md" onClick={handleBack} className={style.errorButton}>
          {`[go_back]`}
        </Button>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      contentClassName={style.contentWrapper}
      hideFooter={true}
    >
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack}
        className={style.backButton}
      >
        {`[<] post`}
      </Button>

      <CommentList postId={Number(postId)} />
    </PageLayout>
  );
};

export default CommentPage;