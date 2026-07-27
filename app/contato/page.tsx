import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Contato() {
  const { data } = await supabase.from("site_config").select("value").eq("key", "redes").maybeSingle();
  type Rede = { nome: string; url: string };
  const redes: Rede[] = (data?.value as unknown as Rede[]) || [];
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-bone">Contato</h1>
      <p className="max-w-xl text-bone/70">Para imprensa, shows e parcerias, entre em contato pelos canais abaixo.</p>
      <div className="space-y-2">
        {redes.map(r => (
          <a key={r.nome} href={r.url} target="_blank" rel="noreferrer" className="block text-bone/80 hover:text-accent transition-colors">
            {r.nome} →
          </a>
        ))}
      </div>
    </div>
  );
}
