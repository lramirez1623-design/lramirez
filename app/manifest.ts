import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinanceHub Luis",
    short_name: "FinanceHub",
    description: "Control financiero personal y de vehículos",
    start_url: "/",
    display: "standalone",
    background_color: "#07151a",
    theme_color: "#07151a",
  };
}
