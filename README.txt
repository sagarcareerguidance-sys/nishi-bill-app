NISHI TRADING COMPANY BILL GENERATOR v12 DIRECT ONE-PAGE PDF

Why this version was needed:
- A mobile-generated PDF was coming out as 2 pages.
- Browser/mobile print services can add their own URL, date, Page 1 of 2 footer/header and extra margins.
- The bottom bank/signature section was being pushed to page 2.

Fix in v12:
- New Download PDF button generates the invoice directly inside the app.
- It captures ONLY the bill, so browser URL/date/page-number headers are not included.
- The complete bill is scaled proportionally to ONE A4 page.
- Ganesh image and bill-book colours are included in the captured bill.
- The bill is automatically saved to Supabase before PDF generation.
- A separate Print button remains for physical printing.

Recommended mobile workflow:
1. Fill bill.
2. Tap Download PDF.
3. Share/print the downloaded PDF.

Deployment:
1. Replace files in the GitHub repository.
2. Commit changes.
3. Let Vercel redeploy.
4. On mobile, close/reopen the site and refresh.
