"use client";

import { useCurrency } from "@/lib/currency-context";

type Zone = {
  zone: string;
  rate: number;
  freeOver: number | null;
  freeOverDisplay?: string; // fixed native-currency label, overrides format(freeOver) when set
  delivery: string;
  countries: string;
};

const SHIPPING_ZONES: Zone[] = [
  {
    zone: "European Union",
    rate: 5,
    freeOver: 50,
    delivery: "4–7 business days",
    countries: "Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden",
  },
  {
    zone: "United Kingdom & Switzerland",
    rate: 8,
    freeOver: 50,
    delivery: "4–7 business days",
    countries: "United Kingdom, Switzerland",
  },
  {
    zone: "USA",
    rate: 8,
    freeOver: 55.56,
    freeOverDisplay: "$60.00 USD",
    delivery: "7–14 business days",
    countries: "United States",
  },
  {
    zone: "Canada",
    rate: 8,
    freeOver: 51.02,
    freeOverDisplay: "$75.00 CAD",
    delivery: "7–14 business days",
    countries: "Canada",
  },
];

export default function ShippingRatesTable() {
  const { format } = useCurrency();

  return (
    <div className="space-y-4">
      {SHIPPING_ZONES.map((z) => (
        <div key={z.zone} className="border border-[#E8B4A8]/40 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
            <span className="font-josefin text-sm tracking-wider uppercase text-[#2C2220]">{z.zone}</span>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-josefin text-sm text-[#A0622A]">{format(z.rate)}</span>
              {z.freeOver != null && (
                <>
                  <span className="text-[#8C7B6E] text-base">·</span>
                  <span className="font-josefin text-xs tracking-wide text-[#A0622A]/70">Free over {z.freeOverDisplay ?? format(z.freeOver)}</span>
                </>
              )}
            </div>
          </div>
          <p className="text-base text-[#8C7B6E] mb-1">Estimated delivery: {z.delivery}</p>
          <p className="text-sm text-[#8C7B6E]/70 leading-snug">{z.countries}</p>
        </div>
      ))}
    </div>
  );
}
