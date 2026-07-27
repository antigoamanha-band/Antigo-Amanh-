import { publicacoes } from "@/lib/data";

export default function Noticias() {
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl text-bone">Notícias</h1>
      <div className="space-y-8">
        {publicacoes.map((p) => (
          <article key={p.titulo} className="border-b border-white/10 pb-8">
            <p className="text-sm text-bone/50">{p.data}</p>
            <h2 className="mt-1 text-xl text-bone">{p.titulo}</h2>
            <p className="mt-2 text-bone/70">{p.resumo}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
