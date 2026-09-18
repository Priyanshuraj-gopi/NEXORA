'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, AlertCircle, Loader2, X, Send } from 'lucide-react';

interface LeadCaptureModalProps {
  sessionId: string;
  styleName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LeadCaptureModal({
  sessionId,
  styleName,
  onClose,
  onSuccess,
}: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trapping and ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/crm/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          name,
          email,
          phone: phone || undefined,
          style: styleName,
          marketingConsent,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch photograph.');
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crm-modal-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-lg bg-[#0E1118] border border-[#262C3D] p-6 shadow-2xl text-left space-y-5"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-white/10 transition-colors text-[#9CA3AF] hover:text-white focus:ring-2 focus:ring-white focus:outline-none"
          aria-label="Close delivery modal"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-white">Photograph Dispatched</h3>
            <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
              We have dispatched your high-resolution {styleName} portrait and motion video to{' '}
              <span className="text-white font-medium">{email}</span>.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#9CA3AF]">
                <Mail className="w-4 h-4 text-white" aria-hidden="true" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                  Digital Photo Delivery
                </span>
              </div>
              <h2 id="crm-modal-title" className="text-xl font-bold tracking-tight text-white">
                Receive Photograph in Your Inbox
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Enter your details to receive an instant copy of your high-res image and MP4 motion video.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#D1D5DB] font-medium mb-1" htmlFor="lead-name">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="lead-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full px-3 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white text-xs placeholder:text-[#6B7280] focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#D1D5DB] font-medium mb-1" htmlFor="lead-email">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="lead-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white text-xs placeholder:text-[#6B7280] focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#D1D5DB] font-medium mb-1" htmlFor="lead-phone">
                  Phone or WhatsApp (Optional)
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="w-full px-3 py-2.5 rounded-md bg-[#08090C] border border-[#262C3D] text-white text-xs placeholder:text-[#6B7280] focus:ring-1 focus:ring-white focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-[#9CA3AF] select-none">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-[#374151] bg-[#08090C] text-white focus:ring-1 focus:ring-white cursor-pointer shrink-0"
                  />
                  <span>
                    Keep me updated on future Nexora event installations and photography experiences.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-md bg-[#141822] hover:bg-[#1E2330] text-[#9CA3AF] hover:text-white border border-[#262C3D] text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-white hover:bg-neutral-200 text-[#08090C] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{loading ? 'Dispatching...' : 'Dispatch My Photograph'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

