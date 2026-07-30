type IconProps = {
  className?: string;
  filled?: boolean;
};

export const LikeIcon = ({ className, filled = false }: IconProps) => (
  <svg
    className={className}
    width="20"
    height="19"
    viewBox="0 0 20 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M0.815859 2.423C4.00632 -1.76629 8.20525 0.338272 9.35484 2.32581C10.5044 4.31335 13.0524 22.3062 8.79201 18.4602C4.53163 14.6142 -2.3746 6.61229 0.815859 2.423Z"
      fill={filled ? "#EF4444" : "#929292"}
    />
    <path
      d="M19.1514 2.45577C15.833 -1.72587 11.4657 0.374851 10.27 2.35876C9.07433 4.34267 6.42419 22.3026 10.8554 18.4636C15.2866 14.6247 22.4698 6.63742 19.1514 2.45577Z"
      fill={filled ? "#EF4444" : "#929292"}
    />
  </svg>
);

export const CommentIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M6 18C8 17.1242 8.83333 15.4455 9 14.7157C8 14.3507 6.1 13.8399 6.5 14.7157C6.9 15.5915 6.33333 17.2701 6 18Z"
      fill="#929292"
    />
    <path
      d="M20 7.66343C20 11.8958 15.5228 15.3269 10 15.3269C4.47715 15.3269 0 11.8958 0 7.66343C0 3.43104 4.47715 0 10 0C15.5228 0 20 3.43104 20 7.66343Z"
      fill="#929292"
    />
  </svg>
);

export const RepostIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M6.6761 5.9616C0.965851 5.9616 -0.144474 13.9872 0.0141435 18C2.67892 12.3091 5.56577 10.5216 6.6761 10.3392V5.9616Z"
      fill="#929292"
    />
    <path
      d="M6.6761 0.224003C6.6761 2.78834 6.6761 5.9616 6.6761 5.9616C6.6761 5.9616 6.66667 13.1728 6.6761 15.9088C6.68552 18.6448 18.2056 9.88058 18.2056 9.88058C19.6333 8.73604 20 8.58963 20 8.15041C20 7.71119 19.5 7.54397 18 6.49832C18 6.49832 6.6761 -1.4172 6.6761 0.224003Z"
      fill="#929292"
    />
  </svg>
);

type SendIconProps = {
  className?: string;
  gradientId: string;
};

export const SendIcon = ({ className, gradientId }: SendIconProps) => (
  <svg
    className={className}
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect x="0.5" y="0.5" width="47" height="47" rx="7.5" fill="white" />
    <rect
      x="0.5"
      y="0.5"
      width="47"
      height="47"
      rx="7.5"
      fill={`url(#${gradientId}_fill)`}
    />
    <rect
      x="0.5"
      y="0.5"
      width="47"
      height="47"
      rx="7.5"
      stroke={`url(#${gradientId}_stroke)`}
    />
    <path
      d="M13.0326 25.0555C12.523 26.5631 18.1285 28.9227 19.6572 28.0706L28.8295 20.5328C30.3583 19.8773 29.8487 21.0353 29.8487 21.0353L23.2242 30.0807C21.6955 31.4353 31.887 36.111 31.887 34.7564C32.7363 29.3962 34.5368 18.0727 34.9445 15.6605C35.3521 13.2484 33.4157 13.9855 32.3966 14.6555L13.0326 25.0555Z"
      fill="#F3F3F3"
    />
    <defs>
      <linearGradient
        id={`${gradientId}_fill`}
        x1="0"
        y1="24"
        x2="48"
        y2="24"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5876DB" />
        <stop offset="1" stopColor="#254FD8" />
      </linearGradient>
      <linearGradient
        id={`${gradientId}_stroke`}
        x1="0"
        y1="24"
        x2="48"
        y2="24"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6285FF" />
        <stop offset="1" stopColor="#3461FA" />
      </linearGradient>
    </defs>
  </svg>
);

export const formatCount = (count: number): string => {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1)}м`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}к`.replace(".0", "");
  }
  return String(count);
};
