import type { AccessTaxiInfo } from "@/lib/resort-data";

type Labels = {
  eyebrow: string;
  phoneLabel: string;
  addressLabel: string;
};

type Props = {
  taxi: AccessTaxiInfo;
  labels: Labels;
  en?: boolean;
};

export function AccessTaxiBlock({ taxi, labels, en = false }: Props) {
  const company = en ? taxi.companyEn : taxi.company;

  return (
    <div className="mt-5 border-t border-[color:var(--award-color-border)] pt-5">
      <p className="award-eyebrow text-[color:var(--award-color-muted)]">
        {labels.eyebrow}
      </p>
      <p className="mt-3 text-base font-semibold tracking-tight text-[color:var(--award-color-fg)]">
        {company}
      </p>
      <p className="mt-2.5 text-sm leading-relaxed text-[color:var(--award-color-muted)]">
        <span className="font-semibold text-[color:var(--foreground)]">
          {labels.phoneLabel}
        </span>
        {": "}
        <a
          href={taxi.phoneHref}
          className="award-stat-inline inline-block min-h-11 py-2 font-medium text-[color:var(--award-color-accent)] underline-offset-2 hover:underline"
        >
          {taxi.phone}
        </a>
      </p>
      <p className="mt-2.5 text-sm leading-relaxed text-[color:var(--award-color-muted)]">
        <span className="font-semibold text-[color:var(--foreground)]">
          {labels.addressLabel}
        </span>
        {": "}
        <span className="[word-break:keep-all]">
          {en ? taxi.addressEn : taxi.address}
        </span>
      </p>
    </div>
  );
}
