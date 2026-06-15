'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Setup failed.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-80 flex flex-col gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-center">EPrint Admin</h1>
          <p className="text-gray-500 text-xs text-center mt-1">Set your admin password</p>
        </div>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-600 rounded-lg py-2 text-sm font-semibold transition-colors"
        >
          Set Password & Login
        </button>
      </form>
    </div>
  );
}
