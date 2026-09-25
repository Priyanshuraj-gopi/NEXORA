import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | Nexora Photo Booth',
  description:
    'Policy regarding digital image outputs, physical booth activations, and service dispute resolutions.',
};

export default function RefundPolicyPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
          <p className="text-sm text-[#9CA3AF]">
            Effective Date: September 18, 2026. Last Updated: September 18, 2026.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-[#D1D5DB]">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Free Demonstration and Event Tiers</h2>
            <p>
              Standard event stall activations and web demonstrations of Nexora are provided free of
              charge for attendees. Where no monetary payment was collected, refund claims are not
              applicable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Commercial Activations and Digital Goods</h2>
            <p>
              For ticketed or commercial booth activations where premium digital tokens or physical
              printouts are purchased:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-[#9CA3AF]">
              <li>
                <strong className="text-white">Technical Failure:</strong> If a technical failure
                prevents your image from generating or being retrieved via QR code, you are entitled
                to an immediate complimentary retake or a full refund from the stall manager.
              </li>
              <li>
                <strong className="text-white">Subjective Dissatisfaction:</strong> Due to the
                nature of generative stylistic rendering, minor stylistic variations or subjective
                artistic preferences do not qualify for a cash refund once digital outputs have been
                downloaded. Complimentary re-shoots are provided at the stall operator&apos;s discretion.
              </li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-[#212530] pt-6">
            <h2 className="text-lg font-semibold text-white">3. Resolution Contact</h2>
            <p className="text-[#9CA3AF]">
              Direct payment dispute inquiries to: refunds@nexorastall.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

