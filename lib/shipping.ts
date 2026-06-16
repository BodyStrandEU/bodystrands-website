export type ShippingRate = {
  displayName: string;
  amount:      number; // cents
  deliveryMin: number;
  deliveryMax: number;
};

const EU = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE",
]);

export function getShippingRate(countryCode: string, cartTotal: number): ShippingRate {
  const free = cartTotal >= 50;
  if (EU.has(countryCode)) {
    return {
      displayName: free ? "Free Shipping — European Union" : "Standard Shipping — European Union",
      amount:      free ? 0 : 500,
      deliveryMin: 4, deliveryMax: 7,
    };
  }
  if (countryCode === "GB" || countryCode === "CH") {
    return {
      displayName: free ? "Free Shipping — UK & Switzerland" : "Standard Shipping — UK & Switzerland",
      amount:      free ? 0 : 800,
      deliveryMin: 4, deliveryMax: 7,
    };
  }
  if (countryCode === "US" || countryCode === "CA") {
    return {
      displayName: "Standard Shipping — USA & Canada",
      amount:      1500,
      deliveryMin: 7, deliveryMax: 14,
    };
  }
  return {
    displayName: "International Shipping — Rest of World",
    amount:      2500,
    deliveryMin: 7, deliveryMax: 20,
  };
}

// Countries available in the shipping dropdown, grouped by zone
export const COUNTRY_GROUPS: { label: string; countries: { code: string; name: string }[] }[] = [
  {
    label: "European Union",
    countries: [
      { code: "AT", name: "Austria" }, { code: "BE", name: "Belgium" },
      { code: "BG", name: "Bulgaria" }, { code: "HR", name: "Croatia" },
      { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czech Republic" },
      { code: "DK", name: "Denmark" }, { code: "EE", name: "Estonia" },
      { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
      { code: "DE", name: "Germany" }, { code: "GR", name: "Greece" },
      { code: "HU", name: "Hungary" }, { code: "IE", name: "Ireland" },
      { code: "IT", name: "Italy" }, { code: "LV", name: "Latvia" },
      { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
      { code: "MT", name: "Malta" }, { code: "NL", name: "Netherlands" },
      { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" },
      { code: "RO", name: "Romania" }, { code: "SK", name: "Slovakia" },
      { code: "SI", name: "Slovenia" }, { code: "ES", name: "Spain" },
      { code: "SE", name: "Sweden" },
    ],
  },
  {
    label: "UK & Switzerland",
    countries: [
      { code: "GB", name: "United Kingdom" },
      { code: "CH", name: "Switzerland" },
    ],
  },
  {
    label: "USA & Canada",
    countries: [
      { code: "US", name: "United States" },
      { code: "CA", name: "Canada" },
    ],
  },
  {
    label: "Rest of World",
    countries: [
      { code: "AU", name: "Australia" }, { code: "NZ", name: "New Zealand" },
      { code: "JP", name: "Japan" }, { code: "KR", name: "South Korea" },
      { code: "SG", name: "Singapore" }, { code: "HK", name: "Hong Kong" },
      { code: "TW", name: "Taiwan" }, { code: "IN", name: "India" },
      { code: "TH", name: "Thailand" }, { code: "ID", name: "Indonesia" },
      { code: "MY", name: "Malaysia" }, { code: "PH", name: "Philippines" },
      { code: "VN", name: "Vietnam" }, { code: "AE", name: "UAE" },
      { code: "SA", name: "Saudi Arabia" }, { code: "QA", name: "Qatar" },
      { code: "KW", name: "Kuwait" }, { code: "BH", name: "Bahrain" },
      { code: "IL", name: "Israel" }, { code: "TR", name: "Turkey" },
      { code: "NO", name: "Norway" }, { code: "IS", name: "Iceland" },
      { code: "BR", name: "Brazil" }, { code: "MX", name: "Mexico" },
      { code: "AR", name: "Argentina" }, { code: "CL", name: "Chile" },
      { code: "CO", name: "Colombia" }, { code: "ZA", name: "South Africa" },
      { code: "NG", name: "Nigeria" }, { code: "EG", name: "Egypt" },
      { code: "MA", name: "Morocco" },
    ],
  },
];

// All supported country codes (for Stripe allowed_countries)
export const ALL_COUNTRIES = COUNTRY_GROUPS.flatMap((g) => g.countries.map((c) => c.code));
