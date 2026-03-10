import type { Metadata } from "next";

const title = "Drag & Drop Test";
const description = "Test sortable lists, Kanban boards, file drop zones, grid reordering, and multi-container drag-and-drop interactions. Benchmark AI agent precision and spatial reasoning in drag-and-drop scenarios.";

export const metadata: Metadata = {
    title,
    description,
    keywords: ["drag and drop testing", "sortable list test", "Kanban board test", "file drop zone", "grid reordering", "AI agent drag drop", "dnd testing"],
    alternates: { canonical: "/tests/dragdrop" },
    openGraph: {
        title: `${title} | AgentTest Lab`,
        description,
        url: "/tests/dragdrop",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Drag & Drop Test — AgentTest Lab" }],
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
