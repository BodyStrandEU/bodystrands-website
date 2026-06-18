import Image, { ImageProps } from "next/image";

// Etsy images are already optimized on their CDN — skip Vercel transformation to save quota
const EXTERNAL_HOSTS = ["i.etsystatic.com"];

function isExternal(src: string) {
  return EXTERNAL_HOSTS.some((host) => src.includes(host));
}

export default function SmartImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return <Image {...props} unoptimized={isExternal(src) || (props.unoptimized ?? false)} />;
}
