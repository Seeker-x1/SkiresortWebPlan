import { EditorialTitle } from "@/components/EditorialTitle";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  titleLines?: string[];
  description?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  titleLines,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <header className={className}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <EditorialTitle
        text={title}
        lines={titleLines}
        as="h2"
        className={`heading-lg ${eyebrow ? "mt-3" : ""}`}
      />
      {description ? <p className="lead mt-4">{description}</p> : null}
    </header>
  );
}
