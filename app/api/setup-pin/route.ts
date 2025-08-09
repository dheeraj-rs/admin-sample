import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import User from '@/models/User';
import AdminKey from '@/models/AdminKey';
import jwt from 'jsonwebtoken';

interface UserData {
  pin: string;
  role: string;
  isActive: boolean;
  expiryDate?: Date;
  createdAt: Date;
  username: string; // Added username field
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { newPin, adminKey, username } = await req.json();

    // Validate new PIN format
    if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      return NextResponse.json(
        { error: 'New PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Validate username
    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    try {
      // Check if username already exists
      const existingUser = await User.findOne({ username: username.trim() });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already exists. Please choose a different username.' },
          { status: 400 }
        );
      }

      let userData: UserData;

      // For normal user creation (without admin key)
      if (!adminKey) {
        userData = {
          pin: newPin,
          username: username.trim(),
          role: 'user',
          isActive: true,
          createdAt: new Date()
        };
      } else {
        // For admin user creation (with admin key)
        try {
          // Find active admin key in database
          const validAdminKey = await AdminKey.findOne({ 
            isActive: true,
            expiryDate: { $gt: new Date() }
          });
          
          if (!validAdminKey) {
            return NextResponse.json(
              { error: 'Invalid or expired admin key' },
              { status: 401 }
            );
          }

          // Verify the stored JWT token
          const decoded = jwt.verify(validAdminKey.key, process.env.JWT_SECRET || 'drjadmin') as {
            key: string;
            role: string;
            isActive: boolean;
            expiryDate: string;
          };

          // Verify if the provided admin key matches the one in the token
          if (decoded.key !== adminKey) {
            return NextResponse.json(
              { error: 'Invalid admin key' },
              { status: 401 }
            );
          }

          // Create admin user with decoded data
          userData = {
            pin: newPin,
            username: username.trim(),
            role: decoded.role,
            isActive: decoded.isActive,
            expiryDate: decoded.expiryDate ? new Date(decoded.expiryDate) : undefined,
            createdAt: new Date()
          };

        } catch (error) {
          console.error('Admin key verification error:', error);
          return NextResponse.json(
            { error: 'Invalid admin key format' },
            { status: 401 }
          );
        }
      }

      // Create and save the user
      const user = new User(userData);
      await user.save();

      // Generate JWT token for the new user
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          role: user.role,
          isActive: user.isActive
        },
        process.env.JWT_SECRET || 'drjadmin',
        { expiresIn: '24h' }
      );

      // Return the same format as the auth API
      return NextResponse.json({
        message: 'User created successfully',
        token: token,
        user: {
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          _id: user._id
        }
      });

    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}