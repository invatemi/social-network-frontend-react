import { useState } from "react";
import { CreateChatModal } from "@/feature";
import style from "./CreateChatButton.module.css";

export type CreateChatButtonVariant = "icon" | "labeled";

export type CreateChatButtonProps = {
  currentUserId: number;
  onChatCreated?: (chatId: number) => void;
  children?: React.ReactNode;
  /** icon — компактный «+»; labeled — full-width CTA с подписью */
  variant?: CreateChatButtonVariant;
};

/**
 * Кнопка для создания нового чата
 */
const CreateChatButton = ({
  currentUserId,
  onChatCreated,
  children,
  variant = "icon",
}: CreateChatButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChatCreated = (chatId: number) => {
    onChatCreated?.(chatId);
    setIsModalOpen(false);
  };

  const isLabeled = variant === "labeled";

  return (
    <>
      <button
        type="button"
        className={[style.button, isLabeled ? style.labeled : ""]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setIsModalOpen(true)}
        aria-label="Создать новый чат"
      >
        {children ??
          (isLabeled ? (
            <>
              <span className={style.chatIcon} aria-hidden />
              <span className={style.label}>Новый чат</span>
            </>
          ) : (
            <span className={style.plus} aria-hidden />
          ))}
      </button>

      <CreateChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onChatCreated={handleChatCreated}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default CreateChatButton;
