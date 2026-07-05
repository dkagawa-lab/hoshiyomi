import Link from "next/link";
import { getLineFriendUrl } from "@/lib/lineLinks";

type LineCtaCardProps = {
  compact?: boolean;
};

export function LineCtaCard({ compact = false }: LineCtaCardProps) {
  const lineFriendUrl = getLineFriendUrl();

  return (
    <section className={`line-cta-card ${compact ? "compact" : ""}`} aria-label="LINE相談の案内">
      <div>
        <div className="eyebrow">LINE相談</div>
        <h2>LINEでも、この星のまま相談できます</h2>
        <p>
          Webで登録した出生図と星読みカルテを引き継いで、気になった瞬間にLINEのメッセージから相談できます。恋愛、仕事、今日の運勢も、同じ星の文脈で続けられます。
        </p>
      </div>
      <div className="line-cta-actions">
        <Link className="button primary" href="/register?returnTo=/consultation">
          LINEで登録・友だち追加
        </Link>
        {lineFriendUrl ? (
          <a className="button auth-provider-button line" href={lineFriendUrl} rel="noreferrer" target="_blank">
            LINE公式を開く
          </a>
        ) : null}
      </div>
    </section>
  );
}
