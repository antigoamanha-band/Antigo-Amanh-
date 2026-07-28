"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, ProjectItem, ItemBlock, ProjectTask, ProjectComment, Profile } from "@/lib/supabase";
export const dynamic = "force-dynamic";

const BLOCK_TYPES = {
  letra: { label: "Letra", icon: "♪", hint: "Cole ou escreva a letra aqui.", isText: true },
  guia:  { label: "Guia / Cifra", icon: "♫", hint: "Link para tablatura ou cifra.", isText: false },
  ideia: { label: "Ideia", icon: "•", hint: "Anote uma ideia para essa música.", isText: true },
  link:  { label: "Link", icon: "↗", hint: "Qualquer referência externa.", isText: false },
} as const;
type BlockTipo = keyof typeof BLOCK_TYPES;
type CommentWithProfile = ProjectComment & { profiles?: { nome: string; avatar_url: string | null } };

function renderMention(text: string, profiles: Profile[]) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const name = part.slice(1).toLowerCase();
      const match = profiles.find(p => p.nome.toLowerCase() === name || p.nome.toLowerCase().startsWith(name));
      if (match) return <span key={i} className="text-accent font-semibold">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ItemDetail() {
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const router = useRouter();
  const [item, setItem] = useState<ProjectItem | null>(null);
  const [blocks, setBlocks] = useState<ItemBlock[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitulo, setEditTitulo] = useState(""); const [editDescricao, setEditDescricao] = useState(""); const [editTipo, setEditTipo] = useState("música"); const [saving, setSaving] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [blockEdits, setBlockEdits] = useState<Record<string, { titulo: string; conteudo: string; url: string }>>({});
  const [newTask, setNewTask] = useState(""); const [addingTask, setAddingTask] = useState(false);
  const [newComment, setNewComment] = useState(""); const [addingComment, setAddingComment] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id || !itemId) return;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const [{ data: itemData, error: itemErr }, { data: blockData }, { data: taskData }, { data: commentData }, { data: profileData }, { data: allProfilesData }] = await Promise.all([
        supabase.from("project_items").select("*").eq("id", itemId).single(),
        supabase.from("item_blocks").select("*").eq("item_id", itemId).order("ordem"),
        supabase.from("project_tasks").select("*").eq("item_id", itemId).order("ordem"),
        supabase.from("project_comments").select("*, profiles!author_id(nome,avatar_url)").eq("item_id", itemId).order("created_at"),
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("profiles").select("*").order("nome"),
      ]);
      if (itemErr || !itemData) { setNotFound(true); setLoading(false); return; }
      setItem(itemData); setEditTitulo(itemData.titulo); setEditDescricao(itemData.descricao || ""); setEditTipo(itemData.tipo);
      setBlocks(blockData || []); setTasks(taskData || []); setComments((commentData || []) as CommentWithProfile[]);
      setCurrentUser(profileData || null); setAllProfiles(allProfilesData || []);
      setLoading(false);
    }
    load();
  }, [id, itemId, router]);

  async function saveItem() { if (!item) return; setSaving(true); await supabase.from("project_items").update({ titulo: editTitulo.trim(), descricao: editDescricao.trim() || null, tipo: editTipo, updated_at: new Date().toISOString() }).eq("id", item.id); setItem(i => i ? { ...i, titulo: editTitulo.trim(), descricao: editDescricao.trim() || null, tipo: editTipo } : i); setEditing(false); setSaving(false); }
  async function uploadCover(file: File) { setUploadingCover(true); const ext = file.name.split(".").pop() || "jpg"; const path = `items/${itemId}.${ext}`; const { error } = await supabase.storage.from("covers").upload(path, file, { upsert: true }); if (!error) { const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(path); await supabase.from("project_items").update({ cover_url: publicUrl, updated_at: new Date().toISOString() }).eq("id", itemId); setItem(i => i ? { ...i, cover_url: publicUrl } : i); } setUploadingCover(false); }
  async function addBlock(tipo: BlockTipo) { if (!currentUser) return; const { data } = await supabase.from("item_blocks").insert({ item_id: itemId, tipo, titulo: BLOCK_TYPES[tipo].label, conteudo: null, url: null, ordem: blocks.length, created_by: currentUser.id }).select().single(); if (data) { setBlocks(b => [...b, data]); setEditingBlock(data.id); setBlockEdits(e => ({ ...e, [data.id]: { titulo: BLOCK_TYPES[tipo].label, conteudo: "", url: "" } })); } }
  async function saveBlock(blockId: string) { const edits = blockEdits[blockId]; if (!edits) return; const update = { titulo: edits.titulo.trim() || blocks.find(b=>b.id===blockId)?.tipo || "", conteudo: edits.conteudo.trim() || null, url: edits.url.trim() || null, updated_at: new Date().toISOString() }; await supabase.from("item_blocks").update(update).eq("id", blockId); setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, ...update } : b)); setEditingBlock(null); }
  async function deleteBlock(blockId: string) { await supabase.from("item_blocks").delete().eq("id", blockId); setBlocks(bs => bs.filter(b => b.id !== blockId)); if (editingBlock === blockId) setEditingBlock(null); }
  async function addTask() { if (!newTask.trim() || !currentUser || !item) return; setAddingTask(true); const { data } = await supabase.from("project_tasks").insert({ project_id: item.project_id, item_id: itemId, content: newTask.trim(), done: false, ordem: tasks.length, created_by: currentUser.id }).select().single(); if (data) setTasks(t => [...t, data]); setNewTask(""); setAddingTask(false); }
  async function toggleTask(taskId: string, done: boolean) { await supabase.from("project_tasks").update({ done: !done }).eq("id", taskId); setTasks(ts => ts.map(t => t.id === taskId ? { ...t, done: !done } : t)); }
  async function deleteTask(taskId: string) { await supabase.from("project_tasks").delete().eq("id", taskId); setTasks(ts => ts.filter(t => t.id !== taskId)); }
  function handleCommentInput(val: string) { setNewComment(val); const m = val.match(/@(\w*)$/); setMentionQuery(m ? m[1].toLowerCase() : null); }
  function insertMention(nome: string) { setNewComment(c => c.replace(/@\w*$/, `@${nome} `)); setMentionQuery(null); }
  const filteredMentions = mentionQuery !== null ? allProfiles.filter(p => p.nome.toLowerCase().includes(mentionQuery) && p.id !== currentUser?.id) : [];
  async function addComment() {
    if (!newComment.trim() || !currentUser || !item) return;
    setAddingComment(true);
    const { data } = await supabase.from("project_comments").insert({ project_id: item.project_id, item_id: itemId, author_id: currentUser.id, content: newComment.trim() }).select().single();
    if (data) {
      setComments(c => [...c, { ...data, profiles: { nome: currentUser.nome, avatar_url: currentUser.avatar_url } }]);
      const ms = newComment.match(/@(\w+)/g) || [];
      for (const m of ms) {
        const name = m.slice(1).toLowerCase();
        const prof = allProfiles.find(p => p.nome.toLowerCase() === name || p.nome.toLowerCase().startsWith(name));
        if (prof && prof.id !== currentUser.id) {
          await supabase.from("notifications").insert({ user_id: prof.id, tipo: "mention", titulo: `${currentUser.nome} te marcou`, corpo: newComment.trim().slice(0, 100), project_id: item.project_id, comment_id: data.id });
        }
      }
    }
    setNewComment(""); setMentionQuery(null); setAddingComment(false);
  }
  async function deleteComment(commentId: string) { await supabase.from("project_comments").delete().eq("id", commentId); setComments(c => c.filter(x => x.id !== commentId)); }

  const isAdmin = currentUser?.role === "admin" || currentUser?.is_owner;
  const doneCount = tasks.filter(t => t.done).length;
  const tipoLabel: Record<string, string> = { "música": "Música", "demo": "Demo", "álbum": "Álbum", "outro": "Outro" };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  if (notFound || !item) return <div className="text-center py-20"><p className="text-bone/40">Item não encontrado.</p><button onClick={() => router.push(`/projetos/${id}`)} className="mt-4 text-accent text-sm hover:underline">Voltar</button></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button onClick={() => router.push(`/projetos/${id}`)} className="text-bone/40 hover:text-bone text-sm">&#8592; Projeto</button>
      <div className="relative rounded-2xl overflow-hidden" style={{ paddingBottom: "38%" }}>
        <div className="absolute inset-0">
          {item.cover_url ? <img src={item.cover_url} alt={item.titulo} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#0f0f2a,#1e1040,#09091e)" }} />}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(9,9,30,0.85) 20%,transparent 70%)" }} />
          <div className="absolute bottom-4 left-4"><p className="text-[10px] uppercase tracking-widest text-accent mb-1">{tipoLabel[item.tipo] || item.tipo}</p><h1 className="font-display text-2xl text-bone">{item.titulo}</h1></div>
          <label className={`absolute top-3 right-3 cursor-pointer flex items-center gap-1.5 text-xs rounded-lg px-3 py-2 bg-black/60 backdrop-blur-sm border border-white/10 text-bone/60 hover:text-bone transition-colors ${uploadingCover ? "opacity-50 pointer-events-none" : ""}`}>{uploadingCover ? "Enviando..." : item.cover_url ? "↑ Trocar" : "↑ Capa"}<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadCover(e.target.files[0]); }} /></label>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 p-5 space-y-4">
        {editing ? (<>
          <div className="space-y-1"><label className="text-xs text-bone/50">Título</label><input value={editTitulo} onChange={e => setEditTitulo(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50" /></div>
          <div className="space-y-1"><label className="text-xs text-bone/50">Tipo</label><select value={editTipo} onChange={e => setEditTipo(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50"><option value="música">Música</option><option value="demo">Demo</option><option value="álbum">Álbum</option><option value="outro">Outro</option></select></div>
          <div className="space-y-1"><label className="text-xs text-bone/50">Descrição</label><textarea value={editDescricao} onChange={e => setEditDescricao(e.target.value)} rows={3} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50 resize-none" /></div>
          <div className="flex gap-2"><button onClick={saveItem} disabled={saving} className="rounded-xl bg-accent/20 border border-accent/30 text-accent px-4 py-2 text-sm hover:bg-accent/30 disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button><button onClick={() => setEditing(false)} className="rounded-xl bg-white/5 text-bone/50 px-4 py-2 text-sm hover:bg-white/10">Cancelar</button></div>
        </>) : (
          <div className="flex items-start justify-between"><p className="text-bone/60 text-sm flex-1">{item.descricao || <span className="italic text-bone/20">Sem descrição.</span>}</p><button onClick={() => setEditing(true)} className="text-xs text-bone/30 hover:text-bone/60 ml-4">Editar</button></div>
        )}
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-bone/60 uppercase tracking-widest">Conteúdo</h2>
        <div className="flex flex-wrap gap-2">{(Object.keys(BLOCK_TYPES) as BlockTipo[]).map(tipo => (<button key={tipo} onClick={() => addBlock(tipo)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-bone/50 hover:text-bone hover:border-accent/30 transition-colors"><span className="text-sm">{BLOCK_TYPES[tipo].icon}</span> + {BLOCK_TYPES[tipo].label}</button>))}</div>
        {blocks.length === 0 && <p className="text-xs text-bone/20 text-center py-4">Nenhum conteúdo. Adicione letra, guia, ideia ou link.</p>}
        {blocks.map(block => {
          const cfg = BLOCK_TYPES[block.tipo as BlockTipo] || { label: block.tipo, icon: "•", hint: "", isText: true };
          const isEditingThis = editingBlock === block.id;
          const edits = blockEdits[block.id] || { titulo: block.titulo, conteudo: block.conteudo || "", url: block.url || "" };
          return (
            <div key={block.id} className="rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-white/2 border-b border-white/5">
                <div className="flex items-center gap-2"><span className="text-bone/40 text-sm">{cfg.icon}</span>{isEditingThis ? <input value={edits.titulo} onChange={e => setBlockEdits(be => ({ ...be, [block.id]: { ...edits, titulo: e.target.value } }))} className="text-xs font-medium text-bone bg-transparent border-b border-accent/40 focus:outline-none w-36 px-1" /> : <span className="text-xs font-medium text-bone/60">{block.titulo}</span>}</div>
                <div className="flex items-center gap-3">{isEditingThis ? (<><button onClick={() => saveBlock(block.id)} className="text-xs text-accent">Salvar</button><button onClick={() => setEditingBlock(null)} className="text-xs text-bone/30">Cancelar</button></>) : (<><button onClick={() => { setEditingBlock(block.id); setBlockEdits(be => ({ ...be, [block.id]: { titulo: block.titulo, conteudo: block.conteudo || "", url: block.url || "" } })); }} className="text-xs text-bone/30 hover:text-bone/60">Editar</button><button onClick={() => deleteBlock(block.id)} className="text-xs text-bone/20 hover:text-red-400">&#215;</button></>)}</div>
              </div>
              <div className="p-4">
                {isEditingThis ? (<div className="space-y-2"><p className="text-[10px] text-bone/25">{cfg.hint}</p>{cfg.isText ? <textarea value={edits.conteudo} onChange={e => setBlockEdits(be => ({ ...be, [block.id]: { ...edits, conteudo: e.target.value } }))} rows={block.tipo === "letra" ? 14 : 4} placeholder={block.tipo === "letra" ? "Cole a letra aqui..." : "Anote sua ideia..."} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/50 resize-y font-mono" /> : <><input value={edits.url} onChange={e => setBlockEdits(be => ({ ...be, [block.id]: { ...edits, url: e.target.value } }))} placeholder="https://..." className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/50 mb-2" /><textarea value={edits.conteudo} onChange={e => setBlockEdits(be => ({ ...be, [block.id]: { ...edits, conteudo: e.target.value } }))} rows={2} placeholder="Descrição..." className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/50 resize-none" /></>}</div>) : (cfg.isText ? (block.conteudo ? <pre className="text-bone/70 text-sm whitespace-pre-wrap leading-relaxed font-sans">{block.conteudo}</pre> : <p className="text-bone/20 text-xs italic">{cfg.hint}</p>) : (block.url ? <div className="space-y-1"><a href={block.url} target="_blank" rel="noreferrer" className="text-accent text-sm hover:underline break-all">{block.url}</a>{block.conteudo && <p className="text-bone/40 text-xs mt-1">{block.conteudo}</p>}</div> : <p className="text-bone/20 text-xs italic">{cfg.hint}</p>))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between"><div><h2 className="text-sm font-medium text-bone">Tarefas</h2>{tasks.length > 0 && <p className="text-xs text-bone/30 mt-0.5">{doneCount} de {tasks.length} concluídas</p>}</div>{tasks.length > 0 && <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${tasks.length ? doneCount / tasks.length * 100 : 0}%` }} /></div>}</div>
        <div className="space-y-1">{tasks.map(t => (<div key={t.id} className="group flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/3 transition-colors"><button onClick={() => toggleTask(t.id, t.done)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${t.done ? "bg-accent border-accent" : "border-white/20 hover:border-accent/50"}`}>{t.done && <span className="text-bone text-[10px] font-bold">&#10003;</span>}</button><span className={`flex-1 text-sm ${t.done ? "line-through text-bone/25" : "text-bone/80"}`}>{t.content}</span><button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-bone/20 hover:text-accent text-xs">&#215;</button></div>))}{tasks.length === 0 && <p className="text-xs text-bone/20 text-center py-2">Nenhuma tarefa.</p>}</div>
        <div className="flex gap-2"><input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} placeholder="Nova tarefa..." className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm placeholder-bone/20 focus:outline-none focus:border-accent/50" /><button onClick={addTask} disabled={addingTask || !newTask.trim()} className="rounded-xl bg-accent/20 border border-accent/30 text-accent px-3 py-2 text-sm hover:bg-accent/30 disabled:opacity-30">+</button></div>
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-bone/60 uppercase tracking-widest">Comentários</h2>
        <div className="relative">
          <div className="flex gap-2"><input value={newComment} onChange={e => handleCommentInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && addComment()} placeholder="Nota ou @mention..." className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm placeholder-bone/20 focus:outline-none focus:border-accent/50" /><button onClick={addComment} disabled={addingComment || !newComment.trim()} className="rounded-xl bg-accent/20 text-accent px-4 py-2 text-xs hover:bg-accent/30 disabled:opacity-30">Publicar</button></div>
          {filteredMentions.length > 0 && (<div className="absolute top-full left-0 mt-1 bg-ink border border-white/15 rounded-xl overflow-hidden shadow-xl z-10 min-w-[160px]">{filteredMentions.map(p => (<button key={p.id} onClick={() => insertMention(p.nome)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-bone hover:bg-white/8 transition-colors text-left"><div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent font-medium">{p.nome[0].toUpperCase()}</div>{p.nome}</button>))}</div>)}
        </div>
        <div className="space-y-3">{comments.map(c => (<div key={c.id} className="group flex gap-3"><div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs text-accent font-medium">{(c.profiles?.nome || "?")[0].toUpperCase()}</div><div className="flex-1"><div className="flex items-baseline gap-2"><span className="text-xs font-medium text-bone/70">{c.profiles?.nome || "Membro"}</span><span className="text-[10px] text-bone/20">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span></div><p className="text-sm text-bone/60 mt-0.5">{renderMention(c.content, allProfiles)}</p></div>{(currentUser?.id === c.author_id || isAdmin) && <button onClick={() => deleteComment(c.id)} className="opacity-0 group-hover:opacity-100 text-xs text-bone/20 hover:text-accent self-start mt-0.5">&#215;</button>}</div>))}{comments.length === 0 && <p className="text-xs text-bone/20 text-center py-3">Sem comentários.</p>}</div>
      </div>
    </div>
  );
}
