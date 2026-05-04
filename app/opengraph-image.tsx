import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kenan Larry — Cybersecurity & AI · Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0B0D",
          color: "#ECEEF2",
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
            color: "#7CFFB2",
            letterSpacing: 2,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#7CFFB2" }} />
          KENANLARRY.DEV
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 128, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
            KENAN LARRY.
          </div>
          <div style={{ marginTop: 24, fontSize: 32, color: "#A8AEB8" }}>
            Cybersecurity & AI · Builder · St. Louis
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#6E7682",
            letterSpacing: 1,
          }}
        >
          <span>FOFIT · CYPHER OS · ULTRAFLIPS · NETWATCH</span>
          <span>github.com/CypherAi-hub</span>
        </div>
      </div>
    ),
    size,
  );
}
