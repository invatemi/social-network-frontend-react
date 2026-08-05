import { useCallback, useEffect, useState, type MouseEvent } from "react";

export type MessageFocusMode = "idle" | "focus" | "multi";

export type MessageFocusAnchor = {
  top: number;
  left: number;
  width: number;
  height: number;
  originX: number;
  originY: number;
  /** Горизонтальное выравнивание меню относительно пузыря */
  align: "start" | "end";
};

type UseMessageFocusReturn = {
  mode: MessageFocusMode;
  selectedIds: number[];
  anchor: MessageFocusAnchor | null;
  isActive: boolean;
  openFocus: (messageId: number, event: MouseEvent, align?: "start" | "end") => void;
  enterMulti: () => void;
  toggleSelect: (messageId: number) => void;
  close: () => void;
  setSelectedIds: (ids: number[]) => void;
};

const resolveBubbleRect = (
  event: MouseEvent,
  messageId: number
): DOMRect => {
  const row = event.currentTarget as HTMLElement;
  const card =
    row.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`) ?? row;
  const bubble =
    card.querySelector<HTMLElement>("[data-message-bubble]") ?? card;
  return bubble.getBoundingClientRect();
};

const toAnchor = (
  event: MouseEvent,
  messageId: number,
  align: "start" | "end"
): MessageFocusAnchor => {
  const rect = resolveBubbleRect(event, messageId);
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    originX: event.clientX,
    originY: event.clientY,
    align,
  };
};

/**
 * Состояние focus/multi-select меню сообщений
 */
export const useMessageFocus = (): UseMessageFocusReturn => {
  const [mode, setMode] = useState<MessageFocusMode>("idle");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [anchor, setAnchor] = useState<MessageFocusAnchor | null>(null);

  const close = useCallback(() => {
    setMode("idle");
    setSelectedIds([]);
    setAnchor(null);
  }, []);

  const openFocus = useCallback(
    (
      messageId: number,
      event: MouseEvent,
      align: "start" | "end" = "start"
    ) => {
      event.preventDefault();
      event.stopPropagation();
      setMode("focus");
      setSelectedIds([messageId]);
      setAnchor(toAnchor(event, messageId, align));
    },
    []
  );

  const enterMulti = useCallback(() => {
    setMode("multi");
  }, []);

  const toggleSelect = useCallback((messageId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(messageId)) {
        const next = prev.filter((id) => id !== messageId);
        if (next.length === 0) {
          setMode("idle");
          setAnchor(null);
          return [];
        }
        return next;
      }
      return [...prev, messageId];
    });
    setMode("multi");
  }, []);

  useEffect(() => {
    if (mode === "idle") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mode, close]);

  return {
    mode,
    selectedIds,
    anchor,
    isActive: mode !== "idle",
    openFocus,
    enterMulti,
    toggleSelect,
    close,
    setSelectedIds,
  };
};
