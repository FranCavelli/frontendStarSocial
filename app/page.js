"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FeedPost from "@/components/FeedPost";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import ScoreBadge from "@/components/ScoreBadge";
import Avatar from "@/components/Avatar";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [people, setPeople] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    let mounted = true;
    setBusy(true);
    setErr("");

    const tasks = [api.users()];
    if (user) tasks.push(api.feed());

    Promise.all(tasks)
      .then((res) => {
        if (!mounted) return;
        setPeople(res[0]);
        setPosts(user ? res[1] : []);
      })
      .catch((e) => mounted && setErr(e.message))
      .finally(() => mounted && setBusy(false));

    return () => {
      mounted = false;
    };
  }, [user, loading]);

  const updatePost = (updated) =>
    setPosts((cur) => cur.map((p) => (p.id === updated.id ? updated : p)));
  const removePost = (id) =>
    setPosts((cur) => cur.filter((p) => p.id !== id));

  if (!loading && !user) {
    return (
      <div className="h-full overflow-y-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="glass-card p-7">
            <div className="text-center mb-6">
              <div className="text-5xl">★</div>
              <h1 className="font-display font-bold text-3xl mt-2">StarSocial</h1>
              <p className="text-sm text-muted mt-1">Be your best self.</p>
            </div>

            <div className="flex gap-2 mb-6">
              <Link href="/register" className="pill-primary flex-1 text-center py-3">
                Crear cuenta
              </Link>
              <Link href="/login" className="pill-ghost flex-1 text-center py-3">
                Entrar
              </Link>
            </div>

            <h2 className="text-xs uppercase tracking-widest text-muted mb-3 text-center">
              Top de la comunidad
            </h2>

            {busy && (
              <div className="text-center text-muted py-8">Cargando…</div>
            )}
            {err && (
              <div className="text-center text-rose-500 py-8">{err}</div>
            )}
            {!busy && !err && people.length === 0 && (
              <div className="text-center text-muted py-8">
                Aún no hay nadie. Sé el primero.
              </div>
            )}

            {!busy && people.length > 0 && (
              <ol className="space-y-2">
                {[...people]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 20)
                  .map((p, i) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 bg-white/70 rounded-2xl p-3 border border-white/80"
                    >
                      <span className="font-display font-bold text-lg w-6 text-center text-muted">
                        {i + 1}
                      </span>
                      <Avatar user={p} size={42} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{p.display_name}</div>
                        <div className="text-xs text-muted truncate">@{p.username}</div>
                      </div>
                      <ScoreBadge score={p.score} size="sm" />
                    </li>
                  ))}
              </ol>
            )}

            <p className="text-center text-xs text-muted mt-6">
              Iniciá sesión para ver el feed y puntuar ✿
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      <section className="snap-start snap-always h-full flex items-center justify-center px-4">
        <div className="glass-card p-7 w-full max-w-md">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-display font-bold text-3xl">
                Hola{user ? `, ${user.display_name.split(" ")[0]}` : ""} ✿
              </h1>
              <p className="text-sm text-muted mt-1">Deslizá para descubrir.</p>
            </div>
            {user && <ScoreBadge score={user.score} size="lg" />}
          </div>

          {people.length > 0 && (
            <>
              <h2 className="text-xs uppercase tracking-widest text-muted mb-2">
                Top de la comunidad
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {[...people]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 12)
                  .map((p) => (
                    <Link
                      key={p.id}
                      href={`/profile/${p.username}`}
                      className="shrink-0 w-24 bg-white/70 rounded-2xl p-2 flex flex-col items-center gap-1.5 border border-white/80 hover:-translate-y-0.5 transition"
                    >
                      <Avatar user={p} size={48} />
                      <div className="text-xs font-semibold text-center truncate w-full">
                        {p.display_name}
                      </div>
                      <ScoreBadge score={p.score} size="sm" />
                    </Link>
                  ))}
              </div>
            </>
          )}

          <div className="text-center mt-6 text-muted text-xs">
            <span className="inline-block animate-bounce">↓</span> deslizá <span className="inline-block animate-bounce">↓</span>
          </div>
        </div>
      </section>

      {busy && (
        <section className="snap-start snap-always h-full flex items-center justify-center text-muted">
          Cargando…
        </section>
      )}

      {err && (
        <section className="snap-start snap-always h-full flex items-center justify-center text-rose-500">
          {err}
        </section>
      )}

      {!busy && !err && posts.length === 0 && (
        <section className="snap-start snap-always h-full flex items-center justify-center px-4">
          <div className="glass-card p-10 text-center max-w-sm">
            <div className="text-5xl mb-2">✿</div>
            <p className="text-muted">Todavía no hay publicaciones. Sé el primero.</p>
            <Link href="/upload" className="pill-primary inline-block mt-4">
              ＋ Subir foto
            </Link>
          </div>
        </section>
      )}

      {posts.map((p) => (
        <section key={p.id} className="snap-start snap-always h-full">
          <FeedPost post={p} onChange={updatePost} onDelete={removePost} />
        </section>
      ))}

      {!busy && posts.length > 0 && (
        <section className="snap-start snap-always h-full flex items-center justify-center px-4">
          <div className="glass-card p-8 text-center max-w-sm">
            <div className="text-3xl">✿</div>
            <p className="text-muted mt-2">Llegaste al final por ahora.</p>
            <Link href="/upload" className="pill-primary inline-block mt-4">
              ＋ Subir algo nuevo
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
