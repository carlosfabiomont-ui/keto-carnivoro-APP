
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
export const SUPABASE_URL: string = 'https://lvddgbpqatcjhuhnpdgr.supabase.co';
export const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZGRnYnBxYXRjamh1aG5wZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzM5MTUsImV4cCI6MjA3OTc0OTkxNX0.a8LvZwaYzkeZzthWHM-d_JfTfaiy-4XNef0IEPDwAls';

// Verificação de segurança simples para não quebrar o app se as chaves não existirem
const isConfigured = SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';

export const supabase = isConfigured 
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
    : null;

export const isSupabaseConfigured = () => !!supabase;
