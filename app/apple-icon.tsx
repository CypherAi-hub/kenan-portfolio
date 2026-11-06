import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: "#174de5",
        color: "#e7f3de",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 64,
        fontWeight: 700,
        fontFamily: "monospace",
      }}
    >
      KJL
    </div>,
    size,
  );
}
