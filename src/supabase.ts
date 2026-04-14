import { createClient } from '@supabase/supabase-js';

// ATENCIÓN: Las claves están harcodeadas temporalmente porque tu servidor de hosting (Vercel/Netlify) no lee el .env local.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ouqadccdztxwzqxrndog.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91cWFkY2NkenR4d3pxeHJuZG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzY2MjgsImV4cCI6MjA5MTYxMjYyOH0.77FNldDvFQtd6jkdKJPxbeR37cKTmuLd7b4QFlXvHxM';

export const supabase = createClient(supabaseUrl, supabaseKey);
