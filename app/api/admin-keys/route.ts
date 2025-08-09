import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import AdminKey from '@/models/AdminKey';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { name, key, role, expiryDate, isActive } = await req.json();

    // Validate inputs
    if (!name || !key || !role || !expiryDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    try {
      // Generate JWT token from the key
      const tokenKey = jwt.sign(
        { 
          key,
          role,
          name,
          isActive
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1y' }
      );

      // Create new admin key with encrypted token
      const adminKey = new AdminKey({
        name,
        key: tokenKey, // Store encrypted token instead of plain key
        role,
        isActive: isActive || true, // Default to true if not provided
        expiryDate: new Date(expiryDate),
        createdAt: new Date()
      });

      await adminKey.save();
      
      return NextResponse.json({
        message: 'Admin key stored successfully'
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { error: 'Failed to store admin key' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Admin key storage error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const keys = await AdminKey.find({}).select('-key');
    
    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching admin keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin keys' },
      { status: 500 }
    );
  }
}