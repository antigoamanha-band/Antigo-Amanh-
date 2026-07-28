"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export default function NovoProject() {
  const router = useRouter();
  const [titulo, setTitulo] = useState(""); const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"música"|"álbum"|"ep"|"clipe"|"outro">("outro");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function criar() {
    if (!titulo.trim()) { setError("Título obrigatório"); return; }
    setLoading(true); setError("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    const { data, error: err } = await supabase.from("projects").insert({ titulo: titulo.trim(), descricao: descricao.trim()||null, tipo, progresso: progress, created_by: session.user.id, updated_at: new Date().toISOString() }).select().single();
    if (err||!data) { setError("Erro: "+(err?.message||"desconhecido")); setLoading(false); return; }
    router.push(`/projetos/${data.id}`);
  }
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4"><button onClick={()=>router.back()} className="text-bone/40 hover:text-bone text-sm">&#8592; Voltar</button><h1 className="font-display text-2xl text-bone">Novo Projeto</h1></div>
      <div className="space-y-4 rounded-2xl border border-white/10 p-6">
        <div className="space-y-1"><label className="text-xs text-bone/50 font-medium">Tipo</label><select value={tipo} onChange={e=>setTipo(e.target.value as typeof tipo)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-bone focus:outline-none focus:border-accent/50"><option value="álbum">Álbum</option><option value="ep">EP</option><option value="música">Música / Single</option><option value="clipe">Clipe</option><option value="outro">Outro</option></select></div>
        <div className="space-y-1"><label className="text-xs text-bone/50 font-medium">Título</label><input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Nome do projeto" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-bone placeholder-bone/30 focus:outline-none focus:border-accent/50" /></div>
        <div className="space-y-1"><label className="text-xs text-bone/50 font-medium">Descrição (opcional)</label><textarea value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder="Sobre o projeto..." rows={3} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-bone placeholder-bone/30 focus:outline-none focus:border-accent/50 resize-none" /></div>
        <div className="space-y-2"><label className="text-xs text-bone/50 font-medium">Progresso — {progress}%</label><input type="range" min={0} max={100} value={progress} onChange={e=>setProgress(+e.target.value)} className="w-full accent-[#e84820]" /></div>
        {error && <p className="text-accent text-sm">{error}</p>}
        <button onClick={criar} disabled={loading} className="w-full rounded-xl bg-accent py-3 text-sm font-medium text-bone hover:bg-accent/90 transition-colors disabled:opacity-50">{loading?"Criando...":"Criar projeto →"}</button>
      </div>
    </div>
  );
}
