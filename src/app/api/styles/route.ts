import { NextResponse } from 'next/server';
import { STYLES_SEED } from '@/config/styles-seed';

export async function GET() {
  const styles = STYLES_SEED
    .filter((s) => s.enabled)
    .map((s, i) => ({
      ...s,
      id: String(i + 1),
    }));

  return NextResponse.json({
    success: true,
    styles,
  });
}
