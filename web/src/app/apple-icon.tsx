import { ImageResponse } from "next/og";
import { AppMark } from "@/components/brand/app-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself.
export default function AppleIcon() {
  return new ImageResponse(<AppMark size={180} />, size);
}
