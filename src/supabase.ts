import { createClient } from '@supabase/supabase-js';

// ATENCIÓN: Las claves están harcodeadas temporalmente porque tu servidor de hosting (Vercel/Netlify) no lee el .env local.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ouqadccdztxwzqxrndog.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TA9PQIYVpxmU4qWx3e0l8w_QJR65U5G';

export const supabase = createClient(supabaseUrl, supabaseKey);
