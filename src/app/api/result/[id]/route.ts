import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/session-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = sessions.get(id);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session not found or expired' },
      { status: 404 }
    );
  }

  if (session.status !== 'completed' || !session.outputImageUrl) {
    return NextResponse.json(
      { success: false, error: 'Result not ready yet', status: session.status },
      { status: 202 }
    );
  }

  return NextResponse.json({
    success: true,
    sessionId: session.id,
    outputImageUrl: session.outputImageUrl,
    style: session.style,
    createdAt: session.createdAt.toISOString(),
  });
}
