import { useMemo } from "react";

import { useStar } from "@/lib/star/store";

function seeded(n: number) {
  let s = n * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Version-specific animated background.
 * 2.0 -> blue/violet tech grid with drifting particles
 * 3.0 -> deep cosmic field with nebulae and glowing stars
 */
export function VersionBackground() {
  const { version, settings, switching } = useStar();
  const cosmic = version === "3.0";
  const count = settings.particles ? (cosmic ? 90 : 55) : 0;

  const stars = useMemo(() => {
    const rand = seeded(cosmic ? 77 : 21);
    return Array.from({ length: count }, () => ({
      left: rand() * 100,
      top: rand() * 100,
      size: cosmic ? 0.6 + rand() * 2.2 : 0.8 + rand() * 1.6,
      delay: rand() * 14,
      duration: (cosmic ? 26 : 34) + rand() * 30,
      opacity: 0.25 + rand() * 0.7,
    }));
  }, [count, cosmic]);

  return (
    <div
      aria-hidden
      key={version}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden version-morph"
      style={{ opacity: `calc(0.45 + 0.55 * var(--bg-intensity))` }}
    >
      <div className="absolute inset-0 bg-background" />

      {/* Ambient light fields */}
      <div
        className="absolute -top-1/3 left-1/2 h-[90vh] w-[120vw] -translate-x-1/2 rounded-full"
        style={{
          background: "var(--gradient-halo)",
          animation: settings.animations ? "nebula-pulse 16s ease-in-out infinite" : undefined,
        }}
      />

      {cosmic ? (
        <>
          <div
            className="absolute -left-40 top-1/4 h-[55vh] w-[55vh] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--primary) 55%, transparent), transparent 70%)",
              animation: settings.animations ? "nebula-pulse 22s ease-in-out infinite" : undefined,
            }}
          />
          <div
            className="absolute -right-32 bottom-0 h-[60vh] w-[60vh] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--accent) 45%, transparent), transparent 70%)",
              animation: settings.animations
                ? "nebula-pulse 28s ease-in-out infinite reverse"
                : undefined,
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in oklab, var(--primary) 22%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--primary) 22%, transparent) 1px, transparent 1px)",
            backgroundSize: "68px 68px",
            maskImage: "radial-gradient(ellipse at 50% 20%, black, transparent 78%)",
          }}
        />
      )}

      {/* Particles / stars */}
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              background: cosmic
                ? "color-mix(in oklab, var(--glow) 55%, white)"
                : "color-mix(in oklab, var(--accent) 65%, white)",
              boxShadow: cosmic ? "0 0 8px currentColor" : undefined,
              animation: settings.animations
                ? `star-drift ${s.duration}s linear ${s.delay}s infinite`
                : undefined,
            }}
          />
        ))}
      </div>

      {switching && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--glow) 35%, transparent), transparent 60%)",
            animation: "version-morph 900ms ease-out",
          }}
        />
      )}
    </div>
  );
}
