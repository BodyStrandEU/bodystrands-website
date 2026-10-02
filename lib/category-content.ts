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

  "Anklets": {
    intro:
      "Anklets and barefoot foot chains in gold and silver tone, from €22: dainty chain anklets, pearl and crystal styles, initial and birthstone anklets you personalise, and toe-chain anklets that look like barefoot sandals. All stainless steel, most adjustable.",
    guide: [
      { type: "heading", text: "Which anklet style is right for you?" },
      { type: "list", items: [
        "Dainty and everyday: " + link("pearl-chain-anklet", "Pearl Chain Anklet") + ", " + link("coin-disc-chain-anklet", "Coin Disc Chain Anklet") + " and " + link("butterfly-anklet", "Butterfly Anklet") + ".",
        "Personalised: the " + link("initial-letter-anklet", "Initial Letter Anklet") + " and " + link("diamond-initial-anklet", "Diamond Initial Anklet") + " carry your letter; the " + link("birthstone-gemstone-anklet", "Birthstone Gemstone Anklet") + ", " + link("gemstone-zodiac-anklet", "Gemstone Zodiac Anklet") + " and " + link("birth-flower-anklet", "Birth Flower Anklet") + " are chosen by month.",
        "Beach and vacation: the " + link("cowrie-shell-anklet", "Cowrie Shell Anklet") + " and " + link("colorful-crystal-bead-anklet", "Colorful Crystal Bead Anklet") + ".",
        "Layered: the " + link("layered-pearl-anklet", "Layered Pearl Anklet") + " gives a stacked look with one clasp.",
      ] },
      { type: "heading", text: "Barefoot anklets and toe chains" },
      { type: "paragraph", text: "A barefoot anklet (also called a foot chain or barefoot sandal) runs from the ankle across the top of the foot to a loop around one toe. The " + link("barefoot-toe-chain-anklet", "Barefoot Toe Chain Anklet") + ", " + link("barefoot-sandal-toe-chain", "Barefoot Sandal Toe Chain") + " and " + link("pearl-barefoot-sandal", "Pearl Barefoot Sandal") + " have adjustable ankle and toe loops; the " + link("mirror-link-foot-chain", "Mirror Link Foot Chain") + " and " + link("diamond-initial-foot-chain", "Personalized Diamond Initial Foot Chain") + " have a 21 cm anklet with a 6 cm extender and an 8 cm toe chain. For a larger fit, try the " + link("plus-size-toe-chain-anklet", "Plus Size Toe Chain Anklet") + "." },
      { type: "heading", text: "What size anklet do you need?" },
      { type: "paragraph", text: "Most of our anklets are 21 cm, many with a 5–6 cm extender, which fits most ankles with a little room to move. Measure around your ankle just above the bone and add 1–2 cm for a relaxed fit. Need it longer or shorter? Message us after checkout and we'll make it to size for free." },
    ],
    faq: [
      { question: "What is a barefoot anklet?", answer: "A barefoot anklet, or foot chain, connects an anklet to a loop around one toe, so a fine chain runs across the top of your foot like a sandal. Ours have adjustable ankle and toe loops." },
      { question: "What length anklet should I buy?", answer: "Measure around your ankle just above the bone and add 1–2 cm. Most of our anklets are 21 cm with a 5–6 cm extender, and we can make a custom length for free." },
      { question: "Can I personalise an anklet?", answer: "Yes. Choose your letter for the initial anklets, or your birth month for the birthstone, zodiac and birth flower anklets, at checkout." },
      { question: "Can you wear an anklet in the sea?", answer: "Our stainless steel anklets are water-resistant and tarnish-resistant, so they can go in the sea or pool. Rinse and dry pieces with shells, beads or pearls after swimming." },
    ],
  },

  "Bracelets": {
    intro:
      "Charm bracelets and dainty bracelets from €14: birth flower, zodiac and initial charm bracelets you personalise, pearl and cross bracelets, and simple chains for stacking. Stainless steel in gold and silver tone, with plus size options.",
    guide: [
      { type: "heading", text: "Personalised charm bracelets" },
      { type: "paragraph", text: "The " + link("birth-flower-charm-bracelet", "Birth Flower Charm Bracelet") + " carries the flower for any of the 12 months and adjusts from 14 to 23 cm. The " + link("zodiac-charm-bracelet", "Zodiac Charm Bracelet") + " carries a star sign, the " + link("birthstone-bracelet", "Birthstone Bracelet") + " a birthstone for any month, and the " + link("script-initial-bracelet", "Script Initial Bracelet") + " and " + link("pearl-heart-initial-bracelet", "Pearl Heart Initial Bracelet") + " your chosen letter. You pick the charm at checkout, which makes these an easy personal gift." },
      { type: "heading", text: "Pearl and cross bracelets" },
      { type: "list", items: [
        "Pearl: " + link("layered-pearl-bracelet", "Layered Pearl Bracelet") + " (freshwater pearls) and " + link("pearl-charm-bracelet", "Pearl Charm Bracelet") + ".",
        "Faith: " + link("pearl-rosary-cross-bracelet", "Pearl Rosary Cross Bracelet") + ", " + link("pearl-cross-faith-bracelet", "Pearl Cross Faith Bracelet") + ", " + link("pink-cross-charm-bracelet", "Pink Cross Charm Bracelet") + " and " + link("gold-beaded-cross-bracelet", "Gold Beaded Cross Bracelet") + ", popular for communions, confirmations and baptisms.",
        "Simple chains for stacking: " + link("dainty-chain-bracelet", "Dainty Chain Bracelet") + " (€14), " + link("cuban-chain-bracelet", "Cuban Chain Bracelet") + " and " + link("coin-disc-bracelet", "Coin Disc Bracelet") + ".",
      ] },
      { type: "heading", text: "Plus size bracelets and sizing" },
      { type: "paragraph", text: "Measure around your wrist where you'd wear the bracelet and add about 1–2 cm for a comfortable fit. Several of our bracelets come in sizes from 14 cm up to 23 cm, and the " + link("plus-size-bracelet", "Plus Size Bracelet") + " is made for larger wrists. Any bracelet can be made to your exact size for free — message us after checkout." },
    ],
    faq: [
      { question: "What is a birth flower charm bracelet?", answer: "A bracelet with a charm showing the flower for a birth month — each of the 12 months has its own flower. You choose the month at checkout." },
      { question: "Do you make plus size bracelets?", answer: "Yes. Several bracelets come in sizes up to 23 cm, there's a dedicated Plus Size Bracelet, and we can make any bracelet to your measurement for free." },
      { question: "What size bracelet should I get?", answer: "Measure your wrist and add 1–2 cm. Many of our bracelets come in sizes from 14 cm to 23 cm or have an extender." },
      { question: "Are your bracelets good gifts?", answer: "The personalised charm bracelets are our most giftable pieces, because you choose a letter, birth month, flower or star sign for the person you're buying for." },
    ],
  },

  "Necklaces": {
    intro:
      "Initial and monogram necklaces, chokers, pendant necklaces and ready-layered necklace stacks, from €20. Stainless steel in gold and silver tone — many sit at 35 cm with a 6 cm extender, the choker length that rests at the collarbone.",
    guide: [
      { type: "heading", text: "Initial and monogram necklaces" },
      { type: "paragraph", text: "The " + link("monogram-letter-necklace", "Monogram Letter Necklace") + " carries your letter in gold, the " + link("initial-letter-rhinestone-choker", "Diamond Initial Necklace") + " and " + link("paperclip-initial-necklace", "Paperclip Chain Diamond Initial Necklace") + " a rhinestone letter, and the " + link("initial-heart-pearl-choker", "Initial Heart Pearl Choker") + " pairs pearls with a heart. Birth month styles include the " + link("birthstone-choker-necklace", "Birthstone Choker Necklace") + ", " + link("birth-flower-charm-necklace", "Birth Flower Charm Necklace") + " and " + link("birth-month-teardrop-choker", "Birth Month Teardrop Choker") + "." },
      { type: "heading", text: "Chokers, pendants and statement pieces" },
      { type: "list", items: [
        "Cross: " + link("pink-cross-choker", "Pink Cross Choker Necklace") + ", " + link("stacked-pearl-cross-choker", "Stacked Pearl Cross Choker") + ", " + link("rosary-pearl-cross-choker", "Rosary Pearl Cross Choker") + " and " + link("curb-chain-cross-necklace", "Cross Pendant Curb Chain Necklace") + ".",
        "Pendants: the " + link("dragonfly-pendant-necklace", "Dragonfly Pendant Necklace") + " (55 cm, 35 × 50 mm dragonfly) and " + link("evil-eye-choker-necklace", "Evil Eye Choker Necklace") + " with natural tiger's eye.",
        "Front-clasp toggle necklaces: " + link("chunky-toggle-cross-necklace", "Chunky Toggle Cross Necklace") + " and " + link("pearl-heart-toggle-necklace", "Chunky Pearl Heart Toggle Necklace") + ".",
        "Colour and texture: " + link("turquoise-beaded-choker", "Turquoise Enamel Bead Double Choker") + ", " + link("colorful-crystal-bead-choker", "Colorful Crystal Bead Choker") + " and " + link("boho-shell-choker-necklace", "Boho Shell Choker Necklace") + ".",
      ] },
      { type: "heading", text: "Layered necklace stacks" },
      { type: "paragraph", text: "Stacks are two or more necklaces at different lengths, sold together so the layers never fight. The " + link("curated-layered-necklace-stack", "Cross & Zodiac Necklace Stack") + " and " + link("turquoise-zodiac-necklace-stack", "Turquoise & Zodiac Necklace Stack") + " pair a 35 cm choker with a 66 cm zodiac necklace; the " + link("maximalist-layered-necklace-stack", "Maximalist Layered Necklace Stack") + " adds a 48 cm flat chain." },
    ],
    faq: [
      { question: "What length is a choker necklace?", answer: "Most of our chokers are 35 cm, many with a 6 cm extender (adjustable to 41 cm), so they rest snugly at the base of the neck or on the collarbone." },
      { question: "Can I personalise a necklace with my initial?", answer: "Yes. Choose your letter at checkout for the monogram and initial necklaces, or your birth month for the birthstone and birth flower styles." },
      { question: "How do you layer necklaces without tangling?", answer: "Leave about 5–10 cm between lengths, or choose a ready-made stack, where the lengths are already chosen to sit apart." },
      { question: "Will your necklaces tarnish?", answer: "Our chains are stainless steel, which is tarnish-resistant for everyday wear. Wipe them with a soft cloth and keep perfume off the chain to keep the shine." },
    ],
  },

  "Hand Chains": {
    intro:
      "Hand chains connect a bracelet to a ring with a fine chain across the back of your hand — boho, pearl and minimal styles in gold and silver tone, from €24. Stainless steel, with adjustable ring and bracelet sections.",
    guide: [
      { type: "heading", text: "Styles of hand chain" },
      { type: "list", items: [
        "Minimal: the " + link("silver-finger-hand-chain", "Dainty Hand Chain") + " and " + link("mirror-link-hand-chain", "Mirror Link Hand Chain") + ", one fine chain from wrist to finger.",
        "Boho: the " + link("boho-finger-hand-chain", "Boho Finger Hand Chain") + " (16.5 cm bracelet with a 4 cm extension) and the " + link("gold-hand-chain", "Multi-Strand Hand Chain") + ", a fuller hand harness look.",
        "Pearl: the " + link("pearl-hand-chain", "Pearl Hand Chain") + " and " + link("pearl-cross-hand-chain", "Pearl Cross Hand Chain") + ", popular for weddings.",
      ] },
      { type: "heading", text: "How a hand chain should fit" },
      { type: "paragraph", text: "The bracelet part sits loosely around the wrist and the ring on your middle or ring finger, with the chain lying flat across the back of the hand. Several of ours have a 16.5 cm bracelet and a US 6 / EU 52 ring; others have adjustable ring and bracelet sections. If you need a different size, message us after checkout and we'll make it to your measurements for free." },
    ],
    faq: [
      { question: "What is a hand chain called?", answer: "Hand chains are also called hand harnesses, finger bracelets or ring bracelets. They all join a bracelet to a ring with chain across the hand." },
      { question: "Which finger does a hand chain go on?", answer: "Usually the middle finger, so the chain runs straight down the back of the hand, but the ring finger works too." },
      { question: "Are hand chains comfortable to wear all day?", answer: "Yes, if the fit is right: the chain should lie flat without pulling when you bend your fingers. Our adjustable sections and free custom sizing help with that." },
    ],
  },

  "Head Chains": {
    intro:
      "Forehead chains, bridal head chains and hair chains, from €24 — dainty pieces that sit across the forehead or drape through the hair for weddings, festivals and special events. Stainless steel in gold and silver tone, adjustable.",
    guide: [
      { type: "heading", text: "Forehead chain or hair chain?" },
      { type: "paragraph", text: "A forehead chain sits across the forehead or just along the hairline, like the " + link("bridal-forehead-chain", "Bridal Forehead Chain") + " (52 cm, adjustable) and " + link("boho-forehead-chain", "Boho Forehead Chain") + ". A hair chain drapes through the hair and attaches with pins or a comb, like the " + link("boho-hair-chain", "Boho Hair Chain") + " and " + link("bridal-hair-vine-chain", "Bridal Hair Vine Chain") + "." },
      { type: "heading", text: "Bridal head chains" },
      { type: "paragraph", text: "For a wedding, pearl and fine chain pieces read most bridal. The " + link("pearl-bridal-head-chain", "Pearl Bridal Head Chain") + " attaches to the hair with a comb or pin and works with an updo or loose waves; the " + link("bridal-hair-vine-chain", "Bridal Hair Vine Chain") + " can be woven around a bun or braid." },
      { type: "heading", text: "How to wear a forehead chain" },
      { type: "list", items: [
        "Decide the line first: across the middle of the forehead for a bold look, or along the hairline for something softer.",
        "Secure each end with a bobby pin hidden under a section of hair.",
        "Keep earrings simple so the head piece stays the focus.",
      ] },
    ],
    faq: [
      { question: "How do you keep a forehead chain in place?", answer: "Pin each side under a small section of hair with bobby pins. Pieces that attach with a comb or pins stay put through a full day." },
      { question: "Can I wear a head chain with short hair?", answer: "Yes. Wear a forehead chain along the hairline and pin it just behind the ears, where short hair still covers the pins." },
      { question: "What head chain suits a wedding?", answer: "Pearl and fine chain styles look most bridal. Pick gold or silver tone to match your dress and other jewelry." },
    ],
  },

  "Eyeglasses Chains": {
    intro:
      "Stainless steel eyeglasses chains that keep your glasses or sunglasses around your neck and look like jewelry while they do it — minimal, pearl and beaded styles from €16, in gold and silver tone.",
    guide: [
      { type: "heading", text: "Choosing an eyeglasses chain" },
      { type: "list", items: [
        "Minimal: the " + link("silver-eyeglasses-chain", "Eyeglasses Chain") + " (€16) and " + link("dainty-eyeglasses-chain", "Dainty Eyeglasses Chain") + " (both 74 cm), plus the " + link("minimalist-glasses-chain", "Minimalist Glasses Chain") + ".",
        "Pearl: the " + link("pearl-glasses-chain", "Pearl Glasses Chain") + ".",
        "Beaded: the " + link("beaded-glasses-chain", "Beaded Glasses Chain") + " and " + link("boho-beaded-eyeglasses-chain", "Boho Beaded Eyeglasses Chain") + ".",
      ] },
      { type: "heading", text: "Reading glasses, sunglasses and gifting" },
      { type: "paragraph", text: "A chain stops you misplacing reading glasses and keeps sunglasses safe at the beach or on the go. Because the chain hangs like a necklace when the glasses are off, it's an easy gift for anyone who wears glasses every day." },
    ],
    faq: [
      { question: "How long should an eyeglasses chain be?", answer: "Around 70–75 cm lets glasses hang comfortably at chest height. Our minimal chains are 74 cm." },
      { question: "Will an eyeglasses chain fit my glasses?", answer: "The rubber loops at each end slip over most glasses and sunglasses arms, thin or thick." },
      { question: "Are stainless steel glasses chains good?", answer: "Yes — stainless steel is light, strong and tarnish-resistant, so the chain keeps its colour with daily wear." },
    ],
  },

  "Bikini Clip Chains": {
    intro:
      "Bikini chains that clip onto your swimwear, bra or waistband to add a little body jewelry at the beach — beaded and birthstone styles at €24, in stainless steel.",
    guide: [
      { type: "heading", text: "How bikini clip chains work" },
      { type: "paragraph", text: "Clip each end onto a strap, ring or waistband and the chain drapes across your body — no clasp around the waist needed. The " + link("beaded-bikini-clip-chain", "Beaded Bikini Clip Chain") + " attaches to any strap, waistband or bra; the " + link("birthstone-bikini-clip-chain", "Birthstone Bikini Clip Chain") + " carries a birthstone charm for any month." },
      { type: "heading", text: "Want a full beach body chain?" },
      { type: "paragraph", text: "For a chain that wraps the body rather than clipping on, see our " + "<a href=\"/shop?category=Body%20Chains\">body chains</a>" + ", including bikini body chains made to wear over swimwear." },
    ],
    faq: [
      { question: "What is a bikini chain?", answer: "A bikini chain is body jewelry made to wear with swimwear. Clip-on styles attach to straps or waistbands, while body chain styles wrap around the body." },
      { question: "Can bikini chains go in the water?", answer: "Our stainless steel chains are water- and tarnish-resistant. Rinse with fresh water after the sea or pool and let them dry." },
      { question: "Will it fit my swimsuit?", answer: "The clips attach to most straps, rings and waistbands, so they work with bikinis, one-pieces and bras." },
    ],
  },

  "Leg Chains": {
    intro:
      "Thigh chains and leg chains, from €28 — slip-on thigh chains with a hidden stretch closure, a birthstone thigh chain, and a waist-to-thigh chain. Stainless steel in gold and silver tone.",
    guide: [
      { type: "heading", text: "Types of thigh chain" },
      { type: "list", items: [
        "Slip-on: the " + link("double-drape-thigh-chain", "Double Drape Thigh Chain") + " and " + link("birthstone-thigh-chain", "Birthstone Thigh Chain") + " have a hidden stretch closure, so there's no clasp to fasten.",
        "Statement: the " + link("thigh-chain", "Thigh Chain") + ".",
        "Waist to thigh: the " + link("double-thigh-belly-chain", "Double Thigh Belly Chain") + " connects a waist chain to both thighs, with an adjustable extender.",
      ] },
      { type: "heading", text: "How to wear a thigh chain" },
      { type: "paragraph", text: "Wear it high on the thigh under a short skirt or dress, with a high-cut swimsuit at the beach, or peeking out from shorts. For sizing, measure around the thigh where you want it to sit; if you're between sizes, message us after checkout for a free custom fit." },
    ],
    faq: [
      { question: "What is a thigh chain called?", answer: "Thigh chains are also called leg chains or thighlets. They sit around the upper thigh, sometimes with drapes of chain." },
      { question: "Do thigh chains stay up?", answer: "A well-fitted thigh chain stays in place; our slip-on styles use a hidden stretch closure to sit snugly without a clasp." },
      { question: "How do I measure for a thigh chain?", answer: "Measure around your thigh at the height you want it to sit, using a soft tape. Message us with the measurement for a custom fit." },
    ],
  },

  "Rings": {
    intro:
      "Birthstone rings and evil eye rings at €19.20 — dainty stacking rings with a cubic zirconia stone in your birth month colour, an adjustable evil eye ring, and a natural rhodochrosite ring.",
    guide: [
      { type: "heading", text: "Birthstone rings" },
      { type: "paragraph", text: "The " + link("birthstone-ring", "Birthstone Ring") + " is a dainty stainless steel stacking ring set with one cubic zirconia stone in any of the 12 birthstone colours. It comes in US size 6 (EU 51) only, so check your size before ordering." },
      { type: "heading", text: "Evil eye and natural stone rings" },
      { type: "paragraph", text: "The " + link("evil-eye-ring", "Evil Eye Ring") + " has a green cubic zirconia evil eye on a fully adjustable open band (20 mm inner diameter), so one size fits most. The " + link("rhodochrosite-ring", "Rhodochrosite Ring") + " uses natural rhodochrosite stone on an adjustable elastic cord — each stone's colour varies slightly." },
    ],
    faq: [
      { question: "What sizes do your rings come in?", answer: "The Birthstone Ring is US 6 (EU 51) only. The Evil Eye Ring is adjustable and the Rhodochrosite Ring stretches, so both fit most fingers." },
      { question: "Can I choose my birthstone colour?", answer: "Yes. Pick any of the 12 birth month colours at checkout." },
      { question: "What does an evil eye ring mean?", answer: "The evil eye is a traditional symbol of protection, believed to ward off bad luck — which is why evil eye jewelry is a popular gift." },
    ],
  },
};
