import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/sobre", label: "Sobre" },
  { href: "/discografia", label: "Discografia" },
  { href: "/clipes", label: "Clipes" },
  { href: "/noticias", label: "Notícias" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.jpeg"
            alt="Antigo Amanhã"
            width={160}
            height={107}
            className="h-10 w-auto rounded object-contain"
            priority
          />
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-bone/70 hover:text-accent transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
