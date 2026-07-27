import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabase = createClient(
  "https://uqhbxaxjabhnrknkuqfo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaGJ4YXhqYWJobnJrbmt1cWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDM2MjcsImV4cCI6MjEwMDY3OTYyN30.9Esz0xe2pcMYN7nIZ9zRekNKgm5s0uODcP7Oiy13tkU"
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: { id: string } };

export default async function NoticiaDetalhe({ params }: Props) {
  const { data: post } = await supabase
    .from("publicacoes_site")
    .select("*")
    .eq("id", params.id)
    .eq("publicado", true)
    .single();

  if (!post) notFound();

  const date = new Date(post.data_pub).toLocaleDateString("pt-BR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <main className="min-h-screen bg-ink text-bone">
      {/* Cover image */}
      {post.cover_url && (
        <div className="relative w-full" style={{ maxHeight: "480px", overflow: "hidden" }}>
          <img
            src={post.cover_url}
            alt={post.titulo}
            className="w-full object-cover"
            style={{ maxHeight: "480px" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 40%, #09091e 100%)" }}
          />
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 py-12">
        <a href="/" className="text-sm text-bone/40 hover:text-bone transition-colors">
          ← Notícias
        </a>

        <article className="mt-8 space-y-6">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-accent">{date}</p>
            <h1
              className="font-display text-3xl sm:text-4xl text-bone leading-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {post.titulo}
            </h1>
            {post.resumo && (
              <p className="text-bone/60 text-lg leading-relaxed">{post.resumo}</p>
            )}
          </header>

          {post.conteudo && (
            <div className="border-t border-white/10 pt-8">
              <p
                className="text-bone/75 leading-relaxed text-base"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {post.conteudo}
              </p>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
