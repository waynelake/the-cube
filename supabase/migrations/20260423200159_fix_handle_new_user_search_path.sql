/*
  # Fix handle_new_user function search_path security

  ## Summary
  Sets the search_path to a fixed, immutable value for the handle_new_user function
  to prevent privilege escalation attacks via schema manipulation.

  ## Changes
  - Recreates handle_new_user function with STABLE and fixed search_path
  - Ensures the function cannot be exploited through search_path mutations
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
