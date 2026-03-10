import type { Metadata } from "next";

const title = "Forms Test";
const description = "Test all HTML form element types — input fields, validation, file upload, password visibility, checkboxes, radio groups, range sliders, and form submission flows. Built for AI agent evaluation.";

export const metadata: Metadata = {
    title,
    description,
    keywords: ["form testing", "input validation", "file upload test", "checkbox testing", "AI form automation", "form submission", "HTML form elements"],
    alternates: { canonical: "/tests/forms" },
    openGraph: {
        title: `${title} | AgentTest Lab`,
        description,
        url: "/tests/forms",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Forms Test — AgentTest Lab" }],
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
