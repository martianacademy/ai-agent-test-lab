import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Drag & Drop Test",
    description:
        "Test sortable lists, Kanban boards, file drop zones, grid reordering, and multi-container drag-and-drop interactions for AI agent evaluation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
