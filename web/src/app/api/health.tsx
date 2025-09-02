import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    // Initialize database on first call
    await initializeDatabase();
    
    return NextResponse.json({ 
      ok: true, 
      service: 'mini-lab-ott-web',
      version: '1.0.0',
      time: new Date().toISOString(),
      database: 'initialized'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        ok: false, 
        service: 'mini-lab-ott-web',
        error: 'Database initialization failed',
        time: new Date().toISOString() 
      },
      { status: 500 }
    );
  }
}