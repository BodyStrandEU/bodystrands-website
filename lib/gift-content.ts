// Gift page copy for /gifts and /christmas (Oct 2, 2026). Grounded in:
// - Search Console: the site already appears for "jewelry for new girlfriend" (pos ~22),
//   "personalised/personalized bracelet gift ideas" (~180 impressions, pos ~11),
//   "jewellery gifting guide under 50" (pos ~10), "jewelry gifts for sister",
//   "last minute jewelry gifts";
// - Web research for Christmas 2026: personalised initial/birthstone/zodiac pieces, charm
//   bracelets, evil eye and heart pieces, layered necklaces, pearls and affordable luxury
//   lead gift searches; searches cluster around her/girlfriend/wife/mum and price caps.
// Facts only from the listings and the site (gift wrap €4 add-on with a note, dispatch in
// 1–2 business days, free shipping to Europe & North America over €50, 14-day returns).
// Occasion and seasonal searches belong here and in blog posts — not in product titles.
import type { CategoryContent } from "@/lib/category-content";

const link = (id: string, name: string) => `<a href="/shop/${id}">${name}</a>`;

export const GIFTS_CONTENT: CategoryContent = {
  intro:
    "Jewelry gifts for her that get worn every day: personalised initial, birthstone and birth flower pieces, pearls and charm bracelets, most between €14 and €40. Stainless steel that won't tarnish, gift wrap at checkout, and free sizing on most pieces.",
  guide: [
    { type: "heading", text: "Personalised jewelry: the gift that's hard to get wrong" },
    { type: "paragraph", text: "Personalised pieces are among the most searched jewelry gifts this year, because they feel chosen rather than bought. Pick her letter for the " + link("script-initial-bracelet", "Script Initial Bracelet") + " or " + link("monogram-letter-necklace", "Monogram Letter Necklace") + ", her birth month for the " + link("birthstone-bracelet", "Birthstone Bracelet") + " or " + link("birth-flower-charm-bracelet", "Birth Flower Charm Bracelet") + ", or her star sign for the " + link("zodiac-charm-bracelet", "Zodiac Charm Bracelet") + ". You choose the letter, month or sign at checkout." },
    { type: "heading", text: "Jewelry gifts by who you're buying for" },
    { type: "list", items: [
      "A new girlfriend: keep it simple and wearable — a " + link("dainty-chain-bracelet", "Dainty Chain Bracelet") + " (€14), " + link("coin-disc-bracelet", "Coin Disc Bracelet") + " or " + link("initial-heart-pearl-choker", "Initial Heart Pearl Choker") + " says thoughtful without saying too much.",
      "Your mum: birth month pieces carry meaning — the " + link("birth-flower-charm-necklace", "Birth Flower Charm Necklace") + " or a " + link("pearl-charm-bracelet", "Pearl Charm Bracelet") + ".",
      "Your sister or best friend: matching " + link("zodiac-charm-bracelet", "zodiac charm bracelets") + " or an " + link("evil-eye-ring", "Evil Eye Ring") + ".",
      "A bride or bridesmaids: the " + link("pearl-wedding-back-necklace", "Pearl Wedding Back Necklace") + ", " + link("bridal-shoulder-chain", "Bridal Shoulder Chain") + " or " + link("pearl-bridal-head-chain", "Pearl Bridal Head Chain") + ".",
      "Communion, confirmation or baptism: the " + link("pearl-rosary-cross-bracelet", "Pearl Rosary Cross Bracelet") + " or " + link("gold-beaded-cross-bracelet", "Gold Beaded Cross Bracelet") + ".",
    ] },
    { type: "heading", text: "Jewelry gifts under €25, €40 and €50" },
    { type: "paragraph", text: "Most of our pieces cost between €20 and €36, so nearly everything here is a gift under €50. Under €25 you'll find chain bracelets, chokers, anklets and our " + link("birthstone-ring", "Birthstone Ring") + "; under €40, personalised charm pieces, pearl jewelry and body chains." },
    { type: "heading", text: "Getting the size right for a gift" },
    { type: "paragraph", text: "Most bracelets, anklets and chokers are adjustable or come with an extender, so you don't need her exact measurements. If you do know them, message us after checkout and we'll make the piece to size for free. Add gift wrap and a note in your cart (+€4)." },
  ],
  faq: [
    { question: "What is a good jewelry gift for a new girlfriend?", answer: "Something simple she can wear every day: a dainty chain bracelet, a coin disc bracelet or a small pearl choker. Save heavily personalised pieces for later." },
    { question: "Are personalised bracelets a good gift?", answer: "Yes. Choosing her initial, birth month, birth flower or star sign makes the gift feel personal, and our charm bracelets let you pick it at checkout." },
    { question: "Can you gift wrap my order?", answer: "Yes. Tick gift wrap in your cart for €4 and add a personal note." },
    { question: "What if it doesn't fit?", answer: "Most pieces are adjustable, we can make them to size for free, and there are 14-day returns." },
    { question: "How fast do you ship?", answer: "Orders leave us within 1–2 business days, with free shipping to Europe and North America on orders over €50." },
  ],
};

export const PERSONALIZED_CONTENT: CategoryContent = {
  intro:
    "Jewelry personalised with her initial, birthstone, birth flower or star sign — picked at checkout, no extra cost. Stainless steel in gold and silver tone, from €20 to €44.",
  guide: [
    { type: "heading", text: "Choose how you personalise it" },
    { type: "list", items: [
      "Initial: the " + link("monogram-letter-necklace", "Monogram Letter Necklace") + ", " + link("script-initial-bracelet", "Script Initial Bracelet") + ", " + link("initial-letter-anklet", "Initial Letter Anklet") + " and " + link("diamond-initial-anklet", "Diamond Initial Anklet") + ".",
      "Birthstone: the " + link("birthstone-bracelet", "Birthstone Bracelet") + ", " + link("birthstone-choker-necklace", "Birthstone Choker Necklace") + " and " + link("birthstone-gemstone-anklet", "Birthstone Gemstone Anklet") + ".",
      "Birth flower: the " + link("birth-flower-charm-bracelet", "Birth Flower Charm Bracelet") + ", " + link("birth-flower-charm-necklace", "Birth Flower Charm Necklace") + " and " + link("birth-flower-anklet", "Birth Flower Anklet") + ".",
      "Zodiac: the " + link("zodiac-charm-bracelet", "Zodiac Charm Bracelet") + ", " + link("zodiac-anklet", "Zodiac Anklet") + ", " + link("zodiac-slip-on-necklace", "Zodiac Slip-On Necklace") + " and " + link("gemstone-zodiac-anklet", "Gemstone Zodiac Anklet") + ".",
    ] },
    { type: "heading", text: "Layered and stacked personalised pieces" },
    { type: "paragraph", text: "For a more built-up look, the " + link("curated-layered-necklace-stack", "Cross & Zodiac Necklace Stack") + ", " + link("turquoise-zodiac-necklace-stack", "Turquoise & Zodiac Necklace Stack") + " and " + link("maximalist-layered-necklace-stack", "Maximalist Layered Necklace Stack") + " come ready-layered, and the " + link("diamond-initial-layered-bracelet", "Diamond Initial Layered Bracelet") + " pairs two chains with a rhinestone initial." },
    { type: "heading", text: "How personalisation works" },
    { type: "paragraph", text: "Pick your letter, birth month or star sign from the dropdown on the product page before adding to cart — there's no extra charge and no need to message us first. If you want a size or length adjusted too, message us after ordering and we'll make it to your measurements for free." },
  ],
  faq: [
    { question: "How do I personalise my jewelry?", answer: "Select your letter, birth month, birth flower or star sign from the dropdown on the product page before checkout. No extra cost." },
    { question: "Can I personalise a gift for someone else?", answer: "Yes — just choose their initial, birth month or sign at checkout. If you're not sure, most of our personalised pieces also make a lovely plain gift." },
    { question: "Are personalised pieces returnable?", answer: "Yes, the same 14-day return policy applies. If you selected the wrong letter or month, message us and we'll help sort it out." },
    { question: "What's the price range for personalised jewelry?", answer: "Most personalised pieces run from €20 to €44, with the majority between €24 and €30." },
  ],
};

export const BRIDAL_CONTENT: CategoryContent = {
  intro:
    "Bridal jewelry for your wedding day: back necklaces for open-back gowns, hair vines and head chains for your bridal hairstyle, and shoulder chains for off-shoulder dresses — in pearl and gold or silver-tone stainless steel, from €24 to €50.",
  guide: [
    { type: "heading", text: "Back necklaces for backless gowns" },
    { type: "paragraph", text: "Our biggest bridal category — the " + link("pearl-wedding-back-necklace", "Pearl Wedding Back Necklace") + ", " + link("pearl-evening-backdrop-necklace", "Pearl Evening Backdrop Necklace") + ", " + link("minimalist-pearl-back-necklace", "Minimalist Pearl Back Necklace") + ", " + link("bridal-pearl-back-necklace", "Bridal Pearl Back Necklace") + ", " + link("pearl-bridal-back-chain", "Pearl Bridal Back Chain") + ", " + link("bridal-open-back-necklace", "Bridal Open-Back Necklace") + ", " + link("boho-back-chain", "Boho Back Chain") + " and " + link("pearl-backdrop-necklace", "Pearl Backdrop Necklace") + " all drape down the spine, designed to sit in the open back of a wedding gown." },
    { type: "heading", text: "Hair vines and head chains" },
    { type: "paragraph", text: "The " + link("bridal-forehead-chain", "Bridal Forehead Chain") + ", " + link("pearl-bridal-head-chain", "Pearl Bridal Head Chain") + " and " + link("bridal-hair-vine-chain", "Bridal Hair Vine Chain") + " are about your hairstyle, not your dress — they work with an up-do or loose bridal hair, worn alone or layered with a veil, with any neckline or back." },
    { type: "heading", text: "Shoulder chains" },
    { type: "paragraph", text: "The " + link("bridal-shoulder-chain", "Bridal Shoulder Chain") + " and " + link("bridal-shoulder-necklace", "Bridal Shoulder Necklace") + " drape over one or both shoulders — made for off-shoulder and strapless gowns." },
    { type: "heading", text: "Fit for your dress" },
    { type: "paragraph", text: "Most back necklaces come with extender sizes, so they can sit anywhere from a low to very low back opening. If you know your exact measurements, message us after ordering and we'll make it to size for free." },
  ],
  faq: [
    { question: "Will a bridal back necklace fit my dress?", answer: "Most come with multiple extender sizes to suit different back openings. Message us your exact measurement after ordering and we'll make it to fit for free." },
    { question: "Can I wear bridal jewelry during the ceremony and reception?", answer: "Yes. Everything is stainless steel — waterproof and tarnish-resistant, so it holds up through a first dance, a humid venue, or even rain." },
    { question: "Do you make bridesmaid sets?", answer: "Message us if you'd like to order several of the same piece for your bridal party — we're happy to help coordinate." },
    { question: "How far in advance should I order bridal jewelry?", answer: "Orders dispatch within 1–2 business days, but order a few weeks ahead if you want time for a custom size or in case you'd like to make changes." },
  ],
};

export const CHRISTMAS_CONTENT: CategoryContent = {
  intro:
    "Christmas jewelry gifts for her: personalised initial and birthstone pieces, pearls, charm bracelets and festive pieces like our snowflake and star necklaces. Handmade in stainless steel, most under €30, with gift wrap at checkout.",
  guide: [
    { type: "heading", text: "The most-wanted jewelry gifts this Christmas" },
    { type: "list", items: [
      "Personalised pieces: initial necklaces like the " + link("initial-letter-rhinestone-choker", "Diamond Initial Necklace") + " and " + link("paperclip-initial-necklace", "Paperclip Chain Diamond Initial Necklace") + ", and birth month charms like the " + link("birth-flower-charm-bracelet", "Birth Flower Charm Bracelet") + ".",
      "Charm bracelets: the " + link("zodiac-charm-bracelet", "Zodiac Charm Bracelet") + " and " + link("pearl-heart-initial-bracelet", "Pearl Heart Initial Bracelet") + ".",
      "Evil eye and heart pieces: the " + link("evil-eye-choker-necklace", "Evil Eye Choker Necklace") + ", " + link("evil-eye-ring", "Evil Eye Ring") + " and " + link("pearl-heart-toggle-necklace", "Chunky Pearl Heart Toggle Necklace") + ".",
      "Layered necklaces: ready-made stacks like the " + link("curated-layered-necklace-stack", "Cross & Zodiac Necklace Stack") + ", so the lengths already sit right.",
      "Pearls: the " + link("layered-pearl-choker", "Pearl Bead Double Choker") + " and " + link("layered-pearl-bracelet", "Layered Pearl Bracelet") + ".",
    ] },
    { type: "heading", text: "Festive pieces" },
    { type: "paragraph", text: "The " + link("christmas-snowflake-necklace", "Christmas Snowflake Necklace") + " has an 18k gold plated snowflake on a stainless steel chain, and the " + link("star-pendant-rhinestone-choker", "Star Pendant Rhinestone Choker") + " comes in red, green or white — both on a 35 cm chain with a 6 cm extender." },
    { type: "heading", text: "Christmas gifts and stocking stuffers under €25" },
    { type: "paragraph", text: "Small, wearable pieces make easy stocking stuffers and Secret Santa gifts: the " + link("dainty-chain-bracelet", "Dainty Chain Bracelet") + " (€14), " + link("silver-eyeglasses-chain", "Eyeglasses Chain") + " (€16), " + link("birthstone-ring", "Birthstone Ring") + " and " + link("evil-eye-ring", "Evil Eye Ring") + " (€19.20), and the " + link("birth-month-teardrop-choker", "Birth Month Teardrop Choker") + " (€20)." },
    { type: "heading", text: "When to order for Christmas" },
    { type: "paragraph", text: "Orders leave us within 1–2 business days. Delivery time then depends on your country, so order early in December to be safe, especially for personalised pieces. Add gift wrap and a note in your cart for €4." },
  ],
  faq: [
    { question: "What jewelry is popular as a Christmas gift this year?", answer: "Personalised pieces (initials, birthstones, zodiac signs), charm bracelets, evil eye and heart jewelry, layered necklaces and pearls are among the most wanted jewelry gifts this season." },
    { question: "What's a good Christmas jewelry gift under €25?", answer: "A dainty chain bracelet (€14), an eyeglasses chain (€16), a birthstone or evil eye ring (€19.20) or a birth month teardrop choker (€20)." },
    { question: "Can I personalise a Christmas gift?", answer: "Yes. Choose a letter, birth month, birth flower or star sign at checkout on our personalised pieces." },
    { question: "Do you offer gift wrapping?", answer: "Yes — tick gift wrap in your cart for €4 and add a personal note." },
    { question: "When should I order for Christmas delivery?", answer: "Orders dispatch within 1–2 business days; order in early December to allow for delivery to your country." },
  ],
};
