import { Link } from "@/i18n/navigation";

type QuickAction = {
  href: "/tickets-rental" | "/access" | "/map" | "/faq";
  label: string;
  desc: string;
};

const ACTIONS: QuickAction[] = [
  { href: "/tickets-rental", label: "料金", desc: "券種・レンタル" },
  { href: "/access", label: "アクセス", desc: "駅・タクシー" },
  { href: "/map", label: "マップ", desc: "コース・リフト" },
  { href: "/faq", label: "FAQ", desc: "よくある質問" },
];

export function QuickActions() {
  return (
    <nav aria-label="クイックアクション" className="flex flex-col gap-3">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="surface-soft flex items-center justify-between px-5 py-4 transition hover:border-[color:var(--accent)]"
        >
          <span className="text-base font-semibold tracking-tight">
            {action.label}
          </span>
          <span className="muted-note text-sm">{action.desc}</span>
        </Link>
      ))}
    </nav>
  );
}
