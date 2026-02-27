import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Modals & Overlays Test",
    description:
        "Test dialog boxes, drawers, toast notifications, popovers, tooltips, lightboxes, and nested/stacked overlay patterns for AI agents.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
