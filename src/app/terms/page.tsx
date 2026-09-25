import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Nexora Photo Booth',
  description:
    'Terms of service, acceptable use policy, and intellectual property terms for the Nexora photo booth application.',
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
          <p className="text-sm text-[#9CA3AF]">
            Effective Date: September 18, 2026. Last Updated: September 18, 2026.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-[#D1D5DB]">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Agreement to Terms</h2>
            <p>
              By accessing or using the Nexora Photo Booth application (the &quot;Service&quot;), you agree to
              be legally bound by these Terms and Conditions. If you do not agree to these terms, do
              not access or use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Acceptable Use and Third-Party Consent</h2>
            <p>
              You represent and warrant that you are at least 18 years of age (or have explicit
              parental/guardian consent). You agree strictly to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-[#9CA3AF]">
              <li>Only upload or capture photographs of yourself or individuals who have provided explicit, informed consent to be photographed and transformed.</li>
              <li>Never upload sexually explicit, defamatory, harassing, abusive, or unlawful imagery.</li>
              <li>Never attempt to reverse engineer, disrupt, or exploit the application infrastructure or API endpoints.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Intellectual Property and Output Ownership</h2>
            <p>
              You retain all ownership rights in the original photographs you upload. To the extent
              permitted by applicable law, you own the resulting transformed images generated for
              your personal, non-commercial use. Nexora retains all proprietary rights, trademarks,
              and brand signatures associated with the Nexora software, logos, and interface.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of
              any kind, either express or implied. Due to the stochastic nature of generative machine
              learning, stylistic outputs may vary and visual likeness is not guaranteed to be
              exact.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Nexora and its operators shall not
              be liable for any indirect, incidental, special, consequential, or punitive damages
              arising out of or related to your use of the Service.
            </p>
          </section>

          <section className="space-y-3 border-t border-[#212530] pt-6">
            <h2 className="text-lg font-semibold text-white">6. Contact Information</h2>
            <div className="p-4 rounded-lg bg-[#111319] border border-[#212530] font-mono text-xs text-[#9CA3AF]">
              <p>Nexora Legal Department: legal@nexorastall.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

