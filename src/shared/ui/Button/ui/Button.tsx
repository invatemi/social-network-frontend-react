import { forwardRef } from "react";
import { ButtonProps } from "../lib";
import style from "./Button.module.css";
import { Spinner } from "@/shared/ui/Spinner";

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

    const spinnerSize = size === "sm" ? "sm" : size === "lg" ? "md" : "sm";

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span className={style.spinner} aria-hidden="true">
            <Spinner size={spinnerSize} color="secondary" label="" />
          </span>
        )}

        {leftIcon && !loading && (
          <span className={style.iconLeft}>{leftIcon}</span>
        )}

        <span className={style.label}>{children}</span>

        {rightIcon && (
          <span className={style.iconRight}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
