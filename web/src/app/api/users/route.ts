import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/** Crea tabla si no existe y lista usuarios */
export async function GET() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );`;
  const { rows } = await sql`SELECT id, email, created_at FROM users ORDER BY id DESC;`;
  return NextResponse.json(rows);
}

/** Crea un usuario: body { email } */
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
  await sql`INSERT INTO users (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING;`;
  return NextResponse.json({ ok: true });
}
