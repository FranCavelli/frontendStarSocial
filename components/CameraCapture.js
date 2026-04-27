"use client";

import { useEffect, useRef, useState } from "react";

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

export default function CameraCapture({ mode = "photo", onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [facing, setFacing] = useState("user");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const stop = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };

    const start = async () => {
      stop();
      setReady(false);
      setError("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: mode === "video",
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      } catch (e) {
        setError(
          e.name === "NotAllowedError"
            ? "Permitir acceso a la cámara desde el navegador."
            : e.message || "No se pudo acceder a la cámara."
        );
      }
    };

    start();
    return () => {
      active = false;
      stop();
    };
  }, [facing, mode]);

  useEffect(() => {
    if (!recording) {
      setElapsed(0);
      return;
    }
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const flip = () => setFacing((f) => (f === "user" ? "environment" : "user"));

  const takePhoto = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !v.videoWidth) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (facing === "user") {
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      },
      "image/jpeg",
      0.92
    );
  };

  const startVideo = () => {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];
    const mimeType = candidates.find(
      (t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)
    );
    if (!mimeType) {
      setError("Tu navegador no soporta grabación de video.");
      return;
    }
    let rec;
    try {
      rec = new MediaRecorder(stream, { mimeType });
    } catch (e) {
      setError("No se pudo iniciar la grabación.");
      return;
    }
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const type = mimeType.startsWith("video/mp4") ? "video/mp4" : "video/webm";
      const ext = type === "video/mp4" ? "mp4" : "webm";
      const blob = new Blob(chunksRef.current, { type });
      const file = new File([blob], `video_${Date.now()}.${ext}`, { type });
      onCapture(file);
    };
    rec.start();
    recorderRef.current = rec;
    setRecording(true);
  };

  const stopVideo = () => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setRecording(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none">
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${
            facing === "user" ? "scale-x-[-1]" : ""
          }`}
        />
        <canvas ref={canvasRef} className="hidden" />

        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 text-white text-2xl leading-none flex items-center justify-center backdrop-blur"
          aria-label="Cerrar"
        >
          ×
        </button>
        <button
          onClick={flip}
          disabled={!ready || recording}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white text-lg flex items-center justify-center backdrop-blur disabled:opacity-50"
          aria-label="Cambiar cámara"
          title="Cambiar cámara"
        >
          ↺
        </button>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-6 text-center">
            <div>
              <div className="text-3xl mb-3">⚠</div>
              <p>{error}</p>
              <button onClick={onClose} className="mt-4 pill-ghost text-ink">
                Cerrar
              </button>
            </div>
          </div>
        )}

        {recording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            REC {fmt(elapsed)}
          </div>
        )}

        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-white/80">
            Iniciando cámara…
          </div>
        )}
      </div>

      <div className="bg-black px-6 py-6 flex flex-col items-center gap-3">
        <p className="text-white/80 text-xs uppercase tracking-widest">
          {mode === "photo" ? "Tomar foto" : recording ? "Grabando…" : "Grabar video"}
        </p>
        {mode === "photo" ? (
          <button
            onClick={takePhoto}
            disabled={!ready}
            className="w-20 h-20 rounded-full border-[5px] border-white bg-white/10 hover:bg-white/20 active:scale-95 transition disabled:opacity-50"
            aria-label="Capturar"
          />
        ) : !recording ? (
          <button
            onClick={startVideo}
            disabled={!ready}
            className="w-20 h-20 rounded-full border-[5px] border-white bg-rose-500 hover:bg-rose-600 active:scale-95 transition disabled:opacity-50"
            aria-label="Iniciar grabación"
          />
        ) : (
          <button
            onClick={stopVideo}
            className="w-20 h-20 rounded-full border-[5px] border-white bg-rose-500 flex items-center justify-center active:scale-95 transition"
            aria-label="Detener grabación"
          >
            <span className="w-8 h-8 bg-white rounded-md" />
          </button>
        )}
      </div>
    </div>
  );
}
