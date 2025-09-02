import { NextRequest, NextResponse } from 'next/server';
import { getKPIs, initializeDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Initialize database if not exists
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '1 hour';
    
    // Validate time range
    const validRanges = ['1 hour', '1 day', '1 week', '1 month'];
    const range = validRanges.includes(timeRange) ? timeRange : '1 hour';
    
    const kpis = await getKPIs(range);
    
    return NextResponse.json(kpis, {
      headers: {
        'Cache-Control': 'public, max-age=60', // Cache por 1 minuto
      }
    });
  } catch (error) {
    console.error('Error in /api/kpis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}