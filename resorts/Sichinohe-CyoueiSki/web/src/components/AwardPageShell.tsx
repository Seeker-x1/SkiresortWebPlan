import { SectionHeader } from "@/components/SectionHeader";

type AwardPageShellProps = {
  eyebrow: string;
  title: string;
  titleLines?: string[];
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AwardPageShell({
  eyebrow,
  title,
  titleLines,
  description,
  children,
  footer,
}: AwardPageShellProps) {
  return (
    <div className="award-section">
      <div className="award-inner">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          titleLines={titleLines}
          description={description}
        />
        <div className="mt-12 space-y-10">{children}</div>
        {footer ? <div className="mt-14">{footer}</div> : null}
      </div>
    </div>
  );
}
