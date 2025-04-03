// app/api/projects/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { cookies } from 'next/headers';
import { Iron } from 'iron-session';

// Helper function to get user ID from session
async function getUserId() {
  const sessionCookie = cookies().get('user_session');
  if (!sessionCookie) return null;
  
  try {
    const session = await Iron.unseal(
      sessionCookie.value,
      process.env.SESSION_SECRET,
      Iron.defaults
    );
    return session.userId;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authenticated', redirectTo: '/login' },
        { status: 401 }
      );
    }
    
    const projects = await Project.find({ userId })
      .select('name updatedAt')
      .sort({ updatedAt: -1 });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authenticated', redirectTo: '/login' },
        { status: 401 }
      );
    }
    
    const { name, code } = await req.json();
    
    const project = new Project({
      userId,
      name,
      code,
    });
    
    await project.save();
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}