import { banda, integrantes } from "@/lib/data";

export default function Sobre() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-3xl text-bone">Sobre a banda</h1>
        <p className="mt-4 max-w-2xl text-bone/70">{banda.bio}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {integrantes.map((i) => (
          <div key={i.nome} className="rounded-2xl border border-white/10 p-6">
            <p className="text-lg text-bone">{i.nome}</p>
            <p className="text-sm text-accent">{i.funcao}</p>
            <p className="mt-3 text-sm text-bone/60">{i.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
