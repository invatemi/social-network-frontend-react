const getRequiredEnv = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }

  return value;
};

const parseNumber = (key: keyof ImportMetaEnv): number => {
  const value = getRequiredEnv(key);
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`[env] Environment variable ${key} must be a finite number`);
  }

  return parsed;
};

const parseBoolean = (key: keyof ImportMetaEnv): boolean => {
  const value = getRequiredEnv(key).toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(value)) return true;
  if (['0', 'false', 'no', 'off'].includes(value)) return false;

  throw new Error(`[env] Environment variable ${key} must be a boolean`);
};

const parseStringList = (key: keyof ImportMetaEnv): string[] => {
  const items = getRequiredEnv(key)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) {
    throw new Error(`[env] Environment variable ${key} must contain at least one value`);
  }

  return items;
};

export const env = {
  apiUrl: getRequiredEnv('VITE_API_URL'),
  wsUrl: getRequiredEnv('VITE_WS_URL'),

  socket: {
    transports: parseStringList('VITE_SOCKET_TRANSPORTS'),
    reconnection: parseBoolean('VITE_SOCKET_RECONNECTION'),
    reconnectionAttempts: parseNumber('VITE_SOCKET_RECONNECTION_ATTEMPTS'),
    reconnectionDelayMs: parseNumber('VITE_SOCKET_RECONNECTION_DELAY_MS'),
    subscribeMaxRetries: parseNumber('VITE_SOCKET_SUBSCRIBE_MAX_RETRIES'),
    subscribeRetryDelayMs: parseNumber('VITE_SOCKET_SUBSCRIBE_RETRY_DELAY_MS'),
  },

  messages: {
    defaultChatLimit: parseNumber('VITE_MESSAGES_CHAT_LIMIT'),
    defaultMessageLimit: parseNumber('VITE_MESSAGES_MESSAGE_LIMIT'),
    messageListPageSize: parseNumber('VITE_MESSAGE_LIST_PAGE_SIZE'),
    scrollToBottomDelayMs: parseNumber('VITE_MESSAGE_SCROLL_TO_BOTTOM_DELAY_MS'),
  },

  posts: {
    defaultFeedLimit: parseNumber('VITE_POST_FEED_LIMIT'),
    feedCacheSeconds: parseNumber('VITE_POST_FEED_CACHE_SECONDS'),
  },

  search: {
    debounceMs: parseNumber('VITE_SEARCH_DEBOUNCE_MS'),
    minQueryLength: parseNumber('VITE_SEARCH_MIN_QUERY_LENGTH'),
  },

  ui: {
    friendStatusRefetchDelayMs: parseNumber('VITE_FRIEND_STATUS_REFETCH_DELAY_MS'),
    profileMessageTimeoutMs: parseNumber('VITE_PROFILE_MESSAGE_TIMEOUT_MS'),
    profileRedirectDelayMs: parseNumber('VITE_PROFILE_REDIRECT_DELAY_MS'),
    passwordRedirectDelayMs: parseNumber('VITE_PASSWORD_REDIRECT_DELAY_MS'),
  },

  socialLinks: {
    telegram: getRequiredEnv('VITE_SOCIAL_TELEGRAM_URL'),
    github: getRequiredEnv('VITE_SOCIAL_GITHUB_URL'),
    vk: getRequiredEnv('VITE_SOCIAL_VK_URL'),
  },
} as const;
