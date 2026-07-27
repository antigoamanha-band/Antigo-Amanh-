import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Clipes() {
  const { data } = await supabase.from("site_config").select("value").eq("key", "clipes").maybeSingle();
  type Clipe = { titulo: string; data: string; link: string };
  const clipes: Clipe[] = (data?.value as unknown as Clipe[]) || [];
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl text-bone">Clipes & Vídeos</h1>
      {clipes.length === 0 ? <p className="text-bone/40">Em breve.</p> : (
        <div className="grid gap-6 sm:grid-cols-2">
          {clipes.map(c => (
            <a key={c.titulo} href={c.link} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 p-6 hover:border-accent transition-colors">
              <p className="text-lg text-bone">{c.titulo}</p>
              <p className="mt-1 text-sm text-bone/50">{c.data}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
