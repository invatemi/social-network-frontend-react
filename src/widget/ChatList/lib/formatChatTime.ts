/**
 * Форматирует время последнего сообщения для отображения
 */
export const formatChatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Сегодня
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  // Вчера
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  }
  
  // Эта неделя
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  }
  
  // Старые сообщения
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short' 
  });
};

/**
 * Определяет секцию времени для группировки чатов
 */
export const getTimeGroup = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (date.toDateString() === now.toDateString()) {
    return 'Сегодня';
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  }
  
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return 'Эта неделя';
  }
  
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return 'Этот месяц';
  }
  
  return 'Старые';
};