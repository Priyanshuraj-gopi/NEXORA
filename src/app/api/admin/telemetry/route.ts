import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/session-store';
import { getApiUsageSummary, resetApiUsageMetrics } from '@/lib/api-meter';

export const dynamic = 'force-dynamic';

export async function GET() {
  const allSessions = Array.from(sessions.values());
  const total = allSessions.length;
  const completed = allSessions.filter((s) => s.status === 'completed').length;
  const processing = allSessions.filter((s) => s.status === 'processing').length;
  const failed = allSessions.filter((s) => s.status === 'failed').length;

  const styleCounts: Record<string, number> = {};
  for (const s of allSessions) {
    if (s.style) {
      styleCounts[s.style] = (styleCounts[s.style] || 0) + 1;
    }
  }

  const apiUsage = getApiUsageSummary();

  return NextResponse.json({
    success: true,
    telemetry: {
      total,
      completed,
      processing,
      failed,
      styleCounts,
      uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
      hasGemini: !!process.env.GEMINI_API_KEY,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      primaryEngine: 'Pollinations FLUX.1 (Photorealistic)',
      visionEngine: 'Google Gemini Multimodal Vision (Identity Anchor)',
      apiUsage,
    },
    recentSessions: allSessions
      .slice(-10)
      .reverse()
      .map((s) => ({
        id: s.id,
        style: s.style,
        status: s.status,
        createdAt: s.createdAt,
      })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === 'reset-api-meter') {
      const resetSummary = resetApiUsageMetrics();
      return NextResponse.json({
        success: true,
        message: 'API usage metrics reset successfully',
        apiUsage: resetSummary,
      });
    }
    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

