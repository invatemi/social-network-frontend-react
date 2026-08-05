import { useEffect, useRef, useCallback, type RefObject } from "react";

type UseInfiniteScrollProps = {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  /** Scroll container — without it observer uses viewport and fires incorrectly */
  rootRef?: RefObject<HTMLElement | null>;
};

/**
 * Infinite scroll вверх (история сообщений).
 * IntersectionObserver root = контейнер списка, не viewport.
 */
export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  isLoading,
  rootRef,
}: UseInfiniteScrollProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(isLoading);
  const onLoadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
      void onLoadMoreRef.current();
    }
  }, []);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const root = rootRef?.current ?? null;
    const observer = new IntersectionObserver(handleObserver, {
      root,
      rootMargin: "120px 0px 0px 0px",
      threshold: 0,
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, [handleObserver, rootRef, hasMore]);

  return { observerTarget };
};
