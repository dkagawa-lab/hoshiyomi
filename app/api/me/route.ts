import { NextResponse } from "next/server";
import { getUserSnapshotByClientUserId, isServerStoreConfigured, normalizeClientUserId } from "@/lib/serverStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientUserId = normalizeClientUserId(searchParams.get("clientUserId"));
  if (!clientUserId) {
    return NextResponse.json({ error: "clientUserId is required" }, { status: 400 });
  }

  if (!isServerStoreConfigured()) {
    return NextResponse.json({ mode: "local", user: null });
  }

  const snapshot = await getUserSnapshotByClientUserId(clientUserId);
  return NextResponse.json({ mode: "server", ...snapshot });
}
