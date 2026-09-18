'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { UploadZone } from '@/components/upload-zone';
import { StyleGrid } from '@/components/style-grid';
import { ProcessingScreen } from '@/components/processing-screen';
import { ResultScreen } from '@/components/result-screen';
import { STYLES_SEED } from '@/config/styles-seed';
import { applyEraStylingAndBrand } from '@/lib/branding';
import type { Style, ProcessingStage } from '@/types';

type BoothStep = 'upload' | 'style' | 'processing' | 'result';

export function BoothView() {
  const [step, setStep] = useState<BoothStep>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('uploading');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File, preview: string) => {
    setUploadedFile(file);
    setUploadedImage(preview);
    setStep('style');
  }, []);

  const handleStyleSelect = useCallback(
    async (style: (typeof STYLES_SEED)[0] & { id: string }) => {
      setSelectedStyle(style as Style);
      setStep('processing');
      setError(null);

      try {
        setProcessingStage('uploading');
        const formData = new FormData();
        if (uploadedFile) {
          formData.append('image', uploadedFile);
          formData.append('style', style.slug);
        }

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Upload failed');
        const uploadData = await uploadRes.json();
        const sid = uploadData.sessionId;
        setSessionId(sid);

        setProcessingStage('preparing');
        const generateRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sid,
            styleSlug: style.slug,
          }),
        });

        if (!generateRes.ok) throw new Error('Generation failed');

        setProcessingStage('generating');
        let attempts = 0;
        const maxAttempts = 60;

        const poll = async (): Promise<void> => {
          if (attempts >= maxAttempts) {
            throw new Error('Generation timed out');
          }

          const statusRes = await fetch(`/api/status/${sid}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'completed') {
            setProcessingStage('completed');
            const transformed = await applyEraStylingAndBrand(statusData.outputImageUrl, {
              styleName: style.title,
              styleSlug: style.slug,
            });
            setResultImage(transformed);
            setTimeout(() => setStep('result'), 600);
            return;
          }

          if (statusData.status === 'failed') {
            throw new Error(statusData.error || 'Generation failed');
          }

          if (statusData.processingStage) {
            setProcessingStage(statusData.processingStage);
          }

          attempts++;
          await new Promise((r) => setTimeout(r, 1500));
          return poll();
        };

        await poll();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setStep('upload');
      }
    },
    [uploadedFile]
  );

  const handleReset = useCallback(() => {
    setStep('upload');
    setUploadedImage(null);
    setUploadedFile(null);
    setSelectedStyle(null);
    setResultImage(null);
    setSessionId(null);
    setError(null);
  }, []);

  const handleBack = useCallback(() => {
    if (step === 'style') {
      setStep('upload');
    } else if (step === 'result') {
      setStep('style');
    }
  }, [step]);

  const stepsList: BoothStep[] = ['upload', 'style', 'processing', 'result'];
  const currentStepIndex = stepsList.indexOf(step);

  return (
    <div className="w-full relative pb-16">
      {/* Sub Header for Booth Steps */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-[#212530]">
        <div className="flex items-center gap-3">
          {step !== 'upload' && step !== 'processing' && (
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-[#141822] hover:bg-[#1E2330] border border-[#262C3D] text-[#D1D5DB] hover:text-white transition-colors focus:ring-2 focus:ring-white focus:outline-none"
              aria-label="Go back to previous step"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <span className="text-xs font-semibold tracking-wider text-[#D1D5DB] uppercase">
            {step === 'upload' && 'Step 1: Capture or Select Photograph'}
            {step === 'style' && 'Step 2: Select Historical or Futuristic Era'}
            {step === 'processing' && 'Step 3: High-Fidelity AI Synthesis'}
            {step === 'result' && 'Step 4: Download & Transfer via QR'}
          </span>
        </div>

        {/* Rectangular step progress indicators */}
        <div className="flex items-center gap-1.5" aria-label="Step progress">
          {stepsList.map((s, i) => (
            <div
              key={s}
              className={`h-1 rounded-sm transition-all duration-300 ${i <= currentStepIndex ? 'w-7 bg-white' : 'w-2.5 bg-[#262C3D]'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline ml-4 text-xs font-medium">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Steps */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight text-white">
                  Capture Your Photograph
                </h2>
                <p className="text-[#9CA3AF] text-sm md:text-base max-w-md mx-auto">
                  Take a photo via the connected booth camera or upload a clear portrait.
                </p>
              </div>
              <UploadZone onImageSelect={handleImageUpload} />
            </motion.div>
          )}

          {step === 'style' && (
            <motion.div
              key="style"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight text-white">
                  Choose Your Era
                </h2>
                <p className="text-[#9CA3AF] text-sm md:text-base">
                  Select an aesthetic style to synthesize your photograph
                </p>
              </div>

              {uploadedImage && (
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#262C3D] shadow-md bg-[#0E1118]">
                    <img
                      src={uploadedImage}
                      alt="Source user photograph"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              <StyleGrid
                styles={STYLES_SEED.map((s, i) => ({ ...s, id: String(i + 1) }))}
                onSelect={handleStyleSelect}
              />
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center min-h-[50vh]"
            >
              <ProcessingScreen
                stage={processingStage}
                styleName={selectedStyle?.title || ''}
                inputImage={uploadedImage}
              />
            </motion.div>
          )}

          {step === 'result' && resultImage && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ResultScreen
                resultImage={resultImage}
                sessionId={sessionId || ''}
                styleName={selectedStyle?.title || ''}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
