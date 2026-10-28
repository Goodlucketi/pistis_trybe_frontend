import clsx from "clsx";
import LogoMark from "./LogoMark";

const Logo = ({ className, markClassName = "w-10 h-10", textClassName = "text-2xl", showText = true }) => (
  <span className={clsx("inline-flex items-center gap-3", className)}>
    <LogoMark className={clsx("shrink-0", markClassName)} />
    {showText && (
      <span
        className={clsx("font-bold tracking-tight leading-none", textClassName)}
        style={{ color: "var(--logo-text)", fontFamily: "'Bricolage Grotesque', Inter, sans-serif" }}
      >
        Pistis Trybe
      </span>
    )}
  </span>
);

export default Logo;
