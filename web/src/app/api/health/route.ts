import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ ok: true, service: 'mini-lab-ott', time: new Date().toISOString() });
}
