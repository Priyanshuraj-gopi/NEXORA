'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [eventType, setEventType] = useState<'corporate' | 'wedding' | 'festival' | 'private_party' | 'exhibition'>('corporate');
  const [eventDate, setEventDate] = useState('');
  const [estimatedGuests, setEstimatedGuests] = useState<number>(150);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          company: company || undefined,
          eventType,
          eventDate: eventDate || undefined,
          estimatedGuests: Number(estimatedGuests) || undefined,
          location: location || undefined,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking inquiry.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-[#F9FAFB] flex flex-col justify-between">
      {/* Header */}
      <header className="p-4 sm:p-6 border-b border-[#212530] bg-[#0E1118]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Return to Booth</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Nexora TAPMI Bengaluru IT Club Logo"
              className="w-7 h-7 object-contain drop-shadow-sm"
            />
            <div className="flex flex-col">
              <span className="font-bold tracking-[0.2em] text-sm text-white leading-none">NEXORA</span>
              <span className="text-[9px] font-mono text-[#9CA3AF] tracking-tight mt-0.5">
                TAPMI BENGALURU IT CLUB
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#161B26] text-[#D1D5DB] border border-[#2B3347] text-xs font-mono uppercase tracking-wider">
            Commercial Stalls & Private Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Book Nexora for Your Event
          </h1>
          <p className="text-sm text-[#9CA3AF] max-w-xl">
            Bring the transformative AI photo booth experience to your conference, exhibition, wedding, or brand activation. Complete the form below for a tailored proposal.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-lg bg-[#0E1118] border border-[#262C3D] text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-white">Inquiry Received</h2>
            <p className="text-sm text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
              Thank you, <span className="text-white font-medium">{name}</span>. Our event operations coordinator will review your dates and follow up with available hardware packages within 24 hours.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#08090C] text-xs font-semibold hover:bg-neutral-200 transition-colors"
              >
                Return to Photo Booth Experience
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-lg bg-[#0E1118] border border-[#262C3D] space-y-6 shadow-xl text-xs">
            {error && (
              <div className="p-3.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#D1D5DB] font-medium mb-1.5" htmlFor="c-name">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="c-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Taylor Swift"
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white placeholder:text-[#6B7280] focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#D1D5DB] font-medium mb-1.5" htmlFor="c-email">
                  Business / Contact Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="c-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="taylor@company.com"
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white placeholder:text-[#6B7280] focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#D1D5DB] font-medium mb-1.5" htmlFor="c-phone">
                  Phone Number
                </label>
                <input
                  id="c-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white placeholder:text-[#6B7280] focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#D1D5DB] font-medium mb-1.5" htmlFor="c-company">
                  Company / Agency (If Applicable)
                </label>
                <input
                  id="c-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Events Ltd"
                  className="w-full px-3.5 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white placeholder:text-[#6B7280] focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#D1D5DB] font-medium mb-1.5" htmlFor="c-type">
                  Event Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="c-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white focus:ring-1 focus:ring-white focus:outline-none cursor-pointer"
                >
                  <option value="corporate">Corporate Exhibition / Expo</option>
                  <option value="wedding">Wedding / Reception</option>
                  <option value="festival">Public Festival / Fair</option>
                  <option value="private_party">Private Celebration</option>
                  <option value="exhibition">Brand Pop-Up Experience</option>
                </select>
              </div>

              <div>
                <label className="block text-[#D1D5DB] font-medium mb-1.5" htmlFor="c-date">
                  Event Date
                </label>
                <input
                  id="c-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#D1D5DB] font-medium mb-1.5" htmlFor="c-guests">
                  Expected Attendees
                </label>
                <input
                  id="c-guests"
                  type="number"
                  min={10}
                  max={50000}
                  value={estimatedGuests}
                  onChange={(e) => setEstimatedGuests(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#D1D5DB] font-medium mb-1.5" htmlFor="c-location">
                City / Venue Location
              </label>
              <input
                id="c-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ExCeL Convention Center, London"
                className="w-full px-3.5 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white placeholder:text-[#6B7280] focus:ring-1 focus:ring-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#D1D5DB] font-medium mb-1.5" htmlFor="c-message">
                Event Requirements & Scope <span className="text-red-400">*</span>
              </label>
              <textarea
                id="c-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your vision, custom eras or themes required, physical stall dimensions, or custom branding requests."
                className="w-full px-3.5 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white placeholder:text-[#6B7280] focus:ring-1 focus:ring-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1C202B]">
              <p className="text-[11px] text-[#6B7280]">
                We respect your privacy. Inquiries are handled under our{' '}
                <Link href="/privacy" className="text-white hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-white hover:bg-neutral-200 text-[#08090C] font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{loading ? 'Submitting...' : 'Submit Inquiry'}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#212530] bg-[#0E1118] py-6 px-6 text-center text-xs text-[#6B7280] space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link href="/" className="text-[#9CA3AF] hover:text-white">
            Photo Booth
          </Link>
          <span>•</span>
          <Link href="/privacy" className="text-[#9CA3AF] hover:text-white">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="text-[#9CA3AF] hover:text-white">
            Terms of Service
          </Link>
        </div>
        <p>© {new Date().getFullYear()} Nexora Imaging Systems. Commercial Operations.</p>
      </footer>
    </div>
  );
}

