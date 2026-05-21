import { NextResponse } from "next/server";
import { referralRewardCredits } from "@/lib/plans";
import { isServerStoreConfigured, normalizeClientUserId, redeemReferralCode, ReferralCodeError } from "@/lib/serverStore";

type ReferralRequest = {
  clientUserId?: string;
  code?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ReferralRequest;
  const clientUserId = normalizeClientUserId(body.clientUserId);
  if (!clientUserId) {
    return NextResponse.json({ error: "clientUserId is required" }, { status: 400 });
  }

  if (!isServerStoreConfigured()) {
    return NextResponse.json({ credits: referralRewardCredits, mode: "local", ok: true });
  }

  try {
    const result = await redeemReferralCode({ clientUserId, code: body.code || "" });
    return NextResponse.json({
      credits: result.credits,
      mode: "server",
      ok: true,
      usage: result.usage,
      user: {
        referralCode: result.user.referral_code
      }
    });
  } catch (error) {
    if (error instanceof ReferralCodeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.warn("Referral redemption failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ error: "紹介コードの適用で一時的な問題が起きました。少し時間をおいてもう一度お試しください。" }, { status: 500 });
  }
}
