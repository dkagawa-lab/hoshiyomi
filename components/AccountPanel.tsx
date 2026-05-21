"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BirthInput } from "@/lib/astrology";
import { ensureClientUserId } from "@/lib/clientIdentity";
import { genderLabel, romanticInterestLabel } from "@/lib/profileOptions";
import { addAddOnCredits, planQuotaLabel, planStatusLabel, PlanKey, readAddOnCredits, readFreeBonusRemaining, readPlanFromStorage, readPlanUsage, referralRewardCredits, resolvePlan, usageLimitsDisabled } from "@/lib/plans";

type AccountState = {
  addOnCredits: number;
  birth: BirthInput | null;
  clientUserId: string;
  freeBonusRemaining: number;
  member: boolean;
  plan: PlanKey;
  referralCode: string;
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
  referralCode: "",
  serverSynced: false,
  used: 0
};

export function AccountPanel() {
  const [account, setAccount] = useState<AccountState>(initialAccountState);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralMessage, setReferralMessage] = useState("");
  const [shareOrigin, setShareOrigin] = useState("");

  useEffect(() => {
    const clientUserId = ensureClientUserId();
    const params = new URLSearchParams(window.location.search);
    const localPlan = readPlanFromStorage();
    const localMember = readStorageValue("localStorage", "hoshiyomi:member") === "true" || readStorageValue("sessionStorage", "hoshiyomi:member") === "true";
    const localBirth = readStoredBirth();
    setShareOrigin(window.location.origin);
    setReferralInput(params.get("ref") || "");
    const localState: AccountState = {
      addOnCredits: readAddOnCredits(),
      birth: localBirth,
      clientUserId,
      freeBonusRemaining: readFreeBonusRemaining(),
      member: localMember,
      plan: localPlan,
      referralCode: ensureLocalReferralCode(clientUserId),
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
      if (!data.user && !data.usage) {
        window.localStorage.removeItem("hoshiyomi:member");
        window.sessionStorage.removeItem("hoshiyomi:member");
      }
      const serverPlan = isPlanKey(data.usage?.plan) ? data.usage.plan : fallback.plan;
      const serverMember =
        typeof data.usage?.isMember === "boolean"
          ? data.usage.isMember
          : Boolean(data.user || data.usage)
            ? fallback.member
            : false;
      if (!serverMember) {
        window.localStorage.removeItem("hoshiyomi:member");
        window.sessionStorage.removeItem("hoshiyomi:member");
      }
      setAccount((current) => ({
        ...current,
        addOnCredits: typeof data.usage?.addOnCredits === "number" ? data.usage.addOnCredits : current.addOnCredits,
        birth: mergeServerBirth(buildBirthFromServer(data.user), current.birth),
        freeBonusRemaining: typeof data.usage?.freeBonusRemaining === "number" ? data.usage.freeBonusRemaining : current.freeBonusRemaining,
        member: serverMember,
        plan: serverPlan,
        referralCode: typeof data.user?.referralCode === "string" ? data.user.referralCode : current.referralCode,
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
    : { href: "/m", label: "ホロスコープを作成する" };
  const nextStepLinks = buildAccountNextStepLinks(account);
  const referralLink = account.referralCode && shareOrigin ? `${shareOrigin}/register?ref=${encodeURIComponent(account.referralCode)}&returnTo=/account` : "";

  async function copyReferral() {
    if (!account.referralCode) return;
    const text = referralLink || account.referralCode;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReferral(true);
      window.setTimeout(() => setCopiedReferral(false), 1800);
    } catch {
      setReferralMessage("コピーできませんでした。紹介コードを手動で選択して共有してください。");
    }
  }

  async function applyReferralCode() {
    const code = referralInput.trim();
    if (!code) {
      setReferralMessage("紹介コードを入力してください。");
      return;
    }
    if (normalizeLocalReferralCode(code) === normalizeLocalReferralCode(account.referralCode)) {
      setReferralMessage("自分の紹介コードは使用できません。");
      return;
    }
    if (readStorageValue("localStorage", "hoshiyomi:referralRedeemedCode")) {
      setReferralMessage("紹介コードはすでに使用済みです。");
      return;
    }

    setReferralLoading(true);
    setReferralMessage("");
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientUserId: account.clientUserId || ensureClientUserId(), code })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        throw new Error(data.error || "紹介コードを適用できませんでした。");
      }
      if (data.mode === "local") {
        const nextCredits = addAddOnCredits(readAddOnCredits(), referralRewardCredits);
        setAccount((current) => ({ ...current, addOnCredits: nextCredits, member: true }));
        setReferralMessage(`紹介特典として${referralRewardCredits}回分の相談枠を追加しました。`);
      } else {
        setAccount((current) => ({
          ...current,
          addOnCredits: typeof data.usage?.addOnCredits === "number" ? data.usage.addOnCredits : current.addOnCredits + referralRewardCredits,
          freeBonusRemaining: typeof data.usage?.freeBonusRemaining === "number" ? data.usage.freeBonusRemaining : current.freeBonusRemaining,
          member: typeof data.usage?.isMember === "boolean" ? data.usage.isMember : true,
          plan: isPlanKey(data.usage?.plan) ? data.usage.plan : current.plan,
          referralCode: typeof data.user?.referralCode === "string" ? data.user.referralCode : current.referralCode,
          serverSynced: true,
          used: typeof data.usage?.used === "number" ? data.usage.used : current.used
        }));
        setReferralMessage(`紹介特典として、あなたと紹介した人に${referralRewardCredits}回分の相談枠を追加しました。`);
      }
      window.localStorage.setItem("hoshiyomi:member", "true");
      window.sessionStorage.setItem("hoshiyomi:member", "true");
      window.localStorage.setItem("hoshiyomi:referralRedeemedCode", code);
      setReferralInput("");
    } catch (error) {
      setReferralMessage(error instanceof Error ? error.message : "紹介コードを適用できませんでした。");
    } finally {
      setReferralLoading(false);
    }
  }

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
            <strong>{planStatusLabel(plan, account.member)}</strong>
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

      <div className="panel account-detail-card referral-card">
        <div className="eyebrow">Invite Gift</div>
        <h2>紹介コード</h2>
        <p>
          あなたの紹介コードを使って誰かが登録すると、紹介した人と紹介された人の両方に{referralRewardCredits}回分の相談枠をプレゼントします。
        </p>
        <div className="referral-code-box">
          <span>あなたのコード</span>
          <strong>{account.referralCode || "会員登録後に発行されます"}</strong>
          {account.referralCode ? (
            <button className="button" onClick={copyReferral} type="button">
              {copiedReferral ? "コピーしました" : "共有リンクをコピー"}
            </button>
          ) : null}
        </div>
        {referralLink ? <p className="small referral-link-text">{referralLink}</p> : null}
        <div className="referral-form">
          <label htmlFor="referral-code-input">紹介コードを入力</label>
          <div>
            <input
              id="referral-code-input"
              onChange={(event) => setReferralInput(event.target.value)}
              placeholder="例: HSY-ABCD1234"
              value={referralInput}
            />
            <button className="button primary" disabled={referralLoading} onClick={applyReferralCode} type="button">
              {referralLoading ? "確認中" : "特典を受け取る"}
            </button>
          </div>
          {referralMessage ? <p className="small referral-message">{referralMessage}</p> : null}
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
            <Link className="button primary" href="/m">
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
      href: "/m",
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

function ensureLocalReferralCode(clientUserId: string) {
  const saved = readStorageValue("localStorage", "hoshiyomi:referralCode") ?? readStorageValue("sessionStorage", "hoshiyomi:referralCode");
  if (saved) return saved;
  const seed = clientUserId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase().padEnd(8, "0");
  const code = `HSY-${seed}`;
  try {
    window.localStorage.setItem("hoshiyomi:referralCode", code);
    window.sessionStorage.setItem("hoshiyomi:referralCode", code);
  } catch {}
  return code;
}

function normalizeLocalReferralCode(value: string) {
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = normalized.startsWith("HSY") ? normalized.slice(3) : normalized;
  return body ? `HSY-${body}` : "";
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
