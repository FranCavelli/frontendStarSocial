"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", display_name: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await register(form);
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
          <div className="text-4xl">✿</div>
          <h1 className="font-display font-bold text-2xl mt-2">Unite a StarSocial</h1>
          <p className="text-sm text-muted">Una vida con más estrellas te espera.</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input value={form.username} onChange={update("username")} placeholder="usuario" className="input-soft" />
          <input value={form.display_name} onChange={update("display_name")} placeholder="nombre visible" className="input-soft" />
          <input value={form.password} onChange={update("password")} type="password" placeholder="contraseña" className="input-soft" />
          {err && <p className="text-sm text-rose-500">{err}</p>}
          <button disabled={busy} className="pill-primary w-full py-3">
            {busy ? "Creando…" : "Crear cuenta"}
          </button>
        </form>
        <p className="text-center text-sm mt-5 text-muted">
          ¿Ya tenés cuenta? <Link href="/login" className="text-peachDark font-semibold">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
