import { NextResponse } from "next/server";
import { ensureSheetStructure, getWishes } from "@/lib/sheets";

function withCors(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

/**
 * Public: the invitation page (index.html) reads the wish list from here so every
 * guest sees the same shared list, not just what is cached in their own browser.
 * No session required, since the guest is never logged in. Read-only, no admin fields exposed.
 */
export async function GET() {
  try {
    await ensureSheetStructure();
    const wishes = await getWishes();
    const publicWishes = wishes.map((w) => ({
      nama_tamu: w.nama_tamu,
      kehadiran: w.kehadiran,
      pesan: w.pesan,
      created_at: w.created_at,
    }));
    return withCors(NextResponse.json({ success: true, data: publicWishes }));
  } catch (err) {
    return withCors(
      NextResponse.json(
        { success: false, message: err instanceof Error ? err.message : "Gagal memuat ucapan." },
        { status: 500 }
      )
    );
  }
}
