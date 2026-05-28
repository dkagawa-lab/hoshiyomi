"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReviewFixture } from "@/lib/reviewFixtures";

type PublicReview = {
  comment: string;
  createdAt?: string;
  displayArea?: string;
  displayName: string;
  id: string;
  rating: number;
  theme?: string;
};

const initialReviewCount = 8;

export function PublicReviewList({ fallback }: { fallback: ReviewFixture[] }) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/reviews?limit=40")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const nextReviews = Array.isArray(data.reviews) ? data.reviews.map(normalizePublicReview).filter(Boolean) : [];
        setReviews(nextReviews as PublicReview[]);
      })
      .catch(() => {
        if (active) setReviews([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const items = useMemo(() => {
    const fallbackItems = fallback.map((item, index) => ({
      comment: item.text,
      displayArea: "",
      displayName: item.name,
      id: `fallback-${index}`,
      rating: Number(item.rating) || 5,
      theme: item.theme
    }));
    if (!reviews.length) return fallbackItems;
    const seen = new Set<string>();
    return [...reviews, ...fallbackItems]
      .filter((item) => {
        const key = `${item.displayName}:${item.comment}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 40);
  }, [fallback, reviews]);
  const visibleItems = showAll ? items : items.slice(0, initialReviewCount);
  const averageRating = useMemo(() => calculateAverageRating(items), [items]);
  const themeSummaries = useMemo(() => buildThemeSummaries(items), [items]);
  const featuredReview = items[0];

  if (!items.length) {
    return (
      <div className="review-empty-card">
        <h3>レビューはこれから掲載されます</h3>
        <p>鑑定後に投稿された声だけを、個人が特定されない形で掲載します。</p>
        <a className="button" href="/account#review">
          評価を書いて相談枠を受け取る
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="review-showcase">
        <div className="review-score-card">
          <span>Review Score</span>
          <div className="review-score">
            <strong>{averageRating}</strong>
            <small>/ 5.0</small>
          </div>
          <div className="stars" aria-hidden="true">
            ★★★★★
          </div>
          <p>{items.length}件の声から、HOSHIYOMIの使われ方が見えてきます。</p>
          <a className="button" href="/account#review">
            評価を書いて相談枠を受け取る
          </a>
        </div>
        {featuredReview ? (
          <article className="review-featured-card">
            <span>Featured Voice</span>
            <h3>{featuredReview.theme || featuredReview.displayArea || "鑑定後の声"}</h3>
            <p>{featuredReview.comment}</p>
            <div>
              <strong>{featuredReview.rating.toFixed(1)}</strong>
              <span>{featuredReview.displayName}</span>
            </div>
          </article>
        ) : null}
        <div className="review-theme-cloud" aria-label="レビューの相談テーマ">
          {themeSummaries.map((item) => (
            <span key={item.theme}>
              {item.theme}
              <b>{item.count}</b>
            </span>
          ))}
        </div>
      </div>
      <div className="testimonial-grid">
        {visibleItems.map((review) => (
          <article className="testimonial-card" key={review.id}>
            <div className="testimonial-meta">
              <span>{review.theme || review.displayArea || "口コミ"}</span>
              <strong>★ {review.rating.toFixed(1)}</strong>
            </div>
            <p>{review.comment}</p>
            <div className="testimonial-name">{review.displayName}</div>
          </article>
        ))}
      </div>
      {items.length > initialReviewCount ? (
        <div className="review-more-row">
          <button className="button" onClick={() => setShowAll((current) => !current)} type="button">
            {showAll ? "レビューを閉じる" : `レビューをさらに見る（全${items.length}件）`}
          </button>
        </div>
      ) : null}
      <p className="review-note">いただいた口コミを、個人が特定されない形で掲載しています。</p>
    </>
  );
}

function normalizePublicReview(value: unknown): PublicReview | null {
  if (!value || typeof value !== "object") return null;
  const review = value as Partial<PublicReview>;
  if (typeof review.comment !== "string" || !review.comment.trim()) return null;
  const rating = Number(review.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return null;
  return {
    comment: review.comment.trim(),
    createdAt: typeof review.createdAt === "string" ? review.createdAt : undefined,
    displayArea: typeof review.displayArea === "string" ? review.displayArea : "",
    displayName: typeof review.displayName === "string" && review.displayName.trim() ? review.displayName.trim() : "H＊＊",
    id: typeof review.id === "string" ? review.id : `${Date.now()}-${Math.random()}`,
    rating,
    theme: typeof review.theme === "string" ? review.theme : undefined
  };
}

function calculateAverageRating(items: PublicReview[]) {
  if (!items.length) return "0.0";
  const total = items.reduce((sum, item) => sum + item.rating, 0);
  return (Math.round((total / items.length) * 10) / 10).toFixed(1);
}

function buildThemeSummaries(items: PublicReview[]) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const theme = (item.theme || item.displayArea || "星読み").trim();
    counts.set(theme, (counts.get(theme) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([theme, count]) => ({ count, theme }))
    .sort((a, b) => b.count - a.count || a.theme.localeCompare(b.theme, "ja-JP"))
    .slice(0, 8);
}
