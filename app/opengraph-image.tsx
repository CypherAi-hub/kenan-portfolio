import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kenan Larry | Cybersecurity & AI Student";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#090b0f",
        color: "#f4f7fb",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 18,
          color: "#77f5b1",
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "#77f5b1" }} />
        KENAN LARRY PORTFOLIO
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 112, fontWeight: 700, lineHeight: 1 }}>Kenan Larry</div>
        <div style={{ marginTop: 24, fontSize: 34, color: "#b7c0cc" }}>
          Cybersecurity & AI Student Building Applied AI Products
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18,
          color: "#7b8695",
        }}
      >
        <span>FoFit · AgentRoom · AWS · SOC Monitor · Netwatch</span>
        <span>github.com/CypherAi-hub</span>
      </div>
    </div>,
    size,
  );
}
