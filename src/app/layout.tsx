import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import DashboardShell from "@/components/DashboardShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

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
    <html lang="en" className={`dark ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-[#07090C] text-[#B6BDC8] antialiased">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
