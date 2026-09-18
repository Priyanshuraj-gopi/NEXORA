export interface SessionRecord {
  id: string;
  status: string;
  style: string;
  inputImageBase64: string;
  outputImageUrl: string | null;
  processingStage: string | null;
  createdAt: Date;
  error: string | null;
  genderHint?: string;
}

const globalForSessions = globalThis as unknown as {
  sessions?: Map<string, SessionRecord>;
};

// Guarantee singleton across all Next.js route chunks in both dev and production
export const sessions = globalForSessions.sessions ?? new Map<string, SessionRecord>();
globalForSessions.sessions = sessions;

const MAX_SESSIONS = 100;
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Periodically purges sessions older than 24h and caps in-memory storage to prevent heap exhaustion.
 */
export function purgeExpiredSessions() {
  const now = Date.now();
  const thirtyMinutesAgo = now - 30 * 60 * 1000;

  for (const [id, session] of sessions.entries()) {
    const age = now - session.createdAt.getTime();
    if (age > SESSION_EXPIRY_MS) {
      sessions.delete(id);
    } else if (session.status === 'completed' && session.createdAt.getTime() < thirtyMinutesAgo && session.inputImageBase64) {
      // Free volatile base64 memory while keeping result URL and analytics intact
      session.inputImageBase64 = '';
    }
  }

  // If still above max capacity, drop oldest completed or failed sessions
  if (sessions.size > MAX_SESSIONS) {
    const sorted = Array.from(sessions.entries()).sort(
      ([, a], [, b]) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    for (const [id, s] of sorted) {
      if (sessions.size <= MAX_SESSIONS) break;
      if (s.status === 'completed' || s.status === 'failed') {
        sessions.delete(id);
      }
    }
  }
}