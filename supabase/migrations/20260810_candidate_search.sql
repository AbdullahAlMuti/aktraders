-- =============================================================================
-- Candidate Search & Filter — schema migration
--
-- RUN THIS IN THE SUPABASE SQL EDITOR (Dashboard -> SQL Editor -> New query).
-- The project has no Supabase CLI link, so this file is applied by hand.
--
-- The whole script is idempotent and safe to re-run: columns, tables and
-- indexes are created only when missing, and CHECK constraints are dropped and
-- re-added so re-running also re-syncs them with constants/candidate-filters.ts
-- after that file gains a new option.
--
-- Value lists below are transcribed verbatim from constants/candidate-filters.ts.
-- If you add an option there, add it here and re-run this file.
--
-- Seeds nothing. Changes no RLS policy — whatever policies already protect
-- public.employees keep applying unchanged (see the note at the end about the
-- new public.projects table).
-- =============================================================================


-- ---------------------------------------------------------------- 1. columns
-- All nullable. Derived columns are recomputed by lib/candidate-normalizer.ts;
-- the six operational columns are only ever written by an admin action.

alter table public.employees add column if not exists gender             text;
alter table public.employees add column if not exists date_of_birth      date;
alter table public.employees add column if not exists education_level    text;
alter table public.employees add column if not exists education_board    text;
alter table public.employees add column if not exists profession         text;
alter table public.employees add column if not exists profession_raw     text;
alter table public.employees add column if not exists experience_years   numeric(4, 1);
alter table public.employees add column if not exists division           text;
alter table public.employees add column if not exists district           text;
alter table public.employees add column if not exists is_trained         boolean;
alter table public.employees add column if not exists training_types     text[];
alter table public.employees add column if not exists cv_quality         text;
alter table public.employees add column if not exists manpower_category  text;
alter table public.employees add column if not exists work_type          text;
alter table public.employees add column if not exists shift              text;
alter table public.employees add column if not exists availability       text;
alter table public.employees add column if not exists sector             text;
alter table public.employees add column if not exists project_id         text;
alter table public.employees add column if not exists search_indexed_at  timestamptz;

comment on column public.employees.profession_raw    is 'Raw designation kept verbatim so profession = ''other'' stays searchable.';
comment on column public.employees.search_indexed_at is 'Last time the derived columns were recomputed. Null means never indexed.';


-- ------------------------------------------------------------- 2. projects
-- Referenced by employees.project_id. `id` is text to match the employees PK
-- convention (e.g. "PRJ-000123").

create table if not exists public.projects (
  id         text primary key,
  name       text not null,
  code       text,
  sector     text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);


-- --------------------------------------------------------- 3. value guards
-- NULL is always allowed: the normalizer writes null when a value cannot be
-- determined, and operational columns stay null until an admin assigns them.
-- `department` is a pre-existing free-text column and is deliberately left
-- unconstrained — its option list is enforced in the UI only.

alter table public.employees drop constraint if exists employees_gender_check;
alter table public.employees add constraint employees_gender_check
  check (gender is null or gender in ('male', 'female', 'other'));

alter table public.employees drop constraint if exists employees_education_level_check;
alter table public.employees add constraint employees_education_level_check
  check (education_level is null or education_level in
    ('below_ssc', 'ssc', 'hsc', 'diploma', 'bachelor', 'masters', 'other'));

alter table public.employees drop constraint if exists employees_education_board_check;
alter table public.employees add constraint employees_education_board_check
  check (education_board is null or education_board in
    ('general', 'vocational', 'madrasa', 'technical', 'equivalent'));

alter table public.employees drop constraint if exists employees_profession_check;
alter table public.employees add constraint employees_profession_check
  check (profession is null or profession in
    ('driver', 'housekeeper', 'security_guard', 'cleaner', 'office_staff', 'technician',
     'electrician', 'welder', 'cook', 'mason', 'plumber', 'carpenter', 'helper',
     'supervisor', 'other'));

-- No upper bound on purpose. `deriveExperienceYears` sums the span of every
-- experience record, so a CV that lists overlapping or duplicated jobs can
-- legitimately total more than one working lifetime. Rejecting that would fail
-- the whole write batch it lands in; numeric(4,1) is the only ceiling needed.
alter table public.employees drop constraint if exists employees_experience_years_check;
alter table public.employees add constraint employees_experience_years_check
  check (experience_years is null or experience_years >= 0);

alter table public.employees drop constraint if exists employees_division_check;
alter table public.employees add constraint employees_division_check
  check (division is null or division in
    ('barishal', 'chattogram', 'dhaka', 'khulna', 'mymensingh', 'rajshahi', 'rangpur', 'sylhet'));

-- All 64 districts, slugs only (alternate spellings are resolved by the
-- normalizer before anything reaches the database).
alter table public.employees drop constraint if exists employees_district_check;
alter table public.employees add constraint employees_district_check
  check (district is null or district in (
    -- Barishal
    'barguna', 'barishal', 'bhola', 'jhalokati', 'patuakhali', 'pirojpur',
    -- Chattogram
    'bandarban', 'brahmanbaria', 'chandpur', 'chattogram', 'cumilla', 'coxs_bazar',
    'feni', 'khagrachhari', 'lakshmipur', 'noakhali', 'rangamati',
    -- Dhaka
    'dhaka', 'faridpur', 'gazipur', 'gopalganj', 'kishoreganj', 'madaripur', 'manikganj',
    'munshiganj', 'narayanganj', 'narsingdi', 'rajbari', 'shariatpur', 'tangail',
    -- Khulna
    'bagerhat', 'chuadanga', 'jashore', 'jhenaidah', 'khulna', 'kushtia', 'magura',
    'meherpur', 'narail', 'satkhira',
    -- Mymensingh
    'jamalpur', 'mymensingh', 'netrokona', 'sherpur',
    -- Rajshahi
    'bogura', 'chapainawabganj', 'joypurhat', 'naogaon', 'natore', 'pabna', 'rajshahi', 'sirajganj',
    -- Rangpur
    'dinajpur', 'gaibandha', 'kurigram', 'lalmonirhat', 'nilphamari', 'panchagarh',
    'rangpur', 'thakurgaon',
    -- Sylhet
    'habiganj', 'moulvibazar', 'sunamganj', 'sylhet'
  ));

-- Array containment: every element must be a known training type. An empty
-- array satisfies this, which is what "no training found" looks like.
alter table public.employees drop constraint if exists employees_training_types_check;
alter table public.employees add constraint employees_training_types_check
  check (training_types is null or training_types <@
    array['driving', 'safety', 'technical', 'computer', 'other']::text[]);

alter table public.employees drop constraint if exists employees_cv_quality_check;
alter table public.employees add constraint employees_cv_quality_check
  check (cv_quality is null or cv_quality in
    ('good', 'verified', 'needs_review', 'not_available'));

alter table public.employees drop constraint if exists employees_manpower_category_check;
alter table public.employees add constraint employees_manpower_category_check
  check (manpower_category is null or manpower_category in
    ('contractual', 'regular', 'manpower', 'young_manpower', 'temporary', 'part_time', 'full_time'));

alter table public.employees drop constraint if exists employees_work_type_check;
alter table public.employees add constraint employees_work_type_check
  check (work_type is null or work_type in ('physical', 'online', 'hybrid'));

alter table public.employees drop constraint if exists employees_shift_check;
alter table public.employees add constraint employees_shift_check
  check (shift is null or shift in ('day', 'night', 'morning', 'evening', 'rotational', 'flexible'));

alter table public.employees drop constraint if exists employees_availability_check;
alter table public.employees add constraint employees_availability_check
  check (availability is null or availability in ('active', 'inactive', 'available', 'assigned'));

alter table public.employees drop constraint if exists employees_sector_check;
alter table public.employees add constraint employees_sector_check
  check (sector is null or sector in ('government', 'private', 'ngo', 'other'));

alter table public.projects drop constraint if exists projects_sector_check;
alter table public.projects add constraint projects_sector_check
  check (sector is null or sector in ('government', 'private', 'ngo', 'other'));

-- Deleting a project un-assigns its candidates instead of deleting them.
alter table public.employees drop constraint if exists employees_project_id_fkey;
alter table public.employees add constraint employees_project_id_fkey
  foreign key (project_id) references public.projects (id) on delete set null;


-- ---------------------------------------------------------------- 4. indexes
-- One b-tree per filtered scalar column: filters are AND-ed across groups, so
-- the planner picks whichever is most selective for a given search.

create index if not exists employees_gender_idx            on public.employees (gender);
create index if not exists employees_date_of_birth_idx     on public.employees (date_of_birth);
create index if not exists employees_education_level_idx   on public.employees (education_level);
create index if not exists employees_education_board_idx   on public.employees (education_board);
create index if not exists employees_profession_idx        on public.employees (profession);
create index if not exists employees_experience_years_idx  on public.employees (experience_years);
create index if not exists employees_division_idx          on public.employees (division);
create index if not exists employees_district_idx          on public.employees (district);
create index if not exists employees_is_trained_idx        on public.employees (is_trained);
create index if not exists employees_cv_quality_idx        on public.employees (cv_quality);
create index if not exists employees_manpower_category_idx on public.employees (manpower_category);
create index if not exists employees_work_type_idx         on public.employees (work_type);
create index if not exists employees_shift_idx             on public.employees (shift);
create index if not exists employees_availability_idx      on public.employees (availability);
create index if not exists employees_sector_idx            on public.employees (sector);
create index if not exists employees_project_id_idx        on public.employees (project_id);

-- training_types is an array, matched with && / @> — needs GIN, not b-tree.
create index if not exists employees_training_types_idx
  on public.employees using gin (training_types);

-- The common shortlisting path: "available candidates of profession X in district Y".
create index if not exists employees_shortlist_idx
  on public.employees (availability, profession, district);


-- ================================= OPTIONAL =================================
-- Trigram index for the keyword box (name ILIKE '%...%').
--
-- Everything above is required. This section is not: without it keyword search
-- still works, it just falls back to a sequential scan — imperceptible at a few
-- thousand rows.
--
-- It is wrapped in a DO block on purpose. The Supabase SQL editor runs a pasted
-- file as one implicit transaction, so an unguarded failure here — CREATE
-- EXTENSION not permitted on the plan, or pg_trgm already installed into the
-- `extensions` schema so unqualified gin_trgm_ops does not resolve — would roll
-- back the whole migration above it. Trapping the error keeps the index
-- genuinely optional: it is skipped with a notice and everything else stands.
-- ============================================================================

do $$
begin
  create extension if not exists pg_trgm;
  -- EXECUTE so the opclass is resolved after the extension exists.
  execute 'create index if not exists employees_name_trgm_idx
             on public.employees using gin (name gin_trgm_ops)';
exception when others then
  raise notice 'Skipped the optional pg_trgm index: %', sqlerrm;
end
$$;


-- ================================= RLS NOTE =================================
-- This migration changes no row-level-security policy. Existing policies on
-- public.employees apply unchanged to the new columns.
--
-- public.projects is created without RLS enabled. If your project relies on RLS
-- rather than on the anon key alone, enable it and add policies matching those
-- on public.employees before putting real project data in the table.
-- ============================================================================
