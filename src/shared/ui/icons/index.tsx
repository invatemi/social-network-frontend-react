import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const defaults = (size = 16): Pick<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox" | "fill" | "aria-hidden"> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
});

export const UploadIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M4 20h16" />
  </svg>
);

export const CloseIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const EditIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const TrashIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const CopyIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

export const LinkIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93" />
    <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.41a5 5 0 0 0 7.07 7.07L14 18.07" />
  </svg>
);

export const ForwardIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 14l5-5-5-5" />
    <path d="M4 19v-2a5 5 0 0 1 5-5h11" />
  </svg>
);

export const ReplyIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 14l-5-5 5-5" />
    <path d="M20 19v-2a5 5 0 0 0-5-5H4" />
  </svg>
);

export const MoreCircleIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12h.01M12 12h.01M16 12h.01" />
  </svg>
);

export const SendIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22l-4-9-9-4 20-7z" />
  </svg>
);

export const PaperclipIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a1.5 1.5 0 0 1-2.12-2.12l8.49-8.48" />
  </svg>
);

export const SearchIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const EyeIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
    <path d="M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.3 17.3 0 0 1-3.2 4.4" />
    <path d="M6.1 6.1A17.2 17.2 0 0 0 2 12s3.5 7 10 7a10.3 10.3 0 0 0 4.1-.8" />
  </svg>
);

export const ChevronDownIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const ChevronRightIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const LoadingIcon = ({ size = 16, className, ...props }: IconProps) => (
  <svg
    {...defaults(size)}
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    {...props}
  >
    <circle cx="12" cy="12" r="9" opacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" />
  </svg>
);

export const CheckIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export const AlertIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
  </svg>
);

export const EmailIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    width={size}
    height={Math.round((size * 12) / 20)}
    viewBox="0 0 20 12"
    fill="none"
    aria-hidden
    {...props}
  >
    <path
      d="M9.91289 6.38164L9.91406 6.38398L9.91523 6.3832L9.91641 6.38398L9.91719 6.38164L19.6148 0.820312C19.8569 1.15105 20 1.55877 20 2V10C19.9999 11.1045 19.1045 12 18 12H2C0.895486 12 8.85911e-05 11.1045 0 10V2C1.77962e-07 1.54212 0.154043 1.12032 0.412891 0.783203L9.91289 6.38164Z"
      fill="currentColor"
    />
    <path
      d="M18 0C18.3684 1.41827e-05 18.7133 0.100043 19.0098 0.273828L9.92031 5.48633L1.0332 0.248828C1.31976 0.090288 1.64933 0 2 0H18Z"
      fill="currentColor"
    />
  </svg>
);

export const LockIcon = ({ size = 17, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 17 17"
    fill="none"
    aria-hidden
    {...props}
  >
    <path
      d="M0.240549 15.2088C-0.0879291 14.8803 -0.0789244 14.3388 0.260662 13.9992L7.43421 6.82563C7.77379 6.48604 8.31537 6.47703 8.64385 6.80551L9.43686 7.59853C9.76534 7.92701 9.75634 8.46858 9.41675 8.80817L2.2432 15.9817C1.90362 16.3213 1.36204 16.3303 1.03357 16.0018L0.240549 15.2088Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.55552 1.5497C9.57418 -0.468951 12.7935 -0.52248 14.7462 1.43014C16.6988 3.38276 16.6452 6.60212 14.6266 8.62077C12.6079 10.6394 9.38859 10.6929 7.43596 8.74033C5.48334 6.78771 5.53687 3.56835 7.55552 1.5497ZM10.5635 4.48935C10.2239 4.82894 10.2149 5.37051 10.5434 5.69899C10.8719 6.02747 11.4134 6.01847 11.753 5.67888C12.0926 5.33929 12.1016 4.79772 11.7731 4.46924C11.4447 4.14076 10.9031 4.14977 10.5635 4.48935Z"
      fill="currentColor"
    />
    <path
      d="M7.82612 13.032C7.82434 13.1369 7.73788 13.2233 7.63296 13.2251L3.74417 13.2912C3.57479 13.2941 3.49333 13.0907 3.61509 12.969L7.56998 9.01409C7.69173 8.89234 7.8951 8.9738 7.89222 9.14317L7.82612 13.032Z"
      fill="currentColor"
    />
    <path
      d="M5.20551 15.6083C5.20373 15.7132 5.11727 15.7996 5.01234 15.8014L1.12356 15.8675C0.954183 15.8704 0.872723 15.667 0.994479 15.5453L4.94936 11.5904C5.07112 11.4686 5.27449 11.5501 5.27161 11.7195L5.20551 15.6083Z"
      fill="currentColor"
    />
  </svg>
);

export const UserFaceIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden
    {...props}
  >
    <path
      d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10Z"
      fill="currentColor"
    />
    <path
      d="M8 7.5C8 8.32843 7.32843 9 6.5 9C5.67157 9 5 8.32843 5 7.5C5 6.67157 5.67157 6 6.5 6C7.32843 6 8 6.67157 8 7.5Z"
      fill="#121212"
    />
    <path
      d="M15 7.5C15 8.32843 14.3284 9 13.5 9C12.6716 9 12 8.32843 12 7.5C12 6.67157 12.6716 6 13.5 6C14.3284 6 15 6.67157 15 7.5Z"
      fill="#121212"
    />
    <path
      d="M14 13.1246C14 14.4951 12.2091 16 10 16C7.79086 16 6 14.4951 6 13.1246C6 12.4884 7.79086 14.4951 10 14.4951C12.2091 14.4951 14 12.4885 14 13.1246Z"
      fill="#121212"
    />
  </svg>
);

/** Одна галочка статуса сообщения (отправлено). */
export const MessageCheckIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    width="12"
    height="11"
    viewBox="0 0 12 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    className={className}
    {...props}
  >
    <path
      d="M0.999997 6.71429L3.22718 9L10.1935 1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/** Две галочки статуса сообщения (прочитано). */
export const MessageChecksIcon = ({
  className,
  animateSecond = false,
  ...props
}: SVGProps<SVGSVGElement> & { animateSecond?: boolean }) => (
  <svg
    width="17"
    height="11"
    viewBox="0 0 17 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    className={className}
    {...props}
  >
    <path
      d="M1.00001 5.57143L4.10244 9L10.6774 1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6.80652 6.71429L9.0337 9L16.0001 1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={animateSecond ? "message-check-second" : undefined}
    />
  </svg>
);
