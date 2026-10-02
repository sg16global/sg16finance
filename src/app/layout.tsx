import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import DashboardShell from "@/components/DashboardShell";

export const viewport: Viewport = {
  themeColor: "#07090C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "SG16 Finance — Global Intelligence",
  description:
    "Institutional-grade market context, global indices, sector research, and plain-English earnings breakdowns. Built by Saif Tech Global LLC — educational content only.",
  applicationName: "SG16 Finance",
  authors: [{ name: "Saif Tech Global LLC", url: "https://sg16finance.com" }],
  keywords: [
    "SG16 Finance",
    "Saif Tech Global LLC",
    "global stock intelligence",
    "institutional market analysis",
    "plain English earnings breakdown",
    "GICS sector analysis",
    "24/7 AI financial copilot",
  ],
  openGraph: {
    title: "SG16 Finance — Global Intelligence",
    description: "Premium financial intelligence dashboard & 24/7 AI financial copilot.",
    url: "https://sg16finance.com",
    siteName: "SG16 Finance",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#07090C] text-[#B6BDC8] antialiased">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
