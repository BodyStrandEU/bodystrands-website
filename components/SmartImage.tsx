import Image, { ImageProps, ImageLoaderProps } from "next/image";

// Etsy images come straight from Etsy's CDN (no transformation quota used). Etsy serves each
// photo in a few fixed widths, so the loader asks for the smallest one that covers the size
// actually needed — a phone product card gets ~400px instead of the full-size original.
const EXTERNAL_HOSTS = ["i.etsystatic.com"];
const ETSY_WIDTHS = [300, 400, 570, 794, 1140];

function isExternal(src: string) {
  return EXTERNAL_HOSTS.some((host) => src.includes(host));
}

function etsyLoader({ src, width }: ImageLoaderProps) {
  const w = ETSY_WIDTHS.find((x) => x >= width);
  return w ? src.replace("/il_fullxfull.", `/il_${w}xN.`) : src;
}

export default function SmartImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  if (isExternal(src) && src.includes("/il_fullxfull.") && !props.unoptimized) {
    return <Image {...props} loader={etsyLoader} />;
  }
  return <Image {...props} unoptimized={isExternal(src) || (props.unoptimized ?? false)} />;
}
