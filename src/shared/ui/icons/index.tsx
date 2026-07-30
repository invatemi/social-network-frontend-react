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

export const SendIcon = ({ size = 16, ...props }: IconProps) => (
  <svg {...defaults(size)} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22l-4-9-9-4 20-7z" />
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
