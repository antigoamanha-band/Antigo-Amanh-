import { banda } from "@/lib/data";

export default function Contato() {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-bone">Contato</h1>
      <p className="max-w-xl text-bone/70">
        Para imprensa, shows e parcerias, entre em contato pelos canais abaixo.
      </p>
      <div className="space-y-2">
        {banda.redes.map((r) => (
          <a
            key={r.nome}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="block text-bone/80 hover:text-accent"
          >
            {r.nome} →
          </a>
        ))}
      </div>
    </div>
  );
}
