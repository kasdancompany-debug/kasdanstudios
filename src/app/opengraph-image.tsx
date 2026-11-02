import { ImageResponse } from "next/og";
import { site } from "@content/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card. Replace with a real still by adding app/opengraph-image.jpg. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "radial-gradient(70% 80% at 75% 20%, #2a241b 0%, #0c0b09 70%)",
        color: "#eee7da",
        fontFamily: "serif",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 6, color: "#c7aa76" }}
      >
        <span>KASDAN STUDIOS</span>
        <span style={{ color: "#9d9588" }}>SAULT STE. MARIE, ON</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 118, lineHeight: 0.95, letterSpacing: -3 }}>
        <span>Ideas worth</span>
        <span style={{ fontStyle: "italic", color: "#cfc6b6" }}>watching.</span>
      </div>
      <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#9d9588" }}>
        COMMERCIALS · WEB · SOCIAL · DESIGN
      </div>
    </div>,
    size,
  );
}
