import { NextResponse } from 'next/server';

// Minimal Tauri 2 updater stub.
// Returning 204 means "no update available" — safe default for phase 1
// before we wire up signed releases.
export async function GET() {
  return new NextResponse(null, { status: 204 });
}
