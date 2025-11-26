
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
// Passo 1: Vá em https://supabase.com/dashboard/project/_/settings/api
// Passo 2: Copie a "Project URL" e a "anon public" Key
// Passo 3: Cole abaixo DENTRO das aspas

// 🔴🔴 👇👇 COLE A URL DO SEU PROJETO ABAIXO (Mantenha as aspas) 👇👇 🔴🔴
const SUPABASE_URL: string = 'https://lvddgbpqatcjhuhnpdgr.supabase.co'; // Ex: 'https://xyz.supabase.co'

// 🔴🔴 👇👇 COLE A CHAVE ANON PUBLIC ABAIXO (Mantenha as aspas) 👇👇 🔴🔴
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2ZGRnYnBxYXRjamh1aG5wZGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzM5MTUsImV4cCI6MjA3OTc0OTkxNX0.a8LvZwaYzkeZzthWHM-d_JfTfaiy-4XNef0IEPDwAls'; // Ex: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// Verificação de segurança simples para não quebrar o app se as chaves não existirem
const isConfigured = SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';

export const supabase = isConfigured 
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
    : null;

export const isSupabaseConfigured = () => !!supabase;
