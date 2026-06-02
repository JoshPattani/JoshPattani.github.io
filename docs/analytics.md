# Portfolio Analytics Setup

This site remains a static GitHub Pages site. Analytics uses a small browser
tracker, a Supabase Edge Function ingestion endpoint, Supabase Postgres, RLS,
and a static `/admin/` dashboard.

The `/admin/` page is publicly downloadable like the rest of the site. The
private asset is the analytics data, which is protected by Supabase Auth and
RLS.

## What Is Collected

- Event name, path, page title, timestamp, site id, and source.
- Referrer domain only, not the full referrer URL.
- UTM source, medium, and campaign when present.
- Coarse device type, browser family, OS family, viewport width bucket,
  language, and timezone offset.
- Small safe metadata such as `projectSlug`, outbound target domain, or
  non-sensitive link label.

## What Is Not Collected

- Raw IP addresses.
- Full user-agent strings.
- Cookies or persistent visitor identifiers.
- Fingerprints.
- Precise geolocation.
- Visitor names, emails, phone numbers, employers, form fields, keystrokes,
  click coordinates, heatmaps, or session replay.

## Files Added

- `JS/analytics-config.js`: public browser-safe config, disabled by default.
- `JS/analytics.js`: dependency-free public tracker.
- `admin/`: static private dashboard route protected by Supabase Auth and RLS.
- `supabase/migrations/20260601000000_create_portfolio_analytics.sql`: tables,
  RLS policies, grants, and indexes.
- `supabase/functions/track-visit/index.ts`: sanitized event ingestion function.
- `supabase/config.toml`: function config with JWT verification disabled for the
  public ingestion endpoint.

## 1. Create A Supabase Project

Create a Supabase project and note:

- Project ref: `<project-ref>`
- Project URL: `https://<project-ref>.supabase.co`
- Publishable or anon key for browser use.
- Service role key for the Edge Function only.

Do not put the service role key in `JS/analytics-config.js`, HTML, or any other
browser-delivered file.

## 2. Install And Link Supabase CLI

Install the Supabase CLI using the current Supabase instructions, then link the
project:

```bash
supabase login
supabase link --project-ref <project-ref>
```

If you do not want to use the CLI for the database, paste
`supabase/migrations/20260601000000_create_portfolio_analytics.sql` into the
Supabase SQL editor and run it there.

## 3. Apply The Database Migration

With the CLI linked:

```bash
supabase db push
```

The migration creates:

- `public.portfolio_events`
- `public.admin_users`
- RLS policies that allow only allowlisted authenticated admins to read events.
- Explicit `authenticated` SELECT grants for dashboard access through the Data
  API.
- No anonymous SELECT or INSERT access to analytics rows.

## 4. Deploy The Edge Function

Set function secrets:

```bash
supabase secrets set SUPABASE_URL=https://<project-ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
supabase secrets set ANALYTICS_SITE_ID=portfolio
supabase secrets set ALLOWED_ORIGINS=https://www.jpattani.me,https://jpattani.me,https://joshpattani.github.io,http://localhost:8000,http://127.0.0.1:8000
supabase secrets set RATE_LIMIT_SALT=<random-long-secret>
```

Deploy:

```bash
supabase functions deploy track-visit
```

The endpoint will be:

```text
https://<project-ref>.functions.supabase.co/track-visit
```

## 5. Create The Admin User

Enable a low-maintenance Supabase Auth method such as email magic links.

Add redirect URLs in Supabase Auth settings:

```text
https://www.jpattani.me/admin/
https://jpattani.me/admin/
https://joshpattani.github.io/admin/
http://localhost:8000/admin/
```

Open `/admin/`, send yourself a magic link, and complete the sign-in once so the
Supabase Auth user exists. Copy your Auth user UUID from the Supabase dashboard,
then add it to the allowlist:

```sql
insert into public.admin_users (id, email)
values ('<auth-user-uuid>', '<admin-email@example.com>')
on conflict (id) do update set email = excluded.email;
```

Use your real UUID and email in Supabase. Do not commit them to the repo.

## 6. Configure Public Browser Values

Edit `JS/analytics-config.js`:

```js
window.PORTFOLIO_ANALYTICS_CONFIG = {
  enabled: true,
  endpoint: "https://<project-ref>.functions.supabase.co/track-visit",
  siteId: "portfolio",
  source: "portfolio",
  supabaseUrl: "https://<project-ref>.supabase.co",
  supabasePublishableKey: "<publishable-or-anon-key>",
  supabaseAnonKey: "",
  trackLocalhost: false,
  respectDoNotTrack: true,
  debug: false
};
```

These values are public. They are safe to ship to the browser. The service role
key is not safe and must only be set as an Edge Function secret.

For local testing, temporarily set `trackLocalhost: true`.

## 7. Test Locally

Serve the static site:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000/
http://localhost:8000/admin/
```

Send a test event to a deployed function:

```bash
curl.exe -i -X POST "https://<project-ref>.functions.supabase.co/track-visit" ^
  -H "Content-Type: application/json" ^
  -H "Origin: http://localhost:8000" ^
  --data "{\"event_name\":\"page_view\",\"site_id\":\"portfolio\",\"path\":\"/local-test\",\"page_title\":\"Local Test\",\"source\":\"portfolio\",\"metadata\":{\"test\":true}}"
```

Confirm the row appears in Supabase Table Editor.

Confirm anonymous reads are blocked:

```bash
curl.exe -i "https://<project-ref>.supabase.co/rest/v1/portfolio_events?select=id" ^
  -H "apikey: <publishable-or-anon-key>" ^
  -H "Authorization: Bearer <publishable-or-anon-key>"
```

Expected result: unauthorized, forbidden, or no rows due to grants and RLS.

Confirm `/admin/` only loads data after signing in as a user present in
`public.admin_users`.

## 8. Deploy

Commit the static files and push to the GitHub Pages branch as usual. This repo
does not currently have a build step or GitHub Actions workflow.

Before deploying with analytics enabled:

- Confirm `JS/analytics-config.js` contains only public values.
- Confirm Edge Function secrets are set in Supabase.
- Confirm the database migration has been applied.
- Confirm your Auth redirect URLs include the production `/admin/` URL.
- Confirm your Auth user UUID is in `public.admin_users`.

## Tradeoffs

- The dashboard summarizes up to 2,000 recent events client-side. That is enough
  for a solo portfolio and avoids extra SQL views or dashboard dependencies.
- The Edge Function rate limit is best-effort in memory. It helps with bursts but
  is not a durable abuse firewall.
- The public config is committed because this is a no-build static site. If you
  later add a GitHub Actions deployment flow, you can inject the same public
  values from repository variables instead.
