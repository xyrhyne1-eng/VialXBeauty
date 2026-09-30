const SUPABASE_URL = "https://bwyugnuwiodfjhoapxuq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_RIEBzXGjCixorYBXBvZ-Lg_OpdvCMdP";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Keep the client available to the existing VialXBeauty scripts.
window.supabaseClient = supabaseClient;
