import { NextRequest, NextResponse } from 'next/server';
import { generateSessionId } from '@/lib/utils';
import { sessions, purgeExpiredSessions } from '@/lib/session-store';

// In-memory sliding window IP rate limiter (10 uploads per minute per IP)
const ipUploadCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipUploadCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipUploadCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_UPLOADS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Upload rate limit exceeded. Please wait a moment before uploading another photograph.',
        },
        { status: 429 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Expected multipart/form-data content type.' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const style = formData.get('style') as string;
    const genderHint = (formData.get('genderHint') as string) || 'auto';

    if (!image) {
      return NextResponse.json({ success: false, error: 'No photograph provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(image.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Only JPEG, PNG, and WebP are supported.' },
        { status: 400 }
      );
    }

    // Validate file size (15MB maximum)
    if (image.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Photograph exceeds the maximum 15MB size limit.' },
        { status: 400 }
      );
    }

    // Convert to base64 for processing
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const sessionId = generateSessionId();
    purgeExpiredSessions();

    // Store session in volatile in-memory map
    sessions.set(sessionId, {
      id: sessionId,
      status: 'pending',
      style: style || '',
      inputImageBase64: base64,
      outputImageUrl: null,
      processingStage: null,
      createdAt: new Date(),
      error: null,
      genderHint,
    });

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Photograph upload could not be processed.' },
      { status: 500 }
    );
  }
}
