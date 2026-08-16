import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${pythonUrl}/api/health`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Backend returned error', status: res.status }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Python health proxy error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to connect to backend' }, { status: 500 });
  }
}
