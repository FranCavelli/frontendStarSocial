"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";
import ScoreBadge from "@/components/ScoreBadge";
import PostCard from "@/components/PostCard";
import CameraCapture from "@/components/CameraCapture";

export default function ProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const { user: me, setUser, loading } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: "", bio: "" });
  const [avatarMenu, setAvatarMenu] = useState(false);
  const [avatarCamera, setAvatarCamera] = useState(false);
  const fileRef = useRef(null);
  const avatarMenuRef = useRef(null);

  const isMe = me && data && me.id === data.user.id;

  const load = async () => {
    try {
      const res = await api.user(username);
      setData(res);
      setForm({ display_name: res.user.display_name, bio: res.user.bio || "" });
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!me) {
      router.push("/login");
      return;
    }
    load();
  }, [username, me, loading]);

  const saveProfile = async () => {
    const updated = await api.updateProfile(form);
    setUser(updated);
    setEditing(false);
    load();
  };

  const uploadAvatarFile = async (f) => {
    if (!f) return;
    const fd = new FormData();
    fd.append("avatar", f);
    const updated = await api.uploadAvatar(fd);
    setUser(updated);
    load();
  };

  const onAvatarFile = async (e) => {
    setAvatarMenu(false);
    await uploadAvatarFile(e.target.files?.[0]);
  };

  useEffect(() => {
    const onClick = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarMenu(false);
      }
    };
    if (avatarMenu) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [avatarMenu]);

  const updatePost = (updated) => {
    setData((d) => ({
      ...d,
      posts: d.posts.map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  const removePost = (id) => {
    setData((d) => ({ ...d, posts: d.posts.filter((p) => p.id !== id) }));
  };

  if (err) {
    return (
      <div className="h-full flex items-center justify-center text-rose-500">{err}</div>
    );
  }
  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-muted">Cargando…</div>
    );
  }

  const { user, posts } = data;

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative" ref={avatarMenuRef}>
              <Avatar user={user} size={92} />
              {isMe && (
                <>
                  <button
                    onClick={() => setAvatarMenu((v) => !v)}
                    className="absolute -bottom-1 -right-1 bg-white rounded-full w-8 h-8 shadow-card text-sm"
                    title="Cambiar avatar"
                  >
                    📷
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarFile}
                  />
                  {avatarMenu && (
                    <div className="absolute left-0 top-24 z-20 glass-card p-2 w-44">
                      <button
                        onClick={() => {
                          setAvatarMenu(false);
                          setAvatarCamera(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white text-sm font-semibold"
                      >
                        📷 Tomar foto
                      </button>
                      <button
                        onClick={() => {
                          setAvatarMenu(false);
                          fileRef.current?.click();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white text-sm font-semibold"
                      >
                        📁 Elegir archivo
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {!editing ? (
                <>
                  <h1 className="font-display font-bold text-2xl truncate">{user.display_name}</h1>
                  <div className="text-sm text-muted">@{user.username}</div>
                  {user.bio && <p className="text-sm mt-2 text-ink/80">{user.bio}</p>}
                </>
              ) : (
                <div className="space-y-2">
                  <input
                    className="input-soft py-2"
                    value={form.display_name}
                    onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  />
                  <textarea
                    className="input-soft py-2 min-h-[60px] resize-none"
                    value={form.bio}
                    placeholder="bio"
                    maxLength={200}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              )}
            </div>
            <ScoreBadge score={user.score} size="lg" />
          </div>

          {isMe && (
            <div className="flex gap-2 mt-4">
              {!editing ? (
                <button onClick={() => setEditing(true)} className="pill-ghost">Editar perfil</button>
              ) : (
                <>
                  <button onClick={saveProfile} className="pill-primary">Guardar</button>
                  <button onClick={() => setEditing(false)} className="pill-ghost">Cancelar</button>
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mt-5 text-center">
            <Stat label="posts" value={posts.length} />
            <Stat label="puntaje" value={user.score.toFixed(1)} />
            <Stat
              label="votos recibidos"
              value={posts.reduce((s, p) => s + p.rating_count, 0)}
            />
          </div>
        </section>

        {posts.length === 0 ? (
          <div className="glass-card p-10 text-center text-muted">
            {isMe ? "Todavía no publicaste nada." : "Sin posts aún."}
          </div>
        ) : (
          posts.map((p) => (
            <PostCard key={p.id} post={p} onChange={updatePost} onDelete={removePost} />
          ))
        )}
      </div>

      {avatarCamera && (
        <CameraCapture
          mode="photo"
          onCapture={async (f) => {
            setAvatarCamera(false);
            await uploadAvatarFile(f);
          }}
          onClose={() => setAvatarCamera(false)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/70 rounded-2xl py-3 border border-white/80">
      <div className="font-display font-bold text-xl">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-muted">{label}</div>
    </div>
  );
}
