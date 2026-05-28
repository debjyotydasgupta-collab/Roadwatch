
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('citizen', 'authority');
CREATE TYPE public.complaint_type AS ENUM ('pothole', 'waterlogging', 'crack', 'streetlight', 'debris', 'other');
CREATE TYPE public.complaint_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.complaint_status AS ENUM ('submitted', 'acknowledged', 'in_progress', 'resolved', 'verified');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ AUTO-CREATE PROFILE + ROLE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CONTRACTORS ============
CREATE TABLE public.contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contractors TO anon, authenticated;
GRANT ALL ON public.contractors TO service_role;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contractors_select_all" ON public.contractors FOR SELECT USING (true);

-- ============ ROAD PROJECTS ============
CREATE TABLE public.road_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  road_name TEXT NOT NULL,
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.road_projects TO anon, authenticated;
GRANT ALL ON public.road_projects TO service_role;
ALTER TABLE public.road_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "road_projects_select_all" ON public.road_projects FOR SELECT USING (true);

-- ============ BUDGETS ============
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.road_projects(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  used_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.budgets TO anon, authenticated;
GRANT ALL ON public.budgets TO service_role;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budgets_select_all" ON public.budgets FOR SELECT USING (true);

-- ============ COMPLAINTS ============
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type public.complaint_type NOT NULL DEFAULT 'pothole',
  severity public.complaint_severity NOT NULL DEFAULT 'medium',
  location_lat DOUBLE PRECISION NOT NULL,
  location_lon DOUBLE PRECISION NOT NULL,
  road_name TEXT,
  image_url TEXT,
  status public.complaint_status NOT NULL DEFAULT 'submitted',
  ai_analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT SELECT ON public.complaints TO anon;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints_select_all" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "complaints_insert_own" ON public.complaints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "complaints_update_own_or_authority" ON public.complaints FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'authority'));
CREATE POLICY "complaints_delete_own" ON public.complaints FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ STATUS HISTORY ============
CREATE TABLE public.complaint_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status public.complaint_status NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.complaint_status_history TO authenticated;
GRANT SELECT ON public.complaint_status_history TO anon;
GRANT ALL ON public.complaint_status_history TO service_role;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "status_history_select_all" ON public.complaint_status_history FOR SELECT USING (true);
CREATE POLICY "status_history_insert_authority" ON public.complaint_status_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'authority') OR auth.uid() = changed_by);

-- ============ REPAIRS ============
CREATE TABLE public.repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL UNIQUE REFERENCES public.complaints(id) ON DELETE CASCADE,
  before_image_url TEXT,
  after_image_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.repairs TO authenticated;
GRANT SELECT ON public.repairs TO anon;
GRANT ALL ON public.repairs TO service_role;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "repairs_select_all" ON public.repairs FOR SELECT USING (true);
CREATE POLICY "repairs_insert_related" ON public.repairs FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'authority')
    OR EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND c.user_id = auth.uid())
  );
CREATE POLICY "repairs_update_related" ON public.repairs FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'authority')
    OR EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND c.user_id = auth.uid())
  );

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_own_or_authority" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'authority'));
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-images', 'complaint-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('repair-images', 'repair-images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "complaint_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'complaint-images');
CREATE POLICY "complaint_images_authenticated_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'complaint-images');
CREATE POLICY "repair_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'repair-images');
CREATE POLICY "repair_images_authenticated_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'repair-images');

-- ============ SEED PUBLIC DATA (contractors, projects, budgets) ============
WITH c AS (
  INSERT INTO public.contractors (name) VALUES ('Apex Infrastructure Pvt Ltd') RETURNING id
), p AS (
  INSERT INTO public.road_projects (name, road_name, contractor_id)
  SELECT 'MG Road Resurfacing Phase 2', 'MG Road', c.id FROM c RETURNING id
)
INSERT INTO public.budgets (project_id, amount, used_amount)
SELECT p.id, 12500000, 7800000 FROM p;
