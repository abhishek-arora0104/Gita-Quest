import { ImageResponse } from "next/og";
import { brandImage } from "@/lib/og/brand-image";

export const alt = "Gita Quest — Understand the Bhagavad Gita in Simple Language";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(brandImage(), size);
}
