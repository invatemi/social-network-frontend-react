import type { KeyboardEvent, MouseEvent, ReactElement } from "react";
import type { PhotoItem } from "../../lib/type";
import style from "./PhotoCard.module.css";

export type PhotoCardProps = {
  photo: PhotoItem;
  className?: string;
  onClick?: (photo: PhotoItem) => void;
  onDelete?: (photo: PhotoItem) => void;
  canDelete?: boolean;
};

/**
 * PhotoCard — превью фото из истории аватаров
 */
const PhotoCard = ({
  photo,
  className,
  onClick,
  onDelete,
  canDelete = false,
}: PhotoCardProps): ReactElement => {
  const interactive = Boolean(onClick);

  const handleClick = () => {
    onClick?.(photo);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(photo);
    }
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    onDelete?.(photo);
  };

  return (
    <article
      className={[style.card, interactive ? style.clickable : "", className]
        .filter(Boolean)
        .join(" ")}
      data-testid="photo-card"
      onClick={interactive ? handleClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? "Открыть фото" : undefined}
    >
      <img
        src={photo.url}
        alt=""
        className={style.image}
        loading="lazy"
      />
      {canDelete && onDelete && (
        <button
          type="button"
          className={style.deleteBtn}
          onClick={handleDelete}
          aria-label="Удалить фото"
          data-testid="photo-card-delete"
        >
          ×
        </button>
      )}
    </article>
  );
};

export default PhotoCard;
