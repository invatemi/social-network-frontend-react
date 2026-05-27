import { forwardRef } from "react";
import { ButtonProps } from "../lib";
import style from "./Button.module.css";

/**
 * Button — интерактивный элемент
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = "",
      ...props
    },
    ref
  ) => {
    const classes = [
      style.button,
      style[`variant-${variant}`],
      style[`size-${size}`],
      fullWidth ? style.fullWidth : "",
      loading ? style.loading : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className={style.spinner} aria-hidden="true">
            {`[•••]`}
          </span>
        )}
        
        {leftIcon && !loading && (
          <span className={style.iconLeft}>{leftIcon}</span>
        )}
        
        <span className={style.label}>
          {variant === "ghost" ? `> ${children}` : `[${children}]`}
        </span>
        
        {rightIcon && (
          <span className={style.iconRight}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";