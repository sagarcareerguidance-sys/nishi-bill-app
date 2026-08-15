# Nishi Bill Generator v5 — Client Cloud Setup

This package upgrades the bill generator to:

- Email/password client login
- Online bill storage
- Online saved bill history
- Reopen / reprint old bills
- Delete saved bills
- Company settings saved in the cloud
- Per-user data isolation with Supabase Row Level Security (RLS)
- Local-browser fallback until cloud configuration is added
- Vercel-ready static deployment

## 1. Create Supabase project

Create a Supabase project.

In **SQL Editor**, run:

`supabase_schema.sql`

## 2. Create client login

In Supabase, create the client's user under Authentication / Users.

Use the client's email and a strong password.

For a private business app, public self-registration can remain disabled.

## 3. Add project credentials

Open `config.js` and enter:

```js
window.NISHI_CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "YOUR_PUBLISHABLE_KEY",
  CLOUD_REQUIRED: true
};
```

Use only the Publishable / Anon client key. Never place a Supabase service-role secret in these web files.

## 4. Deploy

Upload the complete folder to your static web host.

For Vercel you can deploy the project folder/ZIP, or connect a Git repository.

## 5. Give client the URL

Example:

`https://nishi-bills.vercel.app`

The client logs in, creates bills, saves them online, and prints/saves PDFs.

## Recommended before handing over

- Test one Direct Amount bill.
- Test one Rate × Weight bill.
- Test percentage Market Fee / Commission.
- Save, reopen, edit and re-save a bill.
- Generate one PDF.
- Sign out and sign back in.
