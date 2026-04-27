"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import ScoreBadge from "./ScoreBadge";
import StarRating from "./StarRating";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso + "Z").getTime()) / 1000;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function FeedPost({ post, onChange, onDelete }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef(null);

  const isMine = user && post.author.id === user.id;

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu(false);
        setConfirmDel(false);
      }
    };
    if (menu) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menu]);

  const handleRate = async (stars) => {
    if (!user || isMine || busy) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api.ratePost(post.id, stars);
      onChange?.(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await api.deletePost(post.id);
      onDelete?.(post.id);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <article className="h-full w-full flex flex-col px-4 py-4 max-w-md mx-auto">
      <header className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3 group">
          <Avatar user={post.author} size={48} />
          <div className="leading-tight">
            <div className="font-display font-bold text-ink group-hover:underline decoration-peachDark/60">
              {post.author.display_name}
            </div>
            <div className="text-xs text-muted">@{post.author.username} · {timeAgo(post.created_at)}</div>
          </div>
        </Link>
        <div className="flex-1" />
        <ScoreBadge score={post.author.score} size="sm" />
        {isMine && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenu((v) => !v)}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-white/80 shadow-soft text-lg leading-none"
              aria-label="Opciones"
            >
              ⋮
            </button>
            {menu && (
              <div className="absolute right-0 top-11 z-20 glass-card p-2 w-52">
                {!confirmDel ? (
                  <button
                    onClick={() => setConfirmDel(true)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-500 text-sm font-semibold"
                  >
                    Borrar publicación
                  </button>
                ) : (
                  <div className="p-2">
                    <p className="text-xs text-muted mb-2">¿Borrar este post para siempre?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        disabled={busy}
                        className="flex-1 rounded-xl bg-rose-500 text-white text-sm font-semibold py-2 hover:bg-rose-600 disabled:opacity-60"
                      >
                        {busy ? "Borrando…" : "Borrar"}
                      </button>
                      <button
                        onClick={() => setConfirmDel(false)}
                        className="flex-1 rounded-xl bg-white/80 text-ink text-sm font-semibold py-2 hover:bg-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="flex-1 min-h-0 rounded-3xl overflow-hidden bg-white shadow-card border border-white/80 flex items-center justify-center">
        {post.media_type === "video" ? (
          <video
            src={post.media_url}
            controls
            playsInline
            loop
            className="w-full h-full object-cover bg-black/5"
          />
        ) : (
          <img
            src={post.media_url}
            alt={post.caption || "post"}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="mt-3">
        {post.caption && (
          <p className="text-ink/90 leading-relaxed mb-3 line-clamp-3">{post.caption}</p>
        )}
        <div className="flex items-center gap-3">
          <StarRating
            value={post.my_rating || 0}
            onRate={handleRate}
            disabled={busy || isMine || !user}
            size={30}
          />
          <div className="flex-1" />
          <ScoreBadge score={post.average_stars} size="md" />
          <span className="text-xs text-muted">
            {post.rating_count} {post.rating_count === 1 ? "voto" : "votos"}
          </span>
        </div>
        {isMine && (
          <p className="text-[11px] text-muted mt-1.5">No podés puntuarte a vos mismo.</p>
        )}
        {!user && (
          <p className="text-[11px] text-muted mt-1.5">
            <Link href="/login" className="text-peachDark font-semibold">Iniciá sesión</Link> para puntuar.
          </p>
        )}
        {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
      </div>
    </article>
  );
}
