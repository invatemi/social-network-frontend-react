import { useState, useMemo } from 'react';
import { getTimeGroup } from '../lib';
import { ChatData } from '@/entities/message/api/messagesApi';

type UseChatListReturn = {
  groupedChats: Record<string, ChatData[]>;
  filteredChats: ChatData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  activeChatId: number | null;
  setActiveChatId: (chatId: number) => void;
};

export const useChatList = (
  chats: ChatData[],
  isLoading: boolean = false
): UseChatListReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    const query = searchQuery.toLowerCase();
    return chats.filter((chat) =>
      chat.chatName?.toLowerCase().includes(query) ||
      chat.participant?.username.toLowerCase().includes(query) ||
      chat.lastMessage?.content.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  const groupedChats = useMemo(() => {
    const groups: Record<string, ChatData[]> = {};
    
    filteredChats.forEach((chat) => {
      const timestamp = 
        chat.lastMessage?.createdAt || 
        chat.lastMessageAt || 
        new Date().toISOString();
      
      const group = getTimeGroup(timestamp);
      if (!groups[group]) groups[group] = [];
      groups[group].push(chat);
    });
    
    const groupOrder = ['Сегодня', 'Вчера', 'Эта неделя', 'Этот месяц', 'Старые'];
    const sortedGroups: Record<string, ChatData[]> = {};
    
    groupOrder.forEach((group) => {
      if (groups[group]) {
        sortedGroups[group] = groups[group].sort(
          (a, b) => {
            const aTime = a.lastMessage?.createdAt || a.lastMessageAt || '';
            const bTime = b.lastMessage?.createdAt || b.lastMessageAt || '';
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          }
        );
      }
    });
    
    return sortedGroups;
  }, [filteredChats]);

  return {
    groupedChats,
    filteredChats,
    searchQuery,
    setSearchQuery,
    isLoading,
    activeChatId,
    setActiveChatId,
  };
};