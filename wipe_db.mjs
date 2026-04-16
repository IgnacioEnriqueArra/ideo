import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ouqadccdztxwzqxrndog.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91cWFkY2NkenR4d3pxeHJuZG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzY2MjgsImV4cCI6MjA5MTYxMjYyOH0.77FNldDvFQtd6jkdKJPxbeR37cKTmuLd7b4QFlXvHxM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipe() {
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bookmarks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('likes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('feedbacks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('branches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('ideas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Wiped public tables.");
}
wipe();
