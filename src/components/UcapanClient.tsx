"use client";

import { useMemo, useState } from "react";
import type { Wish } from "@/lib/types";

const ATTENDANCE_LABEL: Record<string, string> = {
  hadir: "Hadir",
  ragu: "Masih ragu",
  tidak: "Berhalangan hadir",
};

const TABS = [
  { value: "semua", label: "Semua" },
  { value: "hadir", label: "Hadir" },
  { value: "tidak", label: "Tidak Hadir" },
  { value: "ragu", label: "Ragu" },
] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return (
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

export default function UcapanClient({ wishes }: { wishes: Wish[] }) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["value"]>("semua");

  const filtered = useMemo(() => {
    if (activeTab === "semua") return wishes;
    return wishes.filter((w) => w.kehadiran === activeTab);
  }, [wishes, activeTab]);

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-8">
      <div className="sticky top-0 z-10 -mx-4 bg-[var(--background)] px-4 pb-3 pt-8">
        <h1 className="text-xl font-semibold">Ucapan Tamu</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Ucapan dan konfirmasi kehadiran yang dikirim tamu lewat undangan.
        </p>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                activeTab === tab.value
                  ? "bg-[var(--red)] text-white"
                  : "border border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 text-center">
            <p className="text-sm text-[var(--muted)]">
              {wishes.length === 0
                ? "Belum ada ucapan. Ucapan akan muncul di sini begitu tamu mengisi formulir di undangan."
                : "Belum ada ucapan untuk kategori ini."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((w) => (
              <li key={w.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium">{w.nama_tamu}</p>
                  <p className="shrink-0 text-xs text-[var(--muted)]">{formatDate(w.created_at)}</p>
                </div>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--red)]">
                  {ATTENDANCE_LABEL[w.kehadiran] || w.kehadiran}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted)]">{w.pesan}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
