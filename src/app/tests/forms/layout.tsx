import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Forms Test",
    description:
        "Test all HTML form element types — input fields, validation, file upload, password visibility, checkboxes, radio groups, range sliders, and form submission flows.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
