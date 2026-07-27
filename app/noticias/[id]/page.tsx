import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const supabase = createClient(
  "https://uqhbxaxjabhnrknkuqfo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaGJ4YXhqYWJobnJrbmt1cWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDM2MjcsImV4cCI6MjEwMDY3OTYyN30.9Esz0xe2pcMYN7nIZ9zRekNKgm5s0uODcP7Oiy13tkU"
);

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export default async function NoticiaPage({ params }: { params: { id: string } }) {
  const { data: post, error } = await supabase
    .from("publicacoes_site")
    .select("*")
    .eq("id", params.id)
    .eq("publicado", true)
    .single();

  if (error || !post) notFound();

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="border-b border-white/8 bg-ink/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-tight">Antigo Amanhã</Link>
          <nav className="flex items-center gap-6 text-sm text-bone/50">
            <Link href="/noticias" className="hover:text-bone transition-colors">Notícias</Link>
            <Link href="/sobre" className="hover:text-bone transition-colors">Sobre</Link>
            <Link href="/discografia" className="hover:text-bone transition-colors">Discografia</Link>
            <Link href="/clipes" className="hover:text-bone transition-colors">Clipes</Link>
            <Link href="/contato" className="hover:text-bone transition-colors">Contato</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link href="/" className="text-bone/30 hover:text-bone text-sm transition-colors">← Início</Link>

        <article className="mt-8 space-y-6">
          <div className="space-y-3">
            <p className="text-xs text-bone/30">{formatDate(post.data_pub)}</p>
            <h1 className="font-display text-3xl sm:text-4xl text-bone leading-tight">{post.titulo}</h1>
            {post.resumo && (
              <p className="text-bone/60 text-lg leading-relaxed">{post.resumo}</p>
            )}
          </div>

          {post.conteudo && (
            <div className="border-t border-white/8 pt-6">
              <div className="prose prose-invert max-w-none text-bone/70 leading-relaxed whitespace-pre-wrap text-base">
                {post.conteudo}
              </div>
            </div>
          )}
        </article>

        <div className="mt-12 pt-8 border-t border-white/8">
          <Link href="/noticias" className="text-accent text-sm hover:text-accent/70 transition-colors">← Ver todas as notícias</Link>
        </div>
      </div>
    </main>
  );
}
