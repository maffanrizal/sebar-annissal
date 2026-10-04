import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

/** Returns a 401 response if the request has no valid session; otherwise null. */
export async function requireAuth(): Promise<NextResponse | null> {
  const ok = await isAuthenticated();
  if (!ok) {
    return NextResponse.json({ success: false, message: "Sesi berakhir, silakan login kembali." }, { status: 401 });
  }
  return null;
}
