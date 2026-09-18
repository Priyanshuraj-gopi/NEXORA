import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/session-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let session = sessions.get(id);

  if (id === 'latest') {
    // Get latest active session for TV monitor sync
    const all = Array.from(sessions.values());
    if (all.length > 0) {
      all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      session = all[0];
    }
  }

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'No active session' },
      { status: id === 'latest' ? 200 : 404 }
    );
  }

  return NextResponse.json({
    success: true,
    sessionId: session.id,
    status: session.status,
    processingStage: session.processingStage,
    outputImageUrl: session.outputImageUrl,
    error: session.error,
    style: session.style,
    createdAt: session.createdAt.toISOString(),
  });
}
