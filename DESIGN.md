---
name: JLC
description: Jay's Lip Care and more. Warm frosted glass over a fixed caramel, blush and honey colour field.
colors:
  cream-ground: "#f7f1ea"
  blush: "#ebbcae"
  caramel: "#d6a77a"
  rose: "#dca3a0"
  sand: "#e8d6bf"
  honey: "#edc890"
  espresso: "#2d2420"
  walnut: "#57473d"
  taupe: "#6c5c51"
  deep-caramel: "#8a5f3c"
  deep-caramel-hover: "#714c2e"
  caramel-milk: "#f3e4d6"
  swatch-fallback: "#e0b08a"
  ok: "#2e6b47"
  warn: "#8a5300"
  danger: "#b3261e"
  glass: "rgb(255 255 255 / 0.56)"
  glass-strong: "rgb(255 255 255 / 0.72)"
  glass-line: "rgb(255 255 255 / 0.75)"
  glass-edge: "rgb(45 36 32 / 0.08)"
  white: "#ffffff"
typography:
  display:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 4.4rem)"
    fontWeight: 780
    lineHeight: 1.02
    letterSpacing: "-0.028em"
    fontVariation: "'wdth' 108"
  headline:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.4vw, 3.4rem)"
    fontWeight: 780
    lineHeight: 1.02
    letterSpacing: "-0.028em"
    fontVariation: "'wdth' 108"
  title:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 780
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 108"
  body:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 650
  price:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    fontFeature: "'tnum' 1"
  fine:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  panel: "22px"
  media: "16px"
  input: "14px"
  thumb: "12px"
  pill: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  gutter: "clamp(16px, 4vw, 48px)"
  section: "clamp(56px, 9vw, 112px)"
  max-width: "1320px"
  head-height: "68px"
components:
  button-primary:
    backgroundColor: "{colors.deep-caramel}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.deep-caramel-hover}"
  button-primary-lg:
    backgroundColor: "{colors.deep-caramel}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "54px"
  button-soft:
    backgroundColor: "rgb(255 255 255 / 0.7)"
    textColor: "{colors.espresso}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "44px"
  button-soft-hover:
    backgroundColor: "{colors.white}"
  button-add:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  button-add-hover:
    backgroundColor: "{colors.deep-caramel}"
  button-add-added:
    backgroundColor: "{colors.ok}"
  bag-button:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "42px"
  nav-pill:
    textColor: "{colors.walnut}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  nav-pill-active:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.white}"
  tab:
    textColor: "{colors.walnut}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "40px"
  tab-active:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.white}"
  input:
    backgroundColor: "rgb(255 255 255 / 0.82)"
    textColor: "{colors.espresso}"
    rounded: "{rounded.input}"
    padding: "12px 16px"
    height: "50px"
  input-focus:
    backgroundColor: "{colors.white}"
  search:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.taupe}"
    rounded: "{rounded.pill}"
    height: "50px"
  glass-panel:
    backgroundColor: "{colors.glass}"
    rounded: "{rounded.panel}"
  glass-panel-strong:
    backgroundColor: "{colors.glass-strong}"
    rounded: "{rounded.panel}"
  product-card:
    backgroundColor: "{colors.glass}"
    rounded: "{rounded.panel}"
    padding: "10px 10px 16px"
  product-card-media:
    rounded: "{rounded.media}"
  sale-tag:
    backgroundColor: "{colors.honey}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.pill}"
    padding: "3px 8px"
  bag-count:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.pill}"
    height: "22px"
  delivery-note:
    backgroundColor: "{colors.caramel-milk}"
    textColor: "{colors.walnut}"
    rounded: "{rounded.media}"
    padding: "14px 16px"
  toast:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
---

# Design System: JLC

## Overview

**Creative North Star: "Sugared Glass"**

JLC is a bright, modern phone-first shop seen through frosted glass. Behind every page sits one fixed, non-scrolling field of soft colour blobs (blush, rose, caramel, sand, honey) on a cream ground. Every surface the shopper touches (top bar, cards, bag drawer, checkout, notices, admin panels) is a white frosted panel laid over that field, so the warmth comes from what the glass refracts, not from painted surfaces. The products bring the only other colour: each product card samples the dominant vivid hue of its own photo and tints and glows in it.

The type is one family, Archivo, pushed wide (108% width) and heavy (780) with tight negative tracking for headings, and kept plain and sentence case everywhere else. Every control is a pill. Ink (espresso) carries navigation and the Add action; deep caramel is reserved for the primary purchase path and focus. Light theme only.

The world rejects the beige serif boutique and the dark luxury counter. The jlc script logo is a binding brand asset and appears as the ink raster (`public/brand/jlc-mark-ink.png`, `public/brand/jlc-wordmark-ink-lg.png`), never redrawn.

**Key Characteristics:**
- Fixed warm colour field behind all pages; frosted white glass in front of it.
- Product cards tinted and glowing in the colour sampled from their own photo.
- Archivo Variable, wide and heavy for display, sentence case throughout.
- Three radii (panel 22px, media 16px, input 14px); every control a pill.
- Ink for navigation and Add, deep caramel for the primary action, honey and blush for small highlights.
- Light theme only.

## Colors

A warm, low-contrast pastel field of beige, blush and caramel under white glass, with one dark espresso ink and one deep caramel accent.

### Primary
- **Deep Caramel** (`deep-caramel`): the primary action colour (Shop all, Pay, Place order), focus rings, selected payment option, completed timeline steps, small icons inside notices. Hover deepens to `deep-caramel-hover`. Text set in caramel (text links, sale price, link hovers) uses `deep-caramel-hover`, because `deep-caramel` falls under 4.5:1 on glass over the caramel blobs.

### Secondary
- **Espresso Ink** (`espresso`): all primary text, and the solid fill for the Bag button, Add buttons, active nav and tab pills, the announcement strip, toasts and the skip link. The ink pill is the house "do this" control on cards; caramel is the "pay" control.

### Tertiary
- **Honey** (`honey`): sale tags and the announcement link. Small doses only.
- **Blush** (`blush`): the bag count badge, and a colour-field blob.
- **Field blobs** (`blush`, `rose`, `caramel`, `sand`, `honey`): radial gradients in the fixed background at 0.9 opacity. They exist to be seen through glass; they are not surface fills.

### Neutral
- **Cream Ground** (`cream-ground`): page background under the field.
- **Walnut** (`walnut`): secondary text, labels, inactive nav and tabs.
- **Taupe** (`taupe`): tertiary text, placeholders, fine print, meta.
- **Caramel Milk** (`caramel-milk`): the delivery note fill and quantity-button hover.
- **Glass Edge** (`glass-edge`): hairline dividers inside panels (1px).
- **Status**: `ok` (added state, saved, stock ok), `warn` (low stock), `danger` (errors, destructive). Badge tints are pale versions of each.

### Product swatch
- **Sampled swatch** (runtime `--swatch`, fallback `swatch-fallback`): computed by `src/lib/swatch.js` from a 16x16 downsample of the product photo, weighting vivid pixels by saturation to the 4th power, output as `hsl(H 72% 55-70%)`. Cross-origin or colourless photos fall back to the caramel fallback.

### Named Rules
**The Field-Behind-Glass Rule.** Warm colour lives in the fixed background field and in sampled product swatches. Panels are white glass; never paint a panel caramel or blush to add warmth.

**The Two Inks Rule.** Espresso is for navigation and adding; deep caramel is for paying and focus. Do not introduce a third action colour.

**The Own-Colour Rule.** A product card's tint and glow come only from its own photo's sampled swatch. Never assign card colours by hand or by category.

## Typography

**Display Font:** Archivo Variable (with Archivo, system-ui, sans-serif), width axis loaded via `@fontsource-variable/archivo/wdth.css`
**Body Font:** Archivo Variable, normal width

**Character:** One grotesque doing everything. Headings are stretched to 108% and set at weight 780 with tight tracking, so they read as confident and modern; body and UI copy stay normal width and plain.

### Hierarchy
- **Display** (780, clamp(2.4rem, 5vw, 4.4rem), 1.02, width 108%, -0.028em, balanced wrap): hero, checkout, WhatsApp band (up to 4.6rem). Max about 12-13ch.
- **Headline** (780, clamp(2rem, 4.4vw, 3.4rem), 1.02): catalog, FAQ and notice titles.
- **Title** (780, 18-26px, width 108%, -0.02em): legends, summary, panel, modal, bag and auth titles.
- **Body** (400, 16px, 1.55): running text; lead copy at 18px in walnut, max 40-50ch; FAQ answers max 68ch.
- **Label** (650, 14px): buttons (15px), nav pills, tabs, field labels. Sentence case, no tracking.
- **Price** (700, tabular figures, no wrap): every money value.
- **Fine** (400, 13px, 1.5, taupe): meta, hints, footer copy.

### Named Rules
**The Sentence Case Rule.** No uppercase labels and no letter-spaced small caps anywhere. Weight and width carry hierarchy.

**The Tabular Money Rule.** Prices, totals, counts and quantities always use tabular figures.

## Layout

Content sits in a centred column (max 1320px) with a fluid gutter (clamp(16px, 4vw, 48px)). The top bar is a sticky floating glass pill 12px from the top (68px tall slot; 62px under 760px). The shop hero is a 7:5 split (headline and Shop all left, a glass card tilted -2deg holding the large wordmark and category links with live in-stock counts right), followed by a full-width horizontally scroll-snapping row of in-stock product cards (min 190px columns, 58vw on phones). Catalog grids auto-fill at min 250px, two columns on phones with 12px gaps. Checkout is a form panel beside a sticky 420px summary, stacking under 960px. FAQ is a single 820px column.

Spacing rhythm is 4px based: 4, 8, 12, 16, 20, 24 inside components; sections breathe at clamp(56px, 9vw, 112px). Breakpoints: 960px (checkout, admin stack) and 760px (phone layout: nav hidden, hero card hidden, two-column grid, card descriptions hidden).

Stacking order: background field -1, top bar 20, scrim 40, bag drawer 50, modal 60, toast 70, skip link 100.

## Elevation & Depth

Depth is layered glass. Every panel has the same recipe: glass white fill, 22px blur with 170% saturation, a 1px white line border, a soft warm brown drop shadow, and a 1px inner white top highlight. Overlays (bag drawer, modal) use the stronger glass fill and the large shadow. Shadows are warm brown (rgb 90 60 40), diffuse and negatively spread; never grey, never hard. On hover, product cards lift 6px and their shadow is replaced by a glow in their own swatch colour; on touch screens they keep a softer swatch glow at rest. With reduced transparency, glass becomes solid white; without backdrop-filter support it becomes 92% white.

### Shadow Vocabulary
- **Panel** (`0 18px 40px -18px rgb(90 60 40 / 0.28), 0 2px 6px -2px rgb(90 60 40 / 0.08)` plus `inset 0 1px 0 rgb(255 255 255 / 0.9)`): all resting glass panels.
- **Overlay** (`0 30px 70px -24px rgb(90 60 40 / 0.38)`): bag drawer, modals, toast.
- **Caramel lift** (`0 10px 24px -10px rgb(138 95 60 / 0.7)`, hover `0 14px 30px -10px ... 0.75`): primary button only.
- **Swatch glow** (`0 30px 60px -26px` of the swatch at 85%): product card hover and focus-within. Rest on touch: `0 18px 36px -20px` at 75%.
- **Focus halo** (`0 0 0 3px rgb(138 95 60 / 0.18)`): focused inputs, selected payment option, current timeline step.

### Named Rules
**The One Glass Recipe Rule.** Every surface uses the same glass recipe. A new panel joins the shared glass list; it does not invent its own blur, border or shadow.

**The Glow Is Earned Rule.** Coloured glow belongs to product cards only, in their own swatch. Other panels keep the neutral warm shadow.

## Shapes

Soft, rounded and consistent. Panels (cards, drawer, checkout form, summary, notices, modals, footer) take 22px. Media inside them (product photos, bag lines, payment options, delivery note, FAQ items, receipts) take 16px. Text inputs take 14px. Every button, nav link, tab, segmented control, badge, chip, toast, search field and the top bar itself is a full pill. Small thumbnails in the bag, summary and admin use 10-12px. Borders are 1px hairlines only: white on glass, espresso at 8-14% for dividers and inputs. The single deliberate angle is the hero's -2deg tilted glass card.

## Components

### Buttons
Pills with weight, pressed with a 0.97 scale on active.
- **Shape:** full pill (999px), 44px tall (36px small, 54px large).
- **Primary:** deep caramel fill, white label, caramel lift shadow; hover deepens, rises 1px. Used for the purchase path.
- **Soft:** 70% white with a white border and a small warm shadow; hover to solid white. Secondary actions.
- **Add:** espresso pill, 40px, plus icon; hover turns caramel; added state turns green with a check for 1.2s.
- **Danger:** soft white pill with danger text and border.
- **Icon button:** 40px round, walnut, white wash on hover.

### Chips and badges
- **Sale tag:** honey pill, 11px weight 800, beside the struck-through was-price.
- **Bag count:** blush pill, 22px, weight 800, tabular.
- **Status badges:** pale ok/warn/danger tints with matching text, pill.

### Cards / Containers
- **Corner Style:** panel radius (22px).
- **Background:** glass, with a radial tint of the product's swatch at 42% washing down from the top.
- **Shadow Strategy:** panel shadow at rest; swatch glow and 6px lift on hover or focus-within; photo scales 1.05.
- **Border:** 1px white glass line.
- **Internal Padding:** 10px around a 4:5 photo (16px radius), 6px text inset; 6px on phones.
- **Sold out:** tint removed, photo greyscale at 60% opacity, "Sold out" pill instead of Add.

### Inputs / Fields
- **Style:** 50px, 82% white, 1px espresso-14% border, 14px radius, 16px text; label above in walnut 14px/650.
- **Focus:** solid white fill, caramel border, 3px caramel halo.
- **Error:** danger border with a 13px danger message below.
- **Search:** a glass pill with an inline clear button; focus draws a 2px caramel ring.

### Navigation
- **Top bar:** floating glass pill; ink jlc mark left, category pills centre (walnut, white wash on hover, espresso fill when active), Track order link and the espresso Bag pill right. On phones the category pills hide and labels collapse to icons.
- **Tabs and segmented controls:** a glass or white track holding pills; active pill is espresso.

### Bag drawer
A strong-glass panel inset 12px from the right edge, sliding in over a blurred espresso scrim (28%). Lines are 65% white rows at media radius with a white pill quantity stepper.

### Delivery timeline
Vertical steps with 24px round dots. Done steps fill caramel with a white inner ring and a caramel connector; the current step adds a soft caramel halo; pending steps are white dots with a faint espresso border.

### Delivery note
A caramel-milk block at media radius with a caramel duotone icon, shown before and after payment so the delivery fee is never a surprise.

## Do's and Don'ts

### Do:
- **Do** keep the fixed warm colour field behind every page, including admin, and put every surface on the shared glass recipe.
- **Do** tint and glow product cards only from the colour sampled from their own photo, falling back to the caramel swatch.
- **Do** use the jlc ink rasters for the logo; keep the mark at 42px in the top bar (34px on phones).
- **Do** make every control a pill and keep panels 22px, media 16px, inputs 14px.
- **Do** reserve deep caramel for the purchase path and focus; use espresso pills for navigation and Add.
- **Do** set headings in Archivo at 108% width, weight 780, tight tracking, sentence case.
- **Do** keep warm brown shadows and the white inner top highlight on glass.
- **Do** honour reduced transparency (solid white) and reduced motion.

### Don't:
- **Don't** add a dark theme or dark surfaces beyond the espresso pills, announcement strip and toast.
- **Don't** replace the warm beige, caramel and blush palette with saturated or cool colours.
- **Don't** paint panels with field colours or assign product colours by hand.
- **Don't** use serif display type, uppercase labels or letter-spaced small caps.
- **Don't** use grey or hard offset shadows.
- **Don't** redraw, recolour or replace the jlc logo.
