import { NextResponse } from "next/server";
import { referralRewardCredits } from "@/lib/plans";
import { getAuthenticatedRequestUser } from "@/lib/serverAuth";
import { isServerStoreConfigured, normalizeClientUserId, redeemReferralCode, redeemReferralCodeForLineUser, ReferralCodeError } from "@/lib/serverStore";

type ReferralRequest = {
  clientUserId?: string;
  code?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ReferralRequest;
  const requestedClientUserId = normalizeClientUserId(body.clientUserId);

  if (!isServerStoreConfigured()) {
    if (!requestedClientUserId) {
      return NextResponse.json({ error: "clientUserId is required" }, { status: 400 });
    }
    return NextResponse.json({ credits: referralRewardCredits, mode: "local", ok: true });
  }

  const authUser = await getAuthenticatedRequestUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "紹介コードを適用するにはログインが必要です。" }, { status: 401 });
  }

  try {
    const result =
      authUser.provider === "line" && authUser.lineUserId
        ? await redeemReferralCodeForLineUser({ clientUserId: authUser.clientUserId, code: body.code || "", lineUserId: authUser.lineUserId })
        : await redeemReferralCode({ clientUserId: authUser.clientUserId, code: body.code || "" });
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
