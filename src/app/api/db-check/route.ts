import { connectToDatabase } from '@/backend/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req:NextRequest) {
  try {
    await connectToDatabase();
    return NextResponse.json({ message: "✅ MongoDB connected successfully" }, { status: 200 });
  } catch (error:any) {
    return NextResponse.json({ message: "❌ MongoDB connection failed" }, { status: 500 });
  }
}
