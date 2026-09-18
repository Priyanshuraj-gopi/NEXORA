import { NextResponse } from 'next/server';
import { sessions } from '@/lib/session-store';

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
      visionEngine: 'Google Gemini 2.5 Flash',
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

