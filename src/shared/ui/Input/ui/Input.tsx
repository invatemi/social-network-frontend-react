import { forwardRef } from 'react';
import styles from './Input.module.css';
import { InputProps } from '../lib';

/**
 * Input — поле ввода
 */
const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
  as: Component = 'input',
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconClick,
  size = 'md',
  variant = 'primary',
  helperText,
  fullWidth = false,
  containerClassName,
  className,
  disabled,
  id,
  rows,
  cols,
  ...restProps
}, ref) => {
  const isTextarea = Component === 'textarea';

  const inputClasses = [
    styles.input,
    styles[`input_${size}`],
    variant === 'danger' && styles.input_danger,
    disabled && styles.input_disabled,
    className,
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    styles.wrapper,
    fullWidth && styles.wrapper_fullWidth,
    containerClassName,
  ].filter(Boolean).join(' ');

  const componentProps = {
    ...restProps,
    rows: isTextarea ? rows : undefined,
    cols: isTextarea ? cols : undefined,
    type: isTextarea ? undefined : (restProps as any).type,
  };

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}

      <div className={styles.inputWrapper}>
        {leftIcon && (
          <span className={`${styles.icon} ${styles.icon_left}`}>
            {leftIcon}
          </span>
        )}

        <Component
          ref={ref as any}
          className={inputClasses}
          id={id}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...(componentProps as any)}
        />

        {rightIcon && (
          <button
            type="button"
            className={`${styles.icon} ${styles.icon_right}`}
            onClick={onRightIconClick}
            tabIndex={-1}
            aria-label="Действие с полем"
          >
            {rightIcon}
          </button>
        )}
      </div>

      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={`${id}-helper`} className={styles.helper}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
