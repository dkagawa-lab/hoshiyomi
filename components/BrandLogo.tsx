type BrandLogoProps = {
  label?: string;
};

export function BrandLogo({ label = "HOSHIYOMI" }: BrandLogoProps) {
  return (
    <span className="brand-logo" aria-label={label}>
      <svg className="brand-logo-mark" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="hoshiyomi-mark-gold" cx="38%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#fff3c7" />
            <stop offset="48%" stopColor="#e2be67" />
            <stop offset="100%" stopColor="#8f6c2f" />
          </radialGradient>
          <linearGradient id="hoshiyomi-mark-line" x1="18" x2="78" y1="18" y2="78">
            <stop offset="0%" stopColor="#f8e8a8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7dc7c5" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="38" fill="none" stroke="url(#hoshiyomi-mark-line)" strokeWidth="1.5" />
        <circle cx="48" cy="48" r="29" fill="none" stroke="#e2be67" strokeOpacity="0.24" strokeWidth="1" />
        <path
          d="M57.8 20.8c-13.8 4.4-23.7 17.3-23.7 32.5 0 9.7 4 18.4 10.5 24.6-14-2-24.8-14-24.8-28.6 0-16 13-28.9 29-28.9 3.1 0 6.1.5 9 1.4Z"
          fill="url(#hoshiyomi-mark-gold)"
        />
        <path d="M28 61.5c10.5-11.8 22.6-19.7 40-26.7" fill="none" stroke="#f4d98d" strokeLinecap="round" strokeOpacity="0.9" strokeWidth="1.4" />
        <path d="M26.2 34.5c15.2 3.2 28.2 11.6 41.7 27.3" fill="none" stroke="#7dc7c5" strokeLinecap="round" strokeOpacity="0.62" strokeWidth="1.2" />
        <circle cx="69" cy="31" r="3.4" fill="#f8e8a8" />
        <circle cx="25" cy="63" r="2.4" fill="#7dc7c5" />
        <circle cx="70" cy="62" r="2.6" fill="#e2be67" />
        <path d="M48 11.5v8M48 76.5v8M11.5 48h8M76.5 48h8" stroke="#e2be67" strokeLinecap="round" strokeOpacity="0.72" strokeWidth="1.2" />
        <path d="m48 36 2.5 7.1 7.5 1.4-7.5 1.4L48 53l-2.5-7.1-7.5-1.4 7.5-1.4L48 36Z" fill="#fff3c7" />
      </svg>
      <span className="brand-wordmark">{label}</span>
    </span>
  );
}
