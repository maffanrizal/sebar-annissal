import { NextRequest, NextResponse } from "next/server";
import { checkPin, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin : "";

  if (!pin || !checkPin(pin)) {
    return NextResponse.json({ success: false, message: "PIN salah." }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ success: true });
}
