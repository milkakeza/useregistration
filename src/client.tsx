import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xqcaeffpqvoyywzacavt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxY2FlZmZwcXZveXl3emFjYXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjI2MDQsImV4cCI6MjA3MDQ5ODYwNH0.eI0y0_EtO1uJq4MLNfZHu59XGC-KBMBV9fSf9Tq9jkU";
export const supabase = createClient(supabaseUrl, supabaseKey);
