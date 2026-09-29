// VialXBeauty database connection.
// Replace these two placeholders after creating the NEW VialXBeauty Supabase project.
const SUPABASE_URL = "https://YOUR-VIALXBEAUTY-PROJECT.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "YOUR-VIALXBEAUTY-PUBLISHABLE-KEY";
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
