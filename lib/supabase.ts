import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uqhbxaxjabhnrknkuqfo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaGJ4YXhqYWJobnJrbmt1cWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDM2MjcsImV4cCI6MjEwMDY3OTYyN30.9Esz0xe2pcMYN7nIZ9zRekNKgm5s0uODcP7Oiy13tkU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
