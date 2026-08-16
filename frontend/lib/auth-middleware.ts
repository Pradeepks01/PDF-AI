import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from './auth';
import { prisma } from './db';

export async function authMiddleware(req: NextRequest) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET || "default_secret_key_1234567890"
    });

    if (token) {
      const userId = (token.id as string) || (token.sub as string) || "google_user";
      let dbUser = null;
      try {
        dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: userId },
              { email: token.email as string }
            ]
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            apiKey: true,
          }
        });
      } catch (dbErr) {
        // If DB is offline, continue with session token
      }

      return {
        user: {
          id: dbUser?.id || userId,
          name: token.name || dbUser?.name || "User",
          email: token.email || dbUser?.email || "user@example.com",
          image: (token.picture as string) || dbUser?.image || null,
          apiKey: dbUser?.apiKey || null
        },
        token
      };
    }

    const session = await getServerSession(authOptions);
    if (session?.user) {
      return {
        user: {
          id: (session.user as any).id || "session_user",
          name: session.user.name || "User",
          email: session.user.email || "user@example.com",
          image: session.user.image || null,
          apiKey: null
        },
        session
      };
    }

    // Default guest session for unauthenticated visitors
    return {
      user: {
        id: "guest_user",
        name: "Guest User",
        email: "guest@pdf-ai.local",
        apiKey: null
      }
    };
  } catch (error) {
    console.error('Auth middleware fallback:', error);
    return {
      user: {
        id: "guest_user",
        name: "Guest User",
        email: "guest@pdf-ai.local",
        apiKey: null
      }
    };
  }
}
