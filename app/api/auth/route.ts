import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import User from '@/models/User';
import { createToken, verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { pin } = await req.json();
    
    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find all users
    const users = await User.find({
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } }
      ]
    });
    
    // If no users exist
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No active users found. Please setup PIN first.' },
        { status: 404 }
      );
    }

    // Check PIN against all active users
    for (const user of users) {
      const isValid = await user.comparePin(pin);
      
      if (isValid) {
        // Create JWT token
        const token = await createToken(user._id.toString());

        // Return user data along with token
        return NextResponse.json({
          token,
          user: {
            username: user.username,
            role: user.role,
            isActive: user.isActive,
            _id: user._id
          }
        });
      }
    }

    // If no matching PIN found
    return NextResponse.json(
      { error: 'Invalid PIN' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify the token
    const { authenticated, payload } = await verifyAuth(token);
    
    if (!authenticated || !payload) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Connect to database and verify user still exists and is active
    await dbConnect();
    const user = await User.findById(payload.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { authenticated: false, error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Check if user has expired
    if (user.expiryDate && user.expiryDate < new Date()) {
      return NextResponse.json(
        { authenticated: false, error: 'User account expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        _id: user._id
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Token validation failed' },
      { status: 500 }
    );
  }
}