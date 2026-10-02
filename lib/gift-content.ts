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
