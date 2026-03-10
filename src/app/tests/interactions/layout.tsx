import type { Metadata } from "next";

const title = "Interactions Test";
const description = "Test click targets, hover effects, keyboard events, focus management, double-click, right-click, long-press, and complex UI interaction patterns. A benchmark for AI browser agents.";

export const metadata: Metadata = {
    title,
    description,
    keywords: ["click testing", "hover testing", "keyboard events", "long-press", "UI interaction automation", "AI agent interactions", "browser event testing"],
    alternates: { canonical: "/tests/interactions" },
    openGraph: {
        title: `${title} | AgentTest Lab`,
        description,
        url: "/tests/interactions",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Interactions Test — AgentTest Lab" }],
    },
    twitter: {
        card: "summary_large_image",
        title: `${title} | AgentTest Lab`,
        description,
        images: ["/og-image.png"],
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
