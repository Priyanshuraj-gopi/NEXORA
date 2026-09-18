import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Nexora Photo Booth',
  description:
    'Technical policy explaining strictly necessary session storage, zero third-party advertising cookies, and local storage usage.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#08090C] text-[#F9FAFB] py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Application</span>
        </Link>

        <header className="space-y-2 border-b border-[#212530] pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
          <p className="text-sm text-[#9CA3AF]">
            Effective Date: September 18, 2026. Last Updated: September 18, 2026.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-[#D1D5DB]">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. What Are Cookies</h2>
            <p>
              Cookies and local browser storage are small data files placed on your device to enable
              core functional features during your visit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Cookies We Use</h2>
            <p>
              Nexora operates with strict privacy-by-design principles. We do not use third-party
              advertising cookies, behavioral trackers, or cross-site tracking pixels.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-[#212530] text-xs">
                <thead>
                  <tr className="bg-[#111319] text-white">
                    <th className="p-3 border border-[#212530]">Storage Item</th>
                    <th className="p-3 border border-[#212530]">Type</th>
                    <th className="p-3 border border-[#212530]">Purpose</th>
                    <th className="p-3 border border-[#212530]">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-[#9CA3AF]">
                  <tr>
                    <td className="p-3 border border-[#212530] font-mono">nexora_cookie_consent</td>
                    <td className="p-3 border border-[#212530]">Local Storage</td>
                    <td className="p-3 border border-[#212530]">Remembers user cookie consent choices.</td>
                    <td className="p-3 border border-[#212530]">1 Year</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[#212530] font-mono">session_token</td>
                    <td className="p-3 border border-[#212530]">Session Memory</td>
                    <td className="p-3 border border-[#212530]">Enables QR-code mobile image lookup.</td>
                    <td className="p-3 border border-[#212530]">24 Hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Managing Preferences</h2>
            <p>
              You can accept or decline non-essential technical preferences via our Cookie Consent
              Banner, or configure your browser to reject cookies entirely. Disabling local storage
              may prevent your session preferences from persisting.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

