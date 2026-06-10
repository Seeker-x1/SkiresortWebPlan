import { Link } from "@/i18n/navigation";

type AwardButtonVariant = "primary" | "secondary" | "ghost";

type AwardButtonProps = {
  href: string;
  variant?: AwardButtonVariant;
  children: React.ReactNode;
  className?: string;
  block?: boolean;
  external?: boolean;
  showArrow?: boolean;
};

const VARIANT_CLASS: Record<AwardButtonVariant, string> = {
  primary: "award-btn-primary",
  secondary: "award-btn-secondary",
  ghost: "award-btn-ghost",
};

export function AwardButton({
  href,
  variant = "primary",
  children,
  className = "",
  block = false,
  external = false,
  showArrow,
}: AwardButtonProps) {
  const arrow = showArrow ?? variant === "ghost";
  const classes = [
    VARIANT_CLASS[variant],
    block ? "award-btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span>{children}</span>
      {arrow ? (
        <span className="award-btn__arrow" aria-hidden="true">
          →
        </span>
      ) : null}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
