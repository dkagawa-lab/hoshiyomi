"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const resetKeys = [
  "hoshiyomi:used",
  "hoshiyomi:usageMonth",
  "hoshiyomi:usage:free:period",
  "hoshiyomi:usage:free:used",
  "hoshiyomi:usage:standard:period",
  "hoshiyomi:usage:standard:used",
  "hoshiyomi:usage:luxury:period",
  "hoshiyomi:usage:luxury:used",
  "hoshiyomi:freeBonusRemaining",
  "hoshiyomi:addOnCredits",
  "hoshiyomi:clientUserId",
  "hoshiyomi:plan",
  "hoshiyomi:premium",
  "hoshiyomi:member",
  "hoshiyomi:messages",
  "hoshiyomi:history"
];

export function DemoReset() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    for (const key of resetKeys) {
      try {
        window.localStorage.removeItem(key);
      } catch {}
      try {
        window.sessionStorage.removeItem(key);
      } catch {}
    }
    setDone(true);
  }, []);

  return (
    <main className="shell">
      <section className="panel form-panel" style={{ maxWidth: 680 }}>
        <div className="eyebrow">Demo Reset</div>
        <h1 style={{ fontSize: "3.4rem" }}>{done ? "デモ状態をリセットしました" : "リセット中..."}</h1>
        <p>相談回数、プラン状態、会員状態、チャット履歴をリセットしました。出生情報は残しています。</p>
        <div className="actions">
          <Link className="button primary" href="/dashboard">
            ダッシュボードへ戻る
          </Link>
          <Link className="button" href="/m">
            入力フォームへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
