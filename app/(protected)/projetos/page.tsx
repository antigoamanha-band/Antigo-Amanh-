"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, Project } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export default function Projetos() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [views, setViews] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const [{ data: projs }, { data: viewsData }] = await Promise.all([
        supabase.from("projects").select("*").order("updated_at", { ascending: false }),
        supabase.from("project_views").select("project_id,viewed_at").eq("user_id", session.user.id),
      ]);
      setProjects(projs || []);
      const vm: Record<string,string> = {};
      (viewsData||[]).forEach(v => { vm[v.project_id]=v.viewed_at; });
      setViews(vm); setLoading(false);
    }
    load();
  }, [router]);
  const isNovo = (p: Project) => { const v=views[p.id]; return !v||new Date(p.updated_at)>new Date(v); };
  const tipoLabel: Record<string,string> = { "álbum":"Álbum","música":"Música","ep":"EP","clipe":"Clipe","outro":"Outro" };
  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-bone">Projetos</h1>
        <Link href="/projetos/nova" className="rounded-xl bg-accent/15 border border-accent/30 text-accent px-4 py-2 text-sm hover:bg-accent/25 transition-colors">+ Novo projeto</Link>
      </div>
      {projects.length===0 ? (
        <div className="text-center py-16 text-bone/30"><p className="text-5xl mb-4">&#127925;</p><p className="mb-4">Nenhum projeto ainda.</p><Link href="/projetos/nova" className="text-accent text-sm hover:underline">Criar primeiro projeto</Link></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(p => (
            <Link key={p.id} href={`/projetos/${p.id}`} className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-accent/40 transition-all">
              <div className="relative" style={{paddingBottom:"56.25%"}}>
                <div className="absolute inset-0">
                  {p.cover_url ? <img src={p.cover_url} alt={p.titulo} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{background:"linear-gradient(135deg,#0f0f2a,#1e1040,#09091e)"}} />}
                  <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(9,9,30,0.95) 30%,rgba(9,9,30,0.1) 80%)"}} />
                  {isNovo(p) && <div className="absolute top-3 left-3"><span className="text-[10px] font-medium text-accent bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-2.5 py-1">&#9679; novo</span></div>}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-bone/40 mb-1">{tipoLabel[p.tipo]||p.tipo}</p>
                    <p className="font-medium text-bone text-sm leading-tight line-clamp-2">{p.titulo}</p>
                    {p.descricao && <p className="text-xs text-bone/40 mt-1 line-clamp-1">{p.descricao}</p>}
                    <div className="mt-3"><div className="flex justify-between text-[10px] text-bone/30 mb-1"><span>Progresso</span><span>{p.progresso}%</span></div><div className="h-0.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full rounded-full bg-accent" style={{width:`${p.progresso}%`}} /></div></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
