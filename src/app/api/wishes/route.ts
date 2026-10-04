import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-guard";
import { ensureSheetStructure, getWishes, addWish } from "@/lib/sheets";

const ALLOWED_ATTENDANCE = new Set(["hadir", "ragu", "tidak"]);

function withCors(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

/** Admin-only: list all wishes. */
export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  try {
    await ensureSheetStructure();
    const wishes = await getWishes();
    return NextResponse.json({ success: true, data: wishes });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Gagal memuat ucapan." },
      { status: 500 }
    );
  }
}

/**
 * Public: the invitation page (index.html) posts here directly from the guest's browser.
 * No session required, since the guest is never logged in. Kept permissive but validated.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const nama_tamu = typeof body?.nama_tamu === "string" ? body.nama_tamu.trim().slice(0, 100) : "";
  const pesan = typeof body?.pesan === "string" ? body.pesan.trim().slice(0, 1000) : "";
  const kehadiranRaw = typeof body?.kehadiran === "string" ? body.kehadiran.trim() : "";
  const kehadiran = ALLOWED_ATTENDANCE.has(kehadiranRaw) ? kehadiranRaw : "hadir";

  if (!nama_tamu || !pesan) {
    return withCors(
      NextResponse.json({ success: false, message: "Nama dan ucapan wajib diisi." }, { status: 400 })
    );
  }

  try {
    await ensureSheetStructure();
    const wish = await addWish({ nama_tamu, pesan, kehadiran: kehadiran as "hadir" | "ragu" | "tidak" });
    return withCors(NextResponse.json({ success: true, data: wish }));
  } catch (err) {
    return withCors(
      NextResponse.json(
        { success: false, message: err instanceof Error ? err.message : "Gagal mengirim ucapan." },
        { status: 500 }
      )
    );
  }
}
