import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createLead, updateLeadStage } from '@/lib/crm-store';

const LeadSchema = z.object({
  sessionId: z.string().min(3, 'Invalid session ID'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  style: z.string().default('General'),
  marketingConsent: z.boolean().default(false),
});

// Sliding-window IP rate limiter: 5 submissions per minute
const ipLeadCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_LEADS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipLeadCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipLeadCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_LEADS_PER_WINDOW) {
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
          error: 'Rate limit exceeded. Please wait a minute before submitting again.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parseResult = LeadSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.errors[0]?.message || 'Invalid input data',
        },
        { status: 400 }
      );
    }

    const { sessionId, name, email, phone, style, marketingConsent } = parseResult.data;

    // Create lead record
    const lead = createLead({
      sessionId,
      name,
      email,
      phone: phone || undefined,
      style,
      marketingConsent,
      lifecycleStage: 'lead_captured',
      deliveryStatus: 'sent',
    });

    // Simulate automated photo email dispatch
    setTimeout(() => {
      updateLeadStage(lead.id, 'photo_delivered');
    }, 1500);

    return NextResponse.json({
      success: true,
      message: 'Photograph dispatch queued successfully. Check your email shortly!',
      leadId: lead.id,
      deliveryStatus: lead.deliveryStatus,
    });
  } catch (error) {
    console.error('CRM Lead API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not process photo delivery request.' },
      { status: 500 }
    );
  }
}

