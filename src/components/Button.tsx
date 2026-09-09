import React from "react";
import "./Button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "link";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = ({
  children,
  variant = "primary",
  icon,
  iconPosition = "left",
  className,
  ...props
}: ButtonProps) => {
  const iconOnly = Boolean(icon) && !children;
  const classes = [
    "btn",
    `btn-${variant}`,
    iconOnly && "btn-icon-only",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {icon && (iconOnly || iconPosition === "left") && (
        <span className="btn-icon">{icon}</span>
      )}
      {children}
      {icon && !iconOnly && iconPosition === "right" && (
        <span className="btn-icon">{icon}</span>
      )}
    </button>
  );
};

export default Button;
