import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export type Profile = {
  id: string;
  auth_user_id: string;
  email: string | null;
  subscription_plan: 'free' | 'one_time';
  created_at: string;
};

export type Session = {
  id: string;
  profile_id: string;
  status: 'active' | 'completed' | 'abandoned';
  synthesis_status: 'pending' | 'generating' | 'complete';
  session_number: number;
  created_at: string;
  updated_at: string;
};

export type ResponseRaw = {
  id: string;
  session_id: string;
  question_key: 'cube' | 'ladder' | 'flowers' | 'animal' | 'storm';
  answer_text: string;
  created_at: string;
};

export type DerivedInsights = {
  id: string;
  session_id: string;
  traits: InsightTraits | null;
  summary: string | null;
  created_at: string;
};

export type ElementInsight = {
  observation: string;
  interpretation: string;
  lens: string;
};

export type InsightTraits = {
  cube: ElementInsight;
  ladder: ElementInsight;
  flowers: ElementInsight;
  animal: ElementInsight;
  storm: ElementInsight;
  pattern: string;
  takeaways: string[];
  summary_line: string;
};
