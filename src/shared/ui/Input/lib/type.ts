// 📄 src/shared/ui/Input/types.ts
import { 
  InputHTMLAttributes, 
  TextareaHTMLAttributes, 
  ReactNode,
  ChangeEvent,
  KeyboardEvent,
  CompositionEvent,
  FocusEvent,
} from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'primary' | 'secondary' | 'danger';
export type InputAs = 'input' | 'textarea';

// Общие обработчики событий для обоих типов
type CommonEventHandlers = {
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyUp?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyPress?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCompositionStart?: (e: CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCompositionEnd?: (e: CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

// Убираем конфликтующие свойства из input-атрибутов
type BaseInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | keyof CommonEventHandlers>;

export interface InputProps extends BaseInputProps, CommonEventHandlers {
  as?: InputAs;
  
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  size?: InputSize;
  variant?: InputVariant;
  helperText?: string;
  fullWidth?: boolean;
  containerClassName?: string;
  
  // textarea-специфичные атрибуты
  rows?: number;
  cols?: number;
}