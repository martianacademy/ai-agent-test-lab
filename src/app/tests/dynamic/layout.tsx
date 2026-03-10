import type { Metadata } from "next";

const title = "Dynamic Content Test";
const description = "Test lazy loading, skeleton screens, infinite scroll, real-time data updates, streaming content, and dynamic DOM mutations. Stress-test AI agent robustness against rapidly changing UIs.";

export const metadata: Metadata = {
    title,
    description,
    keywords: ["dynamic content testing", "infinite scroll test", "lazy loading test", "real-time UI", "skeleton screen", "AI agent dynamic content", "DOM mutation testing"],
    alternates: { canonical: "/tests/dynamic" },
    openGraph: {
        title: `${title} | AgentTest Lab`,
        description,
        url: "/tests/dynamic",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Dynamic Content Test — AgentTest Lab" }],
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
