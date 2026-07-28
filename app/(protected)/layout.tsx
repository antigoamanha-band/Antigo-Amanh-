"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase, Profile, Notification } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("site_config").select("value").eq("key","logo_url").limit(1)
      .then(({ data }) => { if (data?.[0]?.value) setLogoUrl(data[0].value as string); });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => { setProfile(data); setChecking(false); });
    });
  }, [router]);

  useEffect(() => {
    if (!profile) return;
    async function loadNotifs() {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", profile!.id).order("created_at", { ascending: false }).limit(30);
      setNotifs(data || []);
    }
    loadNotifs();
    const iv = setInterval(loadNotifs, 60000);
    return () => clearInterval(iv);
  }, [profile]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function openBell() {
    const next = !showNotifs; setShowNotifs(next);
    if (next && notifs.some(n => !n.lida)) {
      await supabase.from("notifications").update({ lida: true }).eq("user_id", profile!.id).eq("lida", false);
      setNotifs(ns => ns.map(n => ({ ...n, lida: true })));
    }
  }

  async function logout() { await supabase.auth.signOut(); router.push("/login"); }

  if (checking) return <div className="min-h-screen bg-ink flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;

  const nav = [
    { href: "/projetos", label: "Projetos" },
    { href: "/site/config", label: "Site" },
    { href: "/site/publicacoes", label: "Publicações" },
    ...(profile?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  const unreadCount = notifs.filter(n => !n.lida).length;

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/projetos" className="font-display text-lg text-bone flex items-center gap-2">
              {logoUrl ? <img src={logoUrl} alt="logo" className="h-8 w-auto object-contain" /> : <span>AA</span>}
            </Link>
            <nav className="hidden sm:flex items-center gap-4">
              {nav.map(n => <Link key={n.href} href={n.href} className={`text-sm transition-colors ${pathname.startsWith(n.href)?"text-bone":"text-bone/40 hover:text-bone/70"}`}>{n.label}</Link>)}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {profile && <span className="text-xs text-bone/40 hidden sm:block">{profile.nome}</span>}
            <div className="relative" ref={notifRef}>
              <button onClick={openBell} className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/8 transition-colors text-bone/50 hover:text-bone">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-bone text-[10px] font-bold flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-ink border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/8"><p className="text-xs font-medium text-bone/60 uppercase tracking-widest">Notificações</p></div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifs.length === 0 && <p className="text-xs text-bone/30 text-center py-6">Sem notificações.</p>}
                    {notifs.map(n => (
                      <button key={n.id} onClick={() => { setShowNotifs(false); if (n.project_id) router.push(`/projetos/${n.project_id}`); }} className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.lida?"bg-accent/5":""}`}>
                        <p className="text-sm text-bone font-medium">{n.titulo}</p>
                        {n.corpo && <p className="text-xs text-bone/40 mt-0.5 line-clamp-2">{n.corpo}</p>}
                        <p className="text-[10px] text-bone/20 mt-1">{new Date(n.created_at).toLocaleDateString("pt-BR")}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={logout} className="text-xs text-bone/40 hover:text-bone transition-colors">Sair</button>
          </div>
        </div>
        <div className="sm:hidden border-t border-white/5 flex overflow-x-auto">
          {nav.map(n => <Link key={n.href} href={n.href} className={`flex-shrink-0 px-4 py-2.5 text-sm ${pathname.startsWith(n.href)?"text-bone border-b-2 border-accent":"text-bone/40"}`}>{n.label}</Link>)}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
