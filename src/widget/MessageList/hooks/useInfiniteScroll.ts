import { useEffect, useRef, useCallback } from 'react';

/**
 * Пропсы для хука бесконечной прокрутки.
 * 
 * @description
 * Используется для настройки поведения загрузки контента при прокрутке
 * в направлении вверх (например, история сообщений в чате).
 */
type UseInfiniteScrollProps = {
  /** 
   * Асинхронный колбэк для загрузки предыдущей страницы данных.
   * Вызывается, когда элемент-триггер появляется в области видимости.
   */
  onLoadMore: () => Promise<void>;
  
  /** 
   * Флаг наличия дополнительных данных для загрузки.
   * Если `false`, загрузка не будет инициирована даже при пересечении триггера.
   */
  hasMore: boolean;
  
  /** 
   * Флаг текущей загрузки: предотвращает множественные параллельные запросы.
   * Используется через `ref` внутри хука для избежания устаревших замыканий.
   */
  isLoading: boolean;
};

/**
 * Хук для реализации бесконечной прокрутки вверх (загрузка более старых данных).
 * 
 * @description
 * Использует `IntersectionObserver` для отслеживания видимости целевого элемента
 * (обычно размещается в начале списка). При появлении элемента в области видимости
 * и при соблюдении условий (`hasMore === true`, `isLoading === false`) вызывается
 * колбэк `onLoadMore` для загрузки предыдущей страницы данных.
 * 
 * @param props - Конфигурация хука {@link UseInfiniteScrollProps}
 * @param props.onLoadMore - Функция загрузки данных
 * @param props.hasMore - Флаг наличия следующих страниц
 * @param props.isLoading - Флаг текущей загрузки
 * 
 * @returns Объект с рефом для целевого элемента:
 * - `observerTarget`: реф, который необходимо прикрепить к элементу-триггеру в начале списка
 * 
 * @example
 * // Использование в компоненте списка сообщений
 * const { observerTarget } = useInfiniteScroll({
 *   onLoadMore: loadOlderMessages,
 *   hasMore: messagesResponse.hasMore,
 *   isLoading: isFetching,
 * });
 * 
 * return (
 *   <div className="message-list">
 *     <div ref={observerTarget} className="scroll-trigger" />
 *     {messages.map(msg => <Message key={msg.id} {...msg} />)}
 *   </div>
 * );
 * 
 * @remarks
 * - `rootMargin: '100px'` создаёт буферную зону для предзагрузки до того,
 *   как пользователь достигнет самого верха списка
 * - `isLoading` передаётся через `ref`, чтобы избежать проблем со stale closure
 *   в колбэке `IntersectionObserver`
 */
export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  isLoading,
}: UseInfiniteScrollProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
        onLoadMore();
      }
    },
    [hasMore, onLoadMore]
  );

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px 0px',
      threshold: 0,
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [handleObserver]);

  return { observerTarget };
};