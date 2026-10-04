"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Check, Copy, Filter, Send, Trash2, X } from "lucide-react";
import type { Guest } from "@/lib/types";

type Props = {
  initialGuests: Guest[];
  initialTemplate: string;
  baseLink: string;
};

function buildPersonalLink(baseLink: string, name: string): string {
  if (!baseLink) return "";
  const url = baseLink.endsWith("/") ? baseLink.slice(0, -1) : baseLink;
  return `${url}?to=${encodeURIComponent(name)}`;
}

function formatMessage(template: string, name: string, link: string): string {
  return template.replace(/\{nama_tamu\}/g, name).replace(/\{link\}/g, link);
}

export default function SebarClient({ initialGuests, initialTemplate, baseLink }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [template, setTemplate] = useState(initialTemplate);
  const [templateDraft, setTemplateDraft] = useState(initialTemplate);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [search, setSearch] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"semua" | "Sudah" | "Belum">("semua");
  const [sortBy, setSortBy] = useState<"tanggal" | "alfabet">("tanggal");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [templateExpanded, setTemplateExpanded] = useState(false);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = q ? guests.filter((g) => g.nama_tamu.toLowerCase().includes(q)) : guests;
    if (filterStatus !== "semua") {
      list = list.filter((g) => g.status_kirim === filterStatus);
    }
    return [...list].sort((a, b) =>
      sortBy === "alfabet"
        ? a.nama_tamu.localeCompare(b.nama_tamu)
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [guests, search, filterStatus, sortBy]);

  async function handleAddSingle(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names: [name] }),
    });
    const data = await res.json();
    if (data.success) {
      setGuests((prev) => [...data.data, ...prev]);
      setNewName("");
      setShowAdd(false);
    }
    setBusy(false);
  }

  async function handleBulkImport() {
    const names = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    setBusy(true);
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names }),
    });
    const data = await res.json();
    if (data.success) {
      setGuests((prev) => [...data.data, ...prev]);
      setBulkText("");
      setShowBulk(false);
    }
    setBusy(false);
  }

  async function handleRename(id: string) {
    const name = editingName.trim();
    if (!name) return;
    setBusy(true);
    const res = await fetch("/api/guests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, nama_tamu: name }),
    });
    const data = await res.json();
    if (data.success) {
      setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, nama_tamu: name } : g)));
      setEditingId(null);
    }
    setBusy(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus tamu ini?")) return;
    setGuests((prev) => prev.filter((g) => g.id !== id));
    await fetch(`/api/guests?id=${id}`, { method: "DELETE" });
  }

  async function setSentStatus(id: string, status: Guest["status_kirim"]) {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, status_kirim: status } : g)));
    await fetch("/api/guests/mark-sent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  function handleUnmarkSent(id: string) {
    if (!confirm("Hapus info terkirim untuk tamu ini?")) return;
    setSentStatus(id, "Belum");
  }

  async function handleCopy(guest: Guest) {
    if (!baseLink) {
      alert("Atur Link Undangan Utama di halaman Home terlebih dahulu.");
      return;
    }
    const link = buildPersonalLink(baseLink, guest.nama_tamu);
    const msg = formatMessage(template, guest.nama_tamu, link);
    await navigator.clipboard.writeText(msg);
    showToast("Kalimat sebar sudah tersalin.");
    setSentStatus(guest.id, "Sudah");
  }

  function handleSend(guest: Guest) {
    if (!baseLink) {
      alert("Atur Link Undangan Utama di halaman Home terlebih dahulu.");
      return;
    }
    const link = buildPersonalLink(baseLink, guest.nama_tamu);
    const msg = formatMessage(template, guest.nama_tamu, link);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    setSentStatus(guest.id, "Sudah");
  }

  async function handleSaveTemplate() {
    setBusy(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_pesan: templateDraft }),
    });
    const data = await res.json();
    if (data.success) {
      setTemplate(templateDraft);
      setEditingTemplate(false);
    }
    setBusy(false);
  }

  function insertVar(variable: string) {
    setTemplateDraft((prev) => `${prev}${variable}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-8">
      {toast && (
        <div
          role="status"
          className="fixed top-4 right-4 z-40 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
      <h1 className="text-xl font-semibold">Sebar</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Kelola daftar tamu dan kalimat yang akan dikirim.</p>

      {/* Template editor */}
      <div className="mt-6 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Kalimat Sebar</h2>
          {!editingTemplate && (
            <button
              onClick={() => {
                setTemplateDraft(template);
                setEditingTemplate(true);
              }}
              className="text-xs font-medium text-[var(--red)]"
            >
              Ubah
            </button>
          )}
        </div>

        {editingTemplate ? (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2 text-xs">
              <button onClick={() => insertVar("{nama_tamu}")} className="rounded border border-[var(--line)] px-2 py-1 text-[var(--muted)] hover:text-[var(--foreground)]">
                +nama_tamu
              </button>
              <button onClick={() => insertVar("{link}")} className="rounded border border-[var(--line)] px-2 py-1 text-[var(--muted)] hover:text-[var(--foreground)]">
                +link
              </button>
            </div>
            <textarea
              value={templateDraft}
              onChange={(e) => setTemplateDraft(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-3 text-sm focus:border-[var(--red)]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveTemplate}
                disabled={busy}
                className="rounded-md bg-[var(--red)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
              >
                Simpan
              </button>
              <button
                onClick={() => setEditingTemplate(false)}
                className="rounded-md border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--muted)]"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <p
              className={`whitespace-pre-wrap text-sm text-[var(--muted)] ${
                templateExpanded ? "" : "max-h-24 overflow-hidden"
              }`}
              style={
                templateExpanded
                  ? undefined
                  : { maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }
              }
            >
              {template}
            </p>
            {template.length > 160 && (
              <button
                onClick={() => setTemplateExpanded((v) => !v)}
                className="mt-1 text-xs font-medium text-[var(--red)]"
              >
                {templateExpanded ? "Sembunyikan" : "Tampilkan semua"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Guest list header, sticky while scrolling the guest list below */}
      <div className="sticky top-0 z-10 -mx-4 bg-[var(--background)] px-4 pb-3 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Daftar Tamu ({guests.length})</h2>
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterMenu((v) => !v);
                  setShowSortMenu(false);
                }}
                title="Filter status kirim"
                aria-label="Filter status kirim"
                className={`flex h-9 w-9 items-center justify-center rounded-md border text-[var(--foreground)] ${
                  filterStatus !== "semua" ? "border-[var(--red)] text-[var(--red)]" : "border-[var(--line)]"
                }`}
              >
                <Filter size={16} />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 z-20 mt-2 w-40 rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-1 text-sm shadow-lg">
                  {[
                    { value: "semua", label: "Semua" },
                    { value: "Sudah", label: "Sudah terkirim" },
                    { value: "Belum", label: "Belum terkirim" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilterStatus(opt.value as typeof filterStatus);
                        setShowFilterMenu(false);
                      }}
                      className={`block w-full rounded px-2 py-1.5 text-left hover:bg-[var(--surface)] ${
                        filterStatus === opt.value ? "text-[var(--red)]" : "text-[var(--foreground)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortMenu((v) => !v);
                  setShowFilterMenu(false);
                }}
                title="Urutkan"
                aria-label="Urutkan"
                className={`flex h-9 w-9 items-center justify-center rounded-md border text-[var(--foreground)] ${
                  sortBy !== "tanggal" ? "border-[var(--red)] text-[var(--red)]" : "border-[var(--line)]"
                }`}
              >
                <ArrowUpDown size={16} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 z-20 mt-2 w-40 rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-1 text-sm shadow-lg">
                  {[
                    { value: "tanggal", label: "Tanggal input" },
                    { value: "alfabet", label: "Alfabet (A-Z)" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value as typeof sortBy);
                        setShowSortMenu(false);
                      }}
                      className={`block w-full rounded px-2 py-1.5 text-left hover:bg-[var(--surface)] ${
                        sortBy === opt.value ? "text-[var(--red)]" : "text-[var(--foreground)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowBulk(true)}
              className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]"
            >
              Import
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-md bg-[var(--red)] px-3 py-1.5 text-xs font-medium text-white"
            >
              + Tamu
            </button>
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama tamu..."
          className="mt-3 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm focus:border-[var(--red)]"
        />
      </div>

      <div className="mt-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 text-center">
            <p className="text-sm text-[var(--muted)]">
              {guests.length === 0
                ? "Belum ada tamu. Tambahkan satu per satu atau import banyak sekaligus."
                : "Tidak ada tamu yang cocok dengan pencarian."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2 pb-4">
            {filtered.map((g) => (
            <li key={g.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
              {editingId === g.id ? (
                <div className="flex gap-2">
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                    className="flex-1 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 text-sm focus:border-[var(--red)]"
                  />
                  <button
                    onClick={() => handleDelete(g.id)}
                    title="Hapus tamu"
                    aria-label="Hapus tamu"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line)] text-[var(--foreground)]"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    title="Batal"
                    aria-label="Batal"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line)] text-[var(--foreground)]"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => handleRename(g.id)}
                    title="Simpan"
                    aria-label="Simpan"
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--red)] text-white"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setEditingId(g.id);
                      setEditingName(g.nama_tamu);
                    }}
                    className="text-left"
                  >
                    <p className="font-medium">{g.nama_tamu}</p>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    {g.status_kirim === "Sudah" && (
                      <button
                        onClick={() => handleUnmarkSent(g.id)}
                        title="Hapus info terkirim"
                        className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-xs text-[var(--foreground)]"
                      >
                        ✓ terkirim
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(g)}
                      title="Salin pesan"
                      aria-label="Salin pesan"
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line)] text-[var(--foreground)]"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleSend(g)}
                      title="Kirim via WhatsApp"
                      aria-label="Kirim via WhatsApp"
                      className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--red)] text-white"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
          </ul>
        )}
      </div>

      {/* Add single guest modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Tambah Tamu">
          <form onSubmit={handleAddSingle} className="space-y-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              placeholder="Nama tamu"
              className="w-full rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-sm focus:border-[var(--red)]"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-[var(--red)] py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              Simpan
            </button>
          </form>
        </Modal>
      )}

      {/* Bulk import modal */}
      {showBulk && (
        <Modal onClose={() => setShowBulk(false)} title="Import Banyak Tamu">
          <p className="mb-3 text-xs text-[var(--muted)]">Satu nama per baris.</p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={8}
            placeholder={"Ahmad Rizki\nBudi Santoso\nSiti Aminah"}
            className="w-full rounded-md border border-[var(--line)] bg-[var(--surface-2)] p-3 text-sm focus:border-[var(--red)]"
          />
          <button
            onClick={handleBulkImport}
            disabled={busy}
            className="mt-3 w-full rounded-md bg-[var(--red)] py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            Proses Import
          </button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/70 sm:items-center"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Tutup" className="text-[var(--muted)]">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
