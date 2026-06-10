"use client";

import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <p className="eyebrow">{t("loadingEyebrow")}</p>
        <p className="mt-4 text-sm text-[color:var(--muted)]">
          {t("loadingMessage")}
        </p>
      </div>
    </div>
  );
}
