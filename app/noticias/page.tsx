import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Noticias() {
  const { data: posts } = await supabase.from("publicacoes_site").select("titulo,resumo,data_pub").eq("publicado", true).order("data_pub", { ascending: false });
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl text-bone">Notícias</h1>
      {(posts || []).length === 0 ? <p className="text-bone/40">Nenhuma notícia ainda.</p> : (
        <div className="space-y-8">
          {(posts || []).map(p => (
            <article key={p.titulo + p.data_pub} className="border-b border-white/10 pb-8">
              <p className="text-sm text-bone/50">{p.data_pub}</p>
              <h2 className="mt-1 text-xl text-bone">{p.titulo}</h2>
              <p className="mt-2 text-bone/70">{p.resumo}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
