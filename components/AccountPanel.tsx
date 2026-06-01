"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BirthInput } from "@/lib/astrology";
import { ensureClientUserId } from "@/lib/clientIdentity";
import { AuthMethod, authClientCookieName, authMethodKey, buildAuthHeaders, getSupabaseAuthClient, readAuthMethod } from "@/lib/authRegistrationClient";
import { getLineFriendUrl } from "@/lib/lineLinks";
import { genderLabel, romanticInterestLabel } from "@/lib/profileOptions";
import { addAddOnCredits, legacyReviewRatingRewardCredits, planQuotaLabel, planStatusLabel, PlanKey, readAddOnCredits, readFreeBonusRemaining, readPlanFromStorage, readPlanUsage, referralRewardCredits, resolvePlan, reviewCombinedRewardCredits, usageLimitsDisabled } from "@/lib/plans";

type AccountState = {
  addOnCredits: number;
  authMethod: AuthMethod | "";
  birth: BirthInput | null;
  clientUserId: string;
  freeBonusRemaining: number;
  lineLinked: boolean;
  member: boolean;
  plan: PlanKey;
  referralCode: string;
  serverSynced: boolean;
  used: number;
};

type ReviewState = {
  comment: string;
  commentRewarded: boolean;
  rating: number;
  ratingRewarded: boolean;
  updatedAt: string | null;
};

const initialAccountState: AccountState = {
  addOnCredits: 0,
  authMethod: "",
  birth: null,
  clientUserId: "",
  freeBonusRemaining: 0,
  lineLinked: false,
  member: false,
  plan: "free",
  referralCode: "",
  serverSynced: false,
  used: 0
};

const initialReviewState: ReviewState = {
  comment: "",
  commentRewarded: false,
  rating: 0,
  ratingRewarded: false,
  updatedAt: null
};

export function AccountPanel() {
  const [account, setAccount] = useState<AccountState>(initialAccountState);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingMessage, setBillingMessage] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralMessage, setReferralMessage] = useState("");
  const [review, setReview] = useState<ReviewState>(initialReviewState);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [shareOrigin, setShareOrigin] = useState("");

  useEffect(() => {
    const clientUserId = ensureClientUserId();
    const params = new URLSearchParams(window.location.search);
    const localPlan = readPlanFromStorage();
    const localMember = readStorageValue("localStorage", "hoshiyomi:member") === "true" || readStorageValue("sessionStorage", "hoshiyomi:member") === "true";
    const localAuthMethod = readAuthMethod();
    const localBirth = readStoredBirth();
    setShareOrigin(window.location.origin);
    setReferralInput(params.get("ref") || "");
    const localState: AccountState = {
      addOnCredits: readAddOnCredits(),
      authMethod: localAuthMethod,
      birth: localBirth,
      clientUserId,
      freeBonusRemaining: readFreeBonusRemaining(),
      lineLinked: false,
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
      const res = await fetch(`/api/me?clientUserId=${encodeURIComponent(clientUserId)}`, {
        headers: await buildAuthHeaders()
      });
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
      setReview(normalizeReviewState(data.review));
      setAccount((current) => ({
        ...current,
        addOnCredits: typeof data.usage?.addOnCredits === "number" ? data.usage.addOnCredits : current.addOnCredits,
        birth: mergeServerBirth(buildBirthFromServer(data.user), current.birth),
        freeBonusRemaining: typeof data.usage?.freeBonusRemaining === "number" ? data.usage.freeBonusRemaining : current.freeBonusRemaining,
        lineLinked: Boolean(data.user?.lineLinked),
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
  const primaryAction = !account.member
    ? { href: "/login?returnTo=/account", label: "ログインする" }
    : account.birth
      ? { href: "/consultation", label: "この星で相談する" }
      : { href: "/m", label: "ホロスコープを作成する" };
  const lineFriendUrl = getLineFriendUrl();
  const nextStepLinks = buildAccountNextStepLinks(account, lineFriendUrl);
  const referralLink = account.referralCode && shareOrigin ? `${shareOrigin}/register?ref=${encodeURIComponent(account.referralCode)}&returnTo=/account` : "";
  const referralShareText = `HOSHIYOMIで星読み相談を始めるなら、この紹介リンクから登録すると相談枠がもらえます。`;
  const xShareHref = referralLink ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(referralShareText)}&url=${encodeURIComponent(referralLink)}` : "";
  const lineShareHref = referralLink ? `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(referralShareText)}` : "";
  const loginMethod = resolveLoginMethod(account.member, account.authMethod, account.clientUserId, account.lineLinked);
  const lineConnectHref = `/api/auth/line/login?returnTo=/account&mode=signup&clientUserId=${encodeURIComponent(account.clientUserId || ensureClientUserId())}`;

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

  async function shareReferralNative() {
    if (!referralLink) return;
    const shareData = {
      text: referralShareText,
      title: "HOSHIYOMIの紹介リンク",
      url: referralLink
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(`${referralShareText}\n${referralLink}`);
      setCopiedReferral(true);
      window.setTimeout(() => setCopiedReferral(false), 1800);
    } catch {}
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
        headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
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

  async function submitReview() {
    if (!account.member) {
      setReviewMessage("評価特典を受け取るには、先に新規登録またはログインが必要です。");
      return;
    }
    if (!review.rating) {
      setReviewMessage("星評価を1〜5で選んでください。");
      return;
    }

    setReviewLoading(true);
    setReviewMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          clientUserId: account.clientUserId || ensureClientUserId(),
          comment: review.comment,
          rating: review.rating
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        throw new Error(data.error || "評価を保存できませんでした。");
      }
      const creditsAwarded = typeof data.creditsAwarded === "number" ? data.creditsAwarded : 0;
      if (data.mode === "local" && creditsAwarded > 0) {
        addAddOnCredits(readAddOnCredits(), creditsAwarded);
      }
      if (data.review) setReview(normalizeReviewState(data.review));
      setAccount((current) => ({
        ...current,
        addOnCredits: typeof data.usage?.addOnCredits === "number" ? data.usage.addOnCredits : current.addOnCredits + creditsAwarded,
        freeBonusRemaining: typeof data.usage?.freeBonusRemaining === "number" ? data.usage.freeBonusRemaining : current.freeBonusRemaining,
        member: typeof data.usage?.isMember === "boolean" ? data.usage.isMember : current.member,
        plan: isPlanKey(data.usage?.plan) ? data.usage.plan : current.plan,
        serverSynced: data.mode === "server" ? true : current.serverSynced,
        used: typeof data.usage?.used === "number" ? data.usage.used : current.used
      }));
      setReviewMessage(creditsAwarded > 0 ? `投稿特典として${creditsAwarded}回分の相談枠を追加しました。` : buildReviewNoCreditMessage(review));
    } catch (error) {
      setReviewMessage(error instanceof Error ? error.message : "評価を保存できませんでした。");
    } finally {
      setReviewLoading(false);
    }
  }

  async function logout() {
    setLogoutLoading(true);
    setLogoutMessage("");
    try {
      const supabase = getSupabaseAuthClient();
      await supabase?.auth.signOut();
    } catch {}
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    clearAccountSession();
    const nextClientUserId = ensureClientUserId();
    setAccount({
      ...initialAccountState,
      birth: readStoredBirth(),
      clientUserId: nextClientUserId,
      referralCode: ensureLocalReferralCode(nextClientUserId)
    });
    setReview(initialReviewState);
    setLogoutLoading(false);
    setLogoutMessage("ログアウトしました。保存済みの星の情報はこの端末に残っています。");
  }

  async function openBillingPortal() {
    setBillingLoading(true);
    setBillingMessage("");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ clientUserId: account.clientUserId || ensureClientUserId() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "支払い管理画面を開けませんでした。");
      window.location.href = data.url;
    } catch (error) {
      setBillingMessage(error instanceof Error ? error.message : "支払い管理画面を開けませんでした。");
    } finally {
      setBillingLoading(false);
    }
  }

  return (
    <section className="account-page-grid">
      <div className="panel account-hero-card">
        <div className="eyebrow">Account</div>
        <h1>登録情報</h1>
        <p className="account-hero-copy">
          <span>会員登録の状態、保存されている出生情報、</span>
          <span>現在のプランを確認できます。</span>
          <span>星の確認や相談へ移動しても、</span>
          <span>上部ナビの「登録情報」からいつでも戻れます。</span>
        </p>
        <div className="account-status-strip">
          <div>
            <span>登録状態</span>
            <strong>{account.member ? "会員登録済み" : "未登録"}</strong>
          </div>
          <div>
            <span>ログイン状態</span>
            <strong>{loginMethod}</strong>
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
          {!account.member ? (
            <Link className="button" href="/register?returnTo=/account">
              新規登録する
            </Link>
          ) : null}
          {!account.member && !account.birth ? (
            <Link className="button" href="/m">
              まず星を読む
            </Link>
          ) : null}
          <Link className="button" href="/dashboard">
            星の確認へ
          </Link>
          <Link className="button" href="/pricing">
            プランを見る
          </Link>
          {account.member && !account.lineLinked ? (
            <a className="button" href={lineConnectHref}>
              LINEで登録・友だち追加
            </a>
          ) : null}
          {account.member && account.lineLinked && lineFriendUrl ? (
            <a className="button auth-provider-button line" href={lineFriendUrl} rel="noreferrer" target="_blank">
              LINEで相談する
            </a>
          ) : null}
          {account.member && account.plan !== "free" ? (
            <button className="button" disabled={billingLoading} onClick={openBillingPortal} type="button">
              {billingLoading ? "支払い管理を開いています" : "支払い管理"}
            </button>
          ) : null}
          {account.member ? (
            <button className="button subtle logout-button" disabled={logoutLoading} onClick={logout} type="button">
              {logoutLoading ? "ログアウト中" : "ログアウト"}
            </button>
          ) : null}
        </div>
        {billingMessage ? <p className="small logout-message">{billingMessage}</p> : null}
        {logoutMessage ? <p className="small logout-message">{logoutMessage}</p> : null}
      </div>

      {account.member ? <LineFriendGuideCard account={account} lineConnectHref={lineConnectHref} lineFriendUrl={lineFriendUrl} /> : null}

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

      <div className="panel account-detail-card review-reward-card" id="review">
        <div className="eyebrow">Review Gift</div>
        <h2>評価して相談枠を受け取る</h2>
        <p>
          星評価と8文字以上の口コミをあわせて投稿すると、{reviewCombinedRewardCredits}回分の相談枠をプレゼントします。
          口コミは個人が特定されないよう、年齢・性別・居住地のみを表示して掲載します。
        </p>
        <div className="review-form">
          <div className="review-stars-input" aria-label="5段階評価">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                aria-label={`${value}つ星`}
                aria-pressed={review.rating === value}
                className={value <= review.rating ? "star-button active" : "star-button"}
                disabled={!account.member || reviewLoading}
                key={value}
                onClick={() => setReview((current) => ({ ...current, rating: value }))}
                type="button"
              >
                ★
              </button>
            ))}
          </div>
          <div className="review-reward-status">
            <span>{buildReviewRewardStatus(review)}</span>
          </div>
          <label htmlFor="review-comment">口コミを書く</label>
          <textarea
            id="review-comment"
            maxLength={420}
            onChange={(event) => setReview((current) => ({ ...current, comment: event.target.value }))}
            placeholder="例: 恋愛の悩みで相談しました。星の根拠をもとに、今すぐ動くことと少し待つことを分けてくれたのがよかったです。"
            value={review.comment}
          />
          <div className="review-form-footer">
            <span>{Array.from(review.comment.trim()).length}/420</span>
            <button className="button primary" disabled={!account.member || reviewLoading} onClick={submitReview} type="button">
              {reviewLoading ? "保存中" : "評価を送信する"}
            </button>
          </div>
          {!account.member ? (
            <p className="small referral-message">
              評価特典を受け取るには、先に<Link className="text-link" href="/register?returnTo=/account">新規登録</Link>またはログインが必要です。
            </p>
          ) : null}
          {reviewMessage ? <p className="small referral-message">{reviewMessage}</p> : null}
        </div>
      </div>

      <div className="panel account-detail-card referral-card">
        <div className="eyebrow">Invite Gift</div>
        <h2>紹介コード</h2>
        <div className="referral-layout">
          <div className="referral-copy">
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
            {referralLink ? (
              <div className="referral-share-actions" aria-label="紹介リンクをSNSで共有">
                <button className="button primary" onClick={shareReferralNative} type="button">
                  端末から共有
                </button>
                <a className="button" href={xShareHref} rel="noreferrer" target="_blank">
                  Xで共有
                </a>
                <a className="button auth-provider-button line" href={lineShareHref} rel="noreferrer" target="_blank">
                  LINEで共有
                </a>
              </div>
            ) : null}
            <p className="small">
              共有リンクを開いた人は、紹介コードが入力された登録・ログイン画面へ進みます。登録またはログインが完了すると、紹介した人と紹介された人の相談枠に特典が反映されます。
            </p>
          </div>
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
      </div>
    </section>
  );
}

function buildAccountNextStepLinks(account: AccountState, lineFriendUrl: string) {
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
      title: "新規登録して星を記録する",
      description: "出生情報と鑑定履歴を保存して、次回以降も同じ文脈で相談できます。"
    });
    links.push({
      href: "/login?returnTo=/account",
      title: "ログインして登録情報を読み込む",
      description: "登録済みの方は、保存している星の情報や鑑定履歴を確認できます。"
    });
  } else if (!account.lineLinked) {
    links.push({
      href: `/api/auth/line/login?returnTo=/account&mode=signup&clientUserId=${encodeURIComponent(account.clientUserId)}`,
      title: "LINEで登録・友だち追加する",
      description: "LINE認証の流れで公式アカウントの友だち追加も行い、LINEからの相談につなげます。"
    });
  } else if (lineFriendUrl) {
    links.push({
      href: lineFriendUrl,
      title: "LINEで相談する",
      description: "登録済みの星と鑑定履歴を引き継いだまま、LINEのメッセージで相談できます。"
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

function buildReviewRewardStatus(review: ReviewState) {
  if (review.commentRewarded) return "星評価＋口コミの特典は受け取り済み";
  if (review.ratingRewarded) {
    const remainingCredits = Math.max(0, reviewCombinedRewardCredits - legacyReviewRatingRewardCredits);
    return `口コミ投稿で残り+${remainingCredits}回`;
  }
  return `星評価＋口コミで${reviewCombinedRewardCredits}回分`;
}

function buildReviewNoCreditMessage(review: ReviewState) {
  const hasValidComment = Array.from(review.comment.trim()).length >= 8;
  if (!hasValidComment && !review.commentRewarded) {
    const remainingCredits = review.ratingRewarded ? Math.max(0, reviewCombinedRewardCredits - legacyReviewRatingRewardCredits) : reviewCombinedRewardCredits;
    return `星評価を保存しました。8文字以上の口コミを書くと、星評価とあわせて${remainingCredits}回分の相談枠を受け取れます。`;
  }
  return "評価を更新しました。特典の付与は1回までです。";
}

function LineFriendGuideCard({ account, lineConnectHref, lineFriendUrl }: { account: AccountState; lineConnectHref: string; lineFriendUrl: string }) {
  const isReady = account.lineLinked && Boolean(lineFriendUrl);

  return (
    <div className={`panel line-friend-card ${isReady ? "ready" : ""}`}>
      <div>
        <div className="eyebrow">LINE Consultation</div>
        <h2>LINEでも、この星のまま相談できます</h2>
        {account.lineLinked ? (
          <p>
            LINE登録の流れで公式アカウントの友だち追加画面が表示されます。
            保存したあなたの星と鑑定履歴を引き継いだまま、LINEのメッセージで相談できます。
          </p>
        ) : (
          <p>
            LINEから相談するには、この登録情報とLINEをつなぎます。LINE認証の流れの中で公式アカウントの友だち追加画面も表示されます。
          </p>
        )}
      </div>
      <div className="line-friend-actions">
        {account.lineLinked && lineFriendUrl ? (
          <a className="button primary auth-provider-button line" href={lineFriendUrl} rel="noreferrer" target="_blank">
            LINEで相談を始める
          </a>
        ) : account.lineLinked ? (
          <span className="line-friend-missing">LINE公式アカウントURLを設定すると、ここからトーク画面を開けます。</span>
        ) : (
          <a className="button primary" href={lineConnectHref}>
            LINEで登録・友だち追加する
          </a>
        )}
        <Link className="button" href="/consultation">
          Webで相談を続ける
        </Link>
      </div>
    </div>
  );
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="account-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function resolveLoginMethod(member: boolean, authMethod: AuthMethod | "", clientUserId: string, lineLinked: boolean) {
  if (!member) return "未ログイン";
  if (!clientUserId) return "ログイン確認中";
  if (authMethod === "line") return "LINEでログイン中";
  if (authMethod === "google") return lineLinked ? "Googleでログイン中 / LINE連携済み" : "Googleでログイン中";
  if (authMethod === "mail") return lineLinked ? "メールでログイン中 / LINE連携済み" : "メールでログイン中";
  if (authMethod === "local") return "開発用登録でログイン中";
  if (lineLinked && clientUserId.startsWith("auth:")) return "メール / Googleでログイン中 / LINE連携済み";
  if (lineLinked || clientUserId.startsWith("line:")) return "LINEでログイン中";
  if (clientUserId.startsWith("auth:")) return "メール / Googleでログイン中";
  return "端末保存でログイン中";
}

function clearAccountSession() {
  const keys = [
    "hoshiyomi:member",
    "hoshiyomi:clientUserId",
    "hoshiyomi:plan",
    "hoshiyomi:premium",
    "hoshiyomi:freeBonusRemaining",
    "hoshiyomi:addOnCredits",
    "hoshiyomi:messages",
    "hoshiyomi:history",
    "hoshiyomi:referralRedeemedCode",
    authMethodKey
  ];
  for (const key of keys) {
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch {}
  }
  try {
    document.cookie = `${authClientCookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
  } catch {}
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

function normalizeReviewState(value: unknown): ReviewState {
  if (!value || typeof value !== "object") return initialReviewState;
  const review = value as {
    comment?: unknown;
    commentRewarded?: unknown;
    rating?: unknown;
    ratingRewarded?: unknown;
    updatedAt?: unknown;
  };
  const rating = Number(review.rating);
  return {
    comment: typeof review.comment === "string" ? review.comment : "",
    commentRewarded: Boolean(review.commentRewarded),
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : 0,
    ratingRewarded: Boolean(review.ratingRewarded),
    updatedAt: typeof review.updatedAt === "string" ? review.updatedAt : null
  };
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
    gender?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    name?: unknown;
    romanticInterest?: unknown;
  };
  if (typeof value.birthDate !== "string" || typeof value.birthCity !== "string" || typeof value.latitude !== "number" || typeof value.longitude !== "number") return null;
  return {
    name: typeof value.name === "string" ? value.name : "",
    date: value.birthDate,
    time: typeof value.birthTime === "string" ? value.birthTime : "",
    city: value.birthCity,
    latitude: value.latitude,
    longitude: value.longitude,
    gender: typeof value.gender === "string" ? (value.gender as BirthInput["gender"]) : undefined,
    romanticInterest: typeof value.romanticInterest === "string" ? (value.romanticInterest as BirthInput["romanticInterest"]) : undefined
  };
}

function mergeServerBirth(serverBirth: BirthInput | null, currentBirth: BirthInput | null) {
  if (!serverBirth) return currentBirth;
  return {
    ...serverBirth,
    gender: serverBirth.gender ?? currentBirth?.gender,
    romanticInterest: serverBirth.romanticInterest ?? currentBirth?.romanticInterest
  };
}
