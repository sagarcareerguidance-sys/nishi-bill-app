NISHI TRADING COMPANY BILL GENERATOR v15 COLOR-ACCURATE PDF

Fix in v15:
- The Download Bill PDF output was appearing faded because the bill was temporarily rendered at 72% opacity during PDF capture.
- The opacity reduction has been completely removed from the bill capture.
- PDF capture now explicitly forces opacity 1 and no CSS filter.
- Direct PDF uses PNG instead of JPEG so the magenta header, blue export ribbon, yellow office strip, green BILL INVOICE tab, Ganesh image and NTC Marka retain stronger, more accurate colours.
- One-page A4 fitting remains unchanged.
- Supabase cloud saving remains unchanged.

Deploy:
1. Replace the current GitHub/Vercel project files with this v15 package.
2. Commit and wait for Vercel redeployment.
3. Open https://nishi-bill-app.vercel.app/?v=15 once on the phone.
4. Test Download Bill PDF again.

APK note:
The Android app loads the live Vercel bill system, so after v15 is deployed the APK will receive the corrected PDF colours too.
