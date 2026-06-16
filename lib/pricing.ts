// Current prices are the 25%-off sale prices.
// Original price = sale price / 0.75, rounded up to nearest .99 or clean number.
export function getOriginalPrice(salePrice: number): number {
  return Math.round((salePrice / 0.75) * 100) / 100;
}

export function getDiscountPercent(): number {
  return 25;
}
