import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "signalstack // live",
  description:
    "Live cyberpunk trading dashboard for the quantflow ecosystem — streaming regime-switching synthetic data with indicators and signals.",
  applicationName: "signalstack",
  authors: [{ name: "thechifura" }],
  keywords: [
    "trading",
    "dashboard",
    "quant",
    "cyberpunk",
    "regime",
    "indicators",
    "next.js",
  ],
  openGraph: {
    title: "signalstack // live",
    description: "Live cyberpunk trading dashboard for the quantflow ecosystem.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050814",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-cyber-bg text-cyber-ink font-sans antialiased selection:bg-cyber-cyan/30 selection:text-cyber-cyan">
        <div className="cyber-grid pointer-events-none fixed inset-0 z-0" aria-hidden />
        <div className="cyber-vignette pointer-events-none fixed inset-0 z-0" aria-hidden />
        <div className="scanline pointer-events-none fixed inset-x-0 top-0 z-0" aria-hidden />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
