import { useStar } from "@/lib/star/store";
import { StarLogo } from "./StarLogo";

export function ThinkingIndicator({ label }: { label?: string }) {
  const { version } = useStar();
  const advanced = version === "3.0";

  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-8 w-8 items-center justify-center">
        {advanced && (
          <>
            <span
              className="absolute inset-0 rounded-full border border-primary/50"
              style={{ animation: "orbit-spin 2.4s linear infinite" }}
            />
            <span
              className="absolute inset-1 rounded-full border border-accent/60 border-dashed"
              style={{ animation: "orbit-spin 3.6s linear infinite reverse" }}
            />
          </>
        )}
        <StarLogo className="h-5 w-5 text-primary" />
      </span>
      <span className="thinking-shimmer text-sm font-medium">
        {label ?? (advanced ? "Reasoning through this…" : "Thinking…")}
      </span>
    </div>
  );
}
