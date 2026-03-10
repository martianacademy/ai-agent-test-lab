import type { Metadata } from "next";

const title = "Real World Test";
const description = "Test realistic user journeys — login flows, shopping carts, data tables with sorting and filtering, multi-step wizards, and complex real-world app scenarios. The ultimate AI agent benchmark.";

export const metadata: Metadata = {
    title,
    description,
    keywords: ["real world testing", "login flow test", "shopping cart test", "data table testing", "multi-step wizard", "AI agent real world", "e-commerce testing", "user journey testing"],
    alternates: { canonical: "/tests/realworld" },
    openGraph: {
        title: `${title} | AgentTest Lab`,
        description,
        url: "/tests/realworld",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Real World Test — AgentTest Lab" }],
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
