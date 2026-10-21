# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Shoppers in Nigeria, mostly on phones, buying lip care (glosses, balms, scrubs), fragrances and self-care items from a small independent seller. They arrive from Instagram/WhatsApp links, browse a short catalog, add a few items and pay. Secondary user: the store owner (Jay) managing products, prices and stock from the admin page.

## Product Purpose

JLC (Jay's Lip Care and more) is a small direct-to-customer beauty shop. The site lets customers see what is in stock, build a cart and pay online with Paystack, or send the order over WhatsApp and pay by bank transfer. Success: customers complete payment without needing a WhatsApp back-and-forth, and the owner sees paid orders and accurate stock.

## Positioning

A personal, owner-run lip care shop, not a marketplace. The products are curated by one person and orders are confirmed personally on WhatsApp.

## Operating Context

- Customers pay in Naira (NGN). Paystack is the online payment provider.
- Delivery fee is not charged at checkout. Customers pay for items online; the delivery fee is agreed afterwards on WhatsApp (confirmed by owner).
- WhatsApp ordering with bank transfer stays as a second checkout option.
- Owner manages catalog in /admin (Firebase Auth email/password, Firestore).
- Hosted on Vercel; data in Firebase project `jay-lip-care-ed4d1`.

## Capabilities and Constraints

- Categories: Lip Care, Fragrance, Self Care.
- Product fields: name, category, description, price (NGN), stock, image.
- Product images are admin-uploaded (often phone photos compressed to data URLs) or pasted URLs; quality varies.
- No customer accounts. No reviews system.
- Prices on the client are display-only; the amount charged is computed on the server.

## Brand Commitments

- Name: JLC, full name "Jay's Lip Care and more".
- Logo: lowercase script "jlc" wordmark with a lips mark, white on black (`logo.jpeg`). Logo stays; the rest of the visual identity is being replaced (confirmed by owner).
- WhatsApp contact number in `src/config.js`.

## Evidence on Hand

- Logo: `logo.jpeg`, favicon `public/favicon.jpeg`.
- Live product catalog in Firestore `store_products`.
- No testimonials, press, ratings, customer counts or ingredient claims exist. Do not invent them.

## Product Principles

1. Paying should be the easiest thing on the page.
2. Stock and price shown are always the real ones; never let a customer pay for something sold out.
3. Keep the personal touch: WhatsApp is a first-class channel, not a fallback hidden in the footer.
4. Phone first; the catalog must work on a slow connection.

## Accessibility & Inclusion

WCAG AA contrast, keyboard-operable cart and checkout, respects reduced motion.
