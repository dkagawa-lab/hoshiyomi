"use client";

import { useEffect, useState } from "react";
import { ensureClientUserId } from "@/lib/clientIdentity";
import { addOnPack, PlanKey, readAddOnCredits, readPlanFromStorage, resolvePlan, servicePlans, writeAddOnCredits } from "@/lib/plans";

type PricingPanelProps = {
  addOnCredits?: number;
  currentPlanKey?: PlanKey;
  onBuyAddOn?: () => void | Promise<void>;
  onCheckout?: (nextPlan: Exclude<PlanKey, "free">) => void | Promise<void>;
};

export function PricingPanel({ addOnCredits, currentPlanKey, onBuyAddOn, onCheckout }: PricingPanelProps) {
  const [activePlanKey, setActivePlanKey] = useState<PlanKey>(currentPlanKey ?? "free");
  const [activeAddOnCredits, setActiveAddOnCredits] = useState(addOnCredits ?? 0);
  const [checkoutLoading, setCheckoutLoading] = useState<string>("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    if (currentPlanKey) {
      setActivePlanKey(currentPlanKey);
    } else {
      const localPlan = readPlanFromStorage();
      setActivePlanKey(localPlan);
      syncServerPlan();
    }
    setActiveAddOnCredits(addOnCredits ?? readAddOnCredits());
  }, [addOnCredits, currentPlanKey]);

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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: nextPlan, clientUserId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || "決済画面を開けませんでした。");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (!data.demo) throw new Error("決済画面を開けませんでした。Stripeの設定を確認してください。");
      setActivePlanKey(nextPlan);
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: addOnPack.key, clientUserId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || "追加相談枠の決済画面を開けませんでした。");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (!data.demo) throw new Error("追加相談枠の決済画面を開けませんでした。Stripeの設定を確認してください。");
      const nextCredits = activeAddOnCredits + addOnPack.credits;
      setActiveAddOnCredits(nextCredits);
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
      const res = await fetch(`/api/me?clientUserId=${encodeURIComponent(clientUserId)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.mode !== "server") return;
      const serverPlan = data.usage?.plan ?? "free";
      if (serverPlan === "free" || serverPlan === "standard" || serverPlan === "luxury") {
        setActivePlanKey(serverPlan);
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

  return (
    <div className="plan-panel pricing-panel">
      <div className="plan-panel-heading">
        <span>Plans</span>
        <strong>今のプラン: {resolvePlan(activePlanKey).label}</strong>
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
                <em>利用中</em>
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
