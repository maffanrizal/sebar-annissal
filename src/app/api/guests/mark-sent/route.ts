import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-guard";
import { setGuestSentStatus } from "@/lib/sheets";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const status = body?.status === "Belum" ? "Belum" : "Sudah";
  if (!id) {
    return NextResponse.json({ success: false, message: "ID tamu wajib diisi." }, { status: 400 });
  }

  try {
    await setGuestSentStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Gagal mencatat status kirim." },
      { status: 500 }
    );
  }
}
