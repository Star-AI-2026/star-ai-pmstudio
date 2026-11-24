
import { ExternalLink, Megaphone } from "lucide-react";
import { useI18n } from "@/lib/star/i18n";

const AD = {
  enabled: true,
  label: "Advertisement",
  title: "Ad placement in Star-AI",
  description: "Contact us to promote your product or service.",
  image: "/ad-banner.png",
  destination: "https://lroom.ir",
};

type AdBannerProps = {
  className?: string;
};

export function AdBanner({ className = "" }: AdBannerProps) {
  const { t } = useI18n();
  if (!AD.enabled) return null;

  const hasImage = Boolean(AD.image);
  const validDestination =
    AD.destination.startsWith("https://") ||
    AD.destination.startsWith("http://");

  return (
    <aside
      aria-label={t("Direct advertisement")}
      className={`mx-auto w-full max-w-3xl px-3 py-2 ${className}`}
    >
      <div className="glass flex items-center gap-3 overflow-hidden rounded-2xl p-3">
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
            {t(AD.label)}
          </span>
          <h2 className="truncate text-sm font-semibold">{t(AD.title)}</h2>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {t(AD.description)}
          </p>
        </div>

        {validDestination && (
          <a
            href={AD.destination}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("View advertisement")}
            className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-secondary"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </aside>
  );
}
