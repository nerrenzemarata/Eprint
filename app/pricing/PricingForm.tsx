'use client';

import { useState } from 'react';

type PricingRow = {
  paperSize: string;
  colorMode: string;
  pricePerPage: number;
  updatedAt?: string;
};

type Props = {
  pricing: PricingRow[];
  updatePrice: (paperSize: string, colorMode: string, price: number) => Promise<void>;
};

export default function PricingForm({ pricing, updatePrice }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(pricing.map((r) => [`${r.paperSize}_${r.colorMode}`, String(r.pricePerPage)])),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function handleSave(row: PricingRow) {
    const key = `${row.paperSize}_${row.colorMode}`;
    const price = parseFloat(values[key] ?? String(row.pricePerPage));
    if (isNaN(price) || price <= 0) return;
    setSaving(key);
    await updatePrice(row.paperSize, row.colorMode, price);
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  const label = (mode: string) => (mode === 'bw' ? 'Black & White' : 'Color');
  const modeColor = (mode: string) => (mode === 'bw' ? '#6b7a99' : '#f0b429');

  return (
    <div className="grid gap-4 max-w-lg">
      {pricing.map((row) => {
        const key = `${row.paperSize}_${row.colorMode}`;
        const isSaving = saving === key;
        const isSaved = saved === key;
        return (
          <div
            key={key}
            className="rounded-2xl p-6 flex items-center gap-4"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 16px rgba(26,42,108,0.10)',
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: row.colorMode === 'bw' ? 'rgba(107,122,153,0.12)' : 'rgba(240,180,41,0.15)',
                    color: modeColor(row.colorMode),
                  }}
                >
                  {label(row.colorMode)}
                </span>
                <span className="font-black text-sm" style={{ color: '#1a2a6c' }}>{row.paperSize}</span>
              </div>
              {row.updatedAt && (
                <p className="text-xs" style={{ color: '#6b7a99' }}>
                  Updated: {new Date(row.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ color: '#1a2a6c' }}>₱</span>
              <input
                type="number"
                min="0.01"
                step="0.50"
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="w-24 rounded-xl px-3 py-2 text-sm text-right font-bold focus:outline-none"
                style={{
                  backgroundColor: '#e8eaf0',
                  border: '2px solid rgba(26,42,108,0.12)',
                  color: '#1a2a6c',
                }}
              />
              <span className="text-xs" style={{ color: '#6b7a99' }}>/page</span>
              <button
                onClick={() => handleSave(row)}
                disabled={isSaving}
                className="ml-2 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-50 min-w-[70px]"
                style={{
                  backgroundColor: isSaved ? '#22c55e' : '#1a2a6c',
                  color: isSaved ? '#ffffff' : '#f0b429',
                }}
              >
                {isSaving ? '...' : isSaved ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
