// Nexora AI Photo Booth — Real-time Dual-API Usage & Limit Meter (OpenAI + Google Gemini)

export interface ApiCallRecord {
  timestamp: number;
  durationMs: number;
  success: boolean;
  model: string;
  errorType?: string;
}

export interface ApiProviderMetrics {
  name: string;
  provider: 'openai' | 'gemini' | 'flux' | 'huggingface' | 'offline';
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  quotaErrors: number;
  dailyLimit: number | null; // null = uncapped
  rpmLimit: number | null;
  estimatedCostPerCall: number;
  recentCalls: ApiCallRecord[];
  averageLatencyMs: number;
  lastCallAt: string | null;
  isQuotaExceeded: boolean;
}

export interface ApiMeterStore {
  openai: ApiProviderMetrics;
  gemini: ApiProviderMetrics;
  flux: ApiProviderMetrics;
  huggingFace: ApiProviderMetrics;
  offline: ApiProviderMetrics;
  activeVisionProvider: 'openai' | 'gemini';
  activeGenerationProvider: 'openai' | 'gemini';
  failoverEngaged: boolean;
  lastFailoverReason: string | null;
  sessionStartedAt: string;
  lastResetAt: string;
}

declare global {
  var __nexora_apiMeter: ApiMeterStore | undefined;
}

function createInitialStore(): ApiMeterStore {
  const now = new Date().toISOString();
  return {
    openai: {
      name: 'OpenAI DALL-E & GPT-4o (Primary Engine)',
      provider: 'openai',
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      quotaErrors: 0,
      dailyLimit: 200, // OpenAI Standard Free/Trial Image Limit
      rpmLimit: 50,    // Rate limit
      estimatedCostPerCall: 0.04,
      recentCalls: [],
      averageLatencyMs: 0,
      lastCallAt: null,
      isQuotaExceeded: false,
    },
    gemini: {
      name: 'Google Gemini & FLUX.1 (Failover Engine)',
      provider: 'gemini',
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      quotaErrors: 0,
      dailyLimit: 1500, // Google Free Tier: 1,500 RPD
      rpmLimit: 15,    // Google Free Tier: 15 RPM
      estimatedCostPerCall: 0, // $0.00 Free Tier
      recentCalls: [],
      averageLatencyMs: 0,
      lastCallAt: null,
      isQuotaExceeded: false,
    },
    flux: {
      name: 'Pollinations FLUX.1 Photorealistic Neural Engine',
      provider: 'flux',
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      quotaErrors: 0,
      dailyLimit: null, // Community Free SOTA (Uncapped)
      rpmLimit: null,
      estimatedCostPerCall: 0,
      recentCalls: [],
      averageLatencyMs: 0,
      lastCallAt: null,
      isQuotaExceeded: false,
    },
    huggingFace: {
      name: 'Hugging Face Serverless Inference (Secondary Fallback)',
      provider: 'huggingface',
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      quotaErrors: 0,
      dailyLimit: 1000,
      rpmLimit: 30,
      estimatedCostPerCall: 0,
      recentCalls: [],
      averageLatencyMs: 0,
      lastCallAt: null,
      isQuotaExceeded: false,
    },
    offline: {
      name: 'Local Canvas RGBA Image Processing (Offline Mode)',
      provider: 'offline',
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      quotaErrors: 0,
      dailyLimit: null,
      rpmLimit: null,
      estimatedCostPerCall: 0,
      recentCalls: [],
      averageLatencyMs: 0,
      lastCallAt: null,
      isQuotaExceeded: false,
    },
    activeVisionProvider: 'openai',
    activeGenerationProvider: 'openai',
    failoverEngaged: false,
    lastFailoverReason: null,
    sessionStartedAt: now,
    lastResetAt: now,
  };
}

export const apiMeter: ApiMeterStore =
  globalThis.__nexora_apiMeter ?? createInitialStore();
globalThis.__nexora_apiMeter = apiMeter;

/**
 * Record an OpenAI API call with duration and status
 */
export function recordOpenAiCall(
  success: boolean,
  durationMs: number,
  model: string = 'dall-e-3',
  errorType?: string
) {
  const m = apiMeter.openai;
  m.totalCalls += 1;
  if (success) {
    m.successfulCalls += 1;
  } else {
    m.failedCalls += 1;
    if (errorType === 'insufficient_quota' || errorType === 'rate_limit_exceeded') {
      m.quotaErrors += 1;
      m.isQuotaExceeded = true;
      apiMeter.failoverEngaged = true;
      apiMeter.activeGenerationProvider = 'gemini';
      apiMeter.activeVisionProvider = 'gemini';
      apiMeter.lastFailoverReason = `OpenAI limit reached (${errorType}). Seamlessly switched to Gemini API.`;
    }
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
    errorType,
  });
  if (m.recentCalls.length > 60) {
    m.recentCalls.shift();
  }
}

/**
 * Record a Gemini Multimodal Vision / Generation API call
 */
export function recordGeminiCall(
  success: boolean,
  durationMs: number,
  model: string = 'gemini-flash-latest'
) {
  const m = apiMeter.gemini;
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
 * Record a Pollinations FLUX.1 generation call
 */
export function recordFluxCall(
  success: boolean,
  durationMs: number,
  model: string = 'flux'
) {
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
 * Get comprehensive usage telemetry snapshot with dual live counters
 */
export function getApiUsageSummary() {
  const tenMinutesAgo = Date.now() - 600000;
  apiMeter.openai.recentCalls = apiMeter.openai.recentCalls.filter((c) => c.timestamp >= tenMinutesAgo);
  apiMeter.gemini.recentCalls = apiMeter.gemini.recentCalls.filter((c) => c.timestamp >= tenMinutesAgo);
  apiMeter.flux.recentCalls = apiMeter.flux.recentCalls.filter((c) => c.timestamp >= tenMinutesAgo);

  const openaiRpm = calculateRpm(apiMeter.openai.recentCalls);
  const geminiRpm = calculateRpm(apiMeter.gemini.recentCalls);
  const fluxRpm = calculateRpm(apiMeter.flux.recentCalls);

  const openaiDailyLimit = apiMeter.openai.dailyLimit || 200;
  const openaiRemaining = Math.max(0, openaiDailyLimit - apiMeter.openai.totalCalls);
  const openaiPercentUsed = Math.min(100, Math.round((apiMeter.openai.totalCalls / openaiDailyLimit) * 1000) / 10);

  const geminiDailyLimit = apiMeter.gemini.dailyLimit || 1500;
  const geminiRemaining = Math.max(0, geminiDailyLimit - apiMeter.gemini.totalCalls);
  const geminiPercentUsed = Math.min(100, Math.round((apiMeter.gemini.totalCalls / geminiDailyLimit) * 1000) / 10);

  return {
    openai: {
      name: apiMeter.openai.name,
      totalCalls: apiMeter.openai.totalCalls,
      successfulCalls: apiMeter.openai.successfulCalls,
      failedCalls: apiMeter.openai.failedCalls,
      quotaErrors: apiMeter.openai.quotaErrors,
      isQuotaExceeded: apiMeter.openai.isQuotaExceeded,
      dailyLimit: openaiDailyLimit,
      remainingToday: openaiRemaining,
      percentUsed: openaiPercentUsed,
      currentRpm: openaiRpm,
      rpmLimit: apiMeter.openai.rpmLimit || 50,
      avgLatencyMs: apiMeter.openai.averageLatencyMs,
      lastCallAt: apiMeter.openai.lastCallAt,
      status: apiMeter.openai.isQuotaExceeded
        ? 'Limit Reached (Switched to Gemini)'
        : apiMeter.openai.totalCalls > 0
          ? 'Active (Primary)'
          : 'Ready (Primary)',
      costTotal: `$${(apiMeter.openai.successfulCalls * apiMeter.openai.estimatedCostPerCall).toFixed(2)}`,
    },
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
      status: apiMeter.failoverEngaged ? 'Active (Failover Engaged)' : 'Ready (Standby)',
      costTotal: '$0.00 (Free Tier)',
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
    failoverStatus: {
      isFailoverActive: apiMeter.failoverEngaged,
      activeVisionEngine: apiMeter.activeVisionProvider,
      activeGenerationEngine: apiMeter.activeGenerationProvider,
      reason: apiMeter.lastFailoverReason,
    },
    summary: {
      totalAiInferences:
        apiMeter.openai.totalCalls +
        apiMeter.gemini.totalCalls +
        apiMeter.flux.totalCalls +
        apiMeter.huggingFace.totalCalls,
      totalCostEstimated: `$${(apiMeter.openai.successfulCalls * apiMeter.openai.estimatedCostPerCall).toFixed(2)}`,
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
  apiMeter.openai = fresh.openai;
  apiMeter.gemini = fresh.gemini;
  apiMeter.flux = fresh.flux;
  apiMeter.huggingFace = fresh.huggingFace;
  apiMeter.activeVisionProvider = fresh.activeVisionProvider;
  apiMeter.activeGenerationProvider = fresh.activeGenerationProvider;
  apiMeter.failoverEngaged = false;
  apiMeter.lastFailoverReason = null;
  apiMeter.lastResetAt = new Date().toISOString();
  return getApiUsageSummary();
}

/**
 * Check if OpenAI is available and has not exceeded quota
 */
export function canUseOpenAI(): boolean {
  return !apiMeter.openai.isQuotaExceeded;
}
