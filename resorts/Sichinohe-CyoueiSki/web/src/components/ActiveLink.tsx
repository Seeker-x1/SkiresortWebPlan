"use client";

import { usePathname, Link } from "@/i18n/navigation";

type ActiveLinkProps = {
  href: string;
  label: string;
};

export function ActiveLink({ href, label }: ActiveLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`rounded-full px-3.5 py-2 text-sm font-medium tracking-wide transition ${
        isActive
          ? "bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
          : "text-[color:var(--muted)] hover:bg-white hover:text-[color:var(--foreground)]"
      }`}
    >
      {label}
    </Link>
  );
}
