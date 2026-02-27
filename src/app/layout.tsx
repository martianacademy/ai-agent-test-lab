import type { Metadata, Viewport } from "next";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AgentTest Lab — AI Agent Web Testing",
    template: "%s | AgentTest Lab",
  },
  description:
    "A comprehensive, interactive web testing laboratory built for AI agents. Covers forms, interactions, navigation, dynamic content, modals, drag-and-drop, and real-world scenarios — all with live analytics.",
  keywords: [
    "AI agent testing",
    "web automation",
    "browser testing",
    "test lab",
    "form testing",
    "interaction testing",
    "Next.js testing",
    "AI web agent",
    "automated testing",
    "test analytics",
  ],
  authors: [{ name: "AgentTest Lab" }],
  creator: "AgentTest Lab",
  applicationName: "AgentTest Lab",
  category: "Developer Tools",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "AgentTest Lab",
    title: "AgentTest Lab — AI Agent Web Testing",
    description:
      "Comprehensive web automation testing scenarios built for AI agents. Interact, measure, and optimise across 7 test suites with live analytics.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentTest Lab — AI Agent Web Testing",
    description:
      "Comprehensive web automation testing scenarios built for AI agents. Interact, measure, and optimise across 7 test suites with live analytics.",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <AppShell>{children}</AppShell>
    </html>
  );
}
