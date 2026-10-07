import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { NavBar } from "@/components/ui/NavBar";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

// Used by the landing page only (app/page.tsx opts in via font-display /
// font-body / font-mono utility classes) — the rest of the app keeps its
// existing default font stack so this doesn't silently re-theme pages
// that weren't part of this request.
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ElectroLab",
  description: "Virtual electronics laboratory for first-year EEE students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <AuthProvider>
          <NavBar />
          {children}
          <AssistantWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
