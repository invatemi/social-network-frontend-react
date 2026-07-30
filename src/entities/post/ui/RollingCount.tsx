import { useEffect, useRef, useState } from "react";
import { formatCount } from "./icons";
import style from "./RollingCount.module.css";

type RollingCountProps = {
  value: number;
  className?: string;
};

/**
 * RollingCount — счётчик с анимацией прокрутки при смене числа
 */
const RollingCount = ({ value, className = "" }: RollingCountProps) => {
  const prevValueRef = useRef(value);
  const [displayValue, setDisplayValue] = useState(value);
  const [outgoingValue, setOutgoingValue] = useState<number | null>(null);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (value === prevValueRef.current) {
      return;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      prevValueRef.current = value;
      setDisplayValue(value);
      setOutgoingValue(null);
      setAnimating(false);
      return;
    }

    const nextDirection = value > prevValueRef.current ? "up" : "down";
    setDirection(nextDirection);
    setOutgoingValue(prevValueRef.current);
    setDisplayValue(value);
    setAnimating(true);
    prevValueRef.current = value;

    const timer = window.setTimeout(() => {
      setOutgoingValue(null);
      setAnimating(false);
    }, 380);

    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <span
      className={[style.root, className].filter(Boolean).join(" ")}
      aria-label={String(value)}
    >
      <span className={style.viewport}>
        {outgoingValue !== null && (
          <span
            className={[
              style.digit,
              style.outgoing,
              direction === "up" ? style.outUp : style.outDown,
            ].join(" ")}
            aria-hidden
          >
            {formatCount(outgoingValue)}
          </span>
        )}
        <span
          className={[
            style.digit,
            style.incoming,
            animating ? (direction === "up" ? style.inUp : style.inDown) : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {formatCount(displayValue)}
        </span>
      </span>
    </span>
  );
};

export default RollingCount;
