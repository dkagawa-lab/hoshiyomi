import { NextResponse } from "next/server";
import { BirthInput, calculateChart } from "@/lib/astrology";
import { getUsageSnapshot, isServerStoreConfigured, mergeClientUserRecords, normalizeClientUserId, normalizeLineUserId, registerClientUser, registerLineUser, upsertUserForChart } from "@/lib/serverStore";

type RegisterRequest = {
  birth?: BirthInput;
  clientUserId?: string;
  lineClientUserId?: string;
  previousClientUserId?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as RegisterRequest;
  const clientUserId = normalizeClientUserId(body.clientUserId);
  if (!clientUserId) {
    return NextResponse.json({ error: "clientUserId is required" }, { status: 400 });
  }

  if (!isServerStoreConfigured()) {
    return NextResponse.json({ ok: true, mode: "local" });
  }

  await mergeClientUserRecords({ sourceClientUserId: body.previousClientUserId, targetClientUserId: clientUserId });
  const user = body.birth
    ? await upsertUserForChart({ chart: calculateChart(body.birth), clientUserId, isMember: true })
    : await registerClientUser(clientUserId);
  const lineUserId = lineUserIdFromClientUserId(body.lineClientUserId);
  const linkedUser = lineUserId ? await registerLineUser({ clientUserId, lineUserId }) : user;

  return NextResponse.json({ ok: true, usage: await getUsageSnapshot(linkedUser) });
}

function lineUserIdFromClientUserId(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("line:")) return null;
  return normalizeLineUserId(value.slice("line:".length));
}
