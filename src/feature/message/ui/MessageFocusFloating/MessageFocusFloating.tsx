import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCard } from "@/entities";
import type { MessageCardProps } from "@/entities/message/lib";
import style from "./MessageFocusFloating.module.css";

type FloatingRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type MessageFocusFloatingItem = Pick<
  MessageCardProps,
  | "messageId"
  | "sender"
  | "senderName"
  | "text"
  | "timestamp"
  | "status"
  | "isError"
  | "attachments"
  | "editedAt"
  | "replyTo"
>;

export type MessageFocusFloatingProps = {
  visible: boolean;
  selectedIds: number[];
  items: MessageFocusFloatingItem[];
  selectionMode?: boolean;
  onSelectToggle?: (messageId: number) => void;
  onReplyQuoteClick?: (messageId: number) => void;
};

/**
 * MessageFocusFloating — копии выбранных сообщений над blur-overlay
 */
const MessageFocusFloating = ({
  visible,
  selectedIds,
  items,
  selectionMode = false,
  onSelectToggle,
  onReplyQuoteClick,
}: MessageFocusFloatingProps) => {
  const [rects, setRects] = useState<Record<number, FloatingRect>>({});

  useLayoutEffect(() => {
    if (!visible || selectedIds.length === 0) {
      setRects({});
      return;
    }

    const next: Record<number, FloatingRect> = {};
    for (const id of selectedIds) {
      const el = document.querySelector<HTMLElement>(
        `[data-message-id="${id}"]`
      );
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      next[id] = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    }
    setRects(next);
  }, [visible, selectedIds, items]);

  if (!visible || typeof document === "undefined") return null;

  const selectedItems = selectedIds
    .map((id) => items.find((item) => item.messageId === id))
    .filter((item): item is MessageFocusFloatingItem => Boolean(item));

  return createPortal(
    <div className={style.layer} aria-hidden>
      {selectedItems.map((item) => {
        const rect = rects[item.messageId];
        if (!rect) return null;

        return (
          <div
            key={item.messageId}
            className={[
              style.item,
              selectionMode ? style.itemInteractive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
            }}
          >
            <MessageCard
              messageId={item.messageId}
              sender={item.sender}
              senderName={item.senderName}
              text={item.text}
              timestamp={item.timestamp}
              status={item.status}
              isError={item.isError}
              attachments={item.attachments}
              editedAt={item.editedAt}
              replyTo={item.replyTo}
              isSelected={selectionMode}
              selectionMode={selectionMode}
              onSelectToggle={
                selectionMode
                  ? () => onSelectToggle?.(item.messageId)
                  : undefined
              }
              onReplyQuoteClick={onReplyQuoteClick}
            />
          </div>
        );
      })}
    </div>,
    document.body
  );
};

export default MessageFocusFloating;
