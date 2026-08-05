import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type UseEnterAnimationOptions = {
  /** When true, apply enter class on mount / when key changes */
  active?: boolean;
  /** Dependency that restarts the enter animation */
  restartKey?: string | number;
};

/**
 * CSS-class enter animation helper (no animation libraries).
 * Pair with a `.enter` class that runs `@keyframes` / transition.
 */
export const useEnterAnimation = (
  options: UseEnterAnimationOptions = {}
): { enterClass: string; isEntering: boolean } => {
  const { active = true, restartKey } = options;
  const reduced = usePrefersReducedMotion();
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    if (!active || reduced) {
      setIsEntering(false);
      return;
    }
    setIsEntering(true);
    const timer = window.setTimeout(() => setIsEntering(false), 400);
    return () => window.clearTimeout(timer);
  }, [active, reduced, restartKey]);

  return {
    isEntering,
    enterClass: isEntering ? "enter" : "",
  };
};
