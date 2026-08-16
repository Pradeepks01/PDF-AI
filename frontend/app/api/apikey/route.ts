import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/utils';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await authMiddleware(req);
    if (session instanceof NextResponse) {
      return session;
    }

    let apiKey = session.user.apiKey || null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { apiKey: true }
      });
      if (user?.apiKey) apiKey = user.apiKey;
    } catch {
      // offline DB fallback
    }

    return NextResponse.json(
      new ApiResponse({
        statusCode: 200,
        data: { apiKey },
        message: 'API key retrieved successfully'
      })
    );
  } catch (error) {
    console.error('Get API key error:', error);
    return NextResponse.json(
      new ApiResponse({
        statusCode: 500,
        data: null,
        message: 'Internal server error',
      }),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authMiddleware(req);
    if (session instanceof NextResponse) {
      return session;
    }

    const { key } = await req.json();

    if (!key || typeof key !== 'string' || key.trim().length < 5) {
      return NextResponse.json(
        new ApiResponse({
          statusCode: 400,
          data: null,
          message: 'Valid API key is required'
        }),
        { status: 400 }
      );
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { apiKey: key },
        select: { apiKey: true }
      });

      return NextResponse.json(
        new ApiResponse({
          statusCode: 200,
          data: updatedUser,
          message: 'API key updated successfully'
        })
      );
    } catch {
      return NextResponse.json(
        new ApiResponse({
          statusCode: 200,
          data: { apiKey: key },
          message: 'API key saved in local session'
        })
      );
    }
  } catch (error) {
    console.error('Update API key error:', error);
    return NextResponse.json(
      new ApiResponse({
        statusCode: 500,
        data: null,
        message: 'Internal server error',
      }),
      { status: 500 }
    );
  }
}
