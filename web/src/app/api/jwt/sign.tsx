import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id = 'demo', subscription_tier = 'premium', expires_in = '2h' } = body;

    const payload = {
      user_id,
      subscription_tier,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (expires_in === '2h' ? 7200 : 3600),
      iss: 'mini-lab-ott'
    };

    const token = jwt.sign(payload, JWT_SECRET);

    return NextResponse.json({
      token,
      expires_in,
      payload: {
        user_id: payload.user_id,
        subscription_tier: payload.subscription_tier,
        expires_at: new Date(payload.exp * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('JWT sign error:', error);
    return NextResponse.json(
      { error: 'Failed to generate JWT token' },
      { status: 500 }
    );
  }
}