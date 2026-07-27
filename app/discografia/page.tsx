import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Discografia() {
  const { data } = await supabase.from("site_config").select("value").eq("key", "discografia").maybeSingle();
  type Disco = { titulo: string; ano: string; link: string };
  const discografia: Disco[] = (data?.value as unknown as Disco[]) || [];
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl text-bone">Discografia</h1>
      {discografia.length === 0 ? <p className="text-bone/40">Em breve.</p> : (
        <div className="divide-y divide-white/10 border-y border-white/10">
          {discografia.map(d => (
            <a key={d.titulo} href={d.link} target="_blank" rel="noreferrer" className="flex items-center justify-between py-5 hover:text-accent transition-colors">
              <span className="text-lg text-bone">{d.titulo}</span>
              <span className="text-sm text-bone/50">{d.ano}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
