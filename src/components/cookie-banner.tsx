'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem('nexora_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleConsent = (level: 'essential' | 'all') => {
    localStorage.setItem('nexora_cookie_consent', level);
    setShow(false);
  };

  if (!mounted || !show) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 bg-[#08090C]/95 border-t border-[#212530] backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="p-2 rounded-lg bg-[#111319] border border-[#212530] shrink-0 text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs text-[#9CA3AF] leading-relaxed">
            <p className="font-semibold text-white text-sm">Privacy and Cookie Notice</p>
            <p>
              We use strictly necessary local storage to remember your session and process your
              temporary photo transformations. We do not use third-party tracking or advertising
              cookies. Read our{' '}
              <Link href="/cookies" className="text-white underline hover:text-[#9CA3AF]">
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-white underline hover:text-[#9CA3AF]">
                Privacy Policy
              </Link>{' '}
              for details.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => handleConsent('essential')}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-lg bg-[#111319] hover:bg-[#161922] text-white border border-[#212530] text-xs font-medium transition-colors cursor-pointer"
          >
            Essential Only
          </button>
          <button
            onClick={() => handleConsent('all')}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-colors cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}

