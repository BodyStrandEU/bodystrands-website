#!/usr/bin/env node
// Splits variantImages for the 40 bulk-imported dual-color products.
// Au → Gold Tone only, Ag → Silver Tone only, G → both arrays.

const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../data/products.json');

// Classification: per-product arrays of 'Au', 'Ag', or 'G', indexed to match
// the current variantImages array order (same for Gold Tone and Silver Tone).
const CLASSIFICATIONS = {
  'silver-finger-hand-chain':           ['Au','Ag','Au','Ag','Au','Au','Au','G','G','G'],
  'boho-finger-hand-chain':             ['Au','Au','Ag','Au','G','G','G','G','G'],
  'reversible-y-chain-lariat':          ['Au','Au','Au','G','Au','G','G','G'],
  'boho-hair-chain':                    ['Ag','Ag','G','Ag','Ag','Ag','G','Au','G','G'],
  'bridal-open-back-necklace':          ['Ag','Ag','G','Ag','Ag','G','G','Ag','G','Au'],
  'boho-back-chain':                    ['Au','Au','Au','Au','Ag','Ag','G','G'],
  'boho-forehead-chain':                ['Au','Ag','Au','G','Au','Au','G','G','G','G'],
  'silver-shoulder-harness':            ['Ag','Au','Au','Au','Au','G','G','G','G'],
  'bridal-hair-vine-chain':             ['Au','Au','Ag','Au','G','G','G','G'],
  'barefoot-toe-chain-anklet':          ['Ag','Au','Ag','Ag','G','G','G','G','G','G'],
  'boho-belly-chain':                   ['Ag','Au','Au','Au','G','Au','G','Au','Au','Ag'],
  'thigh-chain':                        ['Au','Au','Ag','Ag','Au','Ag','Ag','G','Au','G'],
  'stainless-steel-belly-chain':        ['Au','Ag','Au','Au','G','G','Au','G','Au','G'],
  'pearl-beaded-belly-chain':           ['Au','Au','Ag','G','Au','Au','G','Ag','Ag','G'],
  'bridal-backdrop-necklace':           ['Au','Au','Ag','Au','Au','Au','G','G'],
  'layered-shoulder-body-chain':        ['Au','Ag','Au','Au','G','Au','G','Au','G','G'],
  '2-in-1-body-chain-necklace':         ['Au','Au','Ag','Au','G','G','Au','Au','G','G'],
  'gold-belly-body-chain':              ['Au','Au','Au','Au','G','Au','Au','Ag','Au','G'],
  'y2k-belly-chain':                    ['Ag','Ag','Au','Au','Au','G','Au','Au','G','Au'],
  'pearl-body-chain':                   ['Au','Au','Au','Au','G','G','Au','Au','G','G'],
  'beach-belly-chain':                  ['Ag','Au','G','Au','Ag','G','Ag','G','Ag','Au'],
  'goddess-shoulder-body-chain':        ['Au','Ag','G','G','Au','G','Au','Au','G','G'],
  'bridal-epaulette-shoulder-chain':    ['Ag','Au','G','G','Au','Au','G','Au','Au','G'],
  'bridal-shoulder-chain-2':            ['Ag','Au','G','G','Ag','Ag','Ag','Au','G'],
  'gold-waist-chain':                   ['Au','Au','Ag','Ag','Au','G','Au','Au','G','Ag'],
  'pearl-chain-anklet':                 ['Au','G','Au','G','Ag','G','G','G','Au','Au'],
  'minimalist-pearl-back-necklace':     ['Au','Au','Au','Au','Au','Au','G','Au','Au','Au'],
  'dainty-backdrop-back-necklace':      ['Au','Ag','Au','Ag','Au','Au','Ag','Au','G','Au'],
  'minimalist-glasses-chain':           ['Au','Ag','Ag','Ag','G','Au','G','Au','Ag','G'],
  'pearl-lariat-backdrop':              ['Au','Au','G','Au','G','G','Au','Ag','G'],
  'pearl-bridal-back-chain':            ['Au','Ag','Au','Au','Au','G','Au','Ag','Au','Ag'],
  'dainty-summer-belly-chain':          ['Ag','Au','Au','G','Au','Au','G','Au','G','Au'],
  'butterfly-backdrop-necklace-gold':   ['Au','Au','Au','Ag','G','G','Au','Au','Au','Au'],
  'bridal-pearl-back-necklace':         ['Au','Au','Au','Au','Au','Au','Ag','G','Au','Au'],
  'pearl-backdrop-open-back-necklace':  ['Au','Au','Ag','Au','Au','Au','G','Au','Au','Au'],
  'birthstone-gemstone-anklet':         ['Au','G','G','G','Au','Au','G','Ag','Ag','Au'],
  'gold-pearl-backdrop-necklace':       ['Au','Au','Au','Au','G','Au','G','Au'],
  'reversible-pearl-lariat-necklace':   ['Ag','Au','Au','Au','Au','G','Au','G','Ag','G'],
  'gold-body-chain-harness':            ['Au','Ag','Ag','Au','G','Au','Au','Au','Au','Ag'],
  'bikini-body-chain':                  ['Au','Ag','Au','Au','Au','G','Au','Au','Au','G'],
};

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

let updatedCount = 0;

for (const product of products) {
  const classification = CLASSIFICATIONS[product.id];
  if (!classification) continue;

  const urls = product.variantImages['Gold Tone']; // same as Silver Tone
  if (urls.length !== classification.length) {
    console.error(`MISMATCH ${product.id}: ${urls.length} urls vs ${classification.length} labels`);
    process.exit(1);
  }

  const goldUrls = [];
  const silverUrls = [];

  for (let i = 0; i < urls.length; i++) {
    const label = classification[i];
    if (label === 'Au') {
      goldUrls.push(urls[i]);
    } else if (label === 'Ag') {
      silverUrls.push(urls[i]);
    } else { // G
      goldUrls.push(urls[i]);
      silverUrls.push(urls[i]);
    }
  }

  product.variantImages['Gold Tone'] = goldUrls;
  product.variantImages['Silver Tone'] = silverUrls;
  updatedCount++;

  console.log(`✓ ${product.id}: Gold=${goldUrls.length} Silver=${silverUrls.length}`);
}

fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
console.log(`\nDone. Updated ${updatedCount} products.`);
