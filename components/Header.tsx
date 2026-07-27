import Link from "next/link";

const links = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/discografia", label: "Discografia" },
  { href: "/clipes", label: "Clipes" },
  { href: "/noticias", label: "Notícias" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-xl tracking-wide text-bone"
        >
          Antigo Amanhã
        </Link>
        <nav className="flex gap-6 text-sm text-bone/70">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
