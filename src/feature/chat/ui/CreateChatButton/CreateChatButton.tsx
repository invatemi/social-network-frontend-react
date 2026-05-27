import { useState } from 'react';
import { CreateChatModal } from "@/feature"
import { Button } from '@/shared';

export type CreateChatButtonProps = {
  currentUserId: number;
  onChatCreated?: (chatId: number) => void;
  variant?: 'primary' | 'ghost';
  children?: React.ReactNode;
};

/**
 * Кнопка для создания нового чата
 * 
 * @description
 * Открывает модальное окно со списком друзей.
 * При выборе друга автоматически создаётся личный чат.
 */
const CreateChatButton = ({
  currentUserId,
  onChatCreated,
  variant = 'ghost',
  children = 'Новый чат',
}: CreateChatButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChatCreated = (chatId: number) => {
    onChatCreated?.(chatId);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setIsModalOpen(true)}
        aria-label="Создать новый чат"
      >
        {children}
      </Button>

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