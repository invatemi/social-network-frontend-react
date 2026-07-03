import {
  getRateLimitMessage,
  isRateLimitError,
  parseRetryAfterSeconds,
  type RateLimitErrorData,
} from "./parseRateLimitError";

interface HandleRateLimitErrorOptions {
  startCountdown: (seconds: number) => void;
  showToast: (message: string, durationMs?: number) => void;
}

export function handleRateLimitError(
  error: unknown,
  { startCountdown, showToast }: HandleRateLimitErrorOptions,
): boolean {
  if (!isRateLimitError(error)) {
    return false;
  }

  const retryAfterSeconds =
    error.data?.retryAfterSeconds ?? parseRetryAfterSeconds();

  startCountdown(retryAfterSeconds);
  showToast(getRateLimitMessage(retryAfterSeconds), retryAfterSeconds * 1000);

  return true;
}

export function enrichRateLimitErrorData(
  data: unknown,
  retryAfterSeconds: number,
): RateLimitErrorData {
  const existing =
    typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};

  return {
    ...existing,
    retryAfterSeconds,
    message: getRateLimitMessage(retryAfterSeconds),
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again later.",
      ...(typeof existing.error === "object" && existing.error !== null
        ? (existing.error as Record<string, unknown>)
        : {}),
    },
  };
}
