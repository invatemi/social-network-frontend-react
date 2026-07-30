import style from "./Spinner.module.css";
import { SpinnerProps } from "../lib";
import { LoadingIcon } from "@/shared/ui/icons";

const SIZE_PX = {
  sm: 14,
  md: 20,
  lg: 28,
  xl: 36,
} as const;

/**
 * Spinner — индикатор загрузки
 */
const Spinner = ({
  size = "md",
  color = "primary",
  label = "Загрузка...",
  className = "",
}: SpinnerProps) => {
  return (
    <div
      className={`${style.spinner} ${style[size]} ${style[color]} ${className}`}
      role="status"
      aria-label={label || "Загрузка..."}
      aria-hidden={label === "" ? true : undefined}
    >
      {label !== "" && <span className={style.visuallyHidden}>{label}</span>}
      <LoadingIcon size={SIZE_PX[size]} className={style.icon} />
    </div>
  );
};

export default Spinner;
