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
} from 'lucide-react';
import { STYLES_SEED } from '@/config/styles-seed';

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
                    {telemetry?.hasGemini ? 'Gemini 3.6 Flash' : 'Standard'}
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
        </div>
      )}
    </div>
  );
}
