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