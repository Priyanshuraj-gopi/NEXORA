import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Nexora Photo Booth',
  description:
    'Comprehensive privacy policy detailing temporary biometric data processing, image retention limits, zero model training, and your privacy rights.',
};

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-[#9CA3AF]">
            Effective Date: September 18, 2026. Last Updated: September 18, 2026.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-[#D1D5DB]">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">1. Introduction</h2>
            <p>
              Nexora (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) provides an automated digital photo booth service for
              live events, exhibitions, and online demonstrations. This Privacy Policy outlines how
              we collect, process, and protect your personal data, specifically photographic images
              and biometric facial representations, in accordance with applicable global data
              protection regulations, including the General Data Protection Regulation (GDPR), the
              California Consumer Privacy Act (CCPA), and the Digital Personal Data Protection Act
              (DPDP).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">
              2. Biometric and Facial Data Processing Notice
            </h2>
            <p>
              When you capture a selfie or upload a photograph to Nexora, our system processes the
              visual content to perform the requested stylistic transformation.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-[#9CA3AF]">
              <li>
                <strong className="text-white">Purpose:</strong> Images are processed solely to
                apply the chosen aesthetic transformation and generate your requested output.
              </li>
              <li>
                <strong className="text-white">No Machine Learning Training:</strong> Your
                photographs and derived biometric features are never used to train, retrain, or
                improve public or proprietary AI foundation models.
              </li>
              <li>
                <strong className="text-white">Volatile Temporary Retention:</strong> Images are
                held temporarily in volatile system storage for a maximum of 24 hours to enable
                QR-code mobile retrieval, after which they are permanently purged.
              </li>
              <li>
                <strong className="text-white">No Identity Profiling:</strong> We do not match
                your face against facial recognition databases, law enforcement databases, or
                external identity registries.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Information We Collect</h2>
            <p>We practice strict data minimization. We only collect:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-[#9CA3AF]">
              <li>
                <strong className="text-white">User-Provided Images:</strong> The single photo you
                capture via your camera or upload via file selector.
              </li>
              <li>
                <strong className="text-white">Technical Session Data:</strong> Ephemeral session
                identifiers, selected style preferences, and anonymized generation timestamps.
              </li>
              <li>
                <strong className="text-white">Zero Tracking Cookies:</strong> We do not use
                third-party marketing cookies, cross-site trackers, or behavioral profiling tools.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Legal Basis for Processing</h2>
            <p>
              We process your photographic data exclusively upon your explicit, informed consent,
              provided via our pre-capture checkbox prior to taking or uploading a photo. You retain
              the right to withdraw consent at any time prior to generation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Data Sharing and Third Parties</h2>
            <p>
              We do not sell, rent, or monetize your images or personal data. To execute the
              stylistic transformation, your image data may be processed via secure, encrypted API
              connections to certified cloud processing infrastructure under strict data processing
              agreements that prohibit storage or model training.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">6. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you have the right to request immediate erasure of your
              session data, access information regarding your processing session, and lodge a
              complaint with your relevant supervisory authority. Because sessions expire
              automatically within 24 hours, data deletion occurs routinely by system design.
            </p>
          </section>

          <section className="space-y-3 border-t border-[#212530] pt-6">
            <h2 className="text-lg font-semibold text-white">7. Data Controller Contact</h2>
            <p>
              For privacy inquiries, data deletion requests, or regulatory questions, contact our
              designated Data Protection Officer at:
            </p>
            <div className="p-4 rounded-lg bg-[#111319] border border-[#212530] font-mono text-xs text-[#9CA3AF] space-y-1">
              <p>Email: privacy@nexora-booth.internal</p>
              <p>Organization: Nexora Digital Systems</p>
              <p>Subject Line: Data Subject Access Request</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

