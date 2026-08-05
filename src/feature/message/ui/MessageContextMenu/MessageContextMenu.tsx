import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AlertIcon,
  CopyIcon,
  EditIcon,
  ForwardIcon,
  ReplyIcon,
  TrashIcon,
} from "@/shared/ui/icons";
import type { MessageFocusAnchor } from "../../lib/useMessageFocus";
import style from "./MessageContextMenu.module.css";

export type MessageContextMenuAction =
  | "reply"
  | "copy"
  | "edit"
  | "forward"
  | "report"
  | "delete";

export type MessageContextMenuProps = {
  visible: boolean;
  anchor: MessageFocusAnchor | null;
  isOwn: boolean;
  canDelete: boolean;
  multi: boolean;
  selectedCount: number;
  onAction: (action: MessageContextMenuAction) => void;
};

type Position = { top: number; left: number; origin: string };

type MenuItem = {
  action: MessageContextMenuAction;
  label: string;
  icon: ReactNode;
  destructive?: boolean;
  hide?: boolean;
  dividerBefore?: boolean;
};

const VIEWPORT_PADDING = 12;
const GAP = 8;

const computePosition = (
  anchor: MessageFocusAnchor,
  menuWidth: number,
  menuHeight: number
): Position => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = anchor.top + anchor.height + GAP;
  let origin = "center top";

  if (top + menuHeight > vh - VIEWPORT_PADDING) {
    const above = anchor.top - menuHeight - GAP;
    if (above >= VIEWPORT_PADDING) {
      top = above;
      origin = "center bottom";
    } else {
      top = Math.min(
        Math.max(VIEWPORT_PADDING, top),
        vh - menuHeight - VIEWPORT_PADDING
      );
    }
  }

  let left =
    anchor.align === "end"
      ? anchor.left + anchor.width - menuWidth
      : anchor.left;

  left = Math.min(
    Math.max(VIEWPORT_PADDING, left),
    vw - menuWidth - VIEWPORT_PADDING
  );

  return { top, left, origin };
};

/**
 * MessageContextMenu — меню действий над сообщением
 */
const MessageContextMenu = ({
  visible,
  anchor,
  isOwn,
  canDelete,
  multi,
  selectedCount,
  onAction,
}: MessageContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({
    top: 0,
    left: 0,
    origin: "center top",
  });

  useLayoutEffect(() => {
    if (!visible || !anchor || !menuRef.current) return;

    const menu = menuRef.current;
    const menuWidth = menu.offsetWidth || 228;
    const menuHeight = menu.offsetHeight || 280;

    setPosition(computePosition(anchor, menuWidth, menuHeight));
  }, [visible, anchor, multi, selectedCount, isOwn, canDelete]);

  if (typeof document === "undefined" || !visible) return null;

  const singleItems: MenuItem[] = [
    {
      action: "reply",
      label: "Ответить",
      icon: <ReplyIcon size={18} className={style.icon} />,
    },
    {
      action: "copy",
      label: "Скопировать",
      icon: <CopyIcon size={18} className={style.icon} />,
    },
    {
      action: "edit",
      label: "Редактировать",
      icon: <EditIcon size={18} className={style.icon} />,
      hide: !isOwn,
    },
    {
      action: "forward",
      label: "Переслать",
      icon: <ForwardIcon size={18} className={style.icon} />,
    },
    {
      action: "report",
      label: "Пожаловаться",
      icon: <AlertIcon size={18} className={style.icon} />,
      hide: isOwn,
      dividerBefore: true,
    },
    {
      action: "delete",
      label: "Удалить",
      icon: <TrashIcon size={18} className={style.icon} />,
      destructive: true,
      hide: !isOwn,
      dividerBefore: true,
    },
  ];

  const multiItems: MenuItem[] = [
    {
      action: "copy",
      label: "Скопировать",
      icon: <CopyIcon size={18} className={style.icon} />,
    },
    {
      action: "forward",
      label: `Переслать (${selectedCount})`,
      icon: <ForwardIcon size={18} className={style.icon} />,
    },
    {
      action: "delete",
      label: `Удалить (${selectedCount})`,
      icon: <TrashIcon size={18} className={style.icon} />,
      destructive: true,
      hide: !canDelete,
      dividerBefore: true,
    },
  ];

  const items = (multi ? multiItems : singleItems).filter((item) => !item.hide);

  return createPortal(
    <div
      ref={menuRef}
      className={style.menu}
      style={{
        top: position.top,
        left: position.left,
        transformOrigin: position.origin,
      }}
      role="menu"
      onClick={(event) => event.stopPropagation()}
    >
      {multi ? (
        <p className={style.count}>Выбрано: {selectedCount}</p>
      ) : null}
      {items.map((item, index) => (
        <div key={item.action}>
          {item.dividerBefore ? <div className={style.divider} /> : null}
          <button
            type="button"
            className={[style.item, item.destructive ? style.destructive : ""]
              .filter(Boolean)
              .join(" ")}
            style={{ animationDelay: `calc(var(--stagger) * ${index + 1})` }}
            role="menuitem"
            onClick={() => onAction(item.action)}
          >
            <span>{item.label}</span>
            {item.icon}
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default MessageContextMenu;
