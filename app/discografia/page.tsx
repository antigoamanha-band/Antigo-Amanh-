import { discografia } from "@/lib/data";

export default function Discografia() {
  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl text-bone">Discografia</h1>
      <div className="divide-y divide-white/10 border-y border-white/10">
        {discografia.map((d) => (
          <a
            key={d.titulo}
            href={d.link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between py-5 hover:text-accent"
          >
            <span className="text-lg text-bone">{d.titulo}</span>
            <span className="text-sm text-bone/50">{d.ano}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
