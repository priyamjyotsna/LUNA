import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Luna — Cycle Tracker",
    short_name: "Luna",
    description: "Your body's rhythm, understood.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#c97b7b",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
