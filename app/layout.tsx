import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinanceHub Luis",
  description: "Control financiero personal, vehículos y proyecciones",
  applicationName: "FinanceHub Luis",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
