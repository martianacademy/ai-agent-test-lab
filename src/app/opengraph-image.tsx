import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AgentTest Lab — AI Agent Web Testing Laboratory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                    fontFamily: "system-ui, sans-serif",
                    position: "relative",
                }}
            >
                {/* Grid pattern overlay */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Robot emoji */}
                <div style={{ fontSize: 96, marginBottom: 24, display: "flex" }}>🤖</div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 56,
                        fontWeight: 800,
                        color: "#f8fafc",
                        textAlign: "center",
                        letterSpacing: "-1px",
                        lineHeight: 1.1,
                        marginBottom: 16,
                        display: "flex",
                    }}
                >
                    AgentTest Lab
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 24,
                        color: "#94a3b8",
                        textAlign: "center",
                        maxWidth: 760,
                        lineHeight: 1.4,
                        marginBottom: 40,
                        display: "flex",
                    }}
                >
                    AI Agent Web Testing Laboratory — 7 test suites with live analytics
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 12 }}>
                    {["Forms", "Interactions", "Navigation", "Dynamic", "Modals", "Drag & Drop", "Real World"].map(
                        (label) => (
                            <div
                                key={label}
                                style={{
                                    background: "rgba(99,102,241,0.2)",
                                    border: "1px solid rgba(99,102,241,0.4)",
                                    borderRadius: 8,
                                    padding: "6px 14px",
                                    color: "#a5b4fc",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    display: "flex",
                                }}
                            >
                                {label}
                            </div>
                        )
                    )}
                </div>

                {/* Bottom URL */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 32,
                        fontSize: 16,
                        color: "#475569",
                        display: "flex",
                    }}
                >
                    ai-agent-test-lab.vercel.app
                </div>
            </div>
        ),
        { ...size }
    );
}
