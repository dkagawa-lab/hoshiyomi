import { NextResponse } from "next/server";
import { BirthInput, calculateChart } from "@/lib/astrology";
import { getAuthenticatedRequestUser } from "@/lib/serverAuth";
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
  const user =
    authUser.provider === "line" && authUser.lineUserId
      ? body.birth
        ? await upsertUserForLineChart({ chart: calculateChart(body.birth), clientUserId, isMember: true, lineUserId: authUser.lineUserId })
        : await registerLineUser({ clientUserId, lineUserId: authUser.lineUserId })
      : body.birth
        ? await upsertUserForChart({ chart: calculateChart(body.birth), clientUserId, isMember: true })
        : await registerClientUser(clientUserId);
  return NextResponse.json({ ok: true, usage: await getUsageSnapshot(user) });
}
