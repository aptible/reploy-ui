interface Props extends React.SVGProps<SVGSVGElement> {
  color?: string;
  variant?: "base" | "sm";
}

const IconStrokeBase = ({
  children,
  color = "#111920",
  variant = "base",
  ...rest
}: Props) => {
  const size = (() => {
    if (variant === "sm") return 16;
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
      {children}
    </svg>
  );
};

export const IconArrowRight = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </IconStrokeBase>
  );
};

export const IconChevronUp = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <polyline points="18 15 12 9 6 15" />
    </IconStrokeBase>
  );
};

export const IconChevronRight = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <polyline points="9 18 15 12 9 6" />
    </IconStrokeBase>
  );
};

export const IconChevronDown = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <polyline points="6 9 12 15 18 9" />
    </IconStrokeBase>
  );
};

export const IconTrash = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </IconStrokeBase>
  );
};

export const IconBox = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </IconStrokeBase>
  );
};

export const IconSettings = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconStrokeBase>
  );
};

export const IconUserCircle = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </IconStrokeBase>
  );
};

export const IconSearch = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </IconStrokeBase>
  );
};

export const IconCheck = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <polyline points="20 6 9 17 4 12" />
    </IconStrokeBase>
  );
};

export const IconPlusCircle = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </IconStrokeBase>
  );
};

export const IconX = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconStrokeBase>
  );
};

export const IconAlertCircle = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </IconStrokeBase>
  );
};

export const IconLayers = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </IconStrokeBase>
  );
};

export const IconLogout = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </IconStrokeBase>
  );
};

export const IconGitBranch = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </IconStrokeBase>
  );
};

export const IconInfo = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </IconStrokeBase>
  );
};

export const IconCreditCard = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </IconStrokeBase>
  );
};

export const IconGlobe = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </IconStrokeBase>
  );
};

export const IconEllipsis = (props: Props) => {
  return (
    <IconStrokeBase {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </IconStrokeBase>
  );
};
