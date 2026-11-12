import { ImageResponse } from "next/og";
export const runtime = "edge";
export const alt = "KJL Designs — Websites, apps, and digital experiences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraph() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f7f8f5",
        color: "#172b35",
        display: "flex",
        padding: "65px 75px",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", fontSize: 24, justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700 }}>KJL Designs</span>
        <span style={{ fontSize: 17, color: "#586571" }}>DESIGN & DEVELOPMENT</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.1, letterSpacing: -4 }}>
          Useful software.
        </span>
        <span
          style={{
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -4,
            color: "#2455cd",
          }}
        >
          Thoughtfully built.
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 20,
        }}
      >
        <span>Websites · Apps · Digital tools</span>
        <span
          style={{ background: "#2455cd", color: "#ffffff", padding: "18px 26px", borderRadius: 9 }}
        >
          KJL Designs ↗
        </span>
      </div>
    </div>,
    size,
  );
}
