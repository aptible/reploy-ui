interface Props extends React.SVGProps<SVGSVGElement> {
  color?: string;
  variant?: "base" | "sm" | "lg";
}

const IconStrokeBase = ({
  children,
  color = "#111920",
  variant = "base",
  title = "icon",
  ...rest
}: Props & { title: string }) => {
  const size = (() => {
    if (variant === "sm") return 16;
    if (variant === "lg") return 32;
    return 24;
  })();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      stroke={color}
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <title>{title}</title>
      {children}
    </svg>
  );
};

export const IconArrowRight = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Arrow Right Icon">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </IconStrokeBase>
  );
};

export const IconArrowLeft = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Arrow Left Icon">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </IconStrokeBase>
  );
};

export const IconEdit2 = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Edit Icon">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </IconStrokeBase>
  );
};

export const IconChevronUp = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Chevron Up Icon">
      <polyline points="18 15 12 9 6 15" />
    </IconStrokeBase>
  );
};

export const IconChevronRight = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Chevron Right Icon">
      <polyline points="9 18 15 12 9 6" />
    </IconStrokeBase>
  );
};

export const IconChevronDown = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Chevron Down Icon">
      <polyline points="6 9 12 15 18 9" />
    </IconStrokeBase>
  );
};

export const IconCylinder = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Chevron Down Icon">
      <path d="M20.25 6.375C20.25 8.653 16.556 10.5 12 10.5C7.444 10.5 3.75 8.653 3.75 6.375M20.25 6.375C20.25 4.097 16.556 2.25 12 2.25C7.444 2.25 3.75 4.097 3.75 6.375M20.25 6.375V17.625C20.25 19.903 16.556 21.75 12 21.75C7.444 21.75 3.75 19.903 3.75 17.625V6.375M20.25 6.375V10.125M3.75 6.375V10.125M20.25 10.125V13.875C20.25 16.153 16.556 18 12 18C7.444 18 3.75 16.153 3.75 13.875V10.125M20.25 10.125C20.25 12.403 16.556 14.25 12 14.25C7.444 14.25 3.75 12.403 3.75 10.125" />
    </IconStrokeBase>
  );
};

export const IconTrash = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Trash Icon">
      <path d="M10 11V17M14 11V17M4 7H20M19 7L18.133 19.142C18.0971 19.6466 17.8713 20.1188 17.5011 20.4636C17.1309 20.8083 16.6439 21 16.138 21H7.862C7.35614 21 6.86907 20.8083 6.49889 20.4636C6.1287 20.1188 5.90292 19.6466 5.867 19.142L5 7H19ZM15 7V4C15 3.73478 14.8946 3.48043 14.7071 3.29289C14.5196 3.10536 14.2652 3 14 3H10C9.73478 3 9.48043 3.10536 9.29289 3.29289C9.10536 3.48043 9 3.73478 9 4V7H15Z" />
    </IconStrokeBase>
  );
};

export const IconBox = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Box Icon">
      <path d="M21 7.5L12 2.25L3 7.5M21 7.5L12 12.75M21 7.5V16.5L12 21.75M3 7.5L12 12.75M3 7.5V16.5L12 21.75M12 12.75V21.75" />
    </IconStrokeBase>
  );
};

export const IconSettings = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Settings Icon">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconStrokeBase>
  );
};

export const IconUserCircle = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="User Icon">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </IconStrokeBase>
  );
};

export const IconSearch = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Search Icon">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </IconStrokeBase>
  );
};

export const IconCheck = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Check Icon">
      <polyline points="20 6 9 17 4 12" />
    </IconStrokeBase>
  );
};

export const IconCheckCircle = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Check Icon">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline
        xmlns="http://www.w3.org/2000/svg"
        points="22 4 12 14.01 9 11.01"
      />
    </IconStrokeBase>
  );
};

export const IconPlusCircle = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Plus Icon">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </IconStrokeBase>
  );
};

export const IconX = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="X Icon">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconStrokeBase>
  );
};

export const IconXCircle = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="X Icon">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </IconStrokeBase>
  );
};

export const IconAlertCircle = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Alert Icon">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </IconStrokeBase>
  );
};

export const IconAlertTriangle = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Alert Icon">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconStrokeBase>
  );
};

export const IconLayers = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Layers Icon">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </IconStrokeBase>
  );
};

export const IconLogout = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Logout Icon">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </IconStrokeBase>
  );
};

export const IconGitBranch = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Git Branch Icon">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </IconStrokeBase>
  );
};

export const IconInfo = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Info Icon">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </IconStrokeBase>
  );
};

export const IconCreditCard = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Credit Card Icon">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </IconStrokeBase>
  );
};

export const IconGlobe = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Globe Icon">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </IconStrokeBase>
  );
};

export const IconEllipsis = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Ellipsis Icon">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </IconStrokeBase>
  );
};

export const IconExternalLink = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="External Link Icon">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </IconStrokeBase>
  );
};

export const IconCopy = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Copy Icon">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </IconStrokeBase>
  );
};

export const IconDownload = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Download Icon">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </IconStrokeBase>
  );
};

export const IconThumbsUp = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Thumbs Up Icon">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </IconStrokeBase>
  );
};

export const IconRefresh = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Refresh Icon">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </IconStrokeBase>
  );
};

export const IconHeart = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Heart Icon">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </IconStrokeBase>
  );
};

export const IconCloud = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Cloud Up-arrow Icon">
      <path d="M12 16.5V9.75M12 9.75L15 12.75M12 9.75L9.00001 12.75M6.75001 19.5C5.67944 19.5012 4.64353 19.1206 3.82831 18.4267C3.01309 17.7328 2.47196 16.7709 2.30212 15.7139C2.13227 14.6569 2.34484 13.574 2.90163 12.6596C3.45842 11.7452 4.32297 11.0593 5.34001 10.725C5.07871 9.38617 5.34877 7.9982 6.09299 6.85502C6.83722 5.71183 7.99718 4.9032 9.32723 4.60035C10.6573 4.29751 12.053 4.52423 13.2188 5.23251C14.3846 5.9408 15.2289 7.07502 15.573 8.395C16.105 8.22198 16.6748 8.20116 17.218 8.3349C17.7612 8.46864 18.2562 8.7516 18.6471 9.15184C19.038 9.55207 19.3092 10.0536 19.43 10.5999C19.5509 11.1461 19.5166 11.7152 19.331 12.243C20.1497 12.5557 20.833 13.1451 21.2626 13.9089C21.6921 14.6728 21.8407 15.5629 21.6826 16.4249C21.5245 17.2868 21.0697 18.0663 20.3971 18.628C19.7244 19.1897 18.8763 19.4982 18 19.5H6.75001Z" />
    </IconStrokeBase>
  );
};

export const IconHamburger = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Hamburger Menu Icon">
      <path d="M3.75 6.75H20.25M3.75 12H20.25M3.75 17.25H20.25" />
    </IconStrokeBase>
  );
};

export const IconWorkplace = (props: Props) => {
  return (
    <IconStrokeBase {...props} title="Workplace Icon">
      <path d="M3.75 21H20.25M4.5 3H19.5M5.25 3V21M18.75 3V21M9 6.75H10.5M9 9.75H10.5M9 12.75H10.5M13.5 6.75H15M13.5 9.75H15M13.5 12.75H15M9 21V17.625C9 17.004 9.504 16.5 10.125 16.5H13.875C14.496 16.5 15 17.004 15 17.625V21" />
    </IconStrokeBase>
  );
};
