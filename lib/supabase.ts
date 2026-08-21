import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aqfnuyupkvznihzwhpqu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZm51eXVwa3Z6bmloendocHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NzUxOTAsImV4cCI6MjEwMjQ1MTE5MH0.zmX9snDSAV9rijOxxB-SQysGGHQ7l0uI8Am1b53Rn-0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);