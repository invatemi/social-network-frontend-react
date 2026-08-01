import type { ReactElement, ReactNode } from "react";
import style from "./MessagesView.module.css";

export type MessagesViewProps = {
  hasActiveChat: boolean;
  isMobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
  sidebarHeader: ReactNode;
  sidebarList: ReactNode;
  thread?: ReactNode;
  details?: ReactNode;
  /** Ключ активного чата — перезапускает мягкий fade при смене диалога */
  contentKey?: string | number | null;
};

/**
 * MessagesView — layout-shell для MessagePage (idle ↔ 3 колонки)
 */
const MessagesView = ({
  hasActiveChat,
  isMobileSidebarOpen,
  onCloseMobileSidebar,
  sidebarHeader,
  sidebarList,
  thread,
  details,
  contentKey,
}: MessagesViewProps): ReactElement => {
  return (
    <div
      className={[
        style.root,
        hasActiveChat ? style.rootActive : style.rootIdle,
      ].join(" ")}
      data-testid="messages-view"
      data-active={hasActiveChat ? "true" : "false"}
    >
      {isMobileSidebarOpen && hasActiveChat ? (
        <div
          className={style.overlay}
          onClick={onCloseMobileSidebar}
          aria-hidden="true"
          data-testid="messages-overlay"
        />
      ) : null}

      <aside
        className={[
          style.sidebar,
          isMobileSidebarOpen ? style.open : "",
          hasActiveChat ? style.sidebarHiddenMobile : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Список чатов"
        data-testid="messages-sidebar"
      >
        <div className={style.sidebarHeader}>{sidebarHeader}</div>
        <div className={style.chatList}>{sidebarList}</div>
      </aside>

      {hasActiveChat ? (
        <>
          <section
            key={`thread-${contentKey ?? "active"}`}
            className={style.thread}
            data-testid="messages-thread"
          >
            {thread}
          </section>
          <div
            key={`details-${contentKey ?? "active"}`}
            className={style.details}
            data-testid="messages-details"
          >
            {details}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default MessagesView;
