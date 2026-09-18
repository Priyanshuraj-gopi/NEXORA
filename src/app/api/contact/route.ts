import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createBookingInquiry } from '@/lib/crm-store';

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  eventType: z.enum(['corporate', 'wedding', 'festival', 'private_party', 'exhibition']),
  eventDate: z.string().optional(),
  estimatedGuests: z.number().optional(),
  location: z.string().optional(),
  message: z.string().min(10, 'Please provide details about your event (at least 10 characters)'),
});

// Rate limiter: max 3 booking requests per minute per IP
const ipContactCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_CONTACT_PER_WINDOW = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipContactCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipContactCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_CONTACT_PER_WINDOW) {
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
          error: 'Rate limit reached. Please wait a minute before submitting another inquiry.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parseResult = ContactSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.errors[0]?.message || 'Invalid form data',
        },
        { status: 400 }
      );
    }

    const inquiry = createBookingInquiry(parseResult.data);

    return NextResponse.json({
      success: true,
      message: 'Your event booking inquiry has been received. Our operations team will contact you within 24 hours.',
      inquiryId: inquiry.id,
    });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not submit your booking inquiry.' },
      { status: 500 }
    );
  }
}

