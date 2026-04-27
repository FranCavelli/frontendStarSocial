"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Avatar from "./Avatar";
import ScoreBadge from "./ScoreBadge";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const linkCls = (href) =>
    `pill ${pathname === href ? "bg-white text-ink shadow-soft" : "bg-white/40 text-ink/70 hover:bg-white/70"}`;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-cream/70 border-b border-white/60">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/" className="font-display font-bold text-2xl tracking-tight flex items-center gap-1">
          <span className="text-[#f5a524]">★</span>
          <span>StarSocial</span>
        </Link>
        <div className="flex-1" />
        {!loading && user && (
          <>
            <Link href="/upload" className={linkCls("/upload")}>＋ Subir</Link>
            <Link href={`/profile/${user.username}`} className="flex items-center gap-2 pill bg-white/60 hover:bg-white">
              <Avatar user={user} size={28} />
              <ScoreBadge score={user.score} size="sm" />
            </Link>
            <button onClick={logout} className="pill-ghost text-xs">Salir</button>
          </>
        )}
        {!loading && !user && (
          <>
            <Link href="/login" className="pill-ghost">Entrar</Link>
            <Link href="/register" className="pill-primary">Crear cuenta</Link>
          </>
        )}
      </div>
    </header>
  );
}
