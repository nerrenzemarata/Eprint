'use client';

import { useState, useRef } from 'react';

export default function RemotePrintClient({ tunnelUrl }: { tunnelUrl: string | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState('');
  const [listenActive, setListenActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micProcRef = useRef<ScriptProcessorNode | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const listenReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const listenCtxRef = useRef<AudioContext | null>(null);

  function handleFile(f: File | null) {
    if (!f) return;
    setFile(f);
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
  }

  async function handlePrint() {
    if (!file || !tunnelUrl) return;
    setStatus('uploading');
    setProgress(0);
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${tunnelUrl}/print`);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.setRequestHeader('X-Filename', encodeURIComponent(file.name));
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => xhr.status === 200 ? resolve() : reject(new Error(`Server error: ${xhr.status}`));
        xhr.onerror = () => reject(new Error('Connection failed. Make sure the tunnel is running.'));
        xhr.send(file);
      });
      setStatus('done');
      setProgress(100);
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message ?? 'Unknown error');
    }
  }

  async function toggleMic() {
    if (micActive) {
      stopMic();
      setMicActive(false);
      return;
    }
    setMicError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      const ctx = new AudioContext({ sampleRate: 16000 });
      const src = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      src.connect(proc);
      proc.connect(ctx.destination);
      proc.onaudioprocess = (e) => {
        if (!tunnelUrl) return;
        const f32 = e.inputBuffer.getChannelData(0);
        const i16 = new Int16Array(f32.length);
        for (let i = 0; i < f32.length; i++) {
          i16[i] = Math.max(-32768, Math.min(32767, f32[i] * 32768));
        }
        fetch(`${tunnelUrl}/speak`, {
          method: 'POST',
          body: i16.buffer,
          headers: { 'Content-Type': 'application/octet-stream' },
        }).catch(() => {});
      };
      micStreamRef.current = stream;
      micProcRef.current = proc;
      micCtxRef.current = ctx;
      setMicActive(true);
    } catch (e: any) {
      setMicError('Microphone access denied. Allow mic in your browser settings.');
    }
  }

  function stopMic() {
    try { micProcRef.current?.disconnect(); } catch (_) {}
    try { micStreamRef.current?.getTracks().forEach(t => t.stop()); } catch (_) {}
    try { micCtxRef.current?.close(); } catch (_) {}
    micStreamRef.current = null;
    micProcRef.current = null;
    micCtxRef.current = null;
  }

  async function toggleListen() {
    if (listenActive) {
      listenReaderRef.current?.cancel();
      listenReaderRef.current = null;
      listenCtxRef.current?.close();
      listenCtxRef.current = null;
      setListenActive(false);
      return;
    }
    try {
      const ctx = new AudioContext({ sampleRate: 16000 });
      listenCtxRef.current = ctx;
      setListenActive(true);
      const response = await fetch(`${tunnelUrl}/mic`);
      if (!response.ok || !response.body) throw new Error('Mic stream unavailable');
      const reader = response.body.getReader();
      listenReaderRef.current = reader;
      let nextPlayTime = ctx.currentTime;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const samples = new Int16Array(value.buffer, value.byteOffset, value.byteLength / 2);
        const float32 = new Float32Array(samples.length);
        for (let i = 0; i < samples.length; i++) float32[i] = samples[i] / 32768;
        const buf = ctx.createBuffer(1, float32.length, 16000);
        buf.getChannelData(0).set(float32);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        const startAt = Math.max(nextPlayTime, ctx.currentTime + 0.05);
        src.start(startAt);
        nextPlayTime = startAt + buf.duration;
      }
      setListenActive(false);
    } catch (_) {
      setListenActive(false);
    }
  }

  if (!tunnelUrl) {
    return (
      <div
        className="rounded-2xl p-8 text-center max-w-lg"
        style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 16px rgba(26,42,108,0.10)' }}
      >
        <p className="text-4xl mb-4">📡</p>
        <p className="font-bold text-lg mb-2" style={{ color: '#1a2a6c' }}>Tablet Not Connected</p>
        <p className="text-sm" style={{ color: '#6b7a99' }}>
          Run <code className="font-mono bg-gray-100 px-1 rounded">bash ~/start-tunnel.sh</code> on the tablet's Termux to connect.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg flex flex-col gap-4">

      {/* Drop zone */}
      <div
        className="rounded-2xl p-8 text-center cursor-pointer transition-all"
        style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 16px rgba(26,42,108,0.10)',
          border: file ? '2.5px solid #1a2a6c' : '2.5px dashed rgba(26,42,108,0.2)',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        <p className="text-4xl mb-3">{file ? '📄' : '📂'}</p>
        {file ? (
          <>
            <p className="font-black text-base mb-1" style={{ color: '#1a2a6c' }}>{file.name}</p>
            <p className="text-xs" style={{ color: '#6b7a99' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB — click to change
            </p>
          </>
        ) : (
          <>
            <p className="font-bold text-base mb-1" style={{ color: '#1a2a6c' }}>Tap to choose a file</p>
            <p className="text-xs" style={{ color: '#6b7a99' }}>or drag & drop — PDF, JPG, PNG, DOC, DOCX</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Progress bar */}
      {status === 'uploading' && (
        <div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(26,42,108,0.10)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #1a2a6c, #f0b429)' }}
            />
          </div>
          <p className="text-xs text-center mt-1" style={{ color: '#6b7a99' }}>{progress}% uploaded</p>
        </div>
      )}

      {/* Status messages */}
      {status === 'done' && (
        <div className="rounded-xl p-4 text-center font-bold" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
          ✓ File sent! Check the kiosk — it's printing now.
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-xl p-4 text-center text-sm font-semibold" style={{ backgroundColor: 'rgba(239,68,68,0.10)', color: '#ef4444' }}>
          {errorMsg}
        </div>
      )}

      {/* Print button */}
      <button
        onClick={handlePrint}
        disabled={!file || status === 'uploading'}
        className="w-full py-4 rounded-2xl font-black text-base transition-opacity hover:opacity-80 disabled:opacity-40"
        style={{ backgroundColor: '#1a2a6c', color: '#f0b429' }}
      >
        {status === 'uploading' ? 'Sending...' : 'Send to Kiosk & Print'}
      </button>

      {/* Speak to kiosk */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 16px rgba(26,42,108,0.10)' }}
      >
        <div className="flex-1">
          <p className="font-black text-sm" style={{ color: '#1a2a6c' }}>Speak to Kiosk</p>
          <p className="text-xs mt-0.5" style={{ color: '#6b7a99' }}>
            {micActive ? 'Mic on — your voice plays on the tablet speaker' : 'Your voice plays on the tablet speaker'}
          </p>
          {micError && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{micError}</p>}
        </div>
        <button
          onClick={toggleMic}
          className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{
            backgroundColor: micActive ? '#ef4444' : '#1a2a6c',
            color: micActive ? '#ffffff' : '#f0b429',
            minWidth: 90,
          }}
        >
          {micActive ? '⏹ Stop' : '🎤 Speak'}
        </button>
      </div>

      {/* Listen to kiosk */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 16px rgba(26,42,108,0.10)' }}
      >
        <div className="flex-1">
          <p className="font-black text-sm" style={{ color: '#1a2a6c' }}>Listen to Kiosk</p>
          <p className="text-xs mt-0.5" style={{ color: '#6b7a99' }}>
            {listenActive ? 'Streaming tablet mic to your browser...' : 'Hear what\'s happening at the kiosk'}
          </p>
        </div>
        <button
          onClick={toggleListen}
          className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{
            backgroundColor: listenActive ? '#ef4444' : '#22c55e',
            color: '#ffffff',
            minWidth: 90,
          }}
        >
          {listenActive ? '⏹ Stop' : '🔊 Listen'}
        </button>
      </div>

      <p className="text-xs text-center" style={{ color: '#6b7a99' }}>
        Tunnel: <span className="font-mono">{tunnelUrl}</span>
      </p>
    </div>
  );
}
