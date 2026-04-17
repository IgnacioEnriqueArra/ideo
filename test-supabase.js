import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const file = fs.readFileSync('./src/supabase.ts', 'utf8');
const urlMatch = file.match(/const supabaseUrl = ['"]([^'"]+)['"]/);
const keyMatch = file.match(/const supabaseKey = ['"]([^'"]+)['"]/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data: users } = await supabase.from('users').select('*').limit(1);
  if (!users || users.length === 0) { console.log('No users found'); return; }
  const uid = users[0].id;
  const newIdea = { id: '11111111-1111-1111-1111-111111111111', authorId: uid, content: 'Test post', createdAt: new Date().toISOString(), likes: 0, tags: [] };
  const { data, error } = await supabase.from('ideas').insert(newIdea);
  console.log('Result:', error || 'Success');
}
run();
