import Link from "next/link";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-saffron text-white shadow-sm hover:bg-saffron-dark active:bg-maroon",
  secondary:
    "bg-maroon text-cream shadow-sm hover:bg-maroon-dark",
  outline:
    "border-2 border-saffron text-saffron hover:bg-saffron/10",
  ghost: "text-ink-soft hover:bg-parchment hover:text-ink",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className = "", children, ...rest },
    ref,
  ) {
    const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

    if ("href" in rest && rest.href !== undefined) {
      const { href, ...linkRest } = rest;
      // Filter out button-only props that aren't valid on anchors.
      const {
        type: _type,
        disabled: _disabled,
        ...anchorRest
      } = linkRest as Record<string, unknown>;
      return (
        <Link href={href} className={classes} {...(anchorRest as object)}>
          {children}
        </Link>
      );
    }

    const {
      type = "button",
      ...buttonRest
    } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button ref={ref} type={type} className={classes} {...buttonRest}>
        {children}
      </button>
    );
  },
);
