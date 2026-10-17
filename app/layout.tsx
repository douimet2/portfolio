import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PageTracker from "./PageTracker";
import Motion from "@/components/Motion";

const roundo = localFont({
  src: [
    { path: "./fonts/Roundo-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Roundo-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Roundo-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-roundo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daniel Ouimet — Apps built with Claude",
  description:
    "Working apps I built with Claude for clients, my rental units, my family and game night: booking sites, a rental analyzer, party games and more.",
  keywords: ["Daniel Ouimet", "Claude", "apps", "portfolio", "Next.js", "Quebec"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roundo.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Hidden entrance states only apply when scripting works. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        {children}
        <Motion />
        <PageTracker />
      </body>
    </html>
  );
}
