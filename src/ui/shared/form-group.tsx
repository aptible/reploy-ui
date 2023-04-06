import { tokens } from "./tokens";
import classNames from "classnames";
import { LabelHTMLAttributes, PropsWithChildren } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label(props: LabelProps) {
  const classes = classNames(tokens.type.h4, "block", props.className);

  /* eslint-disable jsx-a11y/label-has-associated-control */
  return <label {...props} className={classes} />;
}

export type Feedback = {
  message: string;
  variant: Variant;
};

export function FormGroupFeedback({ message, variant }: Feedback) {
  const classes = classNames("text-sm mt-1", {
    ["text-red-100"]: variant === "danger",
    ["text-limegreen"]: variant === "success",
    ["text-orange-100"]: variant === "warn",
    ["text-indigo-100"]: variant === "info",
  });
  return <div className={classes}>{message}</div>;
}

type Variant = "warn" | "danger" | "success" | "info";

interface Props extends PropsWithChildren {
  label: string;
  htmlFor: string;
  description?: string | JSX.Element;
  feedbackMessage?: string | null;
  feedbackVariant?: Variant;
  splitWidthInputs?: boolean;
  className?: string;
}

export function FormGroup({
  feedbackMessage,
  children,
  label,
  htmlFor,
  description,
  splitWidthInputs,
  feedbackVariant = "info",
  className = "",
}: Props) {
  return (
    <div className={`flex ${splitWidthInputs ? "" : "flex-col"} ${className}`}>
      <div className={`${splitWidthInputs ? "w-1/2" : ""}`}>
        <Label htmlFor={htmlFor}>{label}</Label>
        {description ? <div className="text-black-500">{description}</div> : ""}
      </div>

      <div className={`flex ${splitWidthInputs ? "w-1/2" : "flex-col"}`}>
        {children}
        {feedbackMessage ? (
          <FormGroupFeedback
            message={feedbackMessage}
            variant={feedbackVariant}
          />
        ) : null}
      </div>
    </div>
  );
}
