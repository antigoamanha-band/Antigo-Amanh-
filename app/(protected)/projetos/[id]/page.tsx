"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase, Project, ProjectItem, ProjectLink, ProjectTask, ProjectComment, Profile } from "@/lib/supabase";
export const dynamic = "force-dynamic";

const LINK_TIPOS: Record<string,{label:string;bg:string;color:string;border:string}> = {
  guia:       { label:"Guia",       bg:"rgba(59,130,246,0.12)",  color:"#93c5fd",              border:"rgba(59,130,246,0.25)" },
  letra:      { label:"Letra",      bg:"rgba(168,85,247,0.12)",  color:"#c4b5fd",              border:"rgba(168,85,247,0.25)" },
  referencia: { label:"Referência", bg:"rgba(255,255,255,0.05)", color:"rgba(240,237,232,0.45)",border:"rgba(255,255,255,0.12)" },
  demo:       { label:"Demo",       bg:"rgba(249,115,22,0.12)",  color:"#fdba74",              border:"rgba(249,115,22,0.25)" },
  clipe:      { label:"Clipe",      bg:"rgba(232,72,32,0.12)",   color:"#e84820",              border:"rgba(232,72,32,0.25)" },
  spotify:    { label:"Spotify",    bg:"rgba(34,197,94,0.12)",   color:"#86efac",              border:"rgba(34,197,94,0.25)" },
  youtube:    { label:"YouTube",    bg:"rgba(239,68,68,0.12)",   color:"#fca5a5",              border:"rgba(239,68,68,0.25)" },
  artigo:     { label:"Artigo",     bg:"rgba(6,182,212,0.12)",   color:"#67e8f9",              border:"rgba(6,182,212,0.25)" },
  link:       { label:"Link",       bg:"rgba(255,255,255,0.04)", color:"rgba(240,237,232,0.25)",border:"rgba(255,255,255,0.08)" },
};

function LinkBadge({ tipo }: { tipo: string }) {
  const cfg = LINK_TIPOS[tipo] || LINK_TIPOS.link;
  return <span className="text-[10px] font-medium rounded-full px-2 py-0.5 border flex-shrink-0" style={{ background:cfg.bg, color:cfg.color, borderColor:cfg.border }}>{cfg.label}</span>;
}

function getDomain(url: string) { try { return new URL(url).hostname.replace("www.",""); } catch { return url; } }
function getYtThumb(url: string) { const m=url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/); return m?`https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`:null; }
function Field({label,children}:{label:string;children:React.ReactNode}) {
  return <div><span className="block text-xs font-medium text-bone/60 mb-1">{label}</span>{children}</div>;
}
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

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitulo, setEditTitulo] = useState(""); const [editDescricao, setEditDescricao] = useState(""); const [editTipo, setEditTipo] = useState<Project["tipo"]>("outro"); const [progress, setProgress] = useState(0); const [saving, setSaving] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLabel, setNewLabel] = useState(""); const [newUrl, setNewUrl] = useState(""); const [newDesc, setNewDesc] = useState(""); const [newThumb, setNewThumb] = useState(""); const [newTipo, setNewTipo] = useState("link"); const [addingLink, setAddingLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkLabel, setEditLinkLabel] = useState(""); const [editLinkUrl, setEditLinkUrl] = useState(""); const [editLinkDesc, setEditLinkDesc] = useState(""); const [editLinkThumb, setEditLinkThumb] = useState(""); const [editLinkTipo, setEditLinkTipo] = useState("link"); const [savingLink, setSavingLink] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemTitulo, setNewItemTitulo] = useState(""); const [newItemTipo, setNewItemTipo] = useState("música"); const [newItemDesc, setNewItemDesc] = useState(""); const [addingItem, setAddingItem] = useState(false);
  const [newTask, setNewTask] = useState(""); const [addingTask, setAddingTask] = useState(false);
  const [newComment, setNewComment] = useState(""); const [addingComment, setAddingComment] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      supabase.from("project_views").upsert({ project_id:id, user_id:session.user.id, viewed_at:new Date().toISOString() },{onConflict:"project_id,user_id"}).then(({error})=>{ if(error) console.error("view:",error); });
      const [{ data:proj, error:projErr }, { data:itemData }, { data:linkData }, { data:taskData }, { data:commentData }, { data:profileData }, { data:allProfilesData }] = await Promise.all([
        supabase.from("projects").select("*").eq("id",id).single(),
        supabase.from("project_items").select("*").eq("project_id",id).order("ordem"),
        supabase.from("project_links").select("*").eq("project_id",id).order("created_at"),
        supabase.from("project_tasks").select("*").eq("project_id",id).is("item_id",null).order("ordem"),
        supabase.from("project_comments").select("*, profiles!author_id(nome,avatar_url)").eq("project_id",id).is("item_id",null).order("created_at"),
        supabase.from("profiles").select("*").eq("id",session.user.id).single(),
        supabase.from("profiles").select("*").order("nome"),
      ]);
      if (projErr||!proj) { setNotFound(true); setLoading(false); return; }
      setProject(proj); setEditTitulo(proj.titulo); setEditDescricao(proj.descricao||""); setEditTipo(proj.tipo); setProgress(proj.progresso);
      setItems(itemData||[]); setLinks(linkData||[]); setTasks(taskData||[]); setComments((commentData||[]) as CommentWithProfile[]); setCurrentUser(profileData||null); setAllProfiles(allProfilesData||[]);
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function saveProject() { if (!project) return; setSaving(true); await supabase.from("projects").update({ titulo:editTitulo.trim(), descricao:editDescricao.trim()||null, tipo:editTipo, progresso:progress, updated_at:new Date().toISOString() }).eq("id",project.id); setProject(p=>p?{...p,titulo:editTitulo.trim(),descricao:editDescricao.trim()||null,tipo:editTipo,progresso:progress}:p); setEditing(false); setSaving(false); }
  async function deleteProject() { if (!project||!confirm("Excluir este projeto?")) return; const { error } = await supabase.from("projects").delete().eq("id",project.id); if (error) { alert("Erro: "+error.message); return; } router.push("/projetos"); }
  async function uploadCover(file: File) { setUploadingCover(true); const ext=file.name.split(".").pop()||"jpg"; const path=`${id}.${ext}`; const { error }=await supabase.storage.from("covers").upload(path,file,{upsert:true}); if (!error) { const { data:{publicUrl} }=supabase.storage.from("covers").getPublicUrl(path); await supabase.from("projects").update({cover_url:publicUrl,updated_at:new Date().toISOString()}).eq("id",id); setProject(p=>p?{...p,cover_url:publicUrl}:p); } setUploadingCover(false); }
  async function addItem() { if (!newItemTitulo.trim()) return; setAddingItem(true); const { data: { session } } = await supabase.auth.getSession(); const { data } = await supabase.from("project_items").insert({ project_id:id, titulo:newItemTitulo.trim(), descricao:newItemDesc.trim()||null, tipo:newItemTipo, ordem:items.length, created_by:session?.user.id, updated_at:new Date().toISOString() }).select().single(); if (data) setItems(i=>[...i,data]); setNewItemTitulo(""); setNewItemDesc(""); setShowAddItem(false); setAddingItem(false); }
  async function deleteItem(itemId: string) { if (!confirm("Excluir esta faixa?")) return; await supabase.from("project_items").delete().eq("id",itemId); setItems(i=>i.filter(x=>x.id!==itemId)); }
  async function addLink() { if (!newLabel.trim()||!newUrl.trim()) return; setAddingLink(true); const { data }=await supabase.from("project_links").insert({ project_id:id, label:newLabel.trim(), url:newUrl.trim(), descricao:newDesc.trim()||null, thumb_url:newThumb.trim()||null, tipo:newTipo }).select().single(); if (data) setLinks(l=>[...l,data]); setNewLabel(""); setNewUrl(""); setNewDesc(""); setNewThumb(""); setNewTipo("link"); setShowAddLink(false); setAddingLink(false); }
  function startEditLink(l: ProjectLink) { setEditingLinkId(l.id); setEditLinkLabel(l.label); setEditLinkUrl(l.url); setEditLinkDesc(l.descricao||""); setEditLinkThumb(l.thumb_url||""); setEditLinkTipo(l.tipo||"link"); setShowAddLink(false); }
  async function saveLink(linkId: string) { setSavingLink(true); const update={label:editLinkLabel.trim(),url:editLinkUrl.trim(),descricao:editLinkDesc.trim()||null,thumb_url:editLinkThumb.trim()||null,tipo:editLinkTipo}; await supabase.from("project_links").update(update).eq("id",linkId); setLinks(ls=>ls.map(l=>l.id===linkId?{...l,...update}:l)); setEditingLinkId(null); setSavingLink(false); }
  async function deleteLink(linkId: string) { await supabase.from("project_links").delete().eq("id",linkId); setLinks(l=>l.filter(x=>x.id!==linkId)); if (editingLinkId===linkId) setEditingLinkId(null); }
  function handleNewUrlChange(val: string) { setNewUrl(val); if (!newThumb) { const yt=getYtThumb(val); if(yt) setNewThumb(yt); } }
  function handleEditUrlChange(val: string) { setEditLinkUrl(val); if (!editLinkThumb) { const yt=getYtThumb(val); if(yt) setEditLinkThumb(yt); } }
  async function addTask() { if (!newTask.trim()||!currentUser) return; setAddingTask(true); const { data }=await supabase.from("project_tasks").insert({ project_id:id, item_id:null, content:newTask.trim(), done:false, ordem:tasks.length, created_by:currentUser.id }).select().single(); if (data) setTasks(t=>[...t,data]); setNewTask(""); setAddingTask(false); }
  async function toggleTask(taskId: string, done: boolean) { await supabase.from("project_tasks").update({done:!done}).eq("id",taskId); setTasks(ts=>ts.map(t=>t.id===taskId?{...t,done:!done}:t)); }
  async function deleteTask(taskId: string) { await supabase.from("project_tasks").delete().eq("id",taskId); setTasks(ts=>ts.filter(t=>t.id!==taskId)); }
  function handleCommentInput(val: string) { setNewComment(val); const m = val.match(/@(\w*)$/); setMentionQuery(m ? m[1].toLowerCase() : null); }
  function insertMention(nome: string) { setNewComment(c => c.replace(/@\w*$/, `@${nome} `)); setMentionQuery(null); }
  const filteredMentions = mentionQuery !== null ? allProfiles.filter(p => p.nome.toLowerCase().includes(mentionQuery) && p.id !== currentUser?.id) : [];
  async function addComment() {
    if (!newComment.trim()||!currentUser) return;
    setAddingComment(true);
    const { data }=await supabase.from("project_comments").insert({ project_id:id, item_id:null, author_id:currentUser.id, content:newComment.trim() }).select().single();
    if (data) {
      setComments(c=>[...c,{...data,profiles:{nome:currentUser.nome,avatar_url:currentUser.avatar_url}}]);
      const ms = newComment.match(/@(\w+)/g) || [];
      for (const m of ms) {
        const name = m.slice(1).toLowerCase();
        const prof = allProfiles.find(p => p.nome.toLowerCase() === name || p.nome.toLowerCase().startsWith(name));
        if (prof && prof.id !== currentUser.id) {
          await supabase.from("notifications").insert({ user_id:prof.id, tipo:"mention", titulo:`${currentUser.nome} te marcou`, corpo:newComment.trim().slice(0,100), project_id:id, comment_id:data.id });
        }
      }
    }
    setNewComment(""); setMentionQuery(null); setAddingComment(false);
  }
  async function deleteComment(commentId: string) { await supabase.from("project_comments").delete().eq("id",commentId); setComments(c=>c.filter(x=>x.id!==commentId)); }

  const tipoLabel: Record<string,string> = { "álbum":"Álbum","música":"Música","ep":"EP","clipe":"Clipe","outro":"Outro","demo":"Demo" };
  const isAdmin = currentUser?.role==="admin"||currentUser?.is_owner;
  const doneCount = tasks.filter(t=>t.done).length;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  if (notFound||!project) return <div className="text-center py-20"><p className="text-bone/40">Projeto não encontrado.</p><button onClick={()=>router.push("/projetos")} className="mt-4 text-accent text-sm hover:underline">Voltar</button></div>;

  const tipoSelectOpts = [{v:"álbum",l:"Álbum"},{v:"ep",l:"EP"},{v:"música",l:"Música / Single"},{v:"clipe",l:"Clipe"},{v:"outro",l:"Outro"}];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button onClick={()=>router.push("/projetos")} className="text-bone/40 hover:text-bone text-sm">&#8592; Projetos</button>
      <div className="relative rounded-2xl overflow-hidden" style={{paddingBottom:"38%"}}>
        <div className="absolute inset-0">
          {project.cover_url ? <img src={project.cover_url} alt={project.titulo} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{background:"linear-gradient(135deg,#0f0f2a,#1e1040,#09091e)"}} />}
          <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(9,9,30,0.85) 20%,transparent 70%)"}} />
          <div className="absolute bottom-4 left-4"><p className="text-[10px] uppercase tracking-widest text-accent mb-1">{tipoLabel[project.tipo]||project.tipo}</p><h1 className="font-display text-2xl text-bone">{project.titulo}</h1></div>
          <label className={`absolute top-3 right-3 cursor-pointer flex items-center gap-1.5 text-xs rounded-lg px-3 py-2 bg-black/60 backdrop-blur-sm border border-white/10 text-bone/60 hover:text-bone transition-colors ${uploadingCover?"opacity-50 pointer-events-none":""}`}>{uploadingCover?"Enviando...":project.cover_url?"↑ Trocar capa":"↑ Adicionar capa"}<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>{if(e.target.files?.[0]) uploadCover(e.target.files[0]);}} /></label>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 p-5 space-y-4">
        {editing ? (<>
          <Field label="Título"><input value={editTitulo} onChange={e=>setEditTitulo(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50" /></Field>
          <Field label="Tipo"><select value={editTipo} onChange={e=>setEditTipo(e.target.value as Project["tipo"])} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50">{tipoSelectOpts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select></Field>
          <Field label="Descrição"><textarea value={editDescricao} onChange={e=>setEditDescricao(e.target.value)} rows={3} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm focus:outline-none focus:border-accent/50 resize-none" /></Field>
          <Field label={`Progresso — ${progress}%`}><input type="range" min={0} max={100} value={progress} onChange={e=>setProgress(+e.target.value)} className="w-full accent-[#e84820]" /></Field>
          <div className="flex gap-2"><button onClick={saveProject} disabled={saving} className="rounded-xl bg-accent/20 border border-accent/30 text-accent px-4 py-2 text-sm hover:bg-accent/30 disabled:opacity-50">{saving?"Salvando...":"Salvar"}</button><button onClick={()=>setEditing(false)} className="rounded-xl bg-white/5 text-bone/50 px-4 py-2 text-sm hover:bg-white/10">Cancelar</button></div>
        </>) : (<>
          <div className="flex items-start justify-between"><div className="flex-1">{project.descricao && <p className="text-bone/60 text-sm">{project.descricao}</p>}</div><button onClick={()=>setEditing(true)} className="text-xs text-bone/30 hover:text-bone/60 ml-4">Editar</button></div>
          <div><div className="flex justify-between text-xs text-bone/40 mb-1.5"><span>Progresso</span><span>{project.progresso}%</span></div><div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full rounded-full bg-accent" style={{width:`${project.progresso}%`}} /></div></div>
          {isAdmin && <button onClick={deleteProject} className="text-xs text-red-400/50 hover:text-red-400 transition-colors">Excluir projeto</button>}
        </>)}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-sm font-medium text-bone/60 uppercase tracking-widest">Faixas</h2><button onClick={()=>setShowAddItem(v=>!v)} className="text-xs text-accent">{showAddItem?"Cancelar":"+ Adicionar"}</button></div>
        {showAddItem && (<div className="rounded-xl border border-white/10 p-4 space-y-3"><input value={newItemTitulo} onChange={e=>setNewItemTitulo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder="Nome da faixa ou demo..." className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm placeholder-bone/20 focus:outline-none focus:border-accent/50" /><div className="flex gap-2"><select value={newItemTipo} onChange={e=>setNewItemTipo(e.target.value)} className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/50"><option value="música">Música</option><option value="demo">Demo</option><option value="álbum">Álbum</option><option value="outro">Outro</option></select><button onClick={addItem} disabled={addingItem||!newItemTitulo.trim()} className="rounded-lg bg-accent/20 border border-accent/30 text-accent px-4 py-2 text-sm hover:bg-accent/30 disabled:opacity-40">{addingItem?"...":"Criar"}</button></div><textarea value={newItemDesc} onChange={e=>setNewItemDesc(e.target.value)} rows={2} placeholder="Descrição opcional..." className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm placeholder-bone/20 focus:outline-none focus:border-accent/50 resize-none" /></div>)}
        {items.map(item => (<div key={item.id} className="group relative"><Link href={`/projetos/${id}/itens/${item.id}`} className="flex items-center gap-3 rounded-xl border border-white/10 p-4 hover:border-accent/30 transition-all">{item.cover_url ? <img src={item.cover_url} alt={item.titulo} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" /> : <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"rgba(232,72,32,0.08)"}}><span className="text-accent/30 text-xl">&#9835;</span></div>}<div className="flex-1 min-w-0"><p className="text-bone text-sm font-medium">{item.titulo}</p><p className="text-bone/30 text-xs mt-0.5">{tipoLabel[item.tipo]||item.tipo}{item.descricao?" — "+item.descricao:""}</p></div><span className="text-accent/30 group-hover:text-accent text-sm transition-colors">&#8594;</span></Link>{isAdmin && <button onClick={()=>deleteItem(item.id)} className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 text-bone/20 hover:text-red-400 text-xs transition-all">&#215;</button>}</div>))}
        {items.length===0&&!showAddItem && <p className="text-xs text-bone/20 text-center py-3">Nenhuma faixa ainda.</p>}
      </div>
      <div className="rounded-2xl border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between"><div><h2 className="text-sm font-medium text-bone">Tarefas do projeto</h2>{tasks.length>0&&<p className="text-xs text-bone/30 mt-0.5">{doneCount} de {tasks.length} concluídas</p>}</div>{tasks.length>0&&<div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full" style={{width:`${tasks.length?doneCount/tasks.length*100:0}%`}} /></div>}</div>
        <div className="space-y-1">{tasks.map(t=>(<div key={t.id} className="group flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/3 transition-colors"><button onClick={()=>toggleTask(t.id,t.done)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${t.done?"bg-accent border-accent":"border-white/20 hover:border-accent/50"}`}>{t.done&&<span className="text-bone text-[10px] font-bold">&#10003;</span>}</button><span className={`flex-1 text-sm transition-colors ${t.done?"line-through text-bone/25":"text-bone/80"}`}>{t.content}</span><button onClick={()=>deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-bone/20 hover:text-accent text-xs transition-all">&#215;</button></div>))}{tasks.length===0&&<p className="text-xs text-bone/20 text-center py-2">Nenhuma tarefa.</p>}</div>
        <div className="flex gap-2"><input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Nova tarefa..." className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm placeholder-bone/20 focus:outline-none focus:border-accent/50" /><button onClick={addTask} disabled={addingTask||!newTask.trim()} className="rounded-xl bg-accent/20 border border-accent/30 text-accent px-3 py-2 text-sm hover:bg-accent/30 disabled:opacity-30">+</button></div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-sm font-medium text-bone/60 uppercase tracking-widest">Links</h2><button onClick={()=>{setShowAddLink(v=>!v);setEditingLinkId(null);}} className="text-xs text-accent">{showAddLink?"Cancelar":"+ Adicionar"}</button></div>
        {showAddLink&&(<div className="rounded-xl border border-white/10 p-4 space-y-3">
          <Field label="Tipo de link"><select value={newTipo} onChange={e=>setNewTipo(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/40">{Object.entries(LINK_TIPOS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></Field>
          <Field label="Label"><input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Ex: Guia de acordes" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/40" /></Field>
          <Field label="URL"><input value={newUrl} onChange={e=>handleNewUrlChange(e.target.value)} placeholder="https://..." className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/40" /></Field>
          <Field label="Descrição"><input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Descrição opcional" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/40" /></Field>
          <Field label="URL da miniatura (opcional)"><input value={newThumb} onChange={e=>setNewThumb(e.target.value)} placeholder="https://img.youtube.com/..." className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/40" /></Field>
          <button onClick={addLink} disabled={addingLink||!newLabel.trim()||!newUrl.trim()} className="rounded-xl bg-accent/20 border border-accent/30 text-accent px-4 py-2 text-sm hover:bg-accent/30 disabled:opacity-40">{addingLink?"...":"Adicionar"}</button>
        </div>)}
        {links.map(l => (
          <div key={l.id} className="rounded-xl border border-white/10 overflow-hidden">
            {editingLinkId === l.id ? (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-1"><p className="text-xs uppercase tracking-widest text-accent font-medium">Editando link</p><button onClick={()=>setEditingLinkId(null)} className="text-xs text-bone/30 hover:text-bone">Cancelar</button></div>
                <Field label="Tipo de link"><select value={editLinkTipo} onChange={e=>setEditLinkTipo(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/50">{Object.entries(LINK_TIPOS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></Field>
                <Field label="Label"><input value={editLinkLabel} onChange={e=>setEditLinkLabel(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/50" /></Field>
                <Field label="URL"><input value={editLinkUrl} onChange={e=>handleEditUrlChange(e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/50" /></Field>
                <Field label="Descrição"><input value={editLinkDesc} onChange={e=>setEditLinkDesc(e.target.value)} placeholder="Descrição (opcional)" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/50" /></Field>
                <Field label="URL da miniatura"><input value={editLinkThumb} onChange={e=>setEditLinkThumb(e.target.value)} placeholder="https://img.youtube.com/... (opcional)" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-bone text-sm focus:outline-none focus:border-accent/50" /></Field>
                <div className="flex gap-2"><button onClick={()=>saveLink(l.id)} disabled={savingLink||!editLinkLabel.trim()||!editLinkUrl.trim()} className="rounded-xl bg-accent/20 border border-accent/30 text-accent px-4 py-2 text-sm hover:bg-accent/30 disabled:opacity-50">{savingLink?"Salvando...":"Salvar"}</button><button onClick={()=>deleteLink(l.id)} className="rounded-xl bg-white/5 text-red-400/50 hover:text-red-400 px-3 py-2 text-sm hover:bg-white/10">Excluir</button></div>
              </div>
            ) : (
              <div className="group relative flex hover:border-accent/20">
                <a href={l.url} target="_blank" rel="noreferrer" className="flex flex-1" style={{minHeight:"72px"}}>
                  {l.thumb_url?<div className="w-28 sm:w-36 flex-shrink-0 relative bg-black"><img src={l.thumb_url} alt="" className="absolute inset-0 w-full h-full object-cover" /></div>:<div className="w-12 flex-shrink-0 flex items-center justify-center" style={{background:"rgba(232,72,32,0.07)"}}><span className="text-accent/40 text-xl">&#8599;</span></div>}
                  <div className="flex-1 px-4 py-3 min-w-0 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-2 flex-wrap"><p className="font-medium text-sm text-bone group-hover:text-accent transition-colors">{l.label}</p><LinkBadge tipo={l.tipo||"link"} /></div>
                    {l.descricao&&<p className="text-xs text-bone/40 line-clamp-2">{l.descricao}</p>}
                    <p className="text-[10px] text-bone/20 uppercase tracking-wider">{getDomain(l.url)}</p>
                  </div>
                </a>
                <div className="flex flex-col justify-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={()=>startEditLink(l)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-accent/20 text-bone/40 hover:text-accent text-xs flex items-center justify-center transition-colors" title="Editar">&#9998;</button>
                  <button onClick={()=>deleteLink(l.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-400/10 text-bone/20 hover:text-red-400 text-xs flex items-center justify-center transition-colors" title="Excluir">&#215;</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {links.length===0&&!showAddLink&&<p className="text-xs text-bone/20 text-center py-3">Nenhum link.</p>}
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-bone/60 uppercase tracking-widest">Comentários</h2>
        <div className="relative">
          <div className="flex gap-2"><input value={newComment} onChange={e=>handleCommentInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addComment()} placeholder="Nota ou @mention..." className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-bone text-sm placeholder-bone/20 focus:outline-none focus:border-accent/50" /><button onClick={addComment} disabled={addingComment||!newComment.trim()} className="rounded-xl bg-accent/20 text-accent px-4 py-2 text-xs hover:bg-accent/30 disabled:opacity-30">Publicar</button></div>
          {filteredMentions.length > 0 && (<div className="absolute top-full left-0 mt-1 bg-ink border border-white/15 rounded-xl overflow-hidden shadow-xl z-10 min-w-[160px]">{filteredMentions.map(p => (<button key={p.id} onClick={() => insertMention(p.nome)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-bone hover:bg-white/8 transition-colors text-left"><div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent font-medium">{p.nome[0].toUpperCase()}</div>{p.nome}</button>))}</div>)}
        </div>
        <div className="space-y-3">{comments.map(c=>(<div key={c.id} className="group flex gap-3"><div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs text-accent font-medium">{(c.profiles?.nome||"?")[0].toUpperCase()}</div><div className="flex-1"><div className="flex items-baseline gap-2"><span className="text-xs font-medium text-bone/70">{c.profiles?.nome||"Membro"}</span><span className="text-[10px] text-bone/20">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span></div><p className="text-sm text-bone/60 mt-0.5">{renderMention(c.content, allProfiles)}</p></div>{(currentUser?.id===c.author_id||isAdmin)&&<button onClick={()=>deleteComment(c.id)} className="opacity-0 group-hover:opacity-100 text-xs text-bone/20 hover:text-accent self-start mt-0.5">&#215;</button>}</div>))}{comments.length===0&&<p className="text-xs text-bone/20 text-center py-3">Sem comentários.</p>}</div>
      </div>
    </div>
  );
}
