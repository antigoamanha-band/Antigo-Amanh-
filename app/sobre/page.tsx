import Image from "next/image";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Sobre() {
  const { data } = await supabase.from("site_config").select("key,value").in("key", ["bio", "integrantes"]);
  const cfg: Record<string, unknown> = {};
  (data || []).forEach(row => { cfg[row.key] = row.value; });
  const bio = (cfg.bio as string) || "";
  type Integrante = { nome: string; funcao: string };
  const integrantes: Integrante[] = (cfg.integrantes as Integrante[]) || [];

  return (
    <div className="space-y-20">
      <section className="relative h-[60vh] overflow-hidden rounded-2xl">
        <Image src="/banda.jpg" alt="Antigo Amanhã" fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <p className="font-display text-4xl text-bone">Antigo Amanhã</p>
          <p className="mt-1 text-sm text-accent">Indie Rock · MPB · Uma Banda Cansada</p>
        </div>
      </section>
      <section className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl text-bone">Sobre</h1>
        <p className="mt-6 leading-relaxed text-bone/70">{bio}</p>
      </section>
      {integrantes.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-widest text-bone/50">Integrantes</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrantes.map(i => (
              <div key={i.nome} className="rounded-2xl border border-white/10 p-6">
                <p className="text-lg text-bone">{i.nome}</p>
                <p className="mt-1 text-sm text-accent">{i.funcao}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
