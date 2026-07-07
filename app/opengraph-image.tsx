import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Vera — Buy the ticket. Keep the moment.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [logo, gilroyExtraBold, gilroyBold, gilroyMedium] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/apple-touch-icon-180.png")),
    readFile(join(process.cwd(), "app/fonts/gilroy/Gilroy-ExtraBold.ttf")),
    readFile(join(process.cwd(), "app/fonts/gilroy/Gilroy-Bold.ttf")),
    readFile(join(process.cwd(), "app/fonts/gilroy/Gilroy-Medium.ttf")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#f5f3ef",
          fontFamily: "Gilroy",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={logoSrc} width={56} height={56} alt="" />
          <span style={{ fontSize: 32, fontWeight: 700, color: "#16150f" }}>
            Vera
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 48,
            fontSize: 80,
            fontWeight: 800,
            lineHeight: 1.08,
            color: "#16150f",
          }}
        >
          <span>Buy the ticket.</span>
          <span style={{ display: "flex" }}>
            Keep&nbsp;
            <span style={{ color: "#0fb26e" }}>the moment</span>.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 30,
            fontWeight: 500,
            color: "#7a786c",
          }}
        >
          Find events, grab tickets safely, and relive the moments together.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Gilroy", data: gilroyExtraBold, style: "normal", weight: 800 },
        { name: "Gilroy", data: gilroyBold, style: "normal", weight: 700 },
        { name: "Gilroy", data: gilroyMedium, style: "normal", weight: 500 },
      ],
    },
  );
}
