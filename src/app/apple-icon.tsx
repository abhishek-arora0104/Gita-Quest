import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(135deg, #d97706, #7c2d12)",
          color: "#fbf7ef",
          fontSize: 104,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        G
      </div>
    ),
    size,
  );
}
