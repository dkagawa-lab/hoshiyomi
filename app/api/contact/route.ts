import { NextResponse } from "next/server";
import { insertContactInquiry, isServerStoreConfigured } from "@/lib/serverStore";

type ContactRequest = {
  category?: string;
  email?: string;
  message?: string;
  name?: string;
  pageUrl?: string;
  plan?: string;
};

const categories = new Set(["reading", "bug", "request", "billing", "account", "other"]);

export async function POST(req: Request) {
  const body = (await req.json()) as ContactRequest;
  const name = cleanText(body.name, 80);
  const email = cleanText(body.email, 160).toLowerCase();
  const message = cleanText(body.message, 2000);
  const category = categories.has(body.category || "") ? body.category! : "other";
  const plan = cleanText(body.plan, 80);
  const pageUrl = cleanText(body.pageUrl, 500);

  if (!name) return NextResponse.json({ error: "お名前を入力してください。" }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "返信先メールアドレスを入力してください。" }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ error: "お問い合わせ内容をもう少し詳しく入力してください。" }, { status: 400 });

  if (!isServerStoreConfigured()) {
    return NextResponse.json({
      ok: true,
      stored: false,
      message: "保存先が未設定のため、ローカル確認用として受け付けました。"
    });
  }

  await insertContactInquiry({
    category,
    email,
    message,
    name,
    pageUrl,
    plan,
    userAgent: req.headers.get("user-agent")
  });

  return NextResponse.json({ ok: true, stored: true });
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
