import { createFileRoute } from "@tanstack/react-router";
import { Desktop } from "@/webos/Desktop";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "WebOS — A private, offline desktop in your browser" },
      {
        name: "description",
        content:
          "A complete browser-based operating system with 20 powerful apps. Privacy-first, offline-capable, zero servers.",
      },
    ],
  }),
});

function Index() {
  return <Desktop />;
}
