import type { Metadata } from "next";

const title = "Analytics Dashboard";
const description = "Aggregate metrics and performance insights across all 7 AgentTest Lab test suites. Track scores, operation counts, response timing, success rates, and full session history.";

export const metadata: Metadata = {
    title,
    description,
    keywords: ["test analytics", "AI agent performance", "session analytics", "success rate tracking", "response time metrics", "test results dashboard"],
    alternates: { canonical: "/analytics" },
    openGraph: {
        title: `${title} | AgentTest Lab`,
        description,
        url: "/analytics",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Analytics Dashboard — AgentTest Lab" }],
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
