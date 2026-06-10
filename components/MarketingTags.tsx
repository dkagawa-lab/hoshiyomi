"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { lineTagId, metaPixelId, trackPageView } from "@/lib/marketing";

export function MarketingTags() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackPageView();
  }, [pathname]);

  if (!metaPixelId && !lineTagId) return null;

  return (
    <>
      {metaPixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
        </Script>
      ) : null}
      {lineTagId ? (
        <Script id="line-tag" strategy="afterInteractive">
          {`(function(g,d,o){g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};var h=d.getElementsByTagName(o)[0];var s=d.createElement(o);s.async=1;s.src='https://tag.line.me/tag.js';h.parentNode.insertBefore(s,h);})(window,document,'script');
_lt('init', {customerType: 'lap', tagId: '${lineTagId}'});
_lt('send', 'pv', ['${lineTagId}']);`}
        </Script>
      ) : null}
    </>
  );
}
