'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { Download, Share2, Clock, AlertCircle, Loader2, Smartphone, Check, Film, ShieldCheck, Mail } from 'lucide-react';
import { LeadCaptureModal } from '@/components/lead-capture-modal';
import { applyEraStylingAndBrand } from '@/lib/branding';
import { generateCinematicVideo } from '@/lib/video-generator';

interface ResultData {
  sessionId: string;
  outputImageUrl: string;
  style: string;
  createdAt: string;
}

export default function MobileResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [result, setResult] = useState<ResultData | null>(null);
  const [brandedUrl, setBrandedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [videoDownloaded, setVideoDownloaded] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [shared, setShared] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadDispatched, setLeadDispatched] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/result/${sessionId}`);
        const data = await res.json();

        if (data.success) {
          setResult(data);
          const branded = await applyEraStylingAndBrand(data.outputImageUrl, {
            styleName: data.style.replace(/-/g, ' '),
            styleSlug: data.style,
          });
          setBrandedUrl(branded);
        } else {
          setError(data.error || 'Result not found or expired');
        }
      } catch {
        setError('Failed to load your transformation');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  const handleDownload = useCallback(async () => {
    const url = brandedUrl || result?.outputImageUrl;
    if (!url) return;

    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = `NEXORA-${result?.style.toUpperCase() || 'PHOTO'}-${sessionId}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch {
      window.open(url, '_blank');
    }
  }, [brandedUrl, result, sessionId]);

  const handleDownloadVideo = useCallback(async () => {
    const url = brandedUrl || result?.outputImageUrl;
    if (!url) return;

    setIsGeneratingVideo(true);
    try {
      const blob = await generateCinematicVideo(url, {
        styleName: result?.style || 'Nexora',
        durationSeconds: 4,
      });

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `NEXORA-${result?.style.toUpperCase() || 'MOTION'}-${sessionId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setVideoDownloaded(true);
      setTimeout(() => setVideoDownloaded(false), 3500);
    } catch (err) {
      console.error('Mobile video error:', err);
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [brandedUrl, result, sessionId]);

  const handleShare = useCallback(async () => {
    const url = brandedUrl || result?.outputImageUrl;
    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        if (url) {
          const res = await fetch(url);
          const blob = await res.blob();
          const file = new File([blob], `nexora-${sessionId}.jpg`, { type: 'image/jpeg' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'NEXORA: Same You. Different Era.',
              text: `Check out my ${result?.style} AI photograph from Nexora!`,
              files: [file],
            });
            setShared(true);
            setTimeout(() => setShared(false), 3000);
            return;
          }
        }

        await navigator.share({
          title: 'NEXORA: Same You. Different Era.',
          text: `Check out my ${result?.style} AI photograph from Nexora!`,
          url: currentUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      } catch {
        // Share dismissed
      }
    } else {
      await navigator.clipboard.writeText(currentUrl);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  }, [brandedUrl, result, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090C] text-[#F9FAFB] px-6">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
        <p className="text-[#D1D5DB] font-medium text-sm">Retrieving your photograph...</p>
        <span className="text-xs text-[#6B7280] mt-2 font-mono">SESSION REFERENCE: {sessionId}</span>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090C] text-[#F9FAFB] px-6 text-center">
        <div className="w-14 h-14 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Photograph Unavailable</h1>
        <p className="text-[#9CA3AF] text-sm max-w-sm mb-6">
          {error || 'This photograph has expired according to our 24-hour biometric data retention policy.'}
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg bg-white text-[#08090C] font-semibold text-sm hover:bg-[#F3F4F6] transition-colors"
        >
          Return to Photo Booth
        </Link>
      </div>
    );
  }

  const displayImage = brandedUrl || result.outputImageUrl;

  return (
    <div className="min-h-screen bg-[#08090C] text-[#F9FAFB] flex flex-col justify-between">
      {/* Mobile Top Header */}
      <header className="p-4 sm:p-5 text-center border-b border-[#212530] bg-[#0E1118]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-white text-[#08090C] flex items-center justify-center font-bold text-xs tracking-tight shadow-sm">
            N
          </div>
          <h1 className="text-base font-bold tracking-[0.2em] text-white">NEXORA</h1>
        </div>
        <p className="text-[11px] text-[#9CA3AF] mt-0.5 font-medium tracking-normal">
          Same You. Different Era.
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
        {/* Style Badge & Header */}
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#161B26] border border-[#2B3347] text-xs font-semibold text-[#D1D5DB] tracking-wide uppercase">
            {result.style.replace(/-/g, ' ')}
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white">Your Transformation</h2>
        </div>

        {/* High-Res Photo Container */}
        <div className="relative rounded-lg overflow-hidden border border-[#262C3D] bg-[#0E1118] shadow-lg">
          <img
            src={displayImage}
            alt="High-resolution AI transformed photograph from Nexora Photo Booth"
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>

        {/* Long Press Save Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#9CA3AF] text-center bg-[#141822] py-2.5 px-3 rounded-lg border border-[#262C3D]">
          <Smartphone className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          <span>Tap & hold the image to save directly to your device</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Download JPEG Photo */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white hover:bg-[#E5E7EB] text-[#08090C] rounded-lg font-semibold text-sm transition-colors cursor-pointer focus:ring-2 focus:ring-white focus:outline-none shadow-sm"
          >
            {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Photograph Saved' : 'Download Photograph (JPEG)'}</span>
          </button>

          {/* Download Motion Video */}
          <button
            onClick={handleDownloadVideo}
            disabled={isGeneratingVideo}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#141822] hover:bg-[#1E2330] text-white border border-[#262C3D] rounded-lg font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 focus:ring-2 focus:ring-white focus:outline-none"
          >
            {isGeneratingVideo ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : videoDownloaded ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Film className="w-4 h-4 text-white" />
            )}
            <span>
              {isGeneratingVideo
                ? 'Rendering Motion Video (60fps)...'
                : videoDownloaded
                  ? 'Motion Video Saved'
                  : 'Export Motion Video (MP4)'}
            </span>
          </button>

          {/* Email / WhatsApp Delivery */}
          <button
            onClick={() => setShowLeadCapture(true)}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#141822] hover:bg-[#1E2330] text-white border border-[#262C3D] rounded-lg font-semibold text-sm transition-colors cursor-pointer focus:ring-2 focus:ring-white focus:outline-none"
          >
            {leadDispatched ? <Check className="w-4 h-4 text-emerald-400" /> : <Mail className="w-4 h-4" />}
            <span>{leadDispatched ? 'Photograph Dispatched to Inbox' : 'Email / WhatsApp My Photo'}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#111319] hover:bg-[#1A1E29] text-[#D1D5DB] hover:text-white rounded-lg font-medium text-xs border border-[#212530] transition-colors cursor-pointer focus:ring-2 focus:ring-white focus:outline-none"
          >
            {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{shared ? 'Direct Link Copied' : 'Share Photo Link'}</span>
          </button>
        </div>

        {showLeadCapture && (
          <LeadCaptureModal
            sessionId={sessionId}
            styleName={result.style}
            onClose={() => setShowLeadCapture(false)}
            onSuccess={() => setLeadDispatched(true)}
          />
        )}

        {/* Expiration & Biometrics Notice */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#6B7280]">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Strict Biometric Policy: Link and data expire in 24 hours.</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-[#6B7280]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>Zero AI Model Training Guarantee</span>
          </div>
        </div>
      </main>

      {/* Compliance Footer */}
      <footer className="border-t border-[#212530] bg-[#0E1118] text-[#9CA3AF] py-6 px-4 text-center space-y-3 mt-6">
        <nav aria-label="Legal links" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
          <Link href="/privacy" className="hover:text-white underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white underline-offset-4 hover:underline">
            Terms of Service
          </Link>
          <Link href="/cookies" className="hover:text-white underline-offset-4 hover:underline">
            Cookie Policy
          </Link>
          <Link href="/refund" className="hover:text-white underline-offset-4 hover:underline">
            Refund Policy
          </Link>
        </nav>
        <p className="text-[11px] text-[#6B7280]">
          © {new Date().getFullYear()} Nexora Imaging Systems. Ephemeral processing operations.
        </p>
      </footer>
    </div>
  );
}
