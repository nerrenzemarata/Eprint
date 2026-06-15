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

  return (
    <div className="grid gap-4 max-w-lg">
      {pricing.map((row) => {
        const key = `${row.paperSize}_${row.colorMode}`;
        const isSaving = saving === key;
        const isSaved = saved === key;
        return (
          <div
            key={key}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-4"
          >
            <div className="flex-1">
              <p className="font-semibold">{row.paperSize} — {label(row.colorMode)}</p>
              {row.updatedAt && (
                <p className="text-xs text-gray-600 mt-0.5">
                  Last updated: {new Date(row.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">₱</span>
              <input
                type="number"
                min="0.01"
                step="0.50"
                value={values[key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-gray-500 text-xs">/page</span>
              <button
                onClick={() => handleSave(row)}
                disabled={isSaving}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-700 hover:bg-blue-600 disabled:opacity-50 transition-colors min-w-[70px]"
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
