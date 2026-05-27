/**
 * Форматирует время сообщения для отображения в интерфейсе.
 * 
 * @param dateString - ISO-строка даты и времени сообщения
 * @returns Строка времени в формате "ЧЧ:ММ" (например, "14:30")
 * 
 * @example
 * formatMessageTime("2024-04-15T14:30:00Z") // "14:30"
 */
export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Форматирует дату сообщения для отображения разделителей в ленте чата.
 * 
 * @param dateString - ISO-строка даты и времени сообщения
 * @returns Человеко-читаемая строка даты:
 * - `"Сегодня"` — если сообщение отправлено сегодня
 * - `"Вчера"` — если сообщение отправлено вчера
 * - `"Понедельник"`, `"Вторник"` и т.д. — если сообщение отправлено на этой неделе
 * - `"15 апреля"` или `"15 апреля 2023"` — для более старых сообщений
 * 
 * @example
 * formatMessageDate("2024-04-15T14:30:00Z") // "Сегодня"
 * formatMessageDate("2024-04-14T10:00:00Z") // "Вчера"
 * formatMessageDate("2024-04-10T08:15:00Z") // "Среда"
 * formatMessageDate("2023-12-25T20:00:00Z") // "25 декабря 2023"
 */
export const formatMessageDate = (dateString: string): string => {
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
    return date.toLocaleDateString('ru-RU', { weekday: 'long' });
  }
  
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Определяет, нужно ли показать разделитель даты между двумя сообщениями.
 * 
 * @description
 * Используется при рендеринге списка сообщений для группировки по датам.
 * Разделитель показывается, если предыдущее сообщение отсутствует
 * или если даты текущего и предыдущего сообщений различаются.
 * 
 * @param currentDate - ISO-строка даты текущего сообщения
 * @param previousDate - ISO-строка даты предыдущего сообщения (опционально)
 * @returns `true`, если необходимо показать разделитель даты
 * 
 * @example
 * // Первое сообщение в списке — всегда показываем разделитель
 * shouldShowDateSeparator("2024-04-15T14:30:00Z") // true
 * 
 * // Сообщения в один день — разделитель не нужен
 * shouldShowDateSeparator("2024-04-15T15:00:00Z", "2024-04-15T14:30:00Z") // false
 * 
 * // Сообщения в разные дни — показываем разделитель
 * shouldShowDateSeparator("2024-04-16T10:00:00Z", "2024-04-15T23:59:00Z") // true
 */
export const shouldShowDateSeparator = (
  currentDate: string,
  previousDate?: string
): boolean => {
  if (!previousDate) return true;
  
  const current = new Date(currentDate);
  const previous = new Date(previousDate);
  
  return current.toDateString() !== previous.toDateString();
};