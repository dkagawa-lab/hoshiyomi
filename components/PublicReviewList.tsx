"use client";

import { useEffect, useMemo, useState } from "react";

type PublicReview = {
  comment: string;
  createdAt?: string;
  displayArea?: string;
  displayName: string;
  id: string;
  rating: number;
  theme?: string;
};

type FallbackReview = {
  name: string;
  rating: string;
  text: string;
  theme: string;
};

export function PublicReviewList({ fallback }: { fallback: FallbackReview[] }) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/reviews?limit=6")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const nextReviews = Array.isArray(data.reviews) ? data.reviews.map(normalizePublicReview).filter(Boolean) : [];
        setReviews(nextReviews as PublicReview[]);
      })
      .catch(() => {
        if (active) setReviews([]);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const items = useMemo(() => {
    if (reviews.length > 0) return reviews;
    return fallback.map((item, index) => ({
      comment: item.text,
      displayArea: "",
      displayName: item.name,
      id: `fallback-${index}`,
      rating: Number(item.rating) || 5,
      theme: item.theme
    }));
  }, [fallback, reviews]);

  return (
    <>
      <div className="testimonial-grid">
        {items.map((review) => (
          <article className="testimonial-card" key={review.id}>
            <div className="testimonial-meta">
              <span>{review.theme || review.displayArea || "口コミ"}</span>
              <strong>{review.rating.toFixed(1)}</strong>
            </div>
            <p>{review.comment}</p>
            <div className="testimonial-name">{review.displayName}</div>
          </article>
        ))}
      </div>
      {reviews.length > 0 ? (
        <p className="review-note">投稿された口コミを、個人が特定されない形で掲載しています。</p>
      ) : (
        <p className="review-note">{loaded ? "リリース前の掲載イメージです。正式公開時には実際のレビューに差し替えます。" : "口コミを読み込んでいます。"}</p>
      )}
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
    rating
  };
}
