export type StatusVariant =
  | "warning"
  | "success"
  | "error"
  | "info"
  | "default";

export const variantToTextColor = (s: StatusVariant): string => {
  switch (s) {
    case "warning":
      return "text-orange-200";
    case "success":
      return "text-green-200";
    case "error":
      return "text-red-200";
    case "info":
      return "text-blue-200";
    default:
      return "text-black";
  }
};

export const variantToColor = (s: StatusVariant): string => {
  switch (s) {
    case "warning":
      return "bg-orange-200";
    case "success":
      return "bg-green-200";
    case "error":
      return "bg-red-200";
    case "info":
      return "bg-black-50";
    default:
      return "";
  }
};

export const variantToClassName = (s: StatusVariant): string => {
  switch (s) {
    case "warning":
      return "bg-orange-200 border-orange-200";
    case "success":
      return "bg-green-200 border-green-200";
    case "error":
      return "text-white bg-red";
    case "info":
      return "bg-black-50 border-black-100 border-1";
    default:
      return "";
  }
};

export const variantToHoverColor = (s: StatusVariant): string => {
  switch (s) {
    case "warning":
      return "hover:bg-orange-100";
    case "success":
      return "hover:bg-green-100";
    case "error":
      return "hover:bg-red-100";
    case "info":
      return "hover:bg-blue-100";
    default:
      return "hover:bg-grey-100";
  }
};
