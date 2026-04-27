"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import CameraCapture from "@/components/CameraCapture";

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview({ url, type: file.type.startsWith("video") ? "video" : "image" });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErr("Capturá o elegí una foto / video.");
      return;
    }
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.append("media", file);
    fd.append("caption", caption);
    try {
      await api.createPost(fd);
      router.push("/");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-6">
          <h1 className="font-display font-bold text-2xl mb-1">Compartí un momento</h1>
          <p className="text-sm text-muted mb-5">Capturá ahora o subí algo de tu galería.</p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCamera("photo")}
                className="rounded-2xl bg-white/80 hover:bg-white border border-white/80 py-3 text-sm font-semibold text-ink shadow-soft flex flex-col items-center gap-1"
              >
                <span className="text-2xl">📷</span>
                Foto
              </button>
              <button
                type="button"
                onClick={() => setCamera("video")}
                className="rounded-2xl bg-white/80 hover:bg-white border border-white/80 py-3 text-sm font-semibold text-ink shadow-soft flex flex-col items-center gap-1"
              >
                <span className="text-2xl">🎥</span>
                Video
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-2xl bg-white/80 hover:bg-white border border-white/80 py-3 text-sm font-semibold text-ink shadow-soft flex flex-col items-center gap-1"
              >
                <span className="text-2xl">📁</span>
                Archivo
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <div
              onClick={() => !preview && setCamera("photo")}
              className={`rounded-2xl border-2 border-dashed border-peachDark/40 bg-white/60 p-3 text-center transition min-h-[180px] flex items-center justify-center ${
                !preview ? "cursor-pointer hover:bg-white/80" : ""
              }`}
            >
              {preview ? (
                preview.type === "video" ? (
                  <video src={preview.url} className="max-h-96 mx-auto rounded-xl" controls />
                ) : (
                  <img src={preview.url} className="max-h-96 mx-auto rounded-xl" />
                )
              ) : (
                <div className="py-6">
                  <div className="text-5xl text-peachDark">＋</div>
                  <p className="text-muted mt-2">Tu captura aparece acá</p>
                  <p className="text-xs text-muted/80 mt-1">jpg · png · gif · mp4 · webm · ≤ 25MB</p>
                </div>
              )}
            </div>

            <textarea
              className="input-soft min-h-[90px] resize-none"
              placeholder="Decí algo lindo (máx 280)"
              value={caption}
              maxLength={280}
              onChange={(e) => setCaption(e.target.value)}
            />

            {err && <p className="text-sm text-rose-500">{err}</p>}

            <div className="flex items-center gap-2">
              <button disabled={busy || !file} className="pill-primary py-3 px-6">
                {busy ? "Subiendo…" : "Publicar ✿"}
              </button>
              {file && (
                <button type="button" onClick={() => setFile(null)} className="pill-ghost">
                  Quitar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {camera && (
        <CameraCapture
          mode={camera}
          onCapture={(f) => {
            setFile(f);
            setCamera(null);
          }}
          onClose={() => setCamera(null)}
        />
      )}
    </div>
  );
}
