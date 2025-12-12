
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypvuytqhkcskmcszvqem.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdnV5dHFoa2Nza21jc3p2cWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDgyNDksImV4cCI6MjA4MDc4NDI0OX0.RbWNPWXGXGhLCu16mRAoc2MOMR3c2FGKHdvSj-P4aE4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error);
  } else {
    console.log('Buckets:', data);
  }
}

listBuckets();
