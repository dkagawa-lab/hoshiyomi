import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

function verifyLineSignature(body: string, signature: string | null) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("base64");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(req: Request) {
  const body = await req.text();
  if (process.env.LINE_CHANNEL_SECRET && !verifyLineSignature(body, req.headers.get("x-line-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 本番ではeventsを見て、ユーザーIDと課金状態をDBで確認し、占星術文脈つきの応答をreply APIへ送ります。
  return NextResponse.json({ ok: true });
}
