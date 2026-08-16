import { createClient } from '@supabase/supabase-js';

// ВСТАВЬ СВОИ ДАННЫЕ (возьми их из Supabase)
const supabaseUrl = 'https://aqfnuyupkvznihzwhpqu.supabase.co'; // твой URL
const supabaseAnonKey = 'sb_publishable_uIGZ_TBmUa0E_6zEAlfErQ_Ce2QM9ak'; // твой ключ

export const supabase = createClient(supabaseUrl, supabaseAnonKey);