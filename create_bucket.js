
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypvuytqhkcskmcszvqem.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdnV5dHFoa2Nza21jc3p2cWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDgyNDksImV4cCI6MjA4MDc4NDI0OX0.RbWNPWXGXGhLCu16mRAoc2MOMR3c2FGKHdvSj-P4aE4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBucket() {
    console.log("Attempting to create 'chat-uploads' bucket...");
    const { data, error } = await supabase.storage.createBucket('chat-uploads', {
        public: true
    });

    if (error) {
        console.error('Error creating bucket:', error);
    } else {
        console.log('Bucket created successfully:', data);
    }
}

createBucket();
