import assert from 'node:assert';
import { crmStore, createLead, updateLeadStage, getLeads, exportLeadsToCSV, createBookingInquiry, getBookingInquiries } from '../src/lib/crm-store.ts';
import { sessions, purgeExpiredSessions } from '../src/lib/session-store.ts';
import { STYLES_SEED } from '../src/config/styles-seed.ts';
import { siteConfig } from '../src/config/site.ts';
import { generateSessionId, formatFileSize, isValidImageType, isValidImageSize } from '../src/lib/utils.ts';

console.log('================================================================');
console.log('   NEXORA STALL & AI PHOTO BOOTH: FULL PRODUCTION AUDIT SUITE   ');
console.log('================================================================\n');

let passedCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    process.exit(1);
  }
}

// --- SUITE 1: STYLES CONFIGURATION & BRAND CATALOG ---
console.log('--- 1. STYLES & CATALOG SPECIFICATIONS ---');
test('12 Curated Styles are configured and enabled', () => {
  assert.strictEqual(STYLES_SEED.length, 12, 'Must have 12 styles');
  STYLES_SEED.forEach(s => {
    assert.ok(s.title && s.title.length > 0, `Style missing title: ${s.slug}`);
    assert.ok(s.slug && s.slug.length > 0, `Style missing slug: ${s.title}`);
    assert.ok(s.thumbnail && s.thumbnail.startsWith('/styles/'), `Style thumbnail invalid: ${s.thumbnail}`);
    assert.ok(s.prompt && s.prompt.length > 50, `Style prompt too short: ${s.title}`);
    assert.strictEqual(s.enabled, true, `Style should be enabled: ${s.title}`);
  });
});

test('Categories are properly distributed', () => {
  const categories = new Set(STYLES_SEED.map(s => s.category));
  assert.ok(categories.has('era'), 'Must have era category');
  assert.ok(categories.has('fantasy'), 'Must have fantasy category');
  assert.ok(categories.has('art'), 'Must have art category');
  assert.ok(categories.has('professional'), 'Must have professional category');
});

// --- SUITE 2: UTILITIES & SECURITY FUNCTIONS ---
console.log('\n--- 2. UTILITY & DATA INTEGRITY TESTS ---');
test('Session ID generator produces valid NX- prefixed uppercase codes', () => {
  const id1 = generateSessionId();
  const id2 = generateSessionId();
  assert.ok(/^NX-[A-Z0-9]{6}$/.test(id1), `Session ID invalid format: ${id1}`);
  assert.ok(/^NX-[A-Z0-9]{6}$/.test(id2), `Session ID invalid format: ${id2}`);
  assert.notStrictEqual(id1, id2, 'Session IDs must be unique');
});

test('Image validation rejects invalid MIME types and accepts standard ones', () => {
  const validMock = { type: 'image/jpeg', size: 1024 * 1024 };
  const pngMock = { type: 'image/png', size: 2 * 1024 * 1024 };
  const webpMock = { type: 'image/webp', size: 500 * 1024 };
  const invalidMock = { type: 'application/pdf', size: 1024 };
  const exeMock = { type: 'application/x-msdownload', size: 1024 };

  assert.strictEqual(isValidImageType(validMock), true);
  assert.strictEqual(isValidImageType(pngMock), true);
  assert.strictEqual(isValidImageType(webpMock), true);
  assert.strictEqual(isValidImageType(invalidMock), false);
  assert.strictEqual(isValidImageType(exeMock), false);
});

test('File size limits are strictly enforced (15MB)', () => {
  const underLimit = { size: 14 * 1024 * 1024 };
  const overLimit = { size: 16 * 1024 * 1024 };
  assert.strictEqual(isValidImageSize(underLimit, 15), true);
  assert.strictEqual(isValidImageSize(overLimit, 15), false);
  assert.strictEqual(formatFileSize(1024 * 1024), '1 MB');
});

// --- SUITE 3: IN-MEMORY SESSION STORE & EXPIRY MANAGEMENT ---
console.log('\n--- 3. SESSION STORE LIFECYCLE & PURGE AUDIT ---');
test('Session store adds, retrieves, and purges expired sessions', () => {
  const testId = 'NX-TEST01';
  sessions.set(testId, {
    id: testId,
    status: 'completed',
    style: 'retro-80s',
    inputImageBase64: 'dGVzdA==',
    outputImageUrl: 'https://example.com/test.jpg',
    processingStage: 'completed',
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours old (expired)
    error: null,
  });

  assert.strictEqual(sessions.has(testId), true);
  purgeExpiredSessions();
  assert.strictEqual(sessions.has(testId), false, 'Expired session must be purged after 24h');
});

// --- SUITE 4: CRM STORE, LEADS & CSV EXPORT SECURITY ---
console.log('\n--- 4. CRM WORKFLOW, LEADS & ANTI-INJECTION AUDIT ---');
test('Lead creation and lifecycle state transitions', () => {
  const lead = createLead({
    sessionId: 'NX-ABC123',
    name: 'Priyanshu Test',
    email: 'test@example.com',
    phone: '+91 9876543210',
    style: 'Cyberpunk 2077',
    marketingConsent: true,
    lifecycleStage: 'lead_captured',
    deliveryStatus: 'sent',
  });

  assert.ok(lead.id.startsWith('LEAD-'), 'Lead ID must be generated');
  assert.strictEqual(lead.email, 'test@example.com');
  assert.strictEqual(lead.marketingConsent, true);

  const updated = updateLeadStage(lead.id, 'photo_delivered');
  assert.strictEqual(updated?.lifecycleStage, 'photo_delivered');
});

test('CSV Export neutralizes Formula Injection (CWE-1236)', () => {
  // Inject malicious spreadsheet formulas as names
  createLead({
    sessionId: 'NX-FORMULA',
    name: '=cmd|"/c calc"!A0',
    email: '@malicious.com',
    phone: '+1234567890',
    style: '-2+3*4',
    marketingConsent: false,
    lifecycleStage: 'lead_captured',
    deliveryStatus: 'pending',
  });

  const csv = exportLeadsToCSV();
  assert.ok(csv.includes("'=cmd"), 'Formula starting with = must be escaped with a single quote');
  assert.ok(csv.includes("'@malicious.com") || csv.includes('"\'@malicious.com"'), 'Cell starting with @ must be escaped');
  assert.ok(csv.includes("'-2+3*4") || csv.includes('"\' -2+3*4"') || csv.includes("'-2"), 'Formula starting with - must be escaped');
});

test('Booking inquiry creation and persistence', () => {
  const inquiry = createBookingInquiry({
    name: 'Commercial Host',
    email: 'host@event.com',
    eventType: 'corporate',
    estimatedGuests: 500,
    location: 'Bengaluru Tech Park',
    message: 'Need 2 photo booth stalls for annual summit.',
  });

  assert.ok(inquiry.id.startsWith('INQ-'), 'Inquiry ID must be generated');
  assert.strictEqual(inquiry.status, 'new');
  const inquiries = getBookingInquiries();
  assert.ok(inquiries.some(i => i.id === inquiry.id), 'Inquiry must be queryable');
});

// --- SUITE 5: SITE & SYSTEM CONFIGURATION ---
console.log('\n--- 5. SITE CONFIGURATION AUDIT ---');
test('Site config values adhere to commercial booth standards', () => {
  assert.strictEqual(siteConfig.name, 'NEXORA');
  assert.strictEqual(siteConfig.sessionExpiry, 24 * 60 * 60 * 1000);
  assert.strictEqual(siteConfig.maxFileSize, 15 * 1024 * 1024);
  assert.strictEqual(siteConfig.rateLimit.maxRequests, 10);
});

console.log('\n================================================================');
console.log(` AUDIT TOTAL PASSED: ${passedCount} / ${passedCount} CHECKS`);
console.log('================================================================');
