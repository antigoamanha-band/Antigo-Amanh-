import Image from "next/image";
import Link from "next/link";
import { publicacoes, clipes } from "@/lib/data";

export default function Home() {
  const ultimaPublicacao = publicacoes[0];
  const ultimoClipe = clipes[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-screen items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/banda.jpg"
            alt="Antigo Amanhã"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
          <p className="text-xs uppercase tracking-widest text-accent">Indie Rock · MPB</p>
          <h1 className="mt-2 font-display text-6xl text-bone md:text-8xl">
            Antigo<br />Amanhã
          </h1>
          <p className="mt-4 max-w-md text-bone/60">Uma banda cansada.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/discografia" className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-bone hover:bg-accent/90 transition-colors">
              Discografia
            </Link>
            <Link href="/sobre" className="rounded-full border border-white/20 px-6 py-2.5 text-sm text-bone/70 hover:text-bone transition-colors">
              Sobre a banda
            </Link>
          </div>
        </div>
      </section>

      {/* Último post */}
      {ultimaPublicacao && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs uppercase tracking-widest text-bone/40">Última notícia</p>
          <h2 className="mt-2 font-display text-3xl text-bone">{ultimaPublicacao.titulo}</h2>
          <p className="mt-3 max-w-xl text-bone/60">{ultimaPublicacao.resumo}</p>
          <Link href="/noticias" className="mt-4 inline-block text-sm text-accent hover:underline">
            Ver todas as notícias →
          </Link>
        </section>
      )}

      {/* Último clipe */}
      {ultimoClipe?.embedUrl && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <p className="text-xs uppercase tracking-widest text-bone/40">Último clipe</p>
          <h2 className="mt-2 mb-6 font-display text-3xl text-bone">{ultimoClipe.titulo}</h2>
          <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-2xl">
            <iframe src={ultimoClipe.embedUrl} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </section>
      )}
    </div>
  );
}
