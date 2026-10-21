
import { ExternalLink, Megaphone } from "lucide-react";

const AD = {
  enabled: true,
  label: "تبلیغ",
  title: "جای تبلیغ شما در Star-AI",
  description: "برای معرفی محصول یا خدمات خود با ما تماس بگیرید.",
  image: "/ad-banner.png",
  destination: "https://star-ai-2026.github.io/star-ai-pmstudio/",
};

type AdBannerProps = {
  className?: string;
};

export function AdBanner({ className = "" }: AdBannerProps) {
  if (!AD.enabled) return null;

  const hasImage = Boolean(AD.image);
  const validDestination =
    AD.destination.startsWith("https://") ||
    AD.destination.startsWith("http://");

  return (
    <aside
      aria-label="تبلیغ مستقیم"
      className={`mx-auto w-full max-w-3xl px-3 py-2 ${className}`}
    >
      <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card/80 p-3 shadow-sm">
        {hasImage ? (
          <img
            src={AD.image}
            alt=""
            className="h-16 w-20 shrink-0 rounded-xl object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <Megaphone className="h-7 w-7 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <span className="mb-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
            {AD.label}
          </span>
          <h2 className="truncate text-sm font-semibold">{AD.title}</h2>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {AD.description}
          </p>
        </div>

        {validDestination && (
          <a
            href={AD.destination}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="مشاهده تبلیغ"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border hover:bg-secondary"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </aside>
  );
}
