"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function login() {
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError("Email ou senha incorretos."); else router.push("/projetos");
    setLoading(false);
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm space-y-6">
        <div><h1 className="font-display text-3xl text-bone">Antigo Amanhã</h1><p className="text-sm text-bone/40 mt-1">Área interna da banda</p></div>
        <div className="space-y-3">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-bone placeholder-bone/30 focus:outline-none focus:border-accent/50" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter"&&login()} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-bone placeholder-bone/30 focus:outline-none focus:border-accent/50" />
        </div>
        {error && <p className="text-accent text-sm">{error}</p>}
        <button onClick={login} disabled={loading} className="w-full rounded-xl bg-accent py-3 text-sm font-medium text-bone hover:bg-accent/90 transition-colors disabled:opacity-50">{loading ? "Entrando..." : "Entrar"}</button>
      </div>
    </div>
  );
}
