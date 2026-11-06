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
        background: "#142e38",
        color: "#f7faf8",
        display: "flex",
        padding: "65px 75px",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", fontSize: 24, justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700 }}>KJL Designs</span>
        <span style={{ fontSize: 17, color: "#bdd1d6" }}>DESIGN & DEVELOPMENT</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.1, letterSpacing: -4 }}>
          Designed to impress.
        </span>
        <span
          style={{
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -4,
            color: "#b9dfcb",
          }}
        >
          Built to work.
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
          style={{ background: "#b9dfcb", color: "#16342a", padding: "18px 26px", borderRadius: 9 }}
        >
          Book with me ↗
        </span>
      </div>
    </div>,
    size,
  );
}
