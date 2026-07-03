import { NextResponse } from "next/server";
import { getChatSessions } from "@/lib/store";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ sessions: getChatSessions() });
}
