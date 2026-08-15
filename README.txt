NISHI TRADING COMPANY BILL GENERATOR v5 CLOUD

Start with SETUP.md.

Files:
- index.html              Main bill application
- cloud.js                Login + cloud database logic
- config.js               Supabase URL and publishable key
- supabase_schema.sql     Database + RLS security setup
- vercel.json             Vercel deployment settings
- manifest.webmanifest    Installable app metadata
- sw.js                   Static app cache
- SETUP.md                Deployment guide

IMPORTANT:
Never put a Supabase service_role key or any secret server key in config.js.
