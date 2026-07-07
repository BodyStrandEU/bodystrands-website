// Carrier-specific tracking links. 17track's auto-detect can guess the wrong carrier
// for UPU S10-format numbers (confirmed: it read a real DHL Germany number as "Asendia"),
// so known carriers get a direct, unambiguous link to their own official tracker instead.
export type CarrierId = "dhl-de" | "auto";

export const CARRIERS: { id: CarrierId; label: string }[] = [
  { id: "dhl-de", label: "DHL (Germany)" },
  { id: "auto",   label: "Auto-detect (17track)" },
];

export function isCarrierId(value: string | null | undefined): value is CarrierId {
  return value === "dhl-de" || value === "auto";
}

export function buildTrackingUrl(carrier: string | null | undefined, trackingNumber: string): string {
  const num = encodeURIComponent(trackingNumber.trim());
  if (carrier === "dhl-de") {
    return `https://www.dhl.com/de-en/home/tracking.html?tracking-id=${num}&submit=1`;
  }
  return `https://t.17track.net/en#nums=${num}`;
}

export function carrierLabel(carrier: string | null | undefined): string {
  return CARRIERS.find((c) => c.id === carrier)?.label ?? "Auto-detect (17track)";
}
