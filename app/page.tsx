import Link from "next/link";
import { banda, publicacoes, clipes } from "@/lib/data";

export default function Home() {
  const ultimoPost = publicacoes[0];
  const ultimoClipe = clipes[0];

  return (
    <div className="space-y-20">
      <section>
        <h1 className="font-display text-5xl leading-tight text-bone">
          {banda.nome}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-bone/70">{banda.bio}</p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/discografia"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-ink"
          >
            Ouvir músicas
          </Link>
          <Link
            href="/noticias"
            className="rounded-full border border-white/20 px-6 py-3 text-sm text-bone"
          >
            Ver novidades
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-widest text-accent">
            Última publicação
          </p>
          <h2 className="mt-2 text-xl text-bone">{ultimoPost.titulo}</h2>
          <p className="mt-2 text-sm text-bone/60">{ultimoPost.data}</p>
          <p className="mt-3 text-bone/70">{ultimoPost.resumo}</p>
        </div>
        <div className="rounded-2xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-widest text-accent">
            Último clipe
          </p>
          <h2 className="mt-2 text-xl text-bone">{ultimoClipe.titulo}</h2>
          <p className="mt-2 text-sm text-bone/60">{ultimoClipe.data}</p>
          <a
            href={ultimoClipe.link}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-accent hover:underline"
          >
            Assistir →
          </a>
        </div>
      </section>
    </div>
  );
}
