import { NextResponse } from "next/server";
import { BirthInput, calculateChart } from "@/lib/astrology";
import { getAuthenticatedRequestUser, getLineSessionRequestUser } from "@/lib/serverAuth";
import { getUsageSnapshot, isServerStoreConfigured, registerClientUser, registerLineUser, upsertUserForChart, upsertUserForLineChart } from "@/lib/serverStore";

type RegisterRequest = {
  birth?: BirthInput;
  clientUserId?: string;
  lineClientUserId?: string;
  previousClientUserId?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as RegisterRequest;

  if (!isServerStoreConfigured()) {
    return NextResponse.json({ ok: true, mode: "local" });
  }

  const authUser = await getAuthenticatedRequestUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "登録を完了するにはログインが必要です。もう一度ログインしてください。" }, { status: 401 });
  }

  const clientUserId = authUser.clientUserId;
  const lineSession = getLineSessionRequestUser(req);
  const verifiedLineUserId = lineSession && (!body.lineClientUserId || body.lineClientUserId === lineSession.clientUserId) ? lineSession.lineUserId : undefined;
  const user =
    authUser.provider === "line" && authUser.lineUserId
      ? body.birth
        ? await upsertUserForLineChart({ chart: calculateChart(body.birth), clientUserId, isMember: true, lineUserId: authUser.lineUserId })
        : await registerLineUser({ clientUserId, lineUserId: authUser.lineUserId })
      : await registerSupabaseUser({ birth: body.birth, clientUserId, lineUserId: verifiedLineUserId });
  return NextResponse.json({ ok: true, usage: await getUsageSnapshot(user) });
}

async function registerSupabaseUser(input: { birth?: BirthInput; clientUserId: string; lineUserId?: string }) {
  if (input.lineUserId) {
    await registerLineUser({ clientUserId: input.clientUserId, lineUserId: input.lineUserId });
  }
  if (input.birth) {
    return upsertUserForChart({ chart: calculateChart(input.birth), clientUserId: input.clientUserId, isMember: true });
  }
  if (input.lineUserId) {
    return registerLineUser({ clientUserId: input.clientUserId, lineUserId: input.lineUserId });
  }
  return registerClientUser(input.clientUserId);
}
