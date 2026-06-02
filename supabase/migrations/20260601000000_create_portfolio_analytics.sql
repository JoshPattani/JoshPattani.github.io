create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null,
  path text not null,
  page_title text,
  referrer_domain text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  browser_family text,
  os_family text,
  viewport_width_bucket text,
  language text,
  timezone_offset_minutes integer,
  metadata jsonb not null default '{}'::jsonb,
  site_id text not null,
  source text default 'portfolio',
  is_bot_likely boolean not null default false,
  constraint portfolio_events_event_name_check check (
    event_name in (
      'page_view',
      'project_view',
      'project_click',
      'resume_click',
      'contact_click',
      'contact_submit',
      'github_click',
      'linkedin_click',
      'outbound_click',
      'outbound_project_click'
    )
  ),
  constraint portfolio_events_path_check check (
    path like '/%' and
    length(path) between 1 and 240 and
    position('?' in path) = 0
  ),
  constraint portfolio_events_page_title_check check (page_title is null or length(page_title) <= 160),
  constraint portfolio_events_referrer_domain_check check (referrer_domain is null or length(referrer_domain) <= 120),
  constraint portfolio_events_utm_source_check check (utm_source is null or length(utm_source) <= 80),
  constraint portfolio_events_utm_medium_check check (utm_medium is null or length(utm_medium) <= 80),
  constraint portfolio_events_utm_campaign_check check (utm_campaign is null or length(utm_campaign) <= 80),
  constraint portfolio_events_device_type_check check (
    device_type is null or device_type in ('desktop', 'tablet', 'mobile', 'unknown')
  ),
  constraint portfolio_events_browser_family_check check (
    browser_family is null or browser_family in ('chrome', 'safari', 'firefox', 'edge', 'unknown')
  ),
  constraint portfolio_events_os_family_check check (
    os_family is null or os_family in ('windows', 'macos', 'ios', 'android', 'linux', 'unknown')
  ),
  constraint portfolio_events_viewport_width_bucket_check check (
    viewport_width_bucket is null or viewport_width_bucket in ('lt_480', '480_767', '768_1023', '1024_1439', 'gte_1440')
  ),
  constraint portfolio_events_language_check check (language is null or length(language) <= 32),
  constraint portfolio_events_timezone_offset_check check (
    timezone_offset_minutes is null or timezone_offset_minutes between -840 and 840
  ),
  constraint portfolio_events_metadata_object_check check (jsonb_typeof(metadata) = 'object'),
  constraint portfolio_events_metadata_size_check check (pg_column_size(metadata) <= 2048),
  constraint portfolio_events_site_id_check check (length(site_id) between 1 and 80),
  constraint portfolio_events_source_check check (source is null or length(source) <= 40)
);

comment on table public.portfolio_events is
  'Privacy-conscious portfolio analytics events. Does not store raw IP addresses, full user agents, cookies, or persistent visitor identifiers.';
comment on column public.portfolio_events.referrer_domain is
  'Domain only. Full referrer URLs are intentionally not stored.';
comment on column public.portfolio_events.metadata is
  'Small flat object for safe event context such as projectSlug or outbound target domain.';

create index if not exists portfolio_events_site_created_at_idx
  on public.portfolio_events (site_id, created_at desc);

create index if not exists portfolio_events_event_created_at_idx
  on public.portfolio_events (event_name, created_at desc);

create index if not exists portfolio_events_path_created_at_idx
  on public.portfolio_events (path, created_at desc);

create index if not exists portfolio_events_referrer_domain_idx
  on public.portfolio_events (referrer_domain)
  where referrer_domain is not null;

alter table public.admin_users enable row level security;
alter table public.portfolio_events enable row level security;

revoke all on public.admin_users from anon, authenticated;
revoke all on public.portfolio_events from anon, authenticated;

grant usage on schema public to authenticated, service_role;
grant select on public.admin_users to authenticated;
grant select on public.portfolio_events to authenticated;
grant all on public.admin_users to service_role;
grant all on public.portfolio_events to service_role;

drop policy if exists "Admin users can read their own allowlist row" on public.admin_users;
create policy "Admin users can read their own allowlist row"
  on public.admin_users
  for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Admin users can read portfolio events" on public.portfolio_events;
create policy "Admin users can read portfolio events"
  on public.portfolio_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.id = (select auth.uid())
    )
  );
