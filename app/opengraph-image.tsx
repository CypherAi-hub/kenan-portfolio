import { ImageResponse } from "next/og";
export const runtime = "edge";
export const alt = "Kenan Larry — Websites, apps, and digital experiences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraph() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fbfaf7",
        color: "#162a37",
        display: "flex",
        padding: "65px 75px",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", fontSize: 24, justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700 }}>Kenan Larry</span>
        <span style={{ fontSize: 17, color: "#536777" }}>DESIGN & DEVELOPMENT</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 86, fontWeight: 700, lineHeight: 1.1, letterSpacing: -4 }}>
          Good ideas.
        </span>
        <span
          style={{
            fontSize: 86,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -4,
            color: "#174de5",
          }}
        >
          Built for real life.
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
          style={{ background: "#174de5", color: "#fff", padding: "18px 26px", borderRadius: 9 }}
        >
          Book with me ↗
        </span>
      </div>
    </div>,
    size,
  );
}
