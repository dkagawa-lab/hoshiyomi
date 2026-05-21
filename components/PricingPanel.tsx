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

  useEffect(() => {
    setActivePlanKey(currentPlanKey ?? readPlanFromStorage());
    setActiveAddOnCredits(addOnCredits ?? readAddOnCredits());
  }, [addOnCredits, currentPlanKey]);

  async function checkout(nextPlan: Exclude<PlanKey, "free">) {
    if (onCheckout) {
      await onCheckout(nextPlan);
      return;
    }
    const clientUserId = ensureClientUserId();
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: nextPlan, clientUserId })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setActivePlanKey(nextPlan);
    window.localStorage.setItem("hoshiyomi:plan", nextPlan);
    window.sessionStorage.setItem("hoshiyomi:plan", nextPlan);
    window.localStorage.setItem("hoshiyomi:premium", "true");
  }

  async function buyAddOnPack() {
    if (onBuyAddOn) {
      await onBuyAddOn();
      return;
    }
    const clientUserId = ensureClientUserId();
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: addOnPack.key, clientUserId })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    const nextCredits = activeAddOnCredits + addOnPack.credits;
    setActiveAddOnCredits(nextCredits);
    writeAddOnCredits(nextCredits);
  }

  return (
    <div className="plan-panel pricing-panel">
      <div className="plan-panel-heading">
        <span>Plans</span>
        <strong>今のプラン: {resolvePlan(activePlanKey).label}</strong>
      </div>
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
                <button className="button primary" type="button" onClick={() => checkout(plan.key as Exclude<PlanKey, "free">)}>
                  {plan.ctaLabel}
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
          <button className="button primary" type="button" onClick={buyAddOnPack}>
            {addOnPack.ctaLabel}
          </button>
        </article>
      </div>
    </div>
  );
}
