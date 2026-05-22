-- aniFarm production schema (Supabase / Postgres)
-- Run in Supabase SQL editor when EXPO_PUBLIC_SUPABASE_URL is configured.

create extension if not exists "uuid-ossp";

-- users (extends auth.users profile)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('farmer','manager','vet','staff','admin')),
  tier text default 'free',
  phone text,
  created_at timestamptz default now()
);

create table if not exists public.farms (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id),
  name text not null,
  location text,
  capacity int default 0,
  livestock_type text,
  created_at timestamptz default now()
);

create table if not exists public.animals (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references public.farms(id) on delete cascade,
  pen_id uuid,
  tag_id text not null,
  name text,
  species text,
  breed text,
  gender text,
  birth_date date,
  weight_kg numeric,
  batch_id uuid,
  rfid text,
  health_status text,
  vaccination_status text,
  photo_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ai_counts (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references public.farms(id),
  mode text,
  alive_count int default 0,
  dead_count int default 0,
  excluded_humans int default 0,
  avg_confidence numeric,
  boxes jsonb,
  created_at timestamptz default now()
);

create table if not exists public.cameras (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references public.farms(id),
  name text not null,
  stream_url text,
  zone text,
  enabled boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.camera_events (
  id uuid primary key default uuid_generate_v4(),
  camera_id uuid references public.cameras(id),
  kind text,
  severity text,
  snapshot_url text,
  clip_url text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references public.farms(id),
  title text not null,
  category text,
  status text default 'pending',
  due_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.feed_logs (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references public.farms(id),
  feed_name text,
  amount_kg numeric,
  logged_at timestamptz default now()
);

create table if not exists public.vaccinations (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references public.farms(id),
  animal_id uuid references public.animals(id),
  vaccine text,
  due_at timestamptz,
  administered_at timestamptz
);

create table if not exists public.mortality_logs (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references public.farms(id),
  cause text,
  count int default 1,
  loss_value numeric,
  logged_at timestamptz default now()
);

create table if not exists public.sales (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references public.farms(id),
  product text,
  quantity numeric,
  revenue numeric,
  sold_at timestamptz default now()
);

create table if not exists public.disease_scans (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references public.farms(id),
  image_url text,
  suspicion text,
  severity text,
  risk_score numeric,
  recommendation text,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  farm_id uuid references public.farms(id),
  kind text,
  severity text,
  title text,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);
