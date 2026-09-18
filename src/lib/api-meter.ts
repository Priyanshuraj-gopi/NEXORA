// Nexora AI Photo Booth — Real-time API Usage & Limit Meter

export interface ApiCallRecord {
  timestamp: number;
  durationMs: number;
  success: boolean;
  model: string;
}

export interface ApiProviderMetrics {
  name: string;
  provider: 'gemini' | 'flux' | 'huggingface' | 'offline';
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  dailyLimit: number | null; // null = uncapped
  rpmLimit: number | null;
  estimatedCostPerCall: number;
  recentCalls: ApiCallRecord[];
  averageLatencyMs: number;
  lastCallAt: string | null;
}

export interface ApiMeterStore {
  gemini: ApiProviderMetrics;
  flux: ApiProviderMetrics;
  huggingFace: ApiProviderMetrics;
  offline: ApiProviderMetrics;
  sessionStartedAt: string;
  lastResetAt: string;
}

declare global {
  var __nexora_apiMeter: ApiMeterStore | undefined;
}

function createInitialStore(): ApiMeterStore {
  const now = new Date().toISOString();
  return {
    gemini: {
      name: 'Google Gemini Multimodal Vision (Identity Anchor)',
      provider: 'gemini',
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      dailyLimit: 1500, // Google Free Tier: 1,500 RPD
      rpmLimit: 15,    // Google Free Tier: 15 RPM
      estimatedCostPerCall: 0, // $0.00 Free Tier
      recentCalls: [],
      averageLatencyMs: 0,
      lastCallAt: null,
    },
    flux: {
      name: 'Pollinations FLUX.1 Photorealistic Neural Engine',
      provider: 'flux',
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      dailyLimit: null, // Community Free SOTA (Uncapped)
      rpmLimit: null,
      estimatedCostPerCall: 0,
      recentCalls: [],
      averageLatencyMs: 0,
      lastCallAt: null,
    },
    huggingFace: {
      name: 'Hugging Face Serverless Inference (Secondary Fallback)',
      provider: 'huggingface',
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      dailyLimit: 1000,
      rpmLimit: 30,
      estimatedCostPerCall: 0,
      recentCalls: [],
      averageLatencyMs: 0,
      lastCallAt: null,
    },
    offline: {
      name: 'Local Canvas RGBA Image Processing (Offline Mode)',
      provider: 'offline',
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      dailyLimit: null,
      rpmLimit: null,
      estimatedCostPerCall: 0,
      recentCalls: [],
      averageLatencyMs: 0,
      lastCallAt: null,
    },
    sessionStartedAt: now,
    lastResetAt: now,
  };
}

export const apiMeter: ApiMeterStore =
  globalThis.__nexora_apiMeter ?? createInitialStore();
globalThis.__nexora_apiMeter = apiMeter;

/**
 * Record a Gemini Multimodal Vision API call
 */
export function recordGeminiCall(success: boolean, durationMs: number, model: string = 'gemini-flash-latest') {
  const m = apiMeter.gemini;
  m.totalCalls += 1;
  if (success) {
    m.successfulCalls += 1;
  } else {
    m.failedCalls += 1;
  }
  m.lastCallAt = new Date().toISOString();

  // Update running average latency
  if (m.averageLatencyMs === 0) {
    m.averageLatencyMs = Math.round(durationMs);
  } else {
    m.averageLatencyMs = Math.round((m.averageLatencyMs * 0.7) + (durationMs * 0.3));
  }

  // Store in recent sliding window (last 60 calls)
  m.recentCalls.push({
    timestamp: Date.now(),
    durationMs,
    success,
    model,
  });
  if (m.recentCalls.length > 60) {
    m.recentCalls.shift();
  }
}

/**
 * Record a Pollinations FLUX.1 generation call
 */
export function recordFluxCall(success: boolean, durationMs: number, model: string = 'flux') {
  const m = apiMeter.flux;
  m.totalCalls += 1;
  if (success) {
    m.successfulCalls += 1;
  } else {
    m.failedCalls += 1;
  }
  m.lastCallAt = new Date().toISOString();

  if (m.averageLatencyMs === 0) {
    m.averageLatencyMs = Math.round(durationMs);
  } else {
    m.averageLatencyMs = Math.round((m.averageLatencyMs * 0.7) + (durationMs * 0.3));
  }

  m.recentCalls.push({
    timestamp: Date.now(),
    durationMs,
    success,
    model,
  });
  if (m.recentCalls.length > 60) {
    m.recentCalls.shift();
  }
}

/**
 * Record a Hugging Face or Offline fallback
 */
export function recordFallbackCall(isHuggingFace: boolean, durationMs: number = 0) {
  const target = isHuggingFace ? apiMeter.huggingFace : apiMeter.offline;
  target.totalCalls += 1;
  target.successfulCalls += 1;
  target.lastCallAt = new Date().toISOString();
  if (durationMs > 0) {
    target.averageLatencyMs = Math.round(durationMs);
  }
}

/**
 * Calculate active RPM (calls in last 60 seconds)
 */
function calculateRpm(recentCalls: ApiCallRecord[]): number {
  const oneMinuteAgo = Date.now() - 60000;
  return recentCalls.filter((c) => c.timestamp >= oneMinuteAgo).length;
}

/**
 * Get comprehensive usage telemetry snapshot
 */
export function getApiUsageSummary() {
  // Clean old records older than 10 minutes to save memory
  const tenMinutesAgo = Date.now() - 600000;
  apiMeter.gemini.recentCalls = apiMeter.gemini.recentCalls.filter((c) => c.timestamp >= tenMinutesAgo);
  apiMeter.flux.recentCalls = apiMeter.flux.recentCalls.filter((c) => c.timestamp >= tenMinutesAgo);

  const geminiRpm = calculateRpm(apiMeter.gemini.recentCalls);
  const geminiDailyLimit = apiMeter.gemini.dailyLimit || 1500;
  const geminiRemaining = Math.max(0, geminiDailyLimit - apiMeter.gemini.totalCalls);
  const geminiPercentUsed = Math.min(100, Math.round((apiMeter.gemini.totalCalls / geminiDailyLimit) * 1000) / 10);

  const fluxRpm = calculateRpm(apiMeter.flux.recentCalls);

  return {
    gemini: {
      name: apiMeter.gemini.name,
      totalCalls: apiMeter.gemini.totalCalls,
      successfulCalls: apiMeter.gemini.successfulCalls,
      failedCalls: apiMeter.gemini.failedCalls,
      dailyLimit: geminiDailyLimit,
      remainingToday: geminiRemaining,
      percentUsed: geminiPercentUsed,
      currentRpm: geminiRpm,
      rpmLimit: apiMeter.gemini.rpmLimit || 15,
      isNearLimit: geminiPercentUsed > 80,
      isRateThrottled: geminiRpm >= (apiMeter.gemini.rpmLimit || 15),
      avgLatencyMs: apiMeter.gemini.averageLatencyMs,
      lastCallAt: apiMeter.gemini.lastCallAt,
      costTotal: '$0.00',
    },
    flux: {
      name: apiMeter.flux.name,
      totalCalls: apiMeter.flux.totalCalls,
      successfulCalls: apiMeter.flux.successfulCalls,
      failedCalls: apiMeter.flux.failedCalls,
      limitType: 'Uncapped Free Tier',
      currentRpm: fluxRpm,
      avgLatencyMs: apiMeter.flux.averageLatencyMs,
      lastCallAt: apiMeter.flux.lastCallAt,
      costTotal: '$0.00',
    },
    huggingFace: {
      name: apiMeter.huggingFace.name,
      totalCalls: apiMeter.huggingFace.totalCalls,
      lastCallAt: apiMeter.huggingFace.lastCallAt,
    },
    offline: {
      name: apiMeter.offline.name,
      totalCalls: apiMeter.offline.totalCalls,
      lastCallAt: apiMeter.offline.lastCallAt,
    },
    summary: {
      totalAiInferences: apiMeter.gemini.totalCalls + apiMeter.flux.totalCalls + apiMeter.huggingFace.totalCalls,
      totalCostEstimated: '$0.00 (All Free Tier)',
      sessionStartedAt: apiMeter.sessionStartedAt,
      lastResetAt: apiMeter.lastResetAt,
    },
  };
}

/**
 * Reset metrics (e.g. for a new stall shift)
 */
export function resetApiUsageMetrics() {
  const fresh = createInitialStore();
  apiMeter.gemini = fresh.gemini;
  apiMeter.flux = fresh.flux;
  apiMeter.huggingFace = fresh.huggingFace;
  apiMeter.offline = fresh.offline;
  apiMeter.lastResetAt = new Date().toISOString();
  return getApiUsageSummary();
}
