import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Real World Test",
    description:
        "Test realistic user journeys — login flows, shopping carts, data tables with sorting/filtering, multi-step wizards, and complex real-world app scenarios.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
