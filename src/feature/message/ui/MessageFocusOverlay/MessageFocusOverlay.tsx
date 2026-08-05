import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "@/shared/hooks";
import style from "./MessageFocusOverlay.module.css";

export type MessageFocusOverlayProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * MessageFocusOverlay — scrim для focus-режима сообщений
 */
const MessageFocusOverlay = ({ visible, onClose }: MessageFocusOverlayProps) => {
  const reducedMotion = usePrefersReducedMotion();

  if (typeof document === "undefined" || !visible) return null;

  return createPortal(
    <div
      className={[
        style.overlay,
        !reducedMotion ? style.overlayBlur : "",
        style.overlayVisible,
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={(event) => {
        if (event.button !== 0 && event.button !== 2) return;
        onClose();
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-hidden={false}
    />,
    document.body
  );
};

export default MessageFocusOverlay;
