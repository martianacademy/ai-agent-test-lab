import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Navigation Test",
    description:
        "Test tab navigation, breadcrumbs, accordions, pagination, sidebar menus, and multi-level routing patterns for AI navigation agents.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
