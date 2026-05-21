"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BirthInput } from "@/lib/astrology";
import { ensureClientUserId } from "@/lib/clientIdentity";
import { genderLabel, romanticInterestLabel } from "@/lib/profileOptions";
import { planQuotaLabel, PlanKey, readAddOnCredits, readFreeBonusRemaining, readPlanFromStorage, readPlanUsage, resolvePlan, usageLimitsDisabled } from "@/lib/plans";

type AccountState = {
  addOnCredits: number;
  birth: BirthInput | null;
  clientUserId: string;
  freeBonusRemaining: number;
  member: boolean;
  plan: PlanKey;
  serverSynced: boolean;
  used: number;
};

const initialAccountState: AccountState = {
  addOnCredits: 0,
  birth: null,
  clientUserId: "",
  freeBonusRemaining: 0,
  member: false,
  plan: "free",
  serverSynced: false,
  used: 0
};

export function AccountPanel() {
  const [account, setAccount] = useState<AccountState>(initialAccountState);

  useEffect(() => {
    const clientUserId = ensureClientUserId();
    const localPlan = readPlanFromStorage();
    const localMember = readStorageValue("localStorage", "hoshiyomi:member") === "true" || readStorageValue("sessionStorage", "hoshiyomi:member") === "true";
    const localBirth = readStoredBirth();
    const localState: AccountState = {
      addOnCredits: readAddOnCredits(),
      birth: localBirth,
      clientUserId,
      freeBonusRemaining: readFreeBonusRemaining(),
      member: localMember,
      plan: localPlan,
      serverSynced: false,
      used: readPlanUsage(localPlan)
    };
    setAccount(localState);
    syncServerAccount(clientUserId, localState);
  }, []);

  async function syncServerAccount(clientUserId: string, fallback: AccountState) {
    try {
      const res = await fetch(`/api/me?clientUserId=${encodeURIComponent(clientUserId)}`);
      const data = await res.json();
      if (!res.ok || data.mode !== "server") return;
      const serverPlan = isPlanKey(data.usage?.plan) ? data.usage.plan : fallback.plan;
      setAccount((current) => ({
        ...current,
        addOnCredits: typeof data.usage?.addOnCredits === "number" ? data.usage.addOnCredits : current.addOnCredits,
        birth: mergeServerBirth(buildBirthFromServer(data.user), current.birth),
        freeBonusRemaining: typeof data.usage?.freeBonusRemaining === "number" ? data.usage.freeBonusRemaining : current.freeBonusRemaining,
        member: typeof data.usage?.isMember === "boolean" ? data.usage.isMember : current.member,
        plan: serverPlan,
        serverSynced: Boolean(data.user || data.usage),
        used: typeof data.usage?.used === "number" ? data.usage.used : current.used
      }));
    } catch {
      setAccount((current) => ({ ...current, serverSynced: false }));
    }
  }

  const plan = resolvePlan(account.plan);
  const quotaText = usageLimitsDisabled()
    ? "開発環境: 相談回数の制限なし"
    : planQuotaLabel(plan, account.used, account.member, account.freeBonusRemaining, account.addOnCredits);
  const primaryAction = account.birth
    ? account.member
      ? { href: "/consultation", label: "この星で相談する" }
      : { href: "/register?returnTo=/account", label: "無料会員登録する" }
    : { href: "/#app", label: "ホロスコープを作成する" };
  const nextStepLinks = buildAccountNextStepLinks(account);

  return (
    <section className="account-page-grid">
      <div className="panel account-hero-card">
        <div className="eyebrow">Account</div>
        <h1>登録情報</h1>
        <p>
          ここから会員登録の状態、保存されている出生情報、現在のプランをいつでも確認できます。ホロスコープ作成や相談画面へ移動しても、このページには上部ナビの「登録情報」から戻れます。
        </p>
        <div className="account-status-strip">
          <div>
            <span>登録状態</span>
            <strong>{account.member ? "会員登録済み" : "未登録"}</strong>
          </div>
          <div>
            <span>現在のプラン</span>
            <strong>{plan.label}</strong>
          </div>
          <div>
            <span>相談枠</span>
            <strong>{quotaText}</strong>
          </div>
        </div>
        <div className="actions compact-actions">
          <Link className="button primary" href={primaryAction.href}>
            {primaryAction.label}
          </Link>
          {!account.member && primaryAction.href !== "/register?returnTo=/account" ? (
            <Link className="button" href="/register?returnTo=/account">
              無料会員登録
            </Link>
          ) : null}
          <Link className="button" href="/dashboard">
            星の確認へ
          </Link>
          <Link className="button" href="/pricing">
            プランを見る
          </Link>
        </div>
      </div>

      <div className="panel account-detail-card">
        <div className="eyebrow">Saved Birth Data</div>
        <h2>保存されている星の情報</h2>
        {account.birth ? (
          <div className="account-detail-list">
            <AccountRow label="名前" value={account.birth.name || "未設定"} />
            <AccountRow label="生年月日" value={account.birth.date || "未設定"} />
            <AccountRow label="出生時刻" value={account.birth.time || "時刻不明"} />
            <AccountRow label="出生地" value={account.birth.city || "未設定"} />
            <AccountRow label="性別" value={genderLabel(account.birth.gender)} />
            <AccountRow label="恋愛対象" value={romanticInterestLabel(account.birth.romanticInterest)} />
          </div>
        ) : (
          <div className="empty-account-state">
            <p>まだ出生情報が保存されていません。先にホロスコープを作成すると、ここに登録情報として表示されます。</p>
            <Link className="button primary" href="/#app">
              ホロスコープを作成する
            </Link>
          </div>
        )}
      </div>

      <div className="panel account-detail-card">
        <div className="eyebrow">Next Steps</div>
        <h2>ここからできること</h2>
        <div className="account-link-list">
          {nextStepLinks.map((item) => (
            <Link href={item.href} key={item.href}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </Link>
          ))}
        </div>
        <p className="small">{account.serverSynced ? "登録した星の情報は保存されています。" : "登録前でも、この端末に残っている星の情報を確認できます。"}</p>
      </div>
    </section>
  );
}

function buildAccountNextStepLinks(account: AccountState) {
  const links = [];
  if (account.birth) {
    links.push({
      href: "/consultation",
      title: "この星で相談を続ける",
      description: "保存されている出生図をもとに、恋愛・仕事・相性・将来の迷いを相談できます。"
    });
    links.push({
      href: "/dashboard",
      title: "星の配置をもう一度見る",
      description: "太陽、月、金星、火星など、あなたの出生図と本質の読み解きを確認できます。"
    });
  } else {
    links.push({
      href: "/#app",
      title: "まずホロスコープを作成する",
      description: "生年月日と出生地から、相談の土台になるあなたの星を読み取ります。"
    });
  }
  if (!account.member) {
    links.push({
      href: "/register?returnTo=/account",
      title: "無料会員登録で星を記録する",
      description: "出生情報と鑑定履歴を保存して、次回以降も同じ文脈で相談できます。"
    });
  }
  links.push({
    href: "/pricing",
    title: "相談プランを確認する",
    description: "相談回数、回答の深さ、選べる占い師タイプを確認できます。"
  });
  links.push({
    href: "/terms",
    title: "利用規約・鑑定前の注意を見る",
    description: "登録前後にいつでも確認できます。"
  });
  links.push({
    href: "/contact",
    title: "問い合わせ・要望を送る",
    description: "不具合、鑑定内容、決済や解約、欲しい機能について送れます。"
  });
  return links;
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="account-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function readStoredBirth() {
  return readStorageJson<BirthInput>("localStorage", "hoshiyomi:birth") ?? readStorageJson<BirthInput>("sessionStorage", "hoshiyomi:birth");
}

function readStorageJson<T>(storageName: "localStorage" | "sessionStorage", key: string): T | null {
  try {
    const value = readStorageValue(storageName, key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function readStorageValue(storageName: "localStorage" | "sessionStorage", key: string) {
  try {
    return window[storageName].getItem(key);
  } catch {
    return null;
  }
}

function isPlanKey(value: unknown): value is PlanKey {
  return value === "free" || value === "standard" || value === "luxury";
}

function buildBirthFromServer(user: unknown): BirthInput | null {
  if (!user || typeof user !== "object") return null;
  const value = user as {
    birthCity?: unknown;
    birthDate?: unknown;
    birthTime?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    name?: unknown;
  };
  if (typeof value.birthDate !== "string" || typeof value.birthCity !== "string" || typeof value.latitude !== "number" || typeof value.longitude !== "number") return null;
  return {
    name: typeof value.name === "string" ? value.name : "",
    date: value.birthDate,
    time: typeof value.birthTime === "string" ? value.birthTime : "",
    city: value.birthCity,
    latitude: value.latitude,
    longitude: value.longitude
  };
}

function mergeServerBirth(serverBirth: BirthInput | null, currentBirth: BirthInput | null) {
  if (!serverBirth) return currentBirth;
  return {
    ...serverBirth,
    gender: currentBirth?.gender,
    romanticInterest: currentBirth?.romanticInterest
  };
}
