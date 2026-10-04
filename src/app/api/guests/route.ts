import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-guard";
import { ensureSheetStructure, getGuests, addGuests, deleteGuest, updateGuestName } from "@/lib/sheets";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  try {
    await ensureSheetStructure();
    const guests = await getGuests();
    return NextResponse.json({ success: true, data: guests });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Gagal memuat data tamu." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const names: string[] = Array.isArray(body?.names)
    ? body.names.map((n: unknown) => String(n).trim()).filter(Boolean)
    : [];

  if (names.length === 0) {
    return NextResponse.json({ success: false, message: "Minimal isi satu nama tamu." }, { status: 400 });
  }

  try {
    await ensureSheetStructure();
    const created = await addGuests(names);
    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Gagal menyimpan tamu." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const nama_tamu = typeof body?.nama_tamu === "string" ? body.nama_tamu.trim() : "";

  if (!id || !nama_tamu) {
    return NextResponse.json({ success: false, message: "Data tidak lengkap." }, { status: 400 });
  }

  try {
    await updateGuestName(id, nama_tamu);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Gagal mengubah tamu." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const id = request.nextUrl.searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ success: false, message: "ID tamu wajib diisi." }, { status: 400 });
  }

  try {
    await deleteGuest(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Gagal menghapus tamu." },
      { status: 500 }
    );
  }
}
