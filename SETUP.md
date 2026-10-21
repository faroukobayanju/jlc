# JLC setup: Paystack, Firebase, Vercel

Do these steps once. Do them in order. Never paste a secret key into chat, email, or a file in this repo.

## 1. Paystack keys

1. Sign in at https://dashboard.paystack.com.
2. Open **Settings > API Keys & Webhooks**.
3. Copy the **Test Secret Key** (`sk_test_...`). You need the live key (`sk_live_...`) only after Paystack approves your business.
4. In **Webhook URL** (test mode, and later live mode), enter:
   `https://jlcandmore.vercel.app/api/paystack-webhook`
5. Leave **Callback URL** empty. The site sends its own callback for each order.

## 2. Firebase service account (lets the server write orders and reduce stock)

1. Open https://console.firebase.google.com and pick project **jay-lip-care-ed4d1**.
2. Click the gear icon > **Project settings > Service accounts**.
3. Click **Generate new private key**. A JSON file downloads. Treat it like a password.
4. In Terminal, turn it into one line of base64:

   ```bash
   base64 -i ~/Downloads/jay-lip-care-ed4d1-*.json | tr -d '\n' | pbcopy
   ```

   The value is now on your clipboard.
5. Delete the downloaded JSON file once the value is stored in Vercel (step 3).

## 3. Vercel environment variables

Vercel > your project > **Settings > Environment Variables**. Add:

| Name | Value | Environments |
|---|---|---|
| `PAYSTACK_SECRET_KEY` | `sk_test_...` (Preview), `sk_live_...` (Production when approved) | Production, Preview |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | the base64 value from step 2 | Production, Preview |
| `APP_URL` | `https://jlcandmore.vercel.app` | Production |
| `VITE_ADMIN_EMAIL` | your admin email (optional, pre-fills the login) | Production, Preview |

Redeploy after saving.

## 4. Make your account an admin

The store checks admin rights in the database, so signing in is not enough. If `/admin` says "signed in but is not an admin", do one of these.

**Option A, Firebase console (no code):**

1. Firebase console > **Authentication > Users**. Find your email and copy the **User UID**.
2. Firebase console > **Firestore Database > Start collection**. Collection ID: `admins`.
3. Document ID: paste your UID. Add a field `email` (string) with your email. Save.
4. On the site, sign out of `/admin` and sign back in.

**Option B, one command.** Use the JSON file you downloaded in step 2:

```bash
npm run make-admin -- you@example.com ~/Downloads/jay-lip-care-ed4d1-firebase-adminsdk-xxxx.json
```

## 5. Deploy the new security rules

```bash
npm i -g firebase-tools
```

```bash
firebase login
```

```bash
firebase deploy --only firestore:rules
```

Do step 4 before this, or the admin page will refuse your account. Discounts, announcements and order delivery updates only work after these rules are deployed.

## 6. Recommended Firebase and Vercel settings

- **Authentication > Settings > User actions**: turn off "Enable create (sign-up)". Only you need an account.
- **Authentication > Settings**: turn on **Email enumeration protection**.
- **Authentication > Sign-in method**: add multi-factor (SMS) for your admin account if available on your plan.
- **Google Cloud Console > APIs & Services > Credentials**: restrict the browser API key to `jlcandmore.vercel.app` and `localhost`.
- **Vercel > Firewall**: add a rate-limit rule for `/api/checkout` (for example 10 requests per minute per IP).
- **Firestore > Disaster recovery**: turn on point-in-time recovery and a daily backup.

## 7. Test a payment

1. Open the site, add a product, go to checkout, choose **Pay now with Paystack**.
2. On the Paystack page use test card `4084 0840 8408 4081`, any future expiry, CVV `408`. If it asks for a PIN or OTP, use the values listed at https://paystack.com/docs/payments/test-payments.
3. You return to the order page. It should say **Thank you**.
4. In `/admin > Orders` the order shows as **Paid**, and that product's stock is 1 lower.
5. Click **Mark sent**, then refresh the customer's order page: it shows **On the way**. Click **Mark received**: it shows **Delivered**.
6. Open `/track`, enter the order code (JLC-XXXXXXXX) and the phone number used at checkout. It opens the same order page.

## How payment works

1. Checkout sends only product IDs and quantities. The server reads real prices, discounts and stock from Firestore and creates a pending order.
2. Paystack takes the payment.
3. Paystack calls the webhook. The server checks Paystack's signature, checks the amount, then marks the order paid and reduces stock in one transaction. Retries are safe.
4. If the webhook is slow, the order page asks Paystack directly and does the same step.
5. If two people buy the last unit at the same moment, the second order is marked **Paid, stock issue** in admin. Refund it from the Paystack dashboard or offer a swap.

## Local development

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

`npm run dev` serves the store only. To run the `/api` functions locally, use `vercel dev` after `vercel link` and `vercel env pull .env.local`.
