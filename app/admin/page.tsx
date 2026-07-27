import Link from "next/link";
import { integrantes, discografia, publicacoes } from "@/lib/data";

const modulos = [
  {
    titulo: "Músicas",
    descricao: "Repertório, status (ideia → composição → gravação → lançada), letras e comentários.",
    contagem: `${discografia.length} lançadas`,
  },
  {
    titulo: "Ideias",
    descricao: "Riffs, temas e conceitos soltos, com link, nota ou comentário.",
    contagem: "0 registradas",
  },
  {
    titulo: "Publicações",
    descricao: "Fila de conteúdo para o site público — texto, imagem e links.",
    contagem: `${publicacoes.length} publicadas`,
  },
  {
    titulo: "Comunicação",
    descricao: "Mural interno para recados e combinados entre os integrantes.",
    contagem: "—",
  },
  {
    titulo: "Agenda",
    descricao: "Shows, ensaios, reuniões e prazos.",
    contagem: "—",
  },
  {
    titulo: "Arquivos",
    descricao: "Partituras, contratos e material de estúdio.",
    contagem: "—",
  },
];

export default function Admin() {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent">
          Área restrita
        </p>
        <h1 className="mt-1 font-display text-3xl text-bone">
          Hub — Antigo Amanhã
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-bone/60">
          Protótipo do painel administrativo, visível apenas para os
          integrantes. O login real (com autenticação de verdade, ex.:
          Supabase Auth) ainda precisa ser conectado — por enquanto esta
          página serve para validar a estrutura e o layout dos módulos.
        </p>
      </div>

      <div>
        <h2 className="text-sm uppercase tracking-widest text-bone/50">
          Integrantes
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {integrantes.map((i) => (
            <span
              key={i.nome}
              className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-bone/70"
            >
              {i.nome} · {i.funcao}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((m) => (
          <div
            key={m.titulo}
            className="rounded-2xl border border-white/10 p-6"
          >
            <p className="text-lg text-bone">{m.titulo}</p>
            <p className="mt-2 text-sm text-bone/60">{m.descricao}</p>
            <p className="mt-4 text-xs text-accent">{m.contagem}</p>
          </div>
        ))}
      </div>

      <Link href="/" className="inline-block text-sm text-bone/50 hover:text-accent">
        ← Voltar para o site público
      </Link>
    </div>
  );
}
