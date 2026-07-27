import { clipes } from "@/lib/data";

export default function Clipes() {
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl text-bone">Clipes & Vídeos</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {clipes.map((c) => (
          <a
            key={c.titulo}
            href={c.link}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/10 p-6 hover:border-accent"
          >
            <p className="text-lg text-bone">{c.titulo}</p>
            <p className="mt-1 text-sm text-bone/50">{c.data}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
