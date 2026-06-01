import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser, lineAuthSessionCookieName } from "@/lib/serverAuth";
import { getUserSnapshotByClientUserId, getUserSnapshotByLineUserId, isServerStoreConfigured } from "@/lib/serverStore";

export async function GET(req: Request) {
  if (!isServerStoreConfigured()) {
    if (hasLineSessionCookie(req) && !(await getAuthenticatedRequestUser(req))) {
      return NextResponse.json({ error: "ログイン情報を確認できませんでした。もう一度ログインしてください。" }, { status: 401 });
    }
    return NextResponse.json({ mode: "local", user: null });
  }

  const authUser = await getAuthenticatedRequestUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "ログイン情報を確認できませんでした。もう一度ログインしてください。" }, { status: 401 });
  }

  const snapshot =
    authUser.provider === "line" && authUser.lineUserId
      ? await getUserSnapshotByLineUserId(authUser.lineUserId)
      : await getUserSnapshotByClientUserId(authUser.clientUserId);
  return NextResponse.json({ mode: "server", ...snapshot });
}

function hasLineSessionCookie(req: Request) {
  return (req.headers.get("cookie") || "").split(";").some((part) => part.trim().startsWith(`${lineAuthSessionCookieName}=`));
}
