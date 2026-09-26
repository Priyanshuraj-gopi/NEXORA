'use client';

import { useState, useCallback, useEffect } from 'react';
import { Download, QrCode, Share2, RotateCcw, Check, Loader2, Video, Shield, Mail } from 'lucide-react';
import Link from 'next/link';
import { QRModal } from '@/components/qr-modal';
import { LeadCaptureModal } from '@/components/lead-capture-modal';
import { generateCinematicVideo } from '@/lib/video-generator';

interface ResultScreenProps {
  resultImage: string;
  sessionId: string;
  styleName: string;
  onReset: () => void;
}

export function ResultScreen({ resultImage, sessionId, styleName, onReset }: ResultScreenProps) {
  const [brandedImage, setBrandedImage] = useState<string>(resultImage);
  const [showQR, setShowQR] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadDispatched, setLeadDispatched] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [videoDownloaded, setVideoDownloaded] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [shared, setShared] = useState(false);
  const [isProcessingBrand] = useState(false);

  useEffect(() => {
    setBrandedImage(resultImage);
  }, [resultImage]);

  const handleDownload = useCallback(async () => {
    try {
      const a = document.createElement('a');
      a.href = brandedImage;
      a.download = `NEXORA-${styleName.toUpperCase().replace(/\s+/g, '-')}-${sessionId}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch {
      window.open(brandedImage, '_blank');
    }
  }, [brandedImage, sessionId, styleName]);

  const handleDownloadVideo = useCallback(async () => {
    setIsGeneratingVideo(true);
    try {
      const videoBlob = await generateCinematicVideo(brandedImage, {
        styleName,
        durationSeconds: 4,
      });

      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NEXORA-${styleName.toUpperCase().replace(/\s+/g, '-')}-${sessionId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setVideoDownloaded(true);
      setTimeout(() => setVideoDownloaded(false), 3500);
    } catch (err) {
      console.error('Video generation error:', err);
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [brandedImage, sessionId, styleName]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/result/${sessionId}`;
    const shareText = `Check out my ${styleName} portrait transformation at NEXORA AI Photo Booth! Same You. Different Era. #NexoraAI #AIPhotoBooth`;

    if (navigator.share) {
      try {
        const res = await fetch(brandedImage);
        const blob = await res.blob();
        const file = new File([blob], `nexora-${sessionId}.jpg`, { type: 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `NEXORA: ${styleName} Transformation`,
            text: `${shareText}\n\n${shareUrl}`,
            files: [file],
          });
          setShared(true);
          setTimeout(() => setShared(false), 3000);
          return;
        }

        await navigator.share({
          title: `NEXORA: ${styleName} Transformation`,
          text: shareText,
          url: shareUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      } catch {
        // User dismissed
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  }, [brandedImage, sessionId, styleName]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <p className="text-xs font-mono font-semibold tracking-wider text-[#9CA3AF] uppercase">
          Output Ready
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          {styleName}: Stylistic Transformation
        </h2>
      </div>

      {/* High-Resolution Portrait Container */}
      <div className="relative rounded-lg overflow-hidden border border-[#212530] bg-[#111319] max-w-xl mx-auto shadow-2xl">
        <img
          src={brandedImage}
          alt={`Transformed portrait in ${styleName} style`}
          className="w-full h-auto object-cover"
        />

        {isProcessingBrand && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-white">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Finalizing photograph export...</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          <span>{downloaded ? 'Downloaded' : 'Download JPEG Photograph'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadVideo}
          disabled={isGeneratingVideo}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#161922] hover:bg-[#1F2430] text-white border border-[#212530] rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          {isGeneratingVideo ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : videoDownloaded ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Video className="w-4 h-4" />
          )}
          <span>
            {isGeneratingVideo
              ? 'Rendering Video...'
              : videoDownloaded
                ? 'Saved MP4 Video'
                : 'Export MP4 Motion Video'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowLeadCapture(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#141822] hover:bg-[#1E2330] text-white border border-[#262C3D] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          {leadDispatched ? <Check className="w-4 h-4 text-emerald-400" /> : <Mail className="w-4 h-4" />}
          <span>{leadDispatched ? 'Dispatched to Inbox' : 'Email / WhatsApp My Photo'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowQR(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#111319] hover:bg-[#161922] text-white border border-[#212530] rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>Display Mobile QR Code</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#111319] hover:bg-[#161922] text-white border border-[#212530] rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{shared ? 'Link Copied' : 'Share Link'}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#08090C] hover:bg-[#111319] text-[#9CA3AF] hover:text-white border border-[#212530] rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Session</span>
        </button>
      </div>

      {/* Compliance & Data Notice Footer */}
      <div className="pt-4 border-t border-[#212530] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#6B7280]">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>Session ID: {sessionId}. Retained temporarily for 24 hours.</span>
        </div>
        <div>
          <Link href="/privacy" className="underline hover:text-[#9CA3AF]">
            Privacy Policy
          </Link>
          <span className="mx-2">•</span>
          <Link href="/terms" className="underline hover:text-[#9CA3AF]">
            Terms
          </Link>
        </div>
      </div>

      {showQR && <QRModal sessionId={sessionId} onClose={() => setShowQR(false)} />}
      {showLeadCapture && (
        <LeadCaptureModal
          sessionId={sessionId}
          styleName={styleName}
          onClose={() => setShowLeadCapture(false)}
          onSuccess={() => setLeadDispatched(true)}
        />
      )}
    </div>
  );
}
