import { NextRequest, NextResponse } from 'next/server';
import { getLeads, exportLeadsToCSV } from '@/lib/crm-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const query = searchParams.get('q')?.toLowerCase();
    const styleFilter = searchParams.get('style');

    let leads = getLeads();

    if (query) {
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.email.toLowerCase().includes(query) ||
          (l.phone && l.phone.includes(query)) ||
          l.sessionId.toLowerCase().includes(query)
      );
    }

    if (styleFilter && styleFilter !== 'all') {
      leads = leads.filter((l) => l.style.toLowerCase() === styleFilter.toLowerCase());
    }

    // CSV Export
    if (format === 'csv') {
      const csv = exportLeadsToCSV();
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="nexora-crm-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // JSON summary & records
    const totalLeads = leads.length;
    const marketingConsents = leads.filter((l) => l.marketingConsent).length;
    const deliveredCount = leads.filter((l) => l.deliveryStatus === 'delivered' || l.deliveryStatus === 'sent').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads,
        marketingConsents,
        optInRate: totalLeads > 0 ? Math.round((marketingConsents / totalLeads) * 100) : 0,
        deliveredCount,
      },
      leads: leads.map((l) => ({
        id: l.id,
        sessionId: l.sessionId,
        name: l.name,
        email: l.email,
        phone: l.phone || null,
        style: l.style,
        marketingConsent: l.marketingConsent,
        lifecycleStage: l.lifecycleStage,
        deliveryStatus: l.deliveryStatus,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('CRM Leads Query Error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not retrieve CRM leads.' },
      { status: 500 }
    );
  }
}

