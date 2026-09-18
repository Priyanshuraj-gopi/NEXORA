'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Smartphone, RefreshCw, CheckCircle2, Camera, ArrowRight } from 'lucide-react';
import { ProcessingScreen } from '@/components/processing-screen';
import type { ProcessingStage } from '@/types';
import QRCode from 'qrcode';

type DisplayState = 'idle' | 'processing' | 'result';

interface ActiveSession {
  id: string;
  status: string;
  processingStage: ProcessingStage;
  outputImageUrl: string | null;
  style: string;
  createdAt?: string;
}

import { STYLES_SEED } from '@/config/styles-seed';

interface DisplayViewProps {
  onNavigateToBooth?: () => void;
}

export function DisplayView({ onNavigateToBooth }: DisplayViewProps = {}) {
  const router = useRouter();
  const [displayState, setDisplayState] = useState<DisplayState>('idle');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [attractIndex, setAttractIndex] = useState(0);
  const [countdownToIdle, setCountdownToIdle] = useState<number>(45);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const seenSessionRef = useRef<string | null>(null);

  // Attract mode cycling when idle
  useEffect(() => {
    if (displayState !== 'idle') return;
    const interval = setInterval(() => {
      setAttractIndex((prev) => (prev + 1) % STYLES_SEED.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [displayState]);

  // Sync with live stall sessions by polling /api/status/latest
  useEffect(() => {
    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch('/api/status/latest');
        if (!res.ok) return;
        const data = await res.json();

        if (data.success && data.sessionId) {
          const session: ActiveSession = {
            id: data.sessionId,
            status: data.status,
            processingStage: data.processingStage || 'generating',
            outputImageUrl: data.outputImageUrl || null,
            style: data.style || 'Custom Era',
            createdAt: data.createdAt,
          };

          // If session is new and currently processing
          if (session.status === 'processing') {
            setActiveSession(session);
            setDisplayState('processing');
            seenSessionRef.current = session.id;
          } else if (
            session.status === 'completed' &&
            session.outputImageUrl &&
            seenSessionRef.current !== `done-${session.id}`
          ) {
            // New completed session to display on TV
            setActiveSession(session);
            setDisplayState('result');
            setCountdownToIdle(45);
            seenSessionRef.current = `done-${session.id}`;
          }
        }
      } catch {
        // Network quiet
      }
    }, 2500);

    return () => clearInterval(pollTimer);
  }, []);

  // Render QR Code onto canvas when in result mode
  useEffect(() => {
    if (displayState === 'result' && activeSession && qrCanvasRef.current) {
      const targetUrl = `${window.location.origin}/result/${activeSession.id}`;
      QRCode.toCanvas(qrCanvasRef.current, targetUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#FFFFFF',
          light: '#0E1118',
        },
      });
    }
  }, [displayState, activeSession]);

  // Countdown timer to return to Attract Mode after showing result
  useEffect(() => {
    if (displayState !== 'result') return;

    const timer = setInterval(() => {
      setCountdownToIdle((prev) => {
        if (prev <= 1) {
          setDisplayState('idle');
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [displayState]);

  const handleBoothRedirect = () => {
    if (onNavigateToBooth) {
      onNavigateToBooth();
    } else {
      router.push('/booth');
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden relative py-12 px-6">
      {/* Corner Quick Action: Enter Photo Booth */}
      <div className="absolute top-4 right-6 z-30">
        <button
          onClick={handleBoothRedirect}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#141822]/90 hover:bg-[#1E2330] border border-[#262C3D] text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:ring-2 focus:ring-white focus:outline-none"
          title="Open Photo Booth Kiosk"
        >
          <Camera className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          <span>Launch Photo Booth</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* State 1: Attract Mode (Idle) */}
        {displayState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-10"
          >
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 mb-1">
                <img
                  src="/logo.png"
                  alt="Nexora TAPMI Bengaluru IT Club Logo"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>

              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-[0.2em] select-none text-white leading-none">
                NEXORA
              </h1>

              <p className="text-xs md:text-sm font-mono tracking-widest text-[#9CA3AF] uppercase">
                TAPMI Bengaluru IT Club
              </p>

              <div className="space-y-1 pt-2">
                <p className="text-2xl md:text-4xl font-light text-[#D1D5DB]">Same You.</p>
                <p className="text-2xl md:text-4xl font-semibold text-white tracking-wide">
                  Different Era.
                </p>
              </div>
            </div>

            {/* Cycling Style Architectural Preview Card */}
            <div className="flex justify-center">
              <motion.div
                key={attractIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 p-2.5 pr-6 rounded-lg bg-[#141822] border border-[#262C3D] text-white shadow-xl max-w-lg"
              >
                <div className="w-16 h-16 rounded-md overflow-hidden bg-[#0A0C10] border border-[#2B3347] shrink-0">
                  <img
                    src={STYLES_SEED[attractIndex]?.thumbnail}
                    alt={`Preview of ${STYLES_SEED[attractIndex]?.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-mono uppercase text-[#9CA3AF] tracking-wider block">
                    {STYLES_SEED[attractIndex]?.category} Example
                  </span>
                  <span className="text-xl md:text-2xl font-bold text-white tracking-wide block">
                    {STYLES_SEED[attractIndex]?.title}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Prominent Call to Action: Redirect to Photobooth */}
            <div className="pt-2 flex flex-col items-center justify-center gap-3">
              <button
                onClick={handleBoothRedirect}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white hover:bg-[#F3F4F6] text-[#08090C] text-base md:text-lg font-bold tracking-wide transition-all shadow-2xl hover:scale-[1.03] active:scale-[0.98] cursor-pointer focus:ring-2 focus:ring-white focus:outline-none"
                aria-label="Step up to the Photo Booth to capture your portrait"
              >
                <Camera className="w-5 h-5 text-[#08090C]" aria-hidden="true" />
                <span>Step Up to the Photo Booth</span>
                <ArrowRight className="w-5 h-5 text-[#08090C]" aria-hidden="true" />
              </button>
              <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Kiosk Terminal Active • Tap Button to Begin Transformation</span>
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="pt-4 flex items-center justify-center gap-3 text-[#9CA3AF] text-xs md:text-sm">
              <QrCode className="w-4 h-4 text-white" aria-hidden="true" />
              <span>Tap the button above or visit the booth terminal to select your era</span>
            </div>
          </motion.div>
        )}

        {/* State 2: Active Processing in Booth */}
        {displayState === 'processing' && activeSession && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#161B26] text-[#D1D5DB] border border-[#2B3347] text-xs font-semibold uppercase tracking-wider">
              <span>Photo Transformation in Progress</span>
            </div>

            <ProcessingScreen
              stage={activeSession.processingStage}
              styleName={activeSession.style}
              inputImage={null}
            />
          </motion.div>
        )}

        {/* State 3: Displaying Finished Result with Large QR */}
        {displayState === 'result' && activeSession?.outputImageUrl && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left: Finished Portrait */}
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Transformation Complete</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {activeSession.style}
              </h2>

              <div className="relative rounded-lg overflow-hidden border border-[#262C3D] bg-[#0E1118] max-w-md mx-auto lg:mx-0 shadow-xl">
                <img
                  src={activeSession.outputImageUrl}
                  alt="Transformed photograph generated on Nexora booth"
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Right: QR Code Card */}
            <div className="p-8 rounded-lg bg-[#0E1118] border border-[#262C3D] shadow-xl flex flex-col items-center text-center space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-[#9CA3AF]">
                  <Smartphone className="w-5 h-5 text-white" aria-hidden="true" />
                  <span className="text-xs font-bold tracking-widest uppercase">Mobile Download</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Scan to Download</h3>
                <p className="text-xs text-[#9CA3AF]">Open your phone camera to download your full-resolution photograph</p>
              </div>

              {/* QR Canvas */}
              <div className="p-4 rounded-lg bg-[#08090C] border border-[#212530]">
                <canvas ref={qrCanvasRef} className="w-64 h-64 rounded-md" />
              </div>

              <div className="flex items-center justify-between w-full text-xs text-[#6B7280] pt-2 border-t border-[#1C202B]">
                <span>Returning to attract mode in {countdownToIdle}s</span>
                <button
                  onClick={() => setDisplayState('idle')}
                  className="flex items-center gap-1.5 text-[#9CA3AF] hover:text-white transition-colors focus:ring-2 focus:ring-white focus:outline-none rounded px-2 py-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Next Visitor</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
