import { ImageResponse } from "next/og";
import { AppMark } from "@/components/brand/app-mark";

const sizes = [32, 192, 512];

export function generateImageMetadata() {
  return sizes.map((size) => ({ id: String(size), size: { width: size, height: size }, contentType: "image/png" }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const size = Number(await id);
  // The favicon gets rounded corners; larger icons stay square so platforms can mask them.
  return new ImageResponse(<AppMark size={size} radius={size <= 32 ? size * 0.22 : 0} />, {
    width: size,
    height: size,
  });
}
