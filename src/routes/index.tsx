import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { StarApp } from "@/components/star/StarApp";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { StarProvider } from "@/lib/star/store";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Star-AI — Advanced AI assistant with two generations" },
      {
        name: "description",
        content:
          "Star-AI is an AI assistant with two generations: Star-AI 2.0 for everyday tasks and Star-AI 3.0 for advanced reasoning, coding, analysis and file understanding.",
      },
      { property: "og:title", content: "Star-AI — Advanced AI assistant" },
      {
        property: "og:description",
        content:
          "Switch between Star-AI 2.0 and Star-AI 3.0: two generations of one assistant, each with its own theme, capabilities and AI configuration.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Gate() {
  const { loading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <StarApp />;
}

function Index() {
  return (
    <AuthProvider>
      <StarProvider>
        <Gate />
        <Toaster position="top-center" />
      </StarProvider>
    </AuthProvider>
  );
}
