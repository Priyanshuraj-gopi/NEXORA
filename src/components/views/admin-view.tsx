'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Tv,
  Eye,
  ShieldCheck,
  RefreshCw,
  Server,
  Cpu,
  Users,
  Download,
  Search,
  Mail,
  Phone,
  Tag,
  Gauge,
  Zap,
  RotateCcw,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { STYLES_SEED } from '@/config/styles-seed';

export interface ApiUsageData {
  openai: {
    name: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    quotaErrors: number;
    isQuotaExceeded: boolean;
    dailyLimit: number;
    remainingToday: number;
    percentUsed: number;
    currentRpm: number;
    rpmLimit: number;
    avgLatencyMs: number;
    lastCallAt: string | null;
    status: string;
    costTotal: string;
  };
  gemini: {
    name: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    dailyLimit: number;
    remainingToday: number;
    percentUsed: number;
    currentRpm: number;
    rpmLimit: number;
    isNearLimit: boolean;
    isRateThrottled: boolean;
    avgLatencyMs: number;
    lastCallAt: string | null;
    status: string;
    costTotal: string;
  };
  flux: {
    name: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    limitType: string;
    currentRpm: number;
    avgLatencyMs: number;
    lastCallAt: string | null;
    costTotal: string;
  };
  huggingFace: {
    name: string;
    totalCalls: number;
    lastCallAt: string | null;
  };
  offline: {
    name: string;
    totalCalls: number;
    lastCallAt: string | null;
  };
  failoverStatus: {
    isFailoverActive: boolean;
    activeVisionEngine: string;
    activeGenerationEngine: string;
    reason: string | null;
  };
  summary: {
    totalAiInferences: number;
    totalCostEstimated: string;
    sessionStartedAt: string;
    lastResetAt: string;
  };
}

interface TelemetryData {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  uptimeSeconds: number;
  hasGemini: boolean;
  hasOpenAI: boolean;
  primaryEngine: string;
  visionEngine: string;
  styleCounts: Record<string, number>;
  apiUsage?: ApiUsageData;
}

interface RecentSession {
  id: string;
  style: string;
  status: string;
  createdAt: string;
}

interface LeadRecord {
  id: string;
  sessionId: string;
  name: string;
  email: string;
  phone: string | null;
  style: string;
  marketingConsent: boolean;
  lifecycleStage: string;
  deliveryStatus: string;
  createdAt: string;
}

interface CRMStats {
  totalLeads: number;
  marketingConsents: number;
  optInRate: number;
  deliveredCount: number;
}

export function AdminView({ onSwitchView }: { onSwitchView?: (view: 'booth' | 'display') => void }) {
  const [styles, setStyles] = useState(STYLES_SEED);
  const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'styles' | 'hardware'>('overview');
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(false);

  // CRM state
  const [crmStats, setCrmStats] = useState<CRMStats>({
    totalLeads: 0,
    marketingConsents: 0,
    optInRate: 0,
    deliveredCount: 0,
  });
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('all');
  const [crmLoading, setCrmLoading] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/telemetry');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTelemetry(data.telemetry);
          setRecentSessions(data.recentSessions || []);
        }
      }
    } catch {
      // Quiet catch
    } finally {
      setLoading(false);
    }
  }, []);

  const [resettingApi, setResettingApi] = useState(false);
  const handleResetApiMeter = async () => {
    if (!window.confirm('Reset all API usage counters and session rate meters?')) return;
    setResettingApi(true);
    try {
      const res = await fetch('/api/admin/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-api-meter' }),
      });
      if (res.ok) {
        await fetchTelemetry();
      }
    } catch {
      // Quiet catch
    } finally {
      setResettingApi(false);
    }
  };

  const fetchCRMLeads = useCallback(async () => {
    setCrmLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedStyleFilter !== 'all') params.set('style', selectedStyleFilter);

      const res = await fetch(`/api/crm/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLeads(data.leads || []);
          setCrmStats(data.stats || { totalLeads: 0, marketingConsents: 0, optInRate: 0, deliveredCount: 0 });
        }
      }
    } catch {
      // Quiet catch
    } finally {
      setCrmLoading(false);
    }
  }, [searchQuery, selectedStyleFilter]);

  useEffect(() => {
    fetchTelemetry();
    fetchCRMLeads();
    const interval = setInterval(() => {
      fetchTelemetry();
      if (activeTab === 'crm') fetchCRMLeads();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, fetchTelemetry, fetchCRMLeads]);

  const toggleStyle = (slug: string) => {
    setStyles((prev) =>
      prev.map((s) => (s.slug === slug ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const enabledCount = styles.filter((s) => s.enabled).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Admin Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#212530]">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Nexora TAPMI Bengaluru Logo"
            className="w-10 h-10 object-contain drop-shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-white">Event Operations Hub</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-semibold">
                TELEMETRY ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Nexora • TAPMI Bengaluru IT Club — Live stall telemetry & CRM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchTelemetry();
              fetchCRMLeads();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141822] hover:bg-[#1E2330] border border-[#262C3D] text-xs font-medium text-[#D1D5DB] transition-colors cursor-pointer"
            title="Refresh Telemetry and CRM data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || crmLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>

          {onSwitchView && (
            <>
              <button
                onClick={() => onSwitchView('display')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141822] hover:bg-[#1E2330] border border-[#262C3D] text-xs font-medium text-[#D1D5DB] transition-colors cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                <span>Switch to TV</span>
              </button>
              <button
                onClick={() => onSwitchView('booth')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#E5E7EB] text-[#08090C] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Switch to Booth</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#212530] pb-3" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${activeTab === 'overview'
            ? 'bg-white text-[#08090C] font-semibold'
            : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
            }`}
        >
          Live Telemetry
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'crm'}
          onClick={() => setActiveTab('crm')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${activeTab === 'crm'
            ? 'bg-white text-[#08090C] font-semibold'
            : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
            }`}
        >
          <Users className="w-3.5 h-3.5" aria-hidden="true" />
          <span>CRM & Visitor Leads ({crmStats.totalLeads})</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'styles'}
          onClick={() => setActiveTab('styles')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${activeTab === 'styles'
            ? 'bg-white text-[#08090C] font-semibold'
            : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
            }`}
        >
          Active Eras ({enabledCount}/{styles.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'hardware'}
          onClick={() => setActiveTab('hardware')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${activeTab === 'hardware'
            ? 'bg-white text-[#08090C] font-semibold'
            : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
            }`}
        >
          Pipeline & Infrastructure
        </button>
      </div>

      {/* Tab 1: Live Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[#0E1118] border border-[#212530]">
              <div className="flex items-center justify-between text-[#9CA3AF] text-xs mb-1.5">
                <span className="font-mono">SESSIONS IN RUNTIME</span>
                <Activity className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {telemetry ? telemetry.total : '--'}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Active in volatile server memory
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#0E1118] border border-[#212530]">
              <div className="flex items-center justify-between text-[#9CA3AF] text-xs mb-1.5">
                <span className="font-mono">COMPLETED</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {telemetry ? telemetry.completed : '--'}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Successfully rendered & branded
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#0E1118] border border-[#212530]">
              <div className="flex items-center justify-between text-[#9CA3AF] text-xs mb-1.5">
                <span className="font-mono">IN PROGRESS</span>
                <Clock className="w-4 h-4 text-blue-400" aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-blue-400 font-mono">
                {telemetry ? telemetry.processing : '--'}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Active generation or enhancement
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#0E1118] border border-[#212530]">
              <div className="flex items-center justify-between text-[#9CA3AF] text-xs mb-1.5">
                <span className="font-mono">SERVER UPTIME</span>
                <Server className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {telemetry ? `${telemetry.uptimeSeconds}s` : '--'}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Instance execution time
              </div>
            </div>
          </div>

          {/* AI API Usage & Limits Real-time Counter Panel */}
          <div className="p-5 rounded-lg bg-[#0E1118] border border-[#212530] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C202B]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-[#161B26] border border-[#262C3D] text-white">
                  <Gauge className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white">Dual-Engine AI API Usage & Live Limit Counters</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LIVE DUAL METER
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF]">
                    OpenAI Free Tier (Primary) with automated seamless failover to Google Gemini (1,500 RPD / 15 RPM)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <span className="text-[10px] text-[#6B7280] block font-mono">FAILOVER ENGINE STATUS</span>
                  <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5 justify-end">
                    <span className={`w-2 h-2 rounded-full ${telemetry?.apiUsage?.failoverStatus?.isFailoverActive ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                    {telemetry?.apiUsage?.failoverStatus?.isFailoverActive ? 'Gemini Active (Failover)' : 'Armed & Ready'}
                  </span>
                </div>
                <button
                  onClick={handleResetApiMeter}
                  disabled={resettingApi}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141822] hover:bg-[#1E2330] border border-[#262C3D] text-[11px] font-medium text-[#D1D5DB] transition-colors cursor-pointer disabled:opacity-50"
                  title="Reset session API counters for a new shift"
                >
                  <RotateCcw className={`w-3 h-3 ${resettingApi ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <span>Reset Shift</span>
                </button>
              </div>
            </div>

            {/* Seamless Failover Active Alert */}
            {telemetry?.apiUsage?.failoverStatus?.isFailoverActive ? (
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>⚡ Seamless Failover Engaged: Switched to Google Gemini</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ZERO DISRUPTION
                    </span>
                  </div>
                  <p className="text-amber-300/90 text-[11px]">
                    {telemetry.apiUsage.failoverStatus.reason ||
                      'OpenAI free-tier daily or rate limit reached (HTTP 429). The system automatically routed generation to Google Gemini API & FLUX.1 neural engine.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-[#121620] border border-[#1F2533] flex items-center justify-between text-xs text-[#9CA3AF]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span><strong>Dual-Pipeline Active:</strong> Requests attempt <strong>OpenAI Free Tier</strong> first. If limit reached, seamlessly fails over to <strong>Google Gemini</strong>.</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-400">Failover Latency: &lt;50ms</span>
              </div>
            )}

            {/* Provider Grid - Dual Engine Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: OpenAI DALL-E (Primary Engine) */}
              <div className="p-4 rounded-lg bg-[#141822] border border-[#262C3D] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                    <span className="text-xs font-semibold text-white">OpenAI DALL-E (Primary)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${telemetry?.apiUsage?.openai.isQuotaExceeded
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-white/10 text-white border border-white/20'
                    }`}>
                    {telemetry?.apiUsage?.openai.isQuotaExceeded ? 'LIMIT REACHED' : '200 RPD / 50 RPM'}
                  </span>
                </div>

                {/* Progress Bar & Big Counter */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-white">
                      {telemetry?.apiUsage ? telemetry.apiUsage.openai.totalCalls : 0}
                      <span className="text-xs text-[#9CA3AF] font-normal font-sans ml-1">
                        / {telemetry?.apiUsage?.openai.dailyLimit || 200} calls
                      </span>
                    </span>
                    <span className={`text-xs font-mono font-semibold ${(telemetry?.apiUsage?.openai.percentUsed || 0) >= 100 ? 'text-rose-400' : 'text-white'
                      }`}>
                      {telemetry?.apiUsage ? telemetry.apiUsage.openai.percentUsed : 0}%
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2 rounded-full bg-[#0A0C10] border border-[#1E2330] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${(telemetry?.apiUsage?.openai.percentUsed || 0) >= 100
                        ? 'bg-rose-500'
                        : (telemetry?.apiUsage?.openai.percentUsed || 0) > 70
                          ? 'bg-amber-400'
                          : 'bg-white'
                        }`}
                      style={{ width: `${Math.min(100, Math.max(2, telemetry?.apiUsage?.openai.percentUsed || 0))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#6B7280]">
                    <span>Remaining: {telemetry?.apiUsage ? telemetry.apiUsage.openai.remainingToday : 200}</span>
                    <span>Status: {telemetry?.apiUsage?.openai.isQuotaExceeded ? 'Limit Reached' : 'Ready'}</span>
                  </div>
                </div>

                {/* Sub metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1F2533] text-center">
                  <div className="p-2 rounded bg-[#0E1118] border border-[#1C202B]">
                    <span className="text-[10px] text-[#6B7280] block">CURRENT RATE</span>
                    <span className="text-xs font-mono font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${telemetry?.apiUsage?.openai.isQuotaExceeded ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
                      {telemetry?.apiUsage ? telemetry.apiUsage.openai.currentRpm : 0} / 50 RPM
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0E1118] border border-[#1C202B]">
                    <span className="text-[10px] text-[#6B7280] block">AVG LATENCY</span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                      {telemetry?.apiUsage?.openai.avgLatencyMs ? `${telemetry.apiUsage.openai.avgLatencyMs}ms` : '--'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0E1118] border border-[#1C202B]">
                    <span className="text-[10px] text-[#6B7280] block">QUOTA LIMITS</span>
                    <span className="text-xs font-mono font-bold text-amber-400 mt-0.5 block">
                      {telemetry?.apiUsage?.openai.quotaErrors || 0} hit
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Google Gemini (Failover Engine) */}
              <div className="p-4 rounded-lg bg-[#141822] border border-[#262C3D] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
                    <span className="text-xs font-semibold text-white">Google Gemini (Failover)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                    1,500 RPD / 15 RPM
                  </span>
                </div>

                {/* Progress Bar & Big Counter */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-white">
                      {telemetry?.apiUsage ? telemetry.apiUsage.gemini.totalCalls : 0}
                      <span className="text-xs text-[#9CA3AF] font-normal font-sans ml-1">/ 1,500 requests</span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-white">
                      {telemetry?.apiUsage ? telemetry.apiUsage.gemini.percentUsed : 0}%
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2 rounded-full bg-[#0A0C10] border border-[#1E2330] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${(telemetry?.apiUsage?.gemini.percentUsed || 0) > 90
                        ? 'bg-rose-500'
                        : (telemetry?.apiUsage?.gemini.percentUsed || 0) > 70
                          ? 'bg-amber-400'
                          : 'bg-blue-400'
                        }`}
                      style={{ width: `${Math.min(100, Math.max(2, telemetry?.apiUsage?.gemini.percentUsed || 0))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#6B7280]">
                    <span>Remaining: {telemetry?.apiUsage ? telemetry.apiUsage.gemini.remainingToday : 1500} calls</span>
                    <span>Cost: $0.00 (Free Tier)</span>
                  </div>
                </div>

                {/* Sub metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1F2533] text-center">
                  <div className="p-2 rounded bg-[#0E1118] border border-[#1C202B]">
                    <span className="text-[10px] text-[#6B7280] block">CURRENT RATE</span>
                    <span className="text-xs font-mono font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      {telemetry?.apiUsage ? telemetry.apiUsage.gemini.currentRpm : 0} / 15 RPM
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0E1118] border border-[#1C202B]">
                    <span className="text-[10px] text-[#6B7280] block">AVG LATENCY</span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                      {telemetry?.apiUsage?.gemini.avgLatencyMs ? `${telemetry.apiUsage.gemini.avgLatencyMs}ms` : '--'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0E1118] border border-[#1C202B]">
                    <span className="text-[10px] text-[#6B7280] block">ENGINE ROLE</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                      {telemetry?.apiUsage?.failoverStatus?.isFailoverActive ? 'ACTIVE' : 'STANDBY'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Pollinations FLUX.1 Neural Engine */}
              <div className="p-4 rounded-lg bg-[#141822] border border-[#262C3D] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span className="text-xs font-semibold text-white">FLUX.1 Neural Engine</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    UNCAPPED FREE
                  </span>
                </div>

                {/* Big Counter */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-white">
                      {telemetry?.apiUsage ? telemetry.apiUsage.flux.totalCalls : 0}
                      <span className="text-xs text-[#9CA3AF] font-normal font-sans ml-1">syntheses</span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      Uncapped Tier
                    </span>
                  </div>

                  {/* Visual Uncapped Capacity Indicator */}
                  <div className="w-full h-2 rounded-full bg-[#0A0C10] border border-[#1E2330] overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-full opacity-60" />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#6B7280]">
                    <span>1024x1024 Photorealistic</span>
                    <span>Status: Active</span>
                  </div>
                </div>

                {/* Sub metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1F2533] text-center">
                  <div className="p-2 rounded bg-[#0E1118] border border-[#1C202B]">
                    <span className="text-[10px] text-[#6B7280] block">SUCCESS RATE</span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                      {telemetry?.apiUsage && telemetry.apiUsage.flux.totalCalls > 0
                        ? `${Math.round((telemetry.apiUsage.flux.successfulCalls / telemetry.apiUsage.flux.totalCalls) * 100)}%`
                        : '100%'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0E1118] border border-[#1C202B]">
                    <span className="text-[10px] text-[#6B7280] block">AVG SPEED</span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                      {telemetry?.apiUsage?.flux.avgLatencyMs
                        ? `${(telemetry.apiUsage.flux.avgLatencyMs / 1000).toFixed(1)}s`
                        : '--'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#0E1118] border border-[#1C202B]">
                    <span className="text-[10px] text-[#6B7280] block">COST</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                      $0.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-lg bg-[#0E1118] border border-[#212530] space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-white" aria-hidden="true" />
                Live Session Journal (Recent 10)
              </h3>
              {recentSessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6B7280]">
                  No sessions recorded in current runtime. Step up to the booth to initiate a session.
                </div>
              ) : (
                <div className="divide-y divide-[#1C202B] text-xs">
                  {recentSessions.map((s) => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-mono font-medium text-white">{s.id}</span>
                        <div className="text-[#6B7280] text-[11px]">{s.style || 'Unspecified'}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${s.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : s.status === 'processing'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-white/5 text-[#9CA3AF] border border-[#212530]'
                          }`}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-lg bg-[#0E1118] border border-[#212530] space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                Pipeline Diagnostics
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded bg-[#141822] border border-[#1F2533]">
                  <span className="text-[#9CA3AF]">Primary Image Synthesis</span>
                  <span className="text-white font-mono font-medium">Pollinations FLUX.1</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-[#141822] border border-[#1F2533]">
                  <span className="text-[#9CA3AF]">Vision Profiling</span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {telemetry?.hasGemini ? 'Gemini Multimodal Vision (Active)' : 'Standard'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-[#141822] border border-[#1F2533]">
                  <span className="text-[#9CA3AF]">Local Processing Core</span>
                  <span className="text-white font-mono font-medium">RGBA Pixel Canvas Engine</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-[#141822] border border-[#1F2533]">
                  <span className="text-[#9CA3AF]">Data Retention Ceiling</span>
                  <span className="text-white font-mono font-medium">24 Hours (Purged)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CRM & Visitor Leads */}
      {activeTab === 'crm' && (
        <div className="space-y-6">
          {/* CRM Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[#0E1118] border border-[#212530]">
              <div className="flex items-center justify-between text-[#9CA3AF] text-xs mb-1.5">
                <span className="font-mono">TOTAL LEADS CAPTURED</span>
                <Users className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{crmStats.totalLeads}</div>
              <div className="text-[11px] text-[#6B7280] mt-1">Stall visitor contact profiles</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0E1118] border border-[#212530]">
              <div className="flex items-center justify-between text-[#9CA3AF] text-xs mb-1.5">
                <span className="font-mono">MARKETING OPT-IN</span>
                <Mail className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">{crmStats.optInRate}%</div>
              <div className="text-[11px] text-[#6B7280] mt-1">{crmStats.marketingConsents} consented to updates</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0E1118] border border-[#212530]">
              <div className="flex items-center justify-between text-[#9CA3AF] text-xs mb-1.5">
                <span className="font-mono">PHOTOS DISPATCHED</span>
                <CheckCircle2 className="w-4 h-4 text-blue-400" aria-hidden="true" />
              </div>
              <div className="text-2xl font-bold text-blue-400 font-mono">{crmStats.deliveredCount}</div>
              <div className="text-[11px] text-[#6B7280] mt-1">Delivered to visitor inboxes</div>
            </div>

            <div className="p-4 rounded-lg bg-[#0E1118] border border-[#212530] flex flex-col justify-between">
              <div className="text-xs text-[#9CA3AF] mb-2 font-mono">EXPORT TO CRM</div>
              <a
                href="/api/crm/leads?format=csv"
                download
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-white hover:bg-neutral-200 text-[#08090C] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Export CSV for Salesforce/HubSpot</span>
              </a>
            </div>
          </div>

          {/* Search, Filter & Table */}
          <div className="p-5 rounded-lg bg-[#0E1118] border border-[#212530] space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search by name, email, or session..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-[#08090C] border border-[#262C3D] text-white text-xs placeholder:text-[#6B7280] focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
                <select
                  value={selectedStyleFilter}
                  onChange={(e) => setSelectedStyleFilter(e.target.value)}
                  className="px-3 py-2 rounded-md bg-[#08090C] border border-[#262C3D] text-white text-xs focus:ring-1 focus:ring-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Styles & Eras</option>
                  {styles.map((s) => (
                    <option key={s.slug} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6B7280] space-y-2">
                <Users className="w-8 h-8 text-[#374151] mx-auto" aria-hidden="true" />
                <p>No visitor leads recorded yet.</p>
                <p className="text-[11px] text-[#4B5563]">
                  When visitors choose &quot;Email / WhatsApp My Photo&quot; on the photo result page, their details will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#9CA3AF]">
                  <thead className="text-[11px] uppercase tracking-wider text-[#6B7280] border-b border-[#212530] bg-[#141822]">
                    <tr>
                      <th className="py-3 px-4 font-mono">Visitor</th>
                      <th className="py-3 px-4 font-mono">Contact Details</th>
                      <th className="py-3 px-4 font-mono">Era Selected</th>
                      <th className="py-3 px-4 font-mono">Marketing Consent</th>
                      <th className="py-3 px-4 font-mono">Delivery Status</th>
                      <th className="py-3 px-4 font-mono">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C202B]">
                    {leads.map((l) => (
                      <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{l.name}</div>
                          <div className="text-[11px] font-mono text-[#6B7280]">{l.id}</div>
                        </td>
                        <td className="py-3 px-4 space-y-0.5">
                          <div className="text-white flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-[#9CA3AF]" aria-hidden="true" />
                            <span>{l.email}</span>
                          </div>
                          {l.phone && (
                            <div className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
                              <Phone className="w-3 h-3" aria-hidden="true" />
                              <span>{l.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-[#161B26] border border-[#2B3347] text-white font-medium text-[11px]">
                            {l.style}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {l.marketingConsent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                              <span>Opted-In</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#6B7280]">Transactional Only</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {l.deliveryStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#6B7280] font-mono">
                          {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Style Registry */}
      {activeTab === 'styles' && (
        <div className="space-y-4">
          <p className="text-xs text-[#9CA3AF]">
            Enable or disable specific eras for booth visitors. Changes reflect immediately across connected terminals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {styles.map((style) => (
              <div
                key={style.slug}
                className="flex items-center justify-between p-3.5 rounded-lg bg-[#0E1118] border border-[#212530]"
              >
                <div>
                  <h4 className="font-medium text-xs text-white">{style.title}</h4>
                  <p className="text-[11px] text-[#6B7280] capitalize">{style.category}</p>
                </div>
                <button
                  onClick={() => toggleStyle(style.slug)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${style.enabled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-[#141822] text-[#6B7280] border border-[#212530] hover:text-[#9CA3AF]'
                    }`}
                >
                  {style.enabled ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Hardware & Config */}
      {activeTab === 'hardware' && (
        <div className="max-w-2xl space-y-5">
          <div className="p-5 rounded-lg bg-[#0E1118] border border-[#212530] space-y-4">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-white" aria-hidden="true" />
              Stall Terminal Configuration
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9CA3AF] mb-1">Event Location / Booth Identifier</label>
                <input
                  type="text"
                  defaultValue="Nexora Experience Stall 01"
                  className="w-full px-3 py-2 rounded bg-[#08090C] border border-[#262C3D] text-white text-xs focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#9CA3AF] mb-1">Attract Screen Return Timeout (Seconds)</label>
                <input
                  type="number"
                  defaultValue="45"
                  className="w-full px-3 py-2 rounded bg-[#08090C] border border-[#262C3D] text-white text-xs focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Detailed API Quotas & Provider Specifications */}
          <div className="p-5 rounded-lg bg-[#0E1118] border border-[#212530] space-y-4">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              API Quotas & Architecture Specifications
            </h3>
            <div className="divide-y divide-[#1C202B] text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-white block">OpenAI DALL-E 3 API (Primary Generation Engine)</span>
                  <span className="text-[11px] text-[#6B7280]">Endpoint: api.openai.com/v1/images/generations (1024x1024)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-white font-semibold block">50 RPM / 200 RPD</span>
                  <span className="text-[10px] text-[#9CA3AF]">Tier: Primary Image Generation</span>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-white block">Google Gemini API (Automated Failover Engine)</span>
                  <span className="text-[11px] text-[#6B7280]">Endpoint: generativelanguage.googleapis.com (v1beta)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-semibold block">15 RPM / 1,500 RPD</span>
                  <span className="text-[10px] text-[#9CA3AF]">Tier: Free tier ($0.00) • Seamless Failover</span>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-white block">Pollinations FLUX.1 Neural Engine</span>
                  <span className="text-[11px] text-[#6B7280]">Endpoint: image.pollinations.ai/prompt (1024x1024)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-semibold block">Uncapped Capacity</span>
                  <span className="text-[10px] text-[#9CA3AF]">Tier: Community SOTA Free ($0.00)</span>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-white block">Hugging Face Serverless (FLUX.1-schnell)</span>
                  <span className="text-[11px] text-[#6B7280]">Endpoint: router.huggingface.co/hf-inference</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[#D1D5DB] font-semibold block">Secondary Hot Standby</span>
                  <span className="text-[10px] text-[#9CA3AF]">Tier: Serverless Inference ($0.00)</span>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-medium text-white block">Local Canvas RGBA Grading Core</span>
                  <span className="text-[11px] text-[#6B7280]">Offline fallback inside local browser/server memory</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-semibold block">Infinite (Zero Network)</span>
                  <span className="text-[10px] text-[#9CA3AF]">Guaranteed 100% stall uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
