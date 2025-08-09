import { sendConfirmationEmail } from '@/backend/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req:NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, {status: 405})
  }

  try {
    const { owner, txDetail } = await req.json();
    await sendConfirmationEmail(owner, txDetail);
    return NextResponse.json({ success: true }, {status: 200})
  } catch (error:any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, {status: 500})
  }
}