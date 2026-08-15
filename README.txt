NISHI TRADING COMPANY BILL GENERATOR v14 CACHE REFRESH FIX

Why v14:
Some phones were still showing an older cached version after Vercel redeployment.

Changes:
- Removed active service-worker caching.
- Automatically unregisters old service workers.
- Automatically clears old Cache Storage once v14 loads.
- Vercel headers now use no-store while the app is being finalized.
- Added visible v14 badge at the top.
- Keeps the Direct One-Page PDF feature and Download Bill PDF button.

IMPORTANT AFTER DEPLOYMENT:
Open this exact link ONCE on the phone:
https://nishi-bill-app.vercel.app/?v=14

The ?v=14 query helps bypass the old service-worker cache on the first load.
After v14 appears, the normal link can be used again:
https://nishi-bill-app.vercel.app/

Verification:
- Top header should show v14.
- Toolbar should show Download Bill PDF.
- Blue note should mention Version v14 and one-page A4 PDF.
