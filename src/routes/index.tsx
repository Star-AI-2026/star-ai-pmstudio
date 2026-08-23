import { createFileRoute } from "@tanstack/react-router";

import { StarApp } from "@/components/star/StarApp";
import { Toaster } from "@/components/ui/sonner";
import { StarProvider } from "@/lib/star/store";

export const Route = createFileRoute("/")({
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

function Index() {
  return (
    <StarProvider>
      <StarApp />
      <Toaster position="top-center" />
    </StarProvider>
  );
}
