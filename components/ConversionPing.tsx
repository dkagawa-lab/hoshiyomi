"use client";

import { useEffect, useRef } from "react";
import { trackLineConversion, trackMetaEvent } from "@/lib/marketing";

type ConversionPingProps = {
  lineConversionType?: string;
  metaEvent?: string;
  metaParams?: Record<string, unknown>;
};

export function ConversionPing({ lineConversionType, metaEvent, metaParams }: ConversionPingProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const timer = window.setTimeout(() => {
      if (metaEvent) trackMetaEvent(metaEvent, metaParams);
      if (lineConversionType) trackLineConversion(lineConversionType);
    }, 600);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
