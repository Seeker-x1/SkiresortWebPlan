import { AwardButton } from "@/components/AwardButton";
import { SectionHeader } from "@/components/SectionHeader";

export function AudienceSplitCards() {
  return (
    <section aria-label="来場スタイル別の案内" className="space-y-8">
      <SectionHeader
        eyebrow="Choose your style"
        title="目的別のご案内"
        description="上級者向けの非圧雪エリアと、ファミリー向けの緩斜面エリアを分けてご案内します。"
      />

      <article className="surface-soft border-l-4 border-[color:var(--accent)] p-6 sm:p-7">
        <h3 className="heading-md">パウダー・上級者向け</h3>
        <p className="lead mt-4">
          非圧雪エリアと競争の少ない雪質を重視する方向け。上部エリア・チャンピオンコースなど（当日の運行・視界に依存）。
        </p>
        <div className="mt-7 flex flex-col gap-3">
          <AwardButton href="/plan/transit-powder" variant="primary" block className="sm:!w-auto">
            Transit Powder
          </AwardButton>
          <AwardButton href="/map" variant="ghost" block className="sm:!w-auto">
            コース一覧
          </AwardButton>
        </div>
      </article>

      <article className="surface-soft border-l-4 border-sky-400 p-6 sm:p-7">
        <h3 className="heading-md">ファミリー・初心者向け</h3>
        <p className="lead mt-4">
          緩斜面・講習・ナイターで安心して楽しむ方向け。ポニーリフト周辺や木曜ナイター無料講習をご案内します。
        </p>
        <div className="mt-7 flex flex-col gap-3">
          <AwardButton href="/plan/beginners-hidden-gem" variant="primary" block className="sm:!w-auto">
            Beginners Guide
          </AwardButton>
          <AwardButton href="/lessons-events" variant="ghost" block className="sm:!w-auto">
            スクール・イベント
          </AwardButton>
        </div>
      </article>
    </section>
  );
}
