"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallback?: string;
  label?: string;
};

export function BackButton({ fallback = "/", label = "戻る" }: BackButtonProps) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  }

  return (
    <button className="button" type="button" onClick={goBack}>
      {label}
    </button>
  );
}
