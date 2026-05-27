import { ChatData } from "@/entities/message/api/messagesApi"; 

export type ChatListProps = {
  chats?: ChatData[];
  onChatSelect?: (chatId: number) => void;
  activeChatId?: number | null;
  className?: string;
};