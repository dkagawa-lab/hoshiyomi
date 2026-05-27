import { NextResponse } from "next/server";
import { isServerStoreConfigured, listPublicReviews, normalizeClientUserId, ReviewSubmissionError, submitUserReview } from "@/lib/serverStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 6);
  if (!isServerStoreConfigured()) {
    return NextResponse.json({ mode: "local", reviews: [] });
  }

  try {
    return NextResponse.json({ mode: "server", reviews: await listPublicReviews(limit) });
  } catch (error) {
    console.warn("Public reviews unavailable", { message: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ mode: "server", reviews: [] });
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    clientUserId?: unknown;
    comment?: unknown;
    rating?: unknown;
  };
  const clientUserId = normalizeClientUserId(body.clientUserId);
  if (!clientUserId) {
    return NextResponse.json({ error: "clientUserId is required" }, { status: 400 });
  }

  if (!isServerStoreConfigured()) {
    return NextResponse.json({ creditsAwarded: 0, mode: "local", ok: true });
  }

  try {
    const result = await submitUserReview({
      clientUserId,
      comment: typeof body.comment === "string" ? body.comment : "",
      rating: Number(body.rating)
    });
    return NextResponse.json({ mode: "server", ok: true, ...result });
  } catch (error) {
    if (error instanceof ReviewSubmissionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.warn("Review submission failed", { message: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ error: "評価の保存で一時的な問題が起きました。少し時間をおいてもう一度お試しください。" }, { status: 500 });
  }
}
