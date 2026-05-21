"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureClientUserId } from "@/lib/clientIdentity";
import { addAddOnCredits, ensureFreeBonusRemaining, readAddOnCredits, referralRewardCredits } from "@/lib/plans";

export function RegisterActions() {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState("");
  const [returnTo, setReturnTo] = useState("/account");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReferralCode(params.get("ref") || "");
    setReturnTo(resolveReturnTo(params.get("returnTo")));
  }, []);

  async function registerMember() {
    const clientUserId = ensureClientUserId();
    window.localStorage.setItem("hoshiyomi:member", "true");
    window.sessionStorage.setItem("hoshiyomi:member", "true");
    ensureFreeBonusRemaining();
    const birth = readStoredBirth();
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birth, clientUserId })
      });
    } catch {}
    if (referralCode.trim()) {
      await applyReferralCode(clientUserId, referralCode);
    }
    router.push(returnTo);
  }

  return (
    <button className="button primary" onClick={registerMember} type="button">
      {registerButtonLabel(returnTo)}
    </button>
  );
}

async function applyReferralCode(clientUserId: string, code: string) {
  try {
    const res = await fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientUserId, code })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) return;
    if (data.mode === "local") {
      addAddOnCredits(readAddOnCredits(), referralRewardCredits);
    }
    window.localStorage.setItem("hoshiyomi:referralRedeemedCode", code);
  } catch {}
}

function resolveReturnTo(value: string | null) {
  const allowed = new Set(["/account", "/reading", "/consultation", "/dashboard", "/pricing"]);
  return value && allowed.has(value) ? value : "/account";
}

function registerButtonLabel(returnTo: string) {
  if (returnTo === "/reading") return "同意して続きを読む";
  if (returnTo === "/consultation") return "同意して相談へ戻る";
  return "同意して会員登録する";
}

function readStoredBirth() {
  try {
    const raw = window.localStorage.getItem("hoshiyomi:birth") ?? window.sessionStorage.getItem("hoshiyomi:birth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
