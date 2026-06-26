-- DevFlow Core Database Schema DDL
-- Execute this script in your Supabase SQL Editor.

-- 1. Create public.users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('developer', 'team_lead', 'project_manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create public.projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create public.project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

-- 4. Create public.modules table
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'review', 'completed', 'blocked')),
  deadline TIMESTAMPTZ NOT NULL,
  blocker_description TEXT,
  technical_notes TEXT,
  implementation_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create public.activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 6. Configure RLS Policies

-- Users Profiles Access
CREATE POLICY "Allow authenticated users to read profiles" ON public.users 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update own profile" ON public.users 
  FOR ALL TO authenticated USING (auth.uid() = id);

-- Projects Access (scoped to memberships or ownership)
CREATE POLICY "Allow members to read projects" ON public.projects 
  FOR SELECT TO authenticated USING (
    created_by = auth.uid() OR 
    id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Allow authenticated to insert projects" ON public.projects 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow owners to update projects" ON public.projects 
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Allow owners to delete projects" ON public.projects 
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Project Members Access
CREATE POLICY "Allow members to read project membership" ON public.project_members 
  FOR SELECT TO authenticated USING (true); -- simplify to prevent select loops

CREATE POLICY "Allow project managers or creators to update membership" ON public.project_members 
  FOR ALL TO authenticated USING (
    project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid())
  );

-- Modules Access
CREATE POLICY "Allow project members to read modules" ON public.modules 
  FOR SELECT TO authenticated USING (
    project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Allow project members to modify modules" ON public.modules 
  FOR ALL TO authenticated USING (
    project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
  );

-- Activities Access
CREATE POLICY "Allow members to read activities" ON public.activities 
  FOR SELECT TO authenticated USING (
    project_id IS NULL OR
    project_id IN (SELECT id FROM public.projects WHERE created_by = auth.uid()) OR
    project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Allow authenticated users to create activities" ON public.activities 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
