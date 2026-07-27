import Image from "next/image";
import { banda, integrantes } from "@/lib/data";

export default function Sobre() {
  return (
    <div className="space-y-20">
      {/* Foto da banda */}
      <section className="relative h-[60vh] overflow-hidden rounded-2xl">
        <Image src="/banda.jpg" alt="Antigo Amanhã" fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <p className="font-display text-4xl text-bone">Antigo Amanhã</p>
          <p className="mt-1 text-sm text-accent">Indie Rock · MPB · Uma Banda Cansada</p>
        </div>
      </section>

      {/* Sobre */}
      <section className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl text-bone">Sobre</h1>
        <p className="mt-6 leading-relaxed text-bone/70">{banda.bio}</p>
      </section>

      {/* Integrantes */}
      <section>
        <h2 className="text-sm uppercase tracking-widest text-bone/50">Integrantes</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrantes.map((i) => (
            <div key={i.nome} className="rounded-2xl border border-white/10 p-6">
              <p className="text-lg text-bone">{i.nome}</p>
              <p className="mt-1 text-sm text-accent">{i.funcao}</p>
              {i.bio && <p className="mt-3 text-sm text-bone/60">{i.bio}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
