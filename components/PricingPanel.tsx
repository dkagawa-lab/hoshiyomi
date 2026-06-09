"use client";

import { useEffect, useRef, useState } from "react";
import { buildAuthHeaders } from "@/lib/authRegistrationClient";
import { checkoutLoginHref, clearPendingCheckoutIntent, readPendingCheckoutIntent, writePendingCheckoutIntent } from "@/lib/checkoutIntent";
import { ensureClientUserId } from "@/lib/clientIdentity";
import { addOnPack, PlanKey, planStatusLabel, readAddOnCredits, readPlanFromStorage, resolvePlan, servicePlans, writeAddOnCredits } from "@/lib/plans";

type PricingPanelProps = {
  addOnCredits?: number;
  currentPlanKey?: PlanKey;
  isMember?: boolean;
  onBuyAddOn?: () => void | Promise<void>;
  onCheckout?: (nextPlan: Exclude<PlanKey, "free">) => void | Promise<void>;
};

export function PricingPanel({ addOnCredits, currentPlanKey, isMember, onBuyAddOn, onCheckout }: PricingPanelProps) {
  const [activePlanKey, setActivePlanKey] = useState<PlanKey>(currentPlanKey ?? "free");
  const [activeMember, setActiveMember] = useState(isMember ?? false);
  const [activeAddOnCredits, setActiveAddOnCredits] = useState(addOnCredits ?? 0);
  const [checkoutLoading, setCheckoutLoading] = useState<string>("");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const pendingCheckoutStarted = useRef(false);

  useEffect(() => {
    if (currentPlanKey) {
      setActivePlanKey(currentPlanKey);
    } else {
      const localPlan = readPlanFromStorage();
      setActivePlanKey(localPlan);
      setActiveMember(window.localStorage.getItem("hoshiyomi:member") === "true" || window.sessionStorage.getItem("hoshiyomi:member") === "true");
      syncServerPlan();
    }
    if (typeof isMember === "boolean") setActiveMember(isMember);
    setActiveAddOnCredits(addOnCredits ?? readAddOnCredits());
  }, [addOnCredits, currentPlanKey, isMember]);

  useEffect(() => {
    if (onCheckout || pendingCheckoutStarted.current) return;
    const pending = readPendingCheckoutIntent();
    if (!pending) return;
    pendingCheckoutStarted.current = true;
    clearPendingCheckoutIntent();
    window.setTimeout(() => {
      if (pending.kind === "plan") {
        void checkout(pending.plan);
      } else {
        void buyAddOnPack();
      }
    }, 250);
  }, [onCheckout]);

  async function checkout(nextPlan: Exclude<PlanKey, "free">) {
    setCheckoutLoading(nextPlan);
    setCheckoutMessage("");
    if (onCheckout) {
      try {
        await onCheckout(nextPlan);
      } catch (error) {
        setCheckoutMessage(error instanceof Error ? error.message : "決済画面を開けませんでした。");
      } finally {
        setCheckoutLoading("");
      }
      return;
    }
    const clientUserId = ensureClientUserId();
    try {
      const { data, res } = await postCheckout({ plan: nextPlan, clientUserId });
      if (res.status === 401) {
        redirectToLoginForCheckout({ kind: "plan", plan: nextPlan });
        return;
      }
      if (!res.ok || data.error) throw new Error(data.error || "決済画面を開けませんでした。");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (!data.demo) throw new Error("決済画面を開けませんでした。Stripeの設定を確認してください。");
      setActivePlanKey(nextPlan);
      setActiveMember(true);
      window.localStorage.setItem("hoshiyomi:plan", nextPlan);
      window.sessionStorage.setItem("hoshiyomi:plan", nextPlan);
      window.localStorage.setItem("hoshiyomi:premium", "true");
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "決済画面を開けませんでした。");
    } finally {
      setCheckoutLoading("");
    }
  }

  async function buyAddOnPack() {
    setCheckoutLoading(addOnPack.key);
    setCheckoutMessage("");
    if (onBuyAddOn) {
      try {
        await onBuyAddOn();
      } catch (error) {
        setCheckoutMessage(error instanceof Error ? error.message : "追加相談枠の決済画面を開けませんでした。");
      } finally {
        setCheckoutLoading("");
      }
      return;
    }
    const clientUserId = ensureClientUserId();
    try {
      const { data, res } = await postCheckout({ product: addOnPack.key, clientUserId });
      if (res.status === 401) {
        redirectToLoginForCheckout({ kind: "addOn", product: addOnPack.key });
        return;
      }
      if (!res.ok || data.error) throw new Error(data.error || "追加相談枠の決済画面を開けませんでした。");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (!data.demo) throw new Error("追加相談枠の決済画面を開けませんでした。Stripeの設定を確認してください。");
      const nextCredits = activeAddOnCredits + addOnPack.credits;
      setActiveAddOnCredits(nextCredits);
      setActiveMember(true);
      writeAddOnCredits(nextCredits);
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "追加相談枠の決済画面を開けませんでした。");
    } finally {
      setCheckoutLoading("");
    }
  }

  async function syncServerPlan() {
    const clientUserId = ensureClientUserId();
    try {
      const res = await fetch(`/api/me?clientUserId=${encodeURIComponent(clientUserId)}`, {
        headers: await buildAuthHeaders()
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.mode !== "server") return;
      const serverPlan = data.usage?.plan ?? "free";
      if (serverPlan === "free" || serverPlan === "standard" || serverPlan === "luxury") {
        setActivePlanKey(serverPlan);
        if (typeof data.usage?.isMember === "boolean") setActiveMember(data.usage.isMember);
        if (serverPlan === "free") {
          window.localStorage.removeItem("hoshiyomi:plan");
          window.sessionStorage.removeItem("hoshiyomi:plan");
          window.localStorage.removeItem("hoshiyomi:premium");
          window.sessionStorage.removeItem("hoshiyomi:premium");
        }
      }
      if (typeof data.usage?.addOnCredits === "number") setActiveAddOnCredits(data.usage.addOnCredits);
    } catch {}
  }

  async function postCheckout(body: Record<string, string>) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
        signal: controller.signal
      });
      return { data: await res.json().catch(() => ({})), res };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("決済画面の準備に時間がかかっています。Stripeの環境変数とPrice IDを確認して、もう一度お試しください。");
      }
      throw error;
    } finally {
      window.clearTimeout(timer);
    }
  }

  function redirectToLoginForCheckout(intent: { kind: "plan"; plan: Exclude<PlanKey, "free"> } | { kind: "addOn"; product: typeof addOnPack.key }) {
    writePendingCheckoutIntent(intent);
    setCheckoutMessage("決済に進むにはログインが必要です。ログイン後に、同じプランの決済画面を開きます。");
    window.location.assign(checkoutLoginHref());
  }

  return (
    <div className="plan-panel pricing-panel">
      <div className="plan-panel-heading">
        <span>Plans</span>
        <strong>現在の状態: {planStatusLabel(resolvePlan(activePlanKey), activeMember)}</strong>
      </div>
      {checkoutMessage ? <p className="form-status error">{checkoutMessage}</p> : null}
      <div className="plan-grid">
        {servicePlans.map((plan) => {
          const isCurrent = plan.key === activePlanKey;
          const canCheckout = plan.key !== "free" && !isCurrent;
          return (
            <article className={`plan-card ${isCurrent ? "active" : ""}`} key={plan.key}>
              <div>
                <span>{plan.label}</span>
                <strong>{plan.priceLabel}</strong>
                {plan.renewalPriceLabel ? <small>{plan.renewalPriceLabel}</small> : null}
                <small>
                  {plan.usagePeriod === "day" ? `1日${plan.questionLimit}回` : `月${plan.questionLimit}回`} / {plan.answerDisplay}
                </small>
              </div>
              <p>{plan.answerPolicy}</p>
              <ul>
                {plan.regulations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {isCurrent ? (
                <em>{activePlanKey === "free" && !activeMember ? "未登録" : "利用中"}</em>
              ) : canCheckout ? (
                <button className="button primary" disabled={checkoutLoading === plan.key} type="button" onClick={() => checkout(plan.key as Exclude<PlanKey, "free">)}>
                  {checkoutLoading === plan.key ? "決済画面を開いています" : plan.ctaLabel}
                </button>
              ) : null}
            </article>
          );
        })}
        <article className="plan-card add-on-card">
          <div>
            <span>{addOnPack.label}</span>
            <strong>{addOnPack.priceLabel}</strong>
            <small>{addOnPack.credits}回追加 / 使い切り</small>
          </div>
          <p>{addOnPack.description}</p>
          <ul>
            <li>100回ごとに1,500円で追加できます</li>
            <li>月の相談回数を使い切った後に消費します</li>
            <li>残り追加回数: {activeAddOnCredits}回</li>
          </ul>
          <button className="button primary" disabled={checkoutLoading === addOnPack.key} type="button" onClick={buyAddOnPack}>
            {checkoutLoading === addOnPack.key ? "決済画面を開いています" : addOnPack.ctaLabel}
          </button>
        </article>
      </div>
    </div>
  );
}
