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

declare global {
  var __nexora_sessions: Map<string, SessionRecord> | undefined;
}

// Guarantee singleton across all Next.js route chunks in both dev and production
export const sessions: Map<string, SessionRecord> =
  globalThis.__nexora_sessions ?? new Map<string, SessionRecord>();
globalThis.__nexora_sessions = sessions;
