import { NextResponse } from "next/server";
import { BirthInput, calculateChart } from "@/lib/astrology";
import { getUsageSnapshot, isServerStoreConfigured, normalizeClientUserId, registerClientUser, upsertUserForChart } from "@/lib/serverStore";

type RegisterRequest = {
  birth?: BirthInput;
  clientUserId?: string;
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

  const user = body.birth
    ? await upsertUserForChart({ chart: calculateChart(body.birth), clientUserId, isMember: true })
    : await registerClientUser(clientUserId);

  return NextResponse.json({ ok: true, usage: await getUsageSnapshot(user) });
}
