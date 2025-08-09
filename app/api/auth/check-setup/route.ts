// File: /app/api/auth/check-setup/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // Check if any user exists
    const user = await User.findOne({});
    
    return NextResponse.json({
      userExists: !!user
    });
    
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { error: 'Setup check failed' },
      { status: 500 }
    );
  }
}