-- =============================================================================
-- COMPLETE SUPABASE SCHEMA MIGRATION FOR AK TRADERS
--
-- Project: AK Traders Employee Database System
-- Target: Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- Description: Creates all 4 required tables (profiles, projects, employees, cv_records)
--              with RLS policies, constraints, indexes, and full search fields.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------- 1. PROFILES TABLE
-- Stores user account profiles linked to Supabase Auth (auth.users).
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'employee',
  department TEXT DEFAULT 'Sales',
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read on profiles" ON public.profiles;
CREATE POLICY "Allow read on profiles" ON public.profiles
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Allow insert on profiles" ON public.profiles;
CREATE POLICY "Allow insert on profiles" ON public.profiles
  FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update on profiles" ON public.profiles;
CREATE POLICY "Allow update on profiles" ON public.profiles
  FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);


-- ---------------------------------------------------------------- 2. PROJECTS TABLE
-- Stores operational projects referenced by employees.
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  sector TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access on projects" ON public.projects;
CREATE POLICY "Allow all access on projects" ON public.projects
  FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);


-- ---------------------------------------------------------------- 3. EMPLOYEES TABLE
-- Primary table for candidates and employee profiles (includes 6-tab metadata & filters).
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  designation TEXT,
  status TEXT DEFAULT 'active',
  joining_date DATE,
  cv_file_name TEXT,
  cv_file_size TEXT,
  avatar_url TEXT,
  cv_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Derived & Operational Search Columns
  gender TEXT,
  date_of_birth DATE,
  education_level TEXT,
  education_board TEXT,
  profession TEXT,
  profession_raw TEXT,
  experience_years NUMERIC(4, 1),
  division TEXT,
  district TEXT,
  is_trained BOOLEAN,
  training_types TEXT[],
  cv_quality TEXT,
  manpower_category TEXT,
  work_type TEXT,
  shift TEXT,
  availability TEXT,
  sector TEXT,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  search_indexed_at TIMESTAMPTZ
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access on employees" ON public.employees;
CREATE POLICY "Allow all access on employees" ON public.employees
  FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);


-- ---------------------------------------------------------------- 4. CV_RECORDS TABLE
-- Stores raw extracted CV text and original PDF file references.
CREATE TABLE IF NOT EXISTS public.cv_records (
  id TEXT PRIMARY KEY,
  candidate_name TEXT,
  extracted_text TEXT,
  original_file_name TEXT,
  original_pdf_url TEXT,
  structured_data JSONB,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cv_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access on cv_records" ON public.cv_records;
CREATE POLICY "Allow all access on cv_records" ON public.cv_records
  FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);


-- ---------------------------------------------------------------- 5. VALUE GUARD CONSTRAINTS
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_gender_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_gender_check
  CHECK (gender IS NULL OR gender IN ('male', 'female', 'other'));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_education_level_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_education_level_check
  CHECK (education_level IS NULL OR education_level IN
    ('below_ssc', 'ssc', 'hsc', 'diploma', 'bachelor', 'masters', 'other'));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_education_board_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_education_board_check
  CHECK (education_board IS NULL OR education_board IN
    ('general', 'vocational', 'madrasa', 'technical', 'equivalent'));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_profession_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_profession_check
  CHECK (profession IS NULL OR profession IN
    ('driver', 'housekeeper', 'security_guard', 'cleaner', 'office_staff', 'technician',
     'electrician', 'welder', 'cook', 'mason', 'plumber', 'carpenter', 'helper',
     'supervisor', 'other'));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_experience_years_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_experience_years_check
  CHECK (experience_years IS NULL OR experience_years >= 0);

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_division_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_division_check
  CHECK (division IS NULL OR division IN
    ('barishal', 'chattogram', 'dhaka', 'khulna', 'mymensingh', 'rajshahi', 'rangpur', 'sylhet'));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_district_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_district_check
  CHECK (district IS NULL OR district IN (
    'barguna', 'barishal', 'bhola', 'jhalokati', 'patuakhali', 'pirojpur',
    'bandarban', 'brahmanbaria', 'chandpur', 'chattogram', 'cumilla', 'coxs_bazar',
    'feni', 'khagrachhari', 'lakshmipur', 'noakhali', 'rangamati',
    'dhaka', 'faridpur', 'gazipur', 'gopalganj', 'kishoreganj', 'madaripur', 'manikganj',
    'munshiganj', 'narayanganj', 'narsingdi', 'rajbari', 'shariatpur', 'tangail',
    'bagerhat', 'chuadanga', 'jashore', 'jhenaidah', 'khulna', 'kushtia', 'magura',
    'meherpur', 'narail', 'satkhira',
    'jamalpur', 'mymensingh', 'netrokona', 'sherpur',
    'bogura', 'chapainawabganj', 'joypurhat', 'naogaon', 'natore', 'pabna', 'rajshahi', 'sirajganj',
    'dinajpur', 'gaibandha', 'kurigram', 'lalmonirhat', 'nilphamari', 'panchagarh',
    'rangpur', 'thakurgaon',
    'habiganj', 'moulvibazar', 'sunamganj', 'sylhet'
  ));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_training_types_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_training_types_check
  CHECK (training_types IS NULL OR training_types <@
    ARRAY['driving', 'safety', 'technical', 'computer', 'other']::TEXT[]);

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_cv_quality_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_cv_quality_check
  CHECK (cv_quality IS NULL OR cv_quality IN
    ('good', 'verified', 'needs_review', 'not_available'));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_manpower_category_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_manpower_category_check
  CHECK (manpower_category IS NULL OR manpower_category IN
    ('contractual', 'regular', 'manpower', 'young_manpower', 'temporary', 'part_time', 'full_time'));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_work_type_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_work_type_check
  CHECK (work_type IS NULL OR work_type IN ('physical', 'online', 'hybrid'));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_shift_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_shift_check
  CHECK (shift IS NULL OR shift IN ('day', 'night', 'morning', 'evening', 'rotational', 'flexible'));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_availability_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_availability_check
  CHECK (availability IS NULL OR availability IN ('active', 'inactive', 'available', 'assigned'));

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_sector_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_sector_check
  CHECK (sector IS NULL OR sector IN ('government', 'private', 'ngo', 'other'));

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_sector_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_sector_check
  CHECK (sector IS NULL OR sector IN ('government', 'private', 'ngo', 'other'));


-- ---------------------------------------------------------------- 6. INDEXES
CREATE INDEX IF NOT EXISTS employees_gender_idx            ON public.employees (gender);
CREATE INDEX IF NOT EXISTS employees_date_of_birth_idx     ON public.employees (date_of_birth);
CREATE INDEX IF NOT EXISTS employees_education_level_idx   ON public.employees (education_level);
CREATE INDEX IF NOT EXISTS employees_education_board_idx   ON public.employees (education_board);
CREATE INDEX IF NOT EXISTS employees_profession_idx        ON public.employees (profession);
CREATE INDEX IF NOT EXISTS employees_experience_years_idx  ON public.employees (experience_years);
CREATE INDEX IF NOT EXISTS employees_division_idx          ON public.employees (division);
CREATE INDEX IF NOT EXISTS employees_district_idx          ON public.employees (district);
CREATE INDEX IF NOT EXISTS employees_is_trained_idx        ON public.employees (is_trained);
CREATE INDEX IF NOT EXISTS employees_cv_quality_idx        ON public.employees (cv_quality);
CREATE INDEX IF NOT EXISTS employees_manpower_category_idx ON public.employees (manpower_category);
CREATE INDEX IF NOT EXISTS employees_work_type_idx         ON public.employees (work_type);
CREATE INDEX IF NOT EXISTS employees_shift_idx             ON public.employees (shift);
CREATE INDEX IF NOT EXISTS employees_availability_idx      ON public.employees (availability);
CREATE INDEX IF NOT EXISTS employees_sector_idx            ON public.employees (sector);
CREATE INDEX IF NOT EXISTS employees_project_id_idx        ON public.employees (project_id);
CREATE INDEX IF NOT EXISTS employees_training_types_idx   ON public.employees USING GIN (training_types);
CREATE INDEX IF NOT EXISTS employees_shortlist_idx        ON public.employees (availability, profession, district);

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  EXECUTE 'CREATE INDEX IF NOT EXISTS employees_name_trgm_idx ON public.employees USING GIN (name gin_trgm_ops)';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipped optional pg_trgm index: %', SQLERRM;
END
$$;
