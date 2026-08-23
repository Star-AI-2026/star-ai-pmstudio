import { cn } from "@/lib/utils";

/** Star-AI mark: a stylized star fused with an orbital / circuit motif. */
export function StarLogo({
  className,
  animated = true,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    <span className={cn("relative inline-flex items-center justify-center", className)}>
      <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
        <defs>
          <linearGradient id="star-ai-grad" x1="4" y1="4" x2="44" y2="44">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <g
          style={
            animated ? { transformOrigin: "center", animation: "orbit-spin 18s linear infinite" } : undefined
          }
        >
          <ellipse
            cx="24"
            cy="24"
            rx="21"
            ry="8.5"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.4"
            transform="rotate(-28 24 24)"
          />
          <circle cx="41" cy="16" r="2.1" fill="currentColor" />
        </g>
        <path
          d="M24 3.5c1.9 8.9 5.7 13.9 13.4 16.1C29.7 21.8 25.9 26.8 24 35.7c-1.9-8.9-5.7-13.9-13.4-16.1C18.3 17.4 22.1 12.4 24 3.5Z"
          fill="url(#star-ai-grad)"
        />
        <path
          d="M12.5 33.5c.9 4.2 2.7 6.6 6.4 7.6-3.7 1-5.5 3.4-6.4 7.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeOpacity="0.7"
          transform="translate(0,-7)"
        />
      </svg>
    </span>
  );
}
