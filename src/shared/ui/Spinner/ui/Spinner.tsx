import style from "./Spinner.module.css";
import { SpinnerProps } from "../lib";

/**
 * Spinner — индикатор загрузки
 */
const Spinner = ({ 
  size = "md", 
  color = "primary", 
  label = "Загрузка...",
  className = "" 
}: SpinnerProps) => {
  return (
    <div 
      className={`${style.spinner} ${style[size]} ${style[color]} ${className}`}
      role="status"
      aria-label={label}
    >
      <span className={style.visuallyHidden}>{label}</span>
      <div className={style.spinnerChars} aria-hidden="true">
        <span className={style.char}>[</span>
        <span className={style.dots}>
          <span className={style.dot}>•</span>
          <span className={style.dot}>•</span>
          <span className={style.dot}>•</span>
        </span>
        <span className={style.char}>]</span>
      </div>
    </div>
  );
};

export default Spinner;