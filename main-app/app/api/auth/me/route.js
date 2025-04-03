// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { Iron } from 'iron-session';

export async function GET() {
  try {
    await dbConnect();
    
    // Get session cookie
    const sessionCookie = cookies().get('user_session');
    if (!sessionCookie) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Unseal the session
    const session = await Iron.unseal(
      sessionCookie.value,
      process.env.SESSION_SECRET,
      Iron.defaults
    );
    
    if (!session.userId) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: user._id,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}