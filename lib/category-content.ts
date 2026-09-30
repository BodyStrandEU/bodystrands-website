// Buying-guide copy for category pages (/shop?category=…). Google had these pages at
// positions ~10–22 for searches like "back necklace", "back jewelry for backless dress",
// "arm chain" and "plus size body chain" (Search Console, Jul–Sep 2026) with only a
// product grid to judge them on. Every fact here comes from the product listings in
// data/products.json — keep it that way when editing (no invented specs or grades).
//
// Paragraph and list text may contain <a href="/shop/…"> links; headings and FAQ are plain text.

export type GuideBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type CategoryContent = {
  intro: string;
  guide: GuideBlock[];
  faq: { question: string; answer: string }[];
};

const link = (id: string, name: string) => `<a href="/shop/${id}">${name}</a>`;

export const CATEGORY_CONTENT: Partial<Record<string, CategoryContent>> = {
  "Back Chains": {
    intro:
      "A back necklace (also called a back chain or backdrop necklace) sits at the front like a normal necklace, with a second chain that drops down your spine. It's made for backless dresses, wedding gowns and open-back tops. Every piece here is handmade in stainless steel, in gold or silver tone, from €24.",
    guide: [
      { type: "heading", text: "How does a back necklace work?" },
      { type: "paragraph", text: "The front sits at your collarbone. At the back, a length of chain, pearls or charms hangs from the clasp and runs down your spine, so the jewelry is seen from behind as much as from the front. Lariat styles like the " + link("pearl-lariat-back-necklace", "Pearl Lariat Back Necklace") + " let the drop swing freely, and the " + link("reversible-pearl-lariat-necklace", "Reversible Pearl Lariat Necklace") + " can be turned around and worn with the drop at the front." },
      { type: "heading", text: "Which back jewelry suits your dress?" },
      { type: "list", items: [
        "Wedding gown: pearl pieces read as bridal. Try the " + link("pearl-wedding-back-necklace", "Pearl Wedding Back Necklace") + ", " + link("bridal-pearl-back-necklace", "Bridal Pearl Back Necklace") + " or " + link("bridal-open-back-necklace", "Bridal Open-Back Necklace") + ".",
        "Evening or prom dress: the " + link("pearl-evening-backdrop-necklace", "Pearl Evening Backdrop Necklace") + " has pearl drops that catch the light as you move.",
        "Beach wedding or festival: the " + link("boho-back-chain", "Boho Back Chain") + " is made for relaxed, bohemian looks.",
        "Minimal and everyday: the " + link("dainty-backdrop-back-necklace", "Dainty Backdrop Back Necklace") + " or " + link("minimalist-pearl-back-necklace", "Minimalist Pearl Back Necklace") + " keep it to one fine line.",
        "Something personal: the " + link("personalized-birthstone-back-necklace", "Personalized Birthstone Back Necklace") + " carries a birthstone charm at the back.",
      ] },
      { type: "heading", text: "Getting the drop length right" },
      { type: "paragraph", text: "Measure from the base of your neck down your spine to where the opening of your dress ends. The end of the drop should sit a little above the fabric so it hangs freely. Several of our back necklaces come with small (+7 cm) and medium (+14 cm) extender options for deeper backs." },
      { type: "paragraph", text: "Need an exact length? Most pieces can be made to your measurements for free. Just message us after checkout with your size." },
      { type: "heading", text: "Gold or silver tone?" },
      { type: "paragraph", text: "Most back necklaces come in both. Gold tone warms up ivory, champagne and blush fabrics; silver tone suits bright white, black and cool colours. All chains are stainless steel, so they won't turn your skin green." },
    ],
    faq: [
      { question: "What is a back necklace called?", answer: "It goes by several names: back necklace, back chain, backdrop necklace or back drop necklace. They all mean a necklace with a second chain or drop that hangs down your back." },
      { question: "What necklace do you wear with a backless dress?", answer: "A back necklace, which hangs a chain or pearl drop down your spine so the open back becomes part of the look. Pick a drop length that ends just above where the dress opening stops." },
      { question: "How long should the back drop be?", answer: "Measure from the base of your neck to where your dress opening ends and choose a drop slightly shorter than that. Many of our back necklaces offer +7 cm and +14 cm extenders, and we can make a custom length for free." },
      { question: "Are your back necklaces waterproof?", answer: "The chains are stainless steel, which is water-resistant and tarnish-resistant for everyday wear. For pieces with pearls, avoid long soaks and wipe them dry after wearing." },
    ],
  },

  "Shoulder & Arm Chains": {
    intro:
      "Arm chains and shoulder chains put jewelry where people don't expect it: a slim band around the upper arm, or chains that drape from your neck across your shoulders. Handmade in stainless steel, in gold or silver tone, from €20.",
    guide: [
      { type: "heading", text: "Arm chain or shoulder chain: what's the difference?" },
      { type: "paragraph", text: "An arm chain wraps around your upper arm. The " + link("bicep-chain", "Bicep Chain") + " simply slips on, the " + link("layered-arm-chain", "Layered Arm Chain") + " closes with a lobster clasp and small extender, and the " + link("birthstone-arm-band", "Birthstone Arm Band") + " and " + link("birthstone-arm-chain", "Birthstone Arm Chain") + " add a birthstone of your choice." },
      { type: "paragraph", text: "A shoulder chain connects at your neck and drapes over one or both shoulders, like the " + link("goddess-shoulder-chain", "Goddess Shoulder Chain") + ", " + link("multi-strand-shoulder-chain", "Multi Strand Shoulder Chain") + " or " + link("double-shoulder-chest-chain", "Double Shoulder Chest Chain") + ". The " + link("silver-shoulder-harness", "Silver Shoulder Harness") + " is a more structured shape, sized S to XL." },
      { type: "heading", text: "What to wear with an arm chain or shoulder chain" },
      { type: "list", items: [
        "Sleeveless, strapless and one-shoulder tops, where bare skin shows the chain.",
        "Weddings: the " + link("bridal-shoulder-chain", "Bridal Shoulder Chain") + " and " + link("bridal-shoulder-necklace", "Bridal Shoulder Necklace") + " are made for brides and bridesmaids.",
        "Off-shoulder dresses: the " + link("off-shoulder-chain-necklace", "Off-Shoulder Chain Necklace") + " follows the neckline.",
        "Beach days and festivals, over a bikini top or cover-up.",
        "Cooler months: a slim arm chain over a thin, fitted long-sleeve top.",
      ] },
      { type: "heading", text: "Finding your size" },
      { type: "paragraph", text: "For an arm chain, measure around the widest part of your upper arm where you want it to sit. For shoulder chains and harnesses, the fit depends on your shoulders and chest, and the harness comes in S, M, L and XL. If you're between sizes, message us after checkout and we'll make it to your measurements for free." },
    ],
    faq: [
      { question: "How do you wear an arm chain?", answer: "Slide or clasp it around your upper arm, just above the bicep, where it can't slip down. It looks best with sleeveless or one-shoulder tops so the chain sits on bare skin." },
      { question: "Which arm should you wear an arm chain on?", answer: "Either works. Many people choose the side that shows most in photos, or the arm opposite their bag strap so the chain isn't hidden." },
      { question: "Can you wear a shoulder chain to a wedding?", answer: "Yes. Bridal shoulder chains are designed for brides and bridesmaids and look good with strapless and off-shoulder dresses. As a guest, choose a fine, simple chain so it doesn't compete with the bride." },
      { question: "Are arm chains waterproof?", answer: "Our arm and shoulder chains are stainless steel, which is water-resistant and tarnish-resistant, so they can handle a swim or a shower." },
    ],
  },

  "Belly Chains": {
    intro:
      "Belly chains (also called waist chains) sit around your waist or hips: over a bikini, above low-rise jeans, or over a dress as a chain belt. Ours are stainless steel in gold or silver tone, from €16, including a plus size belly chain.",
    guide: [
      { type: "heading", text: "Belly chain, waist chain or chain belt?" },
      { type: "paragraph", text: "They're close cousins. A belly chain or waist chain is fine and sits on your skin, at the natural waist or lower on the hips. A chain belt is a little bolder and is often worn over clothes. The " + link("chain-waist-belt", "Chain Waist Belt") + " and " + link("coin-link-chain-belt", "Coin Link Chain Belt") + " are made for that, over a dress, jeans or a long knit." },
      { type: "heading", text: "Styles to choose from" },
      { type: "list", items: [
        "Simple and fine: " + link("snake-belly-chain", "Snake Belly Chain") + " and " + link("silver-waterproof-belly-chain", "Silver Belly Chain") + " (both €16).",
        "Pearl: " + link("pearl-belly-chain", "Pearl Belly Chain") + ", " + link("pearl-waist-chain", "Pearl Waist Chain") + " and " + link("pearl-beaded-belly-chain", "Pearl Beaded Belly Chain") + ".",
        "Beachy: the " + link("cowrie-shell-belly-chain", "Cowrie Shell Belly Chain") + " has natural cowrie shells on an adjustable pull-string cord.",
        "Charms and meaning: " + link("zodiac-yoga-belly-chain", "Zodiac Belly Chain") + ", " + link("cross-belly-chain", "Cross Belly Chain") + ", " + link("butterfly-charm-belly-chain", "Butterfly Charm Belly Chain") + " and " + link("dragonfly-charm-belly-chain", "Dragonfly Charm Belly Chain") + ".",
        "Layered: " + link("layered-hip-chain", "Layered Hip Chain") + " and " + link("silver-waist-chain", "Layered Belly Chain") + ".",
      ] },
      { type: "heading", text: "How to measure for a belly chain" },
      { type: "paragraph", text: "Decide where you want it to sit, at your natural waist or lower on your hips, and measure around that exact spot with a soft tape. Many of our belly chains are adjustable, and the " + link("plus-size-belly-chain", "Plus Size Belly Chain") + " is made for larger measurements. For a perfect fit, message us after checkout with your measurement and we'll size it for free." },
    ],
    faq: [
      { question: "Where should a belly chain sit?", answer: "Wherever you like it: at the natural waist for a dainty look, or lower on the hips over low-rise jeans or a bikini. Measure around the spot you want it to sit before choosing a size." },
      { question: "Can you swim with a belly chain?", answer: "Our stainless steel belly chains are water-resistant and tarnish-resistant, so they can go in the sea or pool. The cowrie shell chain is on a cord, so rinse it and let it dry after swimming." },
      { question: "Do you make plus size belly chains?", answer: "Yes. The Plus Size Belly Chain is made for larger waist and hip measurements, and any belly chain can be made to your exact size for free if you message us after checkout." },
      { question: "What's the difference between a waist chain and a chain belt?", answer: "A waist chain is fine and worn on the skin; a chain belt is usually bolder and worn over clothes, like a dress or jeans." },
    ],
  },

  "Body Chains": {
    intro:
      "Body chains connect a necklace to a waist chain and run down the front of your body. Wear one over a bikini at the beach, under an open shirt, or over a slip dress. Handmade in stainless steel, in gold or silver tone, from €32, including a plus size body chain.",
    guide: [
      { type: "heading", text: "Types of body chains" },
      { type: "list", items: [
        "Bikini body chains: the " + link("bikini-body-chain", "Bikini Body Chain") + " and " + link("gold-body-necklace", "Bikini Body Necklace") + " are made to wear over swimwear.",
        "Dainty everyday: the " + link("dainty-gold-body-chain", "Dainty Gold Body Chain") + " is one fine line from neck to waist.",
        "Pearl: the " + link("pearl-body-chain", "Pearl Body Chain") + " and " + link("pearl-body-harness", "Pearl Body Harness") + ".",
        "Statement: the " + link("layered-body-chain-double-choker", "Layered Double Choker Body Chain") + " pairs two chokers with body chains.",
        "Charms: " + link("cross-body-chain", "Cross Body Chain") + " and " + link("butterfly-body-chain", "Butterfly Body Chain") + ".",
      ] },
      { type: "heading", text: "How to choose the right size" },
      { type: "paragraph", text: "A body chain has two measurements that matter: around your neck, and the drop from your neck to where the waist chain sits. Several of our body chains come with a small extender (+7 cm) for a longer drop, and the " + link("plus-size-body-chain", "Plus Size Body Chain") + " is made for fuller figures. Message us after checkout with your measurements and we'll make any body chain to your size for free." },
      { type: "heading", text: "How to wear a body chain" },
      { type: "paragraph", text: "At the beach, wear it straight over a bikini. For evenings, let it show through an open shirt or over a slip dress. Fine chains work under sheer fabric too. Stainless steel is water-resistant and tarnish-resistant, so a body chain can go from the sea to dinner." },
    ],
    faq: [
      { question: "Can you wear a body chain in the sea?", answer: "Yes. Our body chains are stainless steel, which is water-resistant and tarnish-resistant. Rinse with fresh water and dry it after swimming to keep the shine." },
      { question: "How do I pick the right body chain size?", answer: "Measure around your neck and from the base of your neck to your waist. Use those to choose a size, add an extender for a longer drop, or message us after checkout for a free custom fit." },
      { question: "Do you make plus size body chains?", answer: "Yes. The Plus Size Body Chain is made for fuller figures, and any body chain can be made to your measurements for free." },
      { question: "Can you wear a body chain over clothes?", answer: "Yes. Fine chains look good over a slip dress, sheer top or open shirt. Bolder, layered styles work best over simple, plain fabrics." },
    ],
  },
};
