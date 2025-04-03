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

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authenticated', redirectTo: '/login' },
        { status: 401 }
      );
    }
    
    const project = await Project.findOne({
      _id: params.id,
      userId,
    });
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
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
    
    const project = await Project.findOneAndUpdate(
      { _id: params.id, userId },
      { 
        name, 
        code,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { message: 'Not authenticated', redirectTo: '/login' },
        { status: 401 }
      );
    }
    
    const result = await Project.findOneAndDelete({
      _id: params.id,
      userId,
    });
    
    if (!result) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}