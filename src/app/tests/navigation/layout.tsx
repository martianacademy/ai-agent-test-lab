import type { Metadata } from "next";

const title = "Navigation Test";
const description = "Test tab navigation, breadcrumbs, accordions, pagination, sidebar menus, and multi-level routing patterns. Evaluate AI agent navigation capabilities across complex UI structures.";

export const metadata: Metadata = {
    title,
    description,
    keywords: ["navigation testing", "tab navigation", "breadcrumb testing", "accordion testing", "pagination test", "AI navigation agent", "sidebar navigation"],
    alternates: { canonical: "/tests/navigation" },
    openGraph: {
        title: `${title} | AgentTest Lab`,
        description,
        url: "/tests/navigation",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Navigation Test — AgentTest Lab" }],
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
