const DEFAULT_RETRY_AFTER_SECONDS = 60;

export interface RateLimitErrorData {
  retryAfterSeconds: number;
  message: string;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface RateLimitFetchError {
  status: 429;
  data: RateLimitErrorData;
}

export function parseRetryAfterSeconds(response?: Response): number {
  const header = response?.headers.get("Retry-After");
  if (!header) {
    return DEFAULT_RETRY_AFTER_SECONDS;
  }

  const numeric = Number(header);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.ceil(numeric);
  }

  const retryDate = Date.parse(header);
  if (Number.isFinite(retryDate)) {
    const seconds = Math.ceil((retryDate - Date.now()) / 1000);
    return seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_SECONDS;
  }

  return DEFAULT_RETRY_AFTER_SECONDS;
}

export function isRateLimitError(error: unknown): error is RateLimitFetchError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: unknown }).status === 429
  );
}

export function getRateLimitMessage(seconds: number): string {
  return `Слишком много попыток. Попробуйте через ${seconds} секунд`;
}
