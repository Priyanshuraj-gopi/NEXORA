'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, Tv, SlidersHorizontal, Maximize2, Minimize2, ShieldCheck, Lock } from 'lucide-react';
import { BoothView } from '@/components/views/booth-view';
import { DisplayView } from '@/components/views/display-view';
import { AdminView } from '@/components/views/admin-view';

type MasterMode = 'booth' | 'display' | 'admin';

export default function MasterAppPage() {
  const [activeMode, setActiveMode] = useState<MasterMode>('display');
  const [hideSwitcher, setHideSwitcher] = useState(false);

  return (
    <div className="min-h-screen bg-[#08090C] text-[#F9FAFB] flex flex-col relative selection:bg-white/20">
      {/* Background architectural base */}
      <div className="fixed inset-0 bg-[#08090C] -z-20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(#1E2330_1px,transparent_1px)] [background-size:24px_24px] opacity-25 -z-10 pointer-events-none" />

      {/* Master Top Navigation Bar */}
      {!hideSwitcher && (
        <header className="sticky top-0 z-50 bg-[#0E1118]/90 backdrop-blur-md border-b border-[#212530] transition-all">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Enterprise Official Branding */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Nexora TAPMI Bengaluru IT Club Logo"
                className="w-9 h-9 object-contain drop-shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-bold tracking-[0.2em] text-sm text-white leading-none">NEXORA</span>
                <span className="text-[10px] font-mono text-[#9CA3AF] tracking-tight mt-0.5">TAPMI BENGALURU IT CLUB</span>
              </div>
            </div>

            {/* Master Mode Switcher (Unified URL Control) */}
            <nav
              role="tablist"
              aria-label="Application Mode"
              className="flex items-center p-1 rounded-lg bg-[#141822] border border-[#262C3D]"
            >
              <button
                role="tab"
                aria-selected={activeMode === 'booth'}
                onClick={() => setActiveMode('booth')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${activeMode === 'booth'
                  ? 'bg-white text-[#08090C] font-semibold shadow-sm'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                  }`}
              >
                <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Photo Booth</span>
              </button>

              <button
                role="tab"
                aria-selected={activeMode === 'display'}
                onClick={() => setActiveMode('display')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${activeMode === 'display'
                  ? 'bg-white text-[#08090C] font-semibold shadow-sm'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                  }`}
              >
                <Tv className="w-3.5 h-3.5" aria-hidden="true" />
                <span>TV Display</span>
              </button>

              <button
                role="tab"
                aria-selected={activeMode === 'admin'}
                onClick={() => setActiveMode('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${activeMode === 'admin'
                  ? 'bg-white text-[#08090C] font-semibold shadow-sm'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                  }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Operations</span>
              </button>
            </nav>

            {/* Kiosk / Fullscreen toggle button */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setHideSwitcher(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141822] hover:bg-[#1E2330] border border-[#262C3D] text-xs font-medium text-[#D1D5DB] transition-colors focus:ring-2 focus:ring-white focus:outline-none"
                title="Hide top bar for clean stall kiosk presentation"
                aria-label="Enable Kiosk Presentation Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Kiosk Mode</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Floating restore button when top switcher is hidden */}
      {hideSwitcher && (
        <button
          onClick={() => setHideSwitcher(false)}
          className="fixed bottom-5 right-5 z-50 p-2.5 rounded-lg bg-[#141822] border border-[#262C3D] text-white hover:bg-[#1E2330] shadow-xl transition-all focus:ring-2 focus:ring-white focus:outline-none"
          title="Exit Kiosk Mode (Show Navigation Bar)"
          aria-label="Exit Kiosk Mode"
        >
          <Minimize2 className="w-4 h-4" aria-hidden="true" />
        </button>
      )}

      {/* Active Master View */}
      <div className="flex-1 flex flex-col">
        {activeMode === 'booth' && <BoothView />}
        {activeMode === 'display' && (
          <DisplayView onNavigateToBooth={() => setActiveMode('booth')} />
        )}
        {activeMode === 'admin' && (
          <AdminView onSwitchView={(view) => setActiveMode(view)} />
        )}
      </div>

      {/* Enterprise Legal & Compliance Footer */}
      <footer className="border-t border-[#212530] bg-[#0E1118] text-[#9CA3AF] py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wider">
                <span>NEXORA IMAGING SYSTEMS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1F2430] text-[#D1D5DB] border border-[#2F3545] font-mono">
                  ISO-COMPLIANT
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Commercial event photo transformation technology. Registered stall operations.
              </p>
            </div>

            <nav aria-label="Legal navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <Link href="/contact" className="text-white font-medium hover:underline underline-offset-4 transition-colors">
                Book Event Stall
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                Cookie Policy
              </Link>
              <Link href="/refund" className="hover:text-white transition-colors underline-offset-4 hover:underline">
                Refund Policy
              </Link>
            </nav>
          </div>

          <div className="pt-4 border-t border-[#1C202B] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#6B7280]">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                <strong className="text-[#D1D5DB]">Biometric Data Guarantee:</strong> Ephemeral processing only.
                Facial photographs are stored exclusively in volatile runtime storage and purged permanently after 24 hours.
                Customer photographs are never used to train machine learning models.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-[#9CA3AF] shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                <strong className="text-[#D1D5DB]">Direct Legal Recourse:</strong> Nexora Operations. Questions or data deletion requests: contact{' '}
                <a href="mailto:privacy@nexorastall.com" className="text-white hover:underline">
                  privacy@nexorastall.com
                </a>.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center md:text-left text-[11px] text-[#4B5563]">
            © {new Date().getFullYear()} Nexora Imaging Systems. All rights reserved. Zero third-party behavioral tracking.
          </div>
        </div>
      </footer>
    </div>
  );
}
