---
version: 1
slug: "src-pages-shoppage-jsx"
primary_target: "src/pages/ShopPage.jsx"
related_targets: ["src/pages/AllProductsPage.jsx","src/pages/CheckoutPage.jsx"]
---

Scope: JLC storefront (shop home, all products, bag drawer, checkout, order status) and admin. Visitor mode: Persuade (shop/products), Operate (checkout, admin). Admin inherits the world.

Audience: Nigerian phone shoppers arriving from Instagram/WhatsApp. Action: add to bag, pay with Paystack or order on WhatsApp. Proof: real catalog, stock and prices only. No invented reviews or claims.

History: the first direction (black lacquer counter, seed fc82f27a, pick) was built and rejected by the owner ("I don't like the UI at all"). The owner pinned this replacement in words: glass UI, modern, colorful. Later the owner kept the glass but pinned the colours back to the original warm beige/caramel identity.

## Direction contract

THESIS: A warm caramel, blush and honey field seen through frosted glass. The shop feels like a bright modern app, and each product card glows in the colour sampled from its own photo. Refuses the beige serif boutique and the dark luxury counter.

OWN-WORLD: Light theme. Fixed colour field of blush, caramel, rose, sand and honey blobs on a cream ground behind every page. White frosted panels (56% white, 22px blur, white top highlight, plum-tinted shadow). Espresso ink text, deep caramel accent (#8a5f3c) for the primary action. Archivo, width 108%, heavy, tight tracking, sentence case. Panels 22px, media 16px, inputs 14px, every control is a pill.

STORY: Visitor sees what JLC sells and how to pay, adds a product from the first viewport, checks out in one glass panel, then confirms delivery on WhatsApp.

FIRST VIEWPORT: Floating glass pill top bar (ink logo, category pills, dark Bag pill). Left: large headline, one line of copy, pink Shop all pill. Right: tilted glass card with the large ink jlc mark and links to each category with live in-stock counts. Below, full width: row of glass product cards from stock, each tinted by its own colour, with price and Add to bag, horizontally scrollable on phones.

FORM: Owner-pinned direction "colorful glass" (not from the roll). Signature interaction: cards lift and glow in their product's own colour on hover.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
