import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const authUser = await getAuthenticatedRequestUser(req);
  if (authUser?.provider !== "line" || !authUser.clientUserId.startsWith("line:")) {
    return NextResponse.json({ error: "LINEログイン情報を確認できませんでした。" }, { status: 401 });
  }

  return NextResponse.json({
    clientUserId: authUser.clientUserId,
    ok: true
  });
}
