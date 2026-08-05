import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CommentCard } from "@/entities";
import { CommentForm } from "@/feature";
import { Button } from "@/shared";
import { commentApi, type Comment } from "@/entities/comment/api/commentApi";
import { useCommentList } from "../hooks/useCommentList";
import { usePrefersReducedMotion } from "@/shared/hooks";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { checkPresence, subscribeSocketStatus } from "@/app/lib/socket";
import style from "./CommentList.module.css";

type CommentListProps = {
  postId: number;
  /** false — только первый комментарий; true — до 10 */
  expanded?: boolean;
};

type GhostComment = {
  comment: Comment;
  index: number;
};

const ANIM_MS = 280;
const EXIT_MS = 240;

/**
 * CommentList — список комментариев под постом
 */
const CommentList = ({ postId, expanded = false }: CommentListProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const dispatch = useAppDispatch();
  const { comments, isLoading, isError, error } = useCommentList(postId);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const shellRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLDivElement | null>(null);
  const prevExpandedRef = useRef(expanded);
  const prevCommentsRef = useRef(comments);

  const [renderExpanded, setRenderExpanded] = useState(expanded);
  const [showForm, setShowForm] = useState(expanded);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ghosts, setGhosts] = useState<GhostComment[]>([]);
  const [leavingIds, setLeavingIds] = useState<Set<number>>(() => new Set());

  const setShellHeight = (value: number | "auto") => {
    const shell = shellRef.current;
    if (!shell) return;
    shell.style.height = value === "auto" ? "auto" : `${value}px`;
  };

  const measureShell = () => shellRef.current?.getBoundingClientRect().height ?? 0;
  const measureContent = () => measureRef.current?.scrollHeight ?? 0;
  const measureCollapsed = () => firstItemRef.current?.getBoundingClientRect().height ?? 72;

  useLayoutEffect(() => {
    const wasExpanded = prevExpandedRef.current;
    if (wasExpanded === expanded) return;
    prevExpandedRef.current = expanded;

    const shell = shellRef.current;
    if (!shell) return;

    if (prefersReducedMotion) {
      setRenderExpanded(expanded);
      setShowForm(expanded);
      setShellHeight("auto");
      setIsAnimating(false);
      return;
    }

    if (expanded) {
      const from = measureShell();
      setRenderExpanded(true);
      setShowForm(true);
      setIsAnimating(true);
      setShellHeight(from);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const to = measureContent();
          setShellHeight(to);
        });
      });

      const timer = window.setTimeout(() => {
        setShellHeight("auto");
        setIsAnimating(false);
      }, ANIM_MS);

      return () => window.clearTimeout(timer);
    }

    const from = measureShell();
    const to = measureCollapsed();
    setIsAnimating(true);
    setShellHeight(from);
    setShowForm(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShellHeight(to);
      });
    });

    const timer = window.setTimeout(() => {
      setRenderExpanded(false);
      setShellHeight("auto");
      setIsAnimating(false);
    }, ANIM_MS);

    return () => window.clearTimeout(timer);
  }, [expanded, prefersReducedMotion]);

  useEffect(() => {
    const prev = prevCommentsRef.current;
    const currentIds = new Set(comments.map((c) => c.id));
    const removed = prev
      .map((comment, index) => ({ comment, index }))
      .filter(({ comment }) => !currentIds.has(comment.id));

    prevCommentsRef.current = comments;

    if (removed.length === 0) return;

    if (prefersReducedMotion) {
      setGhosts((g) => g.filter((ghost) => currentIds.has(ghost.comment.id)));
      setLeavingIds(new Set());
      return;
    }

    const removedIds = new Set(removed.map(({ comment }) => comment.id));

    setGhosts((g) => [
      ...g.filter((ghost) => !removedIds.has(ghost.comment.id) && !currentIds.has(ghost.comment.id)),
      ...removed,
    ]);
    setLeavingIds((ids) => {
      const next = new Set(ids);
      removedIds.forEach((id) => next.add(id));
      return next;
    });

    const timer = window.setTimeout(() => {
      setGhosts((g) => g.filter((ghost) => !removedIds.has(ghost.comment.id)));
      setLeavingIds((ids) => {
        const next = new Set(ids);
        removedIds.forEach((id) => next.delete(id));
        return next;
      });
    }, EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [comments, prefersReducedMotion]);

  useEffect(() => {
    const authorIds = comments.map((comment) => comment.author.id);
    if (authorIds.length === 0) return;

    checkPresence(authorIds);

    const unsubscribe = subscribeSocketStatus((status) => {
      if (status === "connected") {
        checkPresence(authorIds);
      }
    });

    return unsubscribe;
  }, [comments]);

  const displayComments = (() => {
    const list = comments.slice();
    const present = new Set(list.map((c) => c.id));
    [...ghosts]
      .sort((a, b) => a.index - b.index)
      .forEach(({ comment, index }) => {
        if (present.has(comment.id)) return;
        list.splice(Math.min(index, list.length), 0, comment);
        present.add(comment.id);
      });
    return list;
  })();

  const visibleComments = displayComments.slice(0, renderExpanded ? 10 : 1);

  const handleDeleteSuccess = useCallback(
    (deletedCommentId: number) => {
      dispatch(
        commentApi.util.updateQueryData("getComments", { postId }, (draft) => {
          draft.comments = draft.comments.filter((c) => c.id !== deletedCommentId);
        })
      );
    },
    [dispatch, postId]
  );

  if (isLoading) {
    return (
      <section className={style.commentList}>
        <div className={style.loading}>Загрузка комментариев...</div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={style.commentList}>
        <div className={style.error}>
          <p>{error || "Ошибка загрузки комментариев"}</p>
          <Button type="button" size="sm" onClick={() => window.location.reload()}>
            Повторить
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={shellRef}
      className={[style.commentList, isAnimating ? style.animating : ""].filter(Boolean).join(" ")}
    >
      <div ref={measureRef} className={style.measure}>
        <div
          className={[
            style.list,
            renderExpanded ? style.listExpanded : style.listCollapsed,
            renderExpanded && displayComments.length > 3 ? style.listScrollable : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {visibleComments.length > 0 ? (
            visibleComments.map((comment, index) => {
              const isLeaving = leavingIds.has(comment.id);
              return (
                <div
                  key={comment.id}
                  ref={index === 0 ? firstItemRef : undefined}
                  className={[
                    style.item,
                    isLeaving ? style.itemLeaving : "",
                    index > 0 && !isLeaving ? style.extraItem : "",
                    !expanded && renderExpanded && index > 0 && !isLeaving
                      ? style.extraItemClosing
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    expanded && index > 0 && !isLeaving
                      ? { animationDelay: `${Math.min(index, 9) * 45}ms` }
                      : undefined
                  }
                >
                  <CommentCard
                    isOwner={comment.author.id === currentUserId}
                    comment={comment}
                    onDeleteSuccess={() => handleDeleteSuccess(comment.id)}
                  />
                </div>
              );
            })
          ) : (
            <div className={style.empty}>
              <p>Комментариев пока нет</p>
            </div>
          )}
        </div>

        {showForm && (
          <div className={style.formWrap}>
            <CommentForm postId={postId} />
          </div>
        )}
      </div>
    </section>
  );
};

export default CommentList;
