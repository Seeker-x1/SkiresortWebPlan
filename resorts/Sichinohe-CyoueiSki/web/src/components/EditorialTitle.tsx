import { splitEditorialLines } from "@/lib/typography";

type EditorialTitleProps = {
  text: string;
  lines?: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
};

export function EditorialTitle({
  text,
  lines,
  as: Tag = "h1",
  className = "",
}: EditorialTitleProps) {
  const displayLines = lines?.length ? lines : splitEditorialLines(text);

  return (
    <Tag className={`editorial-title ${className}`.trim()}>
      {displayLines.map((line, index) => (
        <span key={`${index}-${line}`} className="editorial-title__line">
          {line}
        </span>
      ))}
    </Tag>
  );
}
