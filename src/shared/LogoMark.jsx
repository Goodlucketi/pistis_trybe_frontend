import { useId } from "react";

const LogoMark = ({ className = "w-10 h-10" }) => {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Pistis Trybe">
      <defs>
        <linearGradient id={`${id}-disc`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--logo-disc-1)" />
          <stop offset="1" stopColor="var(--logo-disc-2)" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#b58dd4" stopOpacity="var(--logo-glow)" />
          <stop offset="1" stopColor="#b58dd4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill={`url(#${id}-disc)`} />
      <circle cx="60" cy="60" r="58" fill={`url(#${id}-glow)`} />
      <circle cx="60" cy="60" r="57" fill="none" stroke="var(--logo-rim)" strokeWidth="2" />
      <path
        d="M60 22c-15.5 0-28 12.3-28 27.6 0 9.6 5 17.4 12.4 24.6L60 94l15.6-19.8C83 67 88 59.2 88 49.6 88 34.3 75.5 22 60 22z"
        fill="var(--logo-pin)"
      />
      <circle cx="60" cy="50" r="17.5" fill="var(--logo-inner)" />
      <path d="M60 36v15M55 41h10" stroke="var(--logo-pin)" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M47 60c6-1 9-4 13-3.5s7 3 13 1.500"
        fill="none"
        stroke="var(--logo-pin)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default LogoMark;
