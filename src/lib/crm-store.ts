export type CustomerLifecycleStage =
  | 'lead_captured'
  | 'photo_delivered'
  | 'downloaded'
  | 'follow_up_ready'
  | 'converted';

export interface CustomerLead {
  id: string;
  sessionId: string;
  name: string;
  email: string;
  phone?: string;
  style: string;
  marketingConsent: boolean;
  lifecycleStage: CustomerLifecycleStage;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  eventType: 'corporate' | 'wedding' | 'festival' | 'private_party' | 'exhibition';
  eventDate?: string;
  estimatedGuests?: number;
  location?: string;
  message?: string;
  status: 'new' | 'contacted' | 'proposal_sent' | 'booked' | 'declined';
  createdAt: Date;
}

interface CRMStore {
  leads: Map<string, CustomerLead>;
  inquiries: Map<string, BookingInquiry>;
}

const globalForCRM = globalThis as unknown as {
  crmStore?: CRMStore;
};

export const crmStore: CRMStore = globalForCRM.crmStore ?? {
  leads: new Map<string, CustomerLead>(),
  inquiries: new Map<string, BookingInquiry>(),
};
globalForCRM.crmStore = crmStore;

// Utility functions for CRM operations
export function createLead(data: Omit<CustomerLead, 'id' | 'createdAt' | 'updatedAt'>): CustomerLead {
  const id = `LEAD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const now = new Date();

  const lead: CustomerLead = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  crmStore.leads.set(id, lead);
  return lead;
}

export function updateLeadStage(id: string, stage: CustomerLifecycleStage): CustomerLead | null {
  const lead = crmStore.leads.get(id);
  if (!lead) return null;

  lead.lifecycleStage = stage;
  lead.updatedAt = new Date();
  crmStore.leads.set(id, lead);
  return lead;
}

export function getLeads(): CustomerLead[] {
  return Array.from(crmStore.leads.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function createBookingInquiry(data: Omit<BookingInquiry, 'id' | 'createdAt' | 'status'>): BookingInquiry {
  const id = `INQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const inquiry: BookingInquiry = {
    ...data,
    id,
    status: 'new',
    createdAt: new Date(),
  };

  crmStore.inquiries.set(id, inquiry);
  return inquiry;
}

export function getBookingInquiries(): BookingInquiry[] {
  return Array.from(crmStore.inquiries.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

function sanitizeCSVCell(value: string | undefined | null): string {
  if (!value) return '""';
  let str = String(value).replace(/"/g, '""');
  // Neutralize CSV formula injection (CWE-1236)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
}

export function exportLeadsToCSV(): string {
  const leads = getLeads();
  const headers = [
    'Lead ID',
    'Session ID',
    'Full Name',
    'Email Address',
    'Phone / WhatsApp',
    'Transformed Era / Style',
    'Marketing Opt-In',
    'Lifecycle Stage',
    'Delivery Status',
    'Created At',
  ];

  const rows = leads.map((l) => [
    sanitizeCSVCell(l.id),
    sanitizeCSVCell(l.sessionId),
    sanitizeCSVCell(l.name),
    sanitizeCSVCell(l.email),
    sanitizeCSVCell(l.phone || ''),
    sanitizeCSVCell(l.style),
    l.marketingConsent ? 'YES' : 'NO',
    sanitizeCSVCell(l.lifecycleStage),
    sanitizeCSVCell(l.deliveryStatus),
    sanitizeCSVCell(l.createdAt.toISOString()),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

