import type { Metadata } from "next";

const title = "Modals & Overlays Test";
const description = "Test dialog boxes, drawers, toast notifications, popovers, tooltips, lightboxes, and nested/stacked overlay patterns. Evaluate AI agent modal-handling and overlay interaction skills.";

export const metadata: Metadata = {
    title,
    description,
    keywords: ["modal testing", "dialog testing", "toast notification test", "overlay testing", "lightbox test", "AI agent modals", "drawer testing", "popover test"],
    alternates: { canonical: "/tests/modals" },
    openGraph: {
        title: `${title} | AgentTest Lab`,
        description,
        url: "/tests/modals",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Modals & Overlays Test — AgentTest Lab" }],
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
