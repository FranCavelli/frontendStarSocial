"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login({ username, password });
      router.push("/");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto flex items-center justify-center px-4 py-6">
      <div className="glass-card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl">★</div>
          <h1 className="font-display font-bold text-2xl mt-2">Bienvenido de vuelta</h1>
          <p className="text-sm text-muted">Tu mejor sonrisa, por favor.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={username}
            onChange={(e) => setU(e.target.value)}
            placeholder="usuario"
            className="input-soft"
            autoComplete="username"
          />
          <input
            value={password}
            onChange={(e) => setP(e.target.value)}
            type="password"
            placeholder="contraseña"
            className="input-soft"
            autoComplete="current-password"
          />
          {err && <p className="text-sm text-rose-500">{err}</p>}
          <button disabled={busy} className="pill-primary w-full py-3">
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="text-center text-sm mt-5 text-muted">
          ¿Sin cuenta? <Link href="/register" className="text-peachDark font-semibold">Creá una</Link>
        </p>
      </div>
    </div>
  );
}
