"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, PublicacaoSite } from "@/lib/supabase";
export const dynamic = "force-dynamic";

export default function Publicacoes() {
  const router = useRouter();
  const [posts, setPosts] = useState<PublicacaoSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [titulo, setTitulo] = useState(""); const [resumo, setResumo] = useState(""); const [conteudo, setConteudo] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitulo, setEditTitulo] = useState(""); const [editResumo, setEditResumo] = useState(""); const [editConteudo, setEditConteudo] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data } = await supabase.from("publicacoes_site").select("*").order("data_pub", { ascending: false });
      setPosts(data || []); setLoading(false);
    }
    load();
  }, [router]);

  async function createPost() {
    if (!titulo.trim()) return; setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { data } = await supabase.from("publicacoes_site").insert({
      titulo: titulo.trim(), resumo: resumo.trim() || null, conteudo: conteudo.trim() || null,
      data_pub: new Date().toISOString().split("T")[0], publicado: true, created_by: session?.user.id
    }).select().single();
    if (data) setPosts(ps => [data, ...ps]);
    setTitulo(""); setResumo(""); setConteudo(""); setCreating(false); setSaving(false);
  }

  function startEdit(p: PublicacaoSite) {
    setEditingId(p.id); setEditTitulo(p.titulo); setEditResumo(p.resumo || ""); setEditConteudo(p.conteudo || "");
  }

  async function saveEdit(id: string) {
    setEditSaving(true);
    await supabase.from("publicacoes_site").update({
      titulo: editTitulo.trim(), resumo: editResumo.trim() || null, conteudo: editConteudo.trim() || null,
      updated_at: new Date().toISOString()
    }).eq("id", id);
    setPosts(ps => ps.map(p => p.id === id ? { ...p, titulo: editTitulo.trim(), resumo: editResumo.trim() || null, conteudo: editConteudo.trim() || null } : p));
    setEditingId(null); setEditSaving(false);
  }

  async function uploadCover(postId: string, file: File) {
    setUploadingId(postId);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `publicacoes/${postId}.${ext}`;
    const { error } = await supabase.storage.from("covers").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(path);
      await supabase.from("publicacoes_site").update({ cover_url: publicUrl }).eq("id", postId);
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, cover_url: publicUrl } : p));
    }
    setUploadingId(null);
  }

  async function togglePublicado(id: string, pub: boolean) {
    await supabase.from("publicacoes_site").update({ publicado: !pub }).eq("id", id);
    setPosts(ps => ps.map(p => p.id === id ? { ...p, publicado: !pub } : p));
  }

  async function deletePost(id: string) {
    if (!confirm("Excluir este post?")) return;
    await supabase.from("publicacoes_site").delete().eq("id", id);
    setPosts(ps => ps.filter(p => p.id !== id));
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl text-bone">Publicações</h1><p className="text-bone/40 text-sm mt-1">{posts.length} publicação{posts.length !== 1 ? "ões" : ""} no site</p></div>
        <button onClick={() => { setCreating(v => !v); setEditingId(null); }} className="rounded-xl bg-accent/15 border border-accent/30 text-accent px-4 py-2 text-sm hover:bg-accent/25 transition-colors">{creating ? "Cancelar" : "+ Nova"}</button>
      </div>

      {creating && (
        <div className="rounded-2xl border border-accent/20 bg-accent/3 p-5 space-y-4">
          <p className="text-xs uppercase tracking-widest text-accent font-medium">Nova publicação</p>
          <div className="space-y-1"><label className="text-xs text-bone/50">Título *</label><input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título da notícia" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50" /></div>
          <div className="space-y-1"><label className="text-xs text-bone/50">Resumo</label><textarea value={resumo} onChange={e => setResumo(e.target.value)} rows={2} placeholder="Breve descrição exibida no card do site..." className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50 resize-none" /></div>
          <div className="space-y-1"><label className="text-xs text-bone/50">Conteúdo completo (opcional)</label><textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={6} placeholder="Texto completo da notícia..." className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50 resize-none" /></div>
          <button onClick={createPost} disabled={saving || !titulo.trim()} className="rounded-xl bg-accent py-2.5 px-6 text-sm font-medium text-bone hover:bg-accent/90 disabled:opacity-50">{saving ? "Publicando..." : "Publicar no site →"}</button>
        </div>
      )}

      <div className="space-y-3">
        {posts.length === 0 && <p className="text-center text-bone/20 py-8 text-sm">Nenhuma publicação ainda.</p>}
        {posts.map(p => (
          <div key={p.id} className="rounded-2xl border border-white/10 overflow-hidden">
            {editingId !== p.id ? (
              <div className="flex gap-0">
                <div className="relative w-28 sm:w-36 flex-shrink-0" style={{ minHeight: "90px" }}>
                  {p.cover_url ? (
                    <img src={p.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(232,72,32,0.06)" }}>
                      <span className="text-accent/20 text-3xl">&#128248;</span>
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 hover:opacity-100 cursor-pointer transition-opacity bg-black/40">
                    <span className="text-[10px] text-bone/80 bg-black/70 px-2 py-0.5 rounded">{uploadingId === p.id ? "..." : "Trocar"}</span>
                    <input type="file" accept="image/*" className="hidden" ref={el => { fileRefs.current[p.id] = el; }} onChange={e => { if (e.target.files?.[0]) uploadCover(p.id, e.target.files[0]); }} />
                  </label>
                </div>
                <div className="flex-1 px-4 py-3 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="font-medium text-bone text-sm leading-snug">{p.titulo}</p>
                    {p.resumo && <p className="text-bone/40 text-xs mt-1 line-clamp-2">{p.resumo}</p>}
                    <p className="text-bone/20 text-[10px] mt-2">{p.data_pub}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => togglePublicado(p.id, p.publicado)} className={`text-[10px] rounded-full px-2.5 py-1 ${p.publicado ? "bg-accent/15 text-accent border border-accent/20" : "bg-white/5 text-bone/30 border border-white/10"}`}>{p.publicado ? "Publicado" : "Rascunho"}</button>
                    <button onClick={() => startEdit(p)} className="text-xs text-bone/30 hover:text-bone transition-colors">Editar</button>
                    <button onClick={() => deletePost(p.id)} className="text-xs text-bone/20 hover:text-red-400 transition-colors ml-auto">&#215;</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-accent font-medium">Editando</p>
                  <button onClick={() => setEditingId(null)} className="text-xs text-bone/30 hover:text-bone">Cancelar</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 relative" style={{ background: "rgba(232,72,32,0.06)" }}>
                    {p.cover_url && <img src={p.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                  </div>
                  <label className="cursor-pointer text-xs text-accent hover:text-accent/70 transition-colors">
                    {uploadingId === p.id ? "Enviando..." : p.cover_url ? "Trocar imagem" : "+ Adicionar imagem"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadCover(p.id, e.target.files[0]); }} />
                  </label>
                </div>
                <div className="space-y-1"><label className="text-xs text-bone/50">Título</label><input value={editTitulo} onChange={e => setEditTitulo(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50" /></div>
                <div className="space-y-1"><label className="text-xs text-bone/50">Resumo</label><textarea value={editResumo} onChange={e => setEditResumo(e.target.value)} rows={2} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50 resize-none" /></div>
                <div className="space-y-1"><label className="text-xs text-bone/50">Conteúdo completo</label><textarea value={editConteudo} onChange={e => setEditConteudo(e.target.value)} rows={8} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50 resize-none" /></div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(p.id)} disabled={editSaving || !editTitulo.trim()} className="rounded-xl bg-accent/20 border border-accent/30 text-accent px-4 py-2 text-sm hover:bg-accent/30 disabled:opacity-50">{editSaving ? "Salvando..." : "Salvar alterações"}</button>
                  <button onClick={() => setEditingId(null)} className="rounded-xl bg-white/5 text-bone/50 px-4 py-2 text-sm hover:bg-white/10">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
