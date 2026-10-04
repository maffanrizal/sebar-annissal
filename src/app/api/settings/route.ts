import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-guard";
import { ensureSheetStructure, getSettings, updateSettings } from "@/lib/sheets";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  try {
    await ensureSheetStructure();
    const settings = await getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Gagal memuat pengaturan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const partial: Record<string, string> = {};
  for (const key of ["nama_acara", "base_link", "template_pesan"]) {
    if (typeof body?.[key] === "string") partial[key] = body[key];
  }

  try {
    await ensureSheetStructure();
    const updated = await updateSettings(partial);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Gagal menyimpan pengaturan." },
      { status: 500 }
    );
  }
}
