// lib/auth.js - Helper functions for authentication
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get session on the server side
export async function getSession() {
  return await getServerSession(authOptions);
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}
