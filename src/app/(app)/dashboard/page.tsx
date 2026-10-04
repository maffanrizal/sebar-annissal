import { ensureSheetStructure, getGuests, getWishes } from "@/lib/sheets";

const COUPLE_NAME = "Annis & Salafi";
const WEDDING_DATE = "2026-11-21T11:00:00+07:00";

function getGreeting(): string {
  const daysLeft = Math.ceil((new Date(WEDDING_DATE).getTime() - Date.now()) / 86400000);

  if (daysLeft > 1) {
    return `Pernikahanmu tinggal ${daysLeft} hari lagi, semoga semua persiapannya lancar!`;
  }
  if (daysLeft === 1) {
    return "Besok harinya! Semoga semua berjalan lancar dan penuh kebahagiaan.";
  }
  if (daysLeft === 0) {
    return "Hari ini harinya! Selamat menikah, semoga sakinah mawaddah warahmah.";
  }
  return "Semoga pernikahanmu kemarin berjalan lancar dan penuh berkah.";
}

export default async function DashboardPage() {
  await ensureSheetStructure();
  const [guests, wishes] = await Promise.all([getGuests(), getWishes()]);

  const totalGuests = guests.length;
  const totalSent = guests.filter((g) => g.status_kirim === "Sudah").length;
  const totalWishes = wishes.length;
  const totalHadir = wishes.filter((w) => w.kehadiran === "hadir").length;
  const totalRagu = wishes.filter((w) => w.kehadiran === "ragu").length;
  const totalTidak = wishes.filter((w) => w.kehadiran === "tidak").length;

  const sentPercent = totalGuests > 0 ? Math.round((totalSent / totalGuests) * 100) : 0;

  return (
    <div className="mx-auto max-w-lg px-4 pt-8">
      <h1 className="text-xl font-semibold">Halo {COUPLE_NAME}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{getGreeting()}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Total Tamu" value={totalGuests} />
        <StatCard label="Terkirim" value={totalSent} accent />
        <StatCard label="Ucapan Masuk" value={totalWishes} />
        <StatCard label="Konfirmasi Hadir" value={totalHadir} accent />
      </div>

      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progres Penyebaran</span>
          <span className="text-[var(--muted)]">
            {totalSent}/{totalGuests} tamu ({sentPercent}%)
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full rounded-full bg-[var(--red)]" style={{ width: `${sentPercent}%` }} />
        </div>
      </div>

      {totalWishes > 0 && (
        <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-sm font-medium">Ringkasan Kehadiran</p>
          <div className="mt-3 space-y-2">
            <AttendanceBar label="Hadir" count={totalHadir} total={totalWishes} color="var(--red)" />
            <AttendanceBar label="Masih ragu" count={totalRagu} total={totalWishes} color="#B0B0B0" />
            <AttendanceBar label="Tidak hadir" count={totalTidak} total={totalWishes} color="#4A4A4A" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-[var(--line)] p-4 ${
        accent ? "bg-[var(--red)]" : "bg-[var(--surface)]"
      }`}
    >
      <p className={`text-2xl font-semibold ${accent ? "text-white" : "text-[var(--foreground)]"}`}>
        {value}
      </p>
      <p className={`mt-0.5 text-xs ${accent ? "text-white/80" : "text-[var(--muted)]"}`}>{label}</p>
    </div>
  );
}

function AttendanceBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{label}</span>
        <span>
          {count} ({percent}%)
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
