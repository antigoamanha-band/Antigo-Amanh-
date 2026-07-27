import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  "https://uqhbxaxjabhnrknkuqfo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaGJ4YXhqYWJobnJrbmt1cWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDM2MjcsImV4cCI6MjEwMDY3OTYyN30.9Esz0xe2pcMYN7nIZ9zRekNKgm5s0uODcP7Oiy13tkU"
);

function getYtId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export default async function Home() {
  const [{ data: posts }, { data: configRows }] = await Promise.all([
    supabase
      .from("publicacoes_site")
      .select("*")
      .eq("publicado", true)
      .order("data_pub", { ascending: false })
      .limit(20),
    supabase.from("site_config").select("key,value"),
  ]);

  const cfg: Record<string, unknown> = {};
  (configRows || []).forEach((r) => { cfg[r.key] = r.value; });
  const clipes = (cfg.clipes as { titulo: string; link: string; data: string }[]) || [];
  const featuredClipe = clipes[0];
  const ytId = featuredClipe ? getYtId(featuredClipe.link) : null;

  const featured = posts?.[0] ?? null;
  const rest = posts?.slice(1) ?? [];

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="border-b border-white/8 bg-ink/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-tight" style={{ fontFamily: "Georgia, serif" }}>Antigo Amanhã</Link>
          <nav className="flex items-center gap-6 text-sm text-bone/50">
            <Link href="/sobre" className="hover:text-bone transition-colors">Sobre</Link>
            <Link href="/discografia" className="hover:text-bone transition-colors">Discografia</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-10 space-y-12">
        {featured ? (
          <section>
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-4">Última atualização</p>
            <Link href={`/noticias/${featured.id}`} className="group block">
              <div className="rounded-2xl border border-white/10 group-hover:border-accent/40 transition-all overflow-hidden">
                {featured.cover_url && (
                  <div className="relative w-full" style={{ paddingBottom: "42%" }}>
                    <img
                      src={featured.cover_url}
                      alt={featured.titulo}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(9,9,30,0.85) 100%)" }}
                    />
                  </div>
                )}
                <div className="p-8 sm:p-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs text-bone/40">{formatDate(featured.data_pub)}</span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl text-bone leading-tight mb-4 group-hover:text-accent transition-colors" style={{ fontFamily: "Georgia, serif" }}>
                    {featured.titulo}
                  </h1>
                  {featured.resumo && (
                    <p className="text-bone/60 text-base leading-relaxed max-w-2xl">{featured.resumo}</p>
                  )}
                  <p className="mt-6 text-sm text-accent">Ler mais →</p>
                </div>
              </div>
            </Link>
          </section>
        ) : (
          <section className="rounded-2xl border border-white/5 p-10 text-center">
            <p className="font-display text-3xl text-bone/20" style={{ fontFamily: "Georgia, serif" }}>Em breve</p>
            <p className="text-bone/30 text-sm mt-2">Novidades chegando em breve.</p>
          </section>
        )}

        {rest.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-[0.2em] text-bone/30 font-medium mb-5">Publicações anteriores</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((p) => (
                <Link key={p.id} href={`/noticias/${p.id}`} className="group rounded-xl border border-white/8 hover:border-accent/30 transition-all overflow-hidden flex flex-col">
                  {p.cover_url ? (
                    <div className="relative w-full flex-shrink-0" style={{ paddingBottom: "56.25%" }}>
                      <img
                        src={p.cover_url}
                        alt={p.titulo}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full flex-shrink-0 flex items-center justify-center"
                      style={{ height: "120px", background: "rgba(232,72,32,0.04)" }}
                    >
                      <span className="text-3xl opacity-10">◦</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <span className="text-[10px] text-bone/30">{formatDate(p.data_pub)}</span>
                    <h2 className="font-display text-base text-bone group-hover:text-accent transition-colors leading-snug line-clamp-3" style={{ fontFamily: "Georgia, serif" }}>{p.titulo}</h2>
                    {p.resumo && <p className="text-bone/40 text-sm leading-relaxed line-clamp-2 flex-1">{p.resumo}</p>}
                    <span className="text-xs text-accent/60 group-hover:text-accent transition-colors mt-1">Ler →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {featuredClipe && ytId && (
          <section>
            <p className="text-xs uppercase tracking-[0.2em] text-bone/30 font-medium mb-5">Último clipe</p>
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={featuredClipe.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="px-5 py-4 border-t border-white/8">
                <p className="text-sm font-medium text-bone">{featuredClipe.titulo}</p>
                <p className="text-xs text-bone/30 mt-0.5">{featuredClipe.data}</p>
              </div>
            </div>
          </section>
        )}

        <footer className="border-t border-white/8 pt-8 pb-4 text-center">
          <p className="text-xs text-bone/20">© {new Date().getFullYear()} Antigo Amanhã</p>
        </footer>
      </div>
    </main>
  );
}
