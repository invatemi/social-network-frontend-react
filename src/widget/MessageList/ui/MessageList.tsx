import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { MessageCard } from "@/entities";
import type { PhotoItem } from "@/entities/photo";
import type { MessageAttachmentData } from "@/entities/message/api/messagesApi";
import {
  useDeleteMessageMutation,
  useDeleteMessagesBulkMutation,
  useEditMessageMutation,
  useLazyGetMessageUploadUrlQuery,
} from "@/entities/message/api/messagesApi";
import {
  MessageSend,
  PhotoModal,
  MessageFocusOverlay,
  MessageFocusFloating,
  MessageContextMenu,
  MessageForwardModal,
  useMessageFocus,
} from "@/feature";
import type {
  MessageSaveEditPayload,
  MessageSendEditing,
  MessageSendReplying,
} from "@/feature/message/lib/types";
import { uploadMessageAttachments } from "@/feature/message/lib";
import type { MessageContextMenuAction } from "@/feature/message/ui/MessageContextMenu/MessageContextMenu";
import { useToast } from "@/shared";
import { useAppSelector } from "@/app/store/hooks";
import { selectIsUserOnline } from "@/app/store/slices/presenceSlice";
import { useMessageList } from "../hooks/useMessageList";
import {
  formatMessageTime,
  formatMessageDate,
  shouldShowDateSeparator,
  MessageListProps,
  UIMessageData,
} from "../lib";
import style from "./MessageList.module.css";

const DELETE_EXIT_MS = 260;

const waitForExitAnimation = (ms = DELETE_EXIT_MS) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

/** Только реально видимые dialog/menu — скрытые порталы (opacity/pointer-events) не блокируют Esc */
const hasVisibleBlockingOverlay = (): boolean => {
  const nodes = document.querySelectorAll<HTMLElement>(
    '[role="dialog"], [role="menu"]'
  );
  for (const el of nodes) {
    const css = window.getComputedStyle(el);
    if (css.display === "none" || css.visibility === "hidden") continue;
    if (css.pointerEvents === "none") continue;
    if (Number.parseFloat(css.opacity || "1") < 0.05) continue;
    return true;
  }
  return false;
};

/** Два кадра: дать React снять elevated, чтобы exit-анимация шла от видимого пузыря */
const waitNextPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

const toViewerPhotos = (attachments: MessageAttachmentData[]): PhotoItem[] =>
  attachments
    .filter((item) => item.kind === "image")
    .map((item) => ({
      id: item.id,
      url: item.url,
      createdAt: new Date(0).toISOString(),
      year: 0,
      userId: 0,
    }));

/**
 * MessageList — список сообщений
 */
const MessageList = ({
  chatId,
  currentUserId: currentUserIdProp,
  recipient,
  initialMessages = [],
  onSendMessage,
  onBack,
  className = "",
}: MessageListProps) => {
  const [messageText, setMessageText] = useState("");
  const [viewer, setViewer] = useState<{
    photos: PhotoItem[];
    index: number;
  } | null>(null);
  const [editing, setEditing] = useState<MessageSendEditing | null>(null);
  const [replying, setReplying] = useState<MessageSendReplying | null>(null);
  const [exitingIds, setExitingIds] = useState<number[]>([]);
  const [jumpTargetId, setJumpTargetId] = useState<number | null>(null);
  const [forwardOpen, setForwardOpen] = useState(false);
  const jumpTimerRef = useRef<number>(0);
  const lastContainerHeightRef = useRef(0);
  const exitingIdsRef = useRef(exitingIds);
  exitingIdsRef.current = exitingIds;
  const { showToast } = useToast();
  const focus = useMessageFocus();
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [deleteMessagesBulk] = useDeleteMessagesBulkMutation();
  const [fetchUploadUrl] = useLazyGetMessageUploadUrlQuery();
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const authUserId = useAppSelector((state) => state.auth.user?.id ?? 0);
  const currentUserId = currentUserIdProp ?? authUserId;

  const presenceOnline = useAppSelector((state) =>
    selectIsUserOnline(state, recipient.userId)
  );
  const isOnline = presenceOnline || recipient.isOnline;

  const {
    messages,
    isLoading,
    isLoadingMore,
    observerTarget,
    messagesContainerRef,
    handleSendMessage: handleSendFromHook,
    scrollToBottom,
    pendingRemoteExitIds,
    releaseRetainedMessages,
    updateStickToBottom,
    stickToBottomRef,
  } = useMessageList({
    chatId,
    currentUserId,
    initialMessages,
    localExitingIds: exitingIds,
    onSendMessage,
  });

  // Socket/API удаление у наблюдателя — тот же плавный collapse
  useEffect(() => {
    const remoteIds = pendingRemoteExitIds.filter(
      (id) => !exitingIdsRef.current.includes(id)
    );
    if (remoteIds.length === 0) return;

    let cancelled = false;

    const run = async () => {
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!reducedMotion) {
        await waitNextPaint();
      }
      if (cancelled) return;

      setExitingIds((prev) => [...new Set([...prev, ...remoteIds])]);

      if (!reducedMotion) {
        await waitForExitAnimation();
      }
      if (cancelled) return;

      releaseRetainedMessages(remoteIds);
      setExitingIds((prev) => prev.filter((id) => !remoteIds.includes(id)));
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [pendingRemoteExitIds, releaseRetainedMessages]);

  const messagesById = useMemo(() => {
    const map = new Map<number, UIMessageData>();
    for (const message of messages) {
      map.set(message.messageId, message);
    }
    return map;
  }, [messages]);

  const focusedMessage = focus.selectedIds[0]
    ? messagesById.get(focus.selectedIds[0])
    : undefined;
  const isOwnFocused = focusedMessage?.sender === "me";
  const canDeleteSelected = focus.selectedIds.some(
    (id) => messagesById.get(id)?.sender === "me"
  );

  const floatingItems = useMemo(
    () =>
      focus.selectedIds
        .map((id) => messagesById.get(id))
        .filter((message): message is UIMessageData => Boolean(message))
        .map((message) => ({
          messageId: message.messageId,
          sender: message.sender,
          senderName: message.senderName,
          text: message.text,
          timestamp: formatMessageTime(message.createdAt),
          status:
            message.status === "error"
              ? ("sent" as const)
              : message.status === "delivered"
                ? ("delivered" as const)
                : message.status === "read"
                  ? ("read" as const)
                  : ("sent" as const),
          isError: message.isError,
          attachments: message.attachments,
          editedAt: message.editedAt,
          replyTo: message.replyTo
            ? {
                messageId: message.replyTo.messageId,
                authorName: message.replyTo.authorName,
                text: message.replyTo.text,
                timestamp: formatMessageTime(message.replyTo.createdAt),
              }
            : null,
        })),
    [focus.selectedIds, messagesById]
  );

  const initial = recipient.username.charAt(0).toUpperCase();
  const profilePath = recipient.userId > 0 ? `/user/${recipient.userId}` : null;

  const handleSend = async (
    _chatId: number,
    text: string,
    files?: File[],
    options?: { replyToId?: number }
  ) => {
    await handleSendFromHook(text, files, options);
    setMessageText("");
    setReplying(null);
    stickToBottomRef.current = true;
  };

  useEffect(() => {
    setExitingIds([]);
    setEditing(null);
    setReplying(null);
    setJumpTargetId(null);
    if (jumpTimerRef.current) {
      window.clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = 0;
    }
  }, [chatId]);

  useEffect(
    () => () => {
      if (jumpTimerRef.current) window.clearTimeout(jumpTimerRef.current);
    },
    []
  );

  const handleJumpToMessage = useCallback(
    (targetId: number) => {
      if (!messagesById.has(targetId)) {
        showToast("Исходное сообщение недоступно");
        return;
      }

      const el =
        messagesContainerRef.current?.querySelector<HTMLElement>(
          `[data-message-id="${targetId}"]`
        ) ?? null;
      if (!el) {
        showToast("Исходное сообщение недоступно");
        return;
      }

      stickToBottomRef.current = false;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setJumpTargetId(targetId);
      if (jumpTimerRef.current) window.clearTimeout(jumpTimerRef.current);
      jumpTimerRef.current = window.setTimeout(() => {
        setJumpTargetId((current) => (current === targetId ? null : current));
        jumpTimerRef.current = 0;
      }, 1200);
    },
    [messagesById, messagesContainerRef, showToast]
  );

  const handleReplyQuoteClick = useCallback(
    (targetId: number) => {
      if (focus.isActive) {
        focus.close();
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => handleJumpToMessage(targetId));
        });
        return;
      }
      handleJumpToMessage(targetId);
    },
    [focus, handleJumpToMessage]
  );

  const keepLastMessageVisible = useCallback(() => {
    if (!stickToBottomRef.current) return;
    scrollToBottom("auto");
  }, [scrollToBottom, stickToBottomRef]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    stickToBottomRef.current = true;
    lastContainerHeightRef.current = container.clientHeight;

    container.addEventListener("scroll", updateStickToBottom, {
      passive: true,
    });

    // Only re-pin when the viewport height changes (composer/grid), not on content growth
    const ro = new ResizeObserver(() => {
      const nextHeight = container.clientHeight;
      if (nextHeight === lastContainerHeightRef.current) return;
      lastContainerHeightRef.current = nextHeight;
      keepLastMessageVisible();
    });
    ro.observe(container);

    return () => {
      container.removeEventListener("scroll", updateStickToBottom);
      ro.disconnect();
    };
  }, [
    messagesContainerRef,
    updateStickToBottom,
    keepLastMessageVisible,
    stickToBottomRef,
    isLoading,
    chatId,
  ]);

  const copyTexts = async (ids: number[]) => {
    const texts = ids
      .map((id) => messagesById.get(id)?.text?.trim() ?? "")
      .filter(Boolean);
    if (texts.length === 0) {
      showToast("Нет текста для копирования");
      return;
    }
    try {
      await navigator.clipboard.writeText(texts.join("\n\n"));
      showToast("Скопировано");
    } catch {
      showToast("Не удалось скопировать");
    }
  };

  const handleMenuAction = async (action: MessageContextMenuAction) => {
    const ids = focus.selectedIds;
    const primaryId = ids[0];

    switch (action) {
      case "reply": {
        const message = primaryId ? messagesById.get(primaryId) : undefined;
        if (!message) break;
        setEditing(null);
        setReplying({
          messageId: message.messageId,
          authorName: message.senderName || (message.sender === "me" ? "Вы" : "Собеседник"),
          text: message.text,
        });
        focus.close();
        break;
      }
      case "copy":
        await copyTexts(ids);
        if (focus.mode === "focus") focus.close();
        break;
      case "edit": {
        const message = primaryId ? messagesById.get(primaryId) : undefined;
        if (!message || message.sender !== "me") break;
        setReplying(null);
        setEditing({
          messageId: message.messageId,
          text: message.text,
          attachments: message.attachments ?? [],
        });
        focus.close();
        break;
      }
      case "forward":
        setForwardOpen(true);
        break;
      case "report":
        showToast("Жалоба отправлена");
        focus.close();
        break;
      case "delete": {
        const ownIds =
          ids.length === 1 && primaryId
            ? messagesById.get(primaryId)?.sender === "me"
              ? [primaryId]
              : []
            : ids.filter((id) => messagesById.get(id)?.sender === "me");

        if (ownIds.length === 0) {
          showToast("Можно удалять только свои сообщения");
          break;
        }

        // Сначала закрываем focus: пузырь снова видим, иначе exit идёт от visibility:hidden
        focus.close();

        const reducedMotion =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (!reducedMotion) {
          await waitNextPaint();
        }

        setExitingIds((prev) => [...new Set([...prev, ...ownIds])]);

        if (!reducedMotion) {
          await waitForExitAnimation();
        }

        try {
          if (ownIds.length === 1) {
            await deleteMessage({ messageId: ownIds[0] }).unwrap();
          } else {
            await deleteMessagesBulk({ messageIds: ownIds }).unwrap();
          }
          releaseRetainedMessages(ownIds);
          setExitingIds((prev) => prev.filter((id) => !ownIds.includes(id)));
        } catch {
          setExitingIds((prev) => prev.filter((id) => !ownIds.includes(id)));
          showToast("Не удалось удалить сообщение");
        }
        break;
      }
      default:
        break;
    }
  };

  const handleSaveEdit = async (
    messageId: number,
    payload: MessageSaveEditPayload
  ) => {
    setIsSavingEdit(true);
    try {
      const uploaded =
        payload.files && payload.files.length > 0
          ? await uploadMessageAttachments(
              chatId,
              payload.files,
              async (args) =>
                fetchUploadUrl({
                  chatId: args.chatId,
                  contentType: args.contentType,
                  fileName: args.fileName,
                  sizeBytes: args.sizeBytes,
                }).unwrap()
            )
          : undefined;

      await editMessage({
        messageId,
        content: payload.content,
        removeAttachmentIds: payload.removeAttachmentIds,
        attachments: uploaded,
      }).unwrap();
      setEditing(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleEditLastOwnMessage = useCallback(() => {
    if (editing || replying) return;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.sender === "me") {
        setReplying(null);
        setEditing({
          messageId: message.messageId,
          text: message.text,
          attachments: message.attachments ?? [],
        });
        return;
      }
    }
  }, [editing, messages, replying]);

  // ArrowUp — edit последнего; Escape — слои: edit/reply → overlays → закрыть чат
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (editing) {
          event.preventDefault();
          setEditing(null);
          setMessageText("");
          return;
        }

        if (replying) {
          event.preventDefault();
          setReplying(null);
          return;
        }

        // Focus / forward / photo / видимые dialog|menu — чужие Esc-handlers
        if (focus.isActive || forwardOpen || viewer || isSavingEdit) return;
        if (event.defaultPrevented) return;
        if (hasVisibleBlockingOverlay()) return;
        if (!onBack) return;

        event.preventDefault();
        onBack();
        return;
      }

      if (event.key !== "ArrowUp") return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (editing || replying || focus.isActive || forwardOpen || isSavingEdit) {
        return;
      }
      if (messageText.trim()) return;

      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        const isFormField =
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          active.isContentEditable;

        if (isFormField) {
          const isComposer = active.id === `message-input-${chatId}`;
          if (!isComposer) return;

          const textarea = active as HTMLTextAreaElement;
          if (textarea.value.trim()) return;
          if (textarea.selectionStart !== 0 || textarea.selectionEnd !== 0) {
            return;
          }
        }
      }

      event.preventDefault();
      handleEditLastOwnMessage();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    chatId,
    editing,
    replying,
    focus.isActive,
    forwardOpen,
    viewer,
    handleEditLastOwnMessage,
    isSavingEdit,
    messageText,
    onBack,
  ]);

  if (isLoading) {
    return (
      <div className={`${style.container} ${className}`}>
        <div className={style.emptyState}>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  const profileContent = (
    <>
      <div className={style.avatarWrapper}>
        {recipient.avatarUrl ? (
          <img src={recipient.avatarUrl} alt="" className={style.avatar} />
        ) : (
          <div className={style.avatarPlaceholder}>{initial}</div>
        )}
        <span
          className={[style.onlineDot, isOnline ? style.online : style.offline]
            .filter(Boolean)
            .join(" ")}
        />
      </div>

      <div className={style.userInfo}>
        <span className={style.username}>{recipient.username}</span>
        {recipient.email ? (
          <span className={style.email}>{recipient.email}</span>
        ) : (
          <span className={style.email}>
            {isOnline ? "Онлайн" : "Не в сети"}
          </span>
        )}
      </div>
    </>
  );

  return (
    <div className={`${style.container} ${className}`}>
      <div className={style.header}>
        {onBack ? (
          <button
            type="button"
            className={style.backButton}
            onClick={onBack}
            aria-label="Назад к списку чатов"
          >
            ←
          </button>
        ) : null}

        {profilePath ? (
          <Link
            to={profilePath}
            className={style.profileLink}
            aria-label={`Профиль ${recipient.username}`}
          >
            {profileContent}
          </Link>
        ) : (
          <div className={style.profileLink}>{profileContent}</div>
        )}

        {focus.mode === "multi" ? (
          <button
            type="button"
            className={style.cancelSelect}
            onClick={focus.close}
          >
            Готово
          </button>
        ) : null}
      </div>

      <div ref={messagesContainerRef} className={style.messagesContainer}>
        {isLoadingMore ? (
          <div className={style.loadMoreIndicator}>Загрузка истории...</div>
        ) : null}

        <div ref={observerTarget} />

        {messages.length === 0 ? (
          <div className={style.emptyState}>
            <p className={style.emptyText}>Нет сообщений</p>
            <p className={style.emptySubtext}>Напишите первым</p>
          </div>
        ) : (
          messages.map((message: UIMessageData, index: number) => {
            const previousMessage = messages[index - 1];
            const showDateSeparator = shouldShowDateSeparator(
              message.createdAt,
              previousMessage?.createdAt
            );
            const isSelected = focus.selectedIds.includes(message.messageId);
            const isFocused =
              focus.isActive &&
              (focus.mode === "focus"
                ? isSelected
                : focus.mode === "multi" && isSelected);
            const isExiting = exitingIds.includes(message.messageId);

            return (
              <div
                key={message.messageId}
                className={[
                  style.messageRow,
                  isExiting ? style.exiting : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onContextMenu={(event) => {
                  if (isExiting) return;
                  focus.openFocus(
                    message.messageId,
                    event,
                    message.sender === "me" ? "end" : "start"
                  );
                }}
                onDoubleClick={(event) => {
                  if (isExiting) return;
                  focus.openFocus(
                    message.messageId,
                    event,
                    message.sender === "me" ? "end" : "start"
                  );
                }}
              >
                <div className={style.messageRowInner}>
                  {showDateSeparator ? (
                    <div className={style.dateSeparator}>
                      <span className={style.dateText}>
                        {formatMessageDate(message.createdAt)}
                      </span>
                    </div>
                  ) : null}

                  <MessageCard
                    messageId={message.messageId}
                    sender={message.sender}
                    senderName={message.senderName}
                    text={message.text}
                    timestamp={formatMessageTime(message.createdAt)}
                    status={message.status === "error" ? "sent" : message.status}
                    isError={message.isError}
                    attachments={message.attachments}
                    editedAt={message.editedAt}
                    replyTo={
                      message.replyTo
                        ? {
                            messageId: message.replyTo.messageId,
                            authorName: message.replyTo.authorName,
                            text: message.replyTo.text,
                            timestamp: formatMessageTime(
                              message.replyTo.createdAt
                            ),
                          }
                        : null
                    }
                    isJumpTarget={jumpTargetId === message.messageId}
                    isFocused={isFocused}
                    isEditingTarget={editing?.messageId === message.messageId}
                    isSelected={isSelected && focus.mode === "multi"}
                    selectionMode={focus.mode === "multi"}
                    onSelectToggle={() => focus.toggleSelect(message.messageId)}
                    onReplyQuoteClick={handleReplyQuoteClick}
                    onImageClick={(imageIndex) => {
                      if (focus.isActive) return;
                      const photos = toViewerPhotos(message.attachments ?? []);
                      if (photos.length === 0) return;
                      setViewer({
                        photos,
                        index: Math.min(imageIndex, photos.length - 1),
                      });
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageSend
        chatId={chatId}
        value={messageText}
        onChange={setMessageText}
        onSend={handleSend}
        isLoading={isLoadingMore || isSavingEdit}
        disabled={!recipient || isLoading || focus.isActive}
        placeholder="Сообщение"
        maxLength={2000}
        autoFocus
        onComposerHeightChange={keepLastMessageVisible}
        editing={editing}
        onCancelEdit={() => {
          setEditing(null);
          setMessageText("");
        }}
        onSaveEdit={handleSaveEdit}
        replying={replying}
        onCancelReply={() => setReplying(null)}
      />

      <MessageFocusOverlay visible={focus.isActive} onClose={focus.close} />
      <MessageFocusFloating
        visible={focus.isActive}
        selectedIds={focus.selectedIds}
        items={floatingItems}
        selectionMode={focus.mode === "multi"}
        onSelectToggle={focus.toggleSelect}
        onReplyQuoteClick={handleReplyQuoteClick}
      />
      <MessageContextMenu
        visible={focus.isActive && !forwardOpen}
        anchor={focus.anchor}
        isOwn={Boolean(isOwnFocused)}
        canDelete={canDeleteSelected}
        multi={focus.mode === "multi"}
        selectedCount={focus.selectedIds.length}
        onAction={handleMenuAction}
      />
      <MessageForwardModal
        isOpen={forwardOpen}
        messageIds={focus.selectedIds}
        excludeChatId={chatId}
        onClose={() => {
          setForwardOpen(false);
          focus.close();
        }}
        onForwarded={() => showToast("Сообщения пересланы")}
      />

      {viewer ? (
        <PhotoModal
          photos={viewer.photos}
          index={viewer.index}
          onClose={() => setViewer(null)}
          onIndexChange={(nextIndex) =>
            setViewer((prev) => (prev ? { ...prev, index: nextIndex } : prev))
          }
          variant="media"
        />
      ) : null}
    </div>
  );
};

export default MessageList;
