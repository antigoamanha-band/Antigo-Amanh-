import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "https://uqhbxaxjabhnrknkuqfo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaGJ4YXhqYWJobnJrbmt1cWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDM2MjcsImV4cCI6MjEwMDY3OTYyN30.9Esz0xe2pcMYN7nIZ9zRekNKgm5s0uODcP7Oiy13tkU";

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Profile = { id: string; nome: string; funcao: string | null; avatar_url: string | null; role: "admin"|"member"; is_owner: boolean; created_at: string; };
export type Project = { id: string; titulo: string; descricao: string | null; tipo: "música"|"álbum"|"ep"|"clipe"|"outro"; progresso: number; cover_url: string | null; created_by: string | null; created_at: string; updated_at: string; };
export type ProjectItem = { id: string; project_id: string; titulo: string; descricao: string | null; tipo: string; cover_url: string | null; ordem: number; created_by: string | null; created_at: string; updated_at: string; };
export type ItemBlock = { id: string; item_id: string; tipo: string; titulo: string; conteudo: string | null; url: string | null; ordem: number; created_by: string | null; created_at: string; updated_at: string; };
export type ProjectLink = { id: string; project_id: string; label: string; url: string; descricao: string | null; thumb_url: string | null; tipo: string; };
export type ProjectTask = { id: string; project_id: string; item_id: string | null; content: string; done: boolean; ordem: number; created_by: string | null; created_at: string; };
export type ProjectComment = { id: string; project_id: string; item_id: string | null; author_id: string; content: string; created_at: string; profiles?: { nome: string; avatar_url: string | null }; };
export type PublicacaoSite = { id: string; titulo: string; resumo: string | null; conteudo: string | null; cover_url: string | null; data_pub: string; publicado: boolean; created_by: string | null; created_at: string; updated_at: string; };
export type Notification = { id: string; user_id: string; tipo: string; titulo: string; corpo: string | null; project_id: string | null; comment_id: string | null; lida: boolean; created_at: string; };
