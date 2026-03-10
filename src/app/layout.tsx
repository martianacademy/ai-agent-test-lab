import type { Metadata, Viewport } from "next";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-agent-test-lab.vercel.app";
const SITE_NAME = "AgentTest Lab";
const DEFAULT_TITLE = "AgentTest Lab — AI Agent Web Testing";
const DEFAULT_DESCRIPTION =
  "A comprehensive, interactive web testing laboratory built for AI agents. 7 test suites — forms, interactions, navigation, dynamic content, modals, drag-and-drop, and real-world scenarios — with live analytics, scores, and session history.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "AI agent testing",
    "web automation testing",
    "browser automation",
    "AI agent benchmark",
    "test lab for AI",
    "form testing automation",
    "interaction testing",
    "Next.js test environment",
    "AI web agent evaluation",
    "automated UI testing",
    "drag and drop testing",
    "modal testing",
    "navigation testing",
    "live analytics dashboard",
    "LLM browser agent",
    "agent web testing",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: "Developer Tools",
  classification: "AI Tools, Developer Tools, Testing Frameworks",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgentTest Lab — AI Agent Web Testing Laboratory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AgentTestLab",
    creator: "@AgentTestLab",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/og-image.png", alt: "AgentTest Lab" }],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>",
    shortcut: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>",
  },
  manifest: "/manifest.json",
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
