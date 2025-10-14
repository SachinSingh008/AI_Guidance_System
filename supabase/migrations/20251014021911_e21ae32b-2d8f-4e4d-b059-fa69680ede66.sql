-- Create enum for engineering branches
CREATE TYPE engineering_branch AS ENUM ('computer', 'mechanical', 'civil', 'electrical', 'electronics');

-- Create enum for skill levels
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  branch engineering_branch NOT NULL,
  current_year INTEGER CHECK (current_year >= 1 AND current_year <= 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user skills table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level skill_level NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user interests table
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create career recommendations table
CREATE TABLE IF NOT EXISTS public.career_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  career_path TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL,
  skill_gaps TEXT[] NOT NULL,
  recommended_courses JSONB NOT NULL,
  roadmap JSONB NOT NULL,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for user_skills
CREATE POLICY "Users can view own skills"
  ON public.user_skills FOR SELECT
  USING (profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own skills"
  ON public.user_skills FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own skills"
  ON public.user_skills FOR DELETE
  USING (profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Create policies for user_interests
CREATE POLICY "Users can view own interests"
  ON public.user_interests FOR SELECT
  USING (profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own interests"
  ON public.user_interests FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own interests"
  ON public.user_interests FOR DELETE
  USING (profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Create policies for career_recommendations
CREATE POLICY "Users can view own recommendations"
  ON public.career_recommendations FOR SELECT
  USING (profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own recommendations"
  ON public.career_recommendations FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();