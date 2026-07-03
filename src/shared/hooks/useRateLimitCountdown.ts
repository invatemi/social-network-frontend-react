import { useCallback, useEffect, useState } from "react";

interface RateLimitCountdownState {
  secondsLeft: number;
  isBlocked: boolean;
  startCountdown: (seconds: number) => void;
  clearCountdown: () => void;
}

export function useRateLimitCountdown(): RateLimitCountdownState {
  const [secondsLeft, setSecondsLeft] = useState(0);

  const startCountdown = useCallback((seconds: number) => {
    const normalized = Math.max(1, Math.ceil(seconds));
    setSecondsLeft(normalized);
  }, []);

  const clearCountdown = useCallback(() => {
    setSecondsLeft(0);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [secondsLeft]);

  return {
    secondsLeft,
    isBlocked: secondsLeft > 0,
    startCountdown,
    clearCountdown,
  };
}
