import { banda } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-bone/50">
          © {new Date().getFullYear()} {banda.nome}. Todos os direitos reservados.
        </p>
        <div className="flex gap-4 text-sm text-bone/70">
          {banda.redes.map((r) => (
            <a
              key={r.nome}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent"
            >
              {r.nome}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
