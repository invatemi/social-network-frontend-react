/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_SOCKET_TRANSPORTS: string;
  readonly VITE_SOCKET_RECONNECTION: string;
  readonly VITE_SOCKET_RECONNECTION_ATTEMPTS: string;
  readonly VITE_SOCKET_RECONNECTION_DELAY_MS: string;
  readonly VITE_SOCKET_SUBSCRIBE_MAX_RETRIES: string;
  readonly VITE_SOCKET_SUBSCRIBE_RETRY_DELAY_MS: string;
  readonly VITE_MESSAGES_CHAT_LIMIT: string;
  readonly VITE_MESSAGES_MESSAGE_LIMIT: string;
  readonly VITE_MESSAGE_LIST_PAGE_SIZE: string;
  readonly VITE_MESSAGE_SCROLL_TO_BOTTOM_DELAY_MS: string;
  readonly VITE_POST_FEED_LIMIT: string;
  readonly VITE_POST_FEED_CACHE_SECONDS: string;
  readonly VITE_SEARCH_DEBOUNCE_MS: string;
  readonly VITE_SEARCH_MIN_QUERY_LENGTH: string;
  readonly VITE_FRIEND_STATUS_REFETCH_DELAY_MS: string;
  readonly VITE_PROFILE_MESSAGE_TIMEOUT_MS: string;
  readonly VITE_PROFILE_REDIRECT_DELAY_MS: string;
  readonly VITE_PASSWORD_REDIRECT_DELAY_MS: string;
  readonly VITE_SOCIAL_TELEGRAM_URL: string;
  readonly VITE_SOCIAL_GITHUB_URL: string;
  readonly VITE_SOCIAL_VK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
