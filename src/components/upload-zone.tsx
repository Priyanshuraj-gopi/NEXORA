'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, AlertCircle, RefreshCw, Loader2, Timer } from 'lucide-react';
import Link from 'next/link';
import { cn, isValidImageType, isValidImageSize, formatFileSize } from '@/lib/utils';

interface UploadZoneProps {
  onImageSelect: (file: File, preview: string, genderHint?: 'auto' | 'male' | 'female') => void;
}

export function UploadZone({ onImageSelect }: UploadZoneProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [genderHint, setGenderHint] = useState<'auto' | 'male' | 'female'>('auto');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const compressImage = useCallback(async (file: File): Promise<{ file: File; preview: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1536;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ file, preview: e.target?.result as string });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                });
                const preview = URL.createObjectURL(blob);
                resolve({ file: optimizedFile, preview });
              } else {
                resolve({ file, preview: e.target?.result as string });
              }
            },
            'image/jpeg',
            0.92
          );
        };
        img.onerror = () => resolve({ file, preview: e.target?.result as string });
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const validateAndProcess = useCallback(
    async (file: File) => {
      setError(null);
      if (!hasConsent) {
        setConsentError(true);
        return;
      }

      if (!isValidImageType(file)) {
        setError('Unsupported file type. Please provide a standard JPEG, PNG, or WebP photograph.');
        return;
      }
      if (!isValidImageSize(file, 15)) {
        setError(`File exceeds limit (${formatFileSize(file.size)}). Maximum permitted size is 15 MB.`);
        return;
      }

      setIsCompressing(true);
      try {
        const { file: optimized, preview } = await compressImage(file);
        onImageSelect(optimized, preview, genderHint);
      } catch {
        onImageSelect(file, URL.createObjectURL(file), genderHint);
      } finally {
        setIsCompressing(false);
      }
    },
    [compressImage, genderHint, hasConsent, onImageSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndProcess(file);
    },
    [validateAndProcess]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndProcess(file);
    },
    [validateAndProcess]
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsCameraLoading(false);
    setCountdown(null);
  }, []);

  // Callback ref to bind video stream immediately upon DOM mount
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch((err) => {
        console.warn('[Nexora Camera] Autoplay notice:', err);
      });
    }
  }, []);

  // Synchronization effect when camera visibility toggles
  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn('[Nexora Camera] Effect play notice:', err);
      });
    }
  }, [showCamera]);

  const startCamera = useCallback(
    async (mode: 'user' | 'environment') => {
      if (!hasConsent) {
        setConsentError(true);
        return;
      }

      setError(null);

      // Verify browser capability and secure context
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Live camera requires a secure context (HTTPS or localhost). Please upload a file instead.');
        return;
      }

      setIsCameraLoading(true);
      setShowCamera(true);
      setFacingMode(mode);

      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        let stream: MediaStream;
        try {
          // Attempt high-definition resolution constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: mode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (constraintErr) {
          console.warn('[Nexora Camera] High-res constraints failed, falling back to basic video feed:', constraintErr);
          // Fallback to generic webcam constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;

        // If the video DOM node is already mounted, attach immediately
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.warn('[Nexora Camera] Immediate play notice:', err);
          });
        }
      } catch (err) {
        console.error('[Nexora Camera] Device stream error:', err);
        setIsCameraLoading(false);
        setShowCamera(false);

        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError('Camera access was blocked. Please permit camera permissions in your browser address bar.');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setError('No camera detected on this system. Please connect a webcam or upload a file.');
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            setError('Camera is currently in use by another program. Please close other camera apps and retry.');
          } else {
            setError(`Camera could not be accessed: ${err.message}`);
          }
        } else {
          setError('Camera could not be accessed.');
        }
      }
    },
    [hasConsent]
  );

  const toggleCameraFacing = useCallback(() => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextMode);
  }, [facingMode, startCamera]);

  const snapPhoto = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'nexora-portrait.jpg', { type: 'image/jpeg' });
          validateAndProcess(file);
        }
      },
      'image/jpeg',
      0.94
    );
    stopCamera();
  }, [facingMode, stopCamera, validateAndProcess]);

  const startCountdown = useCallback(() => {
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => (c !== null ? c - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      snapPhoto();
    }
  }, [countdown, snapPhoto]);

  // Clean up media tracks when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  if (showCamera) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3] border border-[#212530]">
          <video
            ref={setVideoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              setIsCameraLoading(false);
              videoRef.current?.play().catch((err) => {
                console.warn('[Nexora Camera] Metadata play notice:', err);
              });
            }}
            onCanPlay={() => {
              setIsCameraLoading(false);
            }}
            className={cn('w-full h-full object-cover', facingMode === 'user' && 'scale-x-[-1]')}
          />

          {/* Camera Loading Overlay */}
          {isCameraLoading && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 gap-3 text-white">
              <Loader2 className="w-7 h-7 animate-spin text-white" />
              <span className="text-xs font-mono tracking-wider uppercase text-[#9CA3AF]">
                Initializing camera feed...
              </span>
            </div>
          )}

          <AnimatePresence>
            {isFlashing && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-white z-40 pointer-events-none"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
                <span className="text-8xl font-black text-white font-mono">{countdown}</span>
              </div>
            )}
          </AnimatePresence>

          {/* Top Camera Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#08090C]/85 hover:bg-[#08090C] text-white text-xs font-medium border border-[#212530] transition-colors cursor-pointer backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Flip Camera ({facingMode === 'user' ? 'Front' : 'Rear'})</span>
            </button>

            <button
              type="button"
              onClick={stopCamera}
              className="p-2 rounded-lg bg-[#08090C]/85 hover:bg-[#08090C] text-white border border-[#212530] transition-colors cursor-pointer backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close Camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Shutter Controls */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 z-20">
            <button
              type="button"
              onClick={startCountdown}
              disabled={countdown !== null || isCameraLoading}
              className="p-3 rounded-lg bg-[#08090C]/85 hover:bg-[#08090C] text-white border border-[#212530] transition-colors cursor-pointer disabled:opacity-40 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-white"
              title="Activate 3-Second Countdown"
              aria-label="Activate 3-Second Countdown"
            >
              <Timer className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={snapPhoto}
              disabled={countdown !== null || isCameraLoading}
              className="px-6 py-3 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-colors cursor-pointer disabled:opacity-40 shadow-lg focus-visible:ring-2 focus-visible:ring-white"
            >
              Capture Photograph
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Explicit Biometric & Processing Consent Checkbox */}
      <div
        className={cn(
          'p-4 rounded-lg bg-[#111319] border transition-colors',
          consentError ? 'border-red-500 bg-red-950/20' : 'border-[#212530]'
        )}
      >
        <label className="flex items-start gap-3 cursor-pointer text-xs text-[#9CA3AF] select-none leading-relaxed">
          <input
            type="checkbox"
            checked={hasConsent}
            onChange={(e) => {
              setHasConsent(e.target.checked);
              if (e.target.checked) setConsentError(false);
            }}
            className="mt-0.5 w-4 h-4 rounded border-[#374151] bg-[#08090C] text-white focus:ring-1 focus:ring-white shrink-0 cursor-pointer"
            required
          />
          <div>
            <span className="font-semibold text-white block mb-0.5">
              Required: Biometric & Image Processing Consent
            </span>
            <span>
              I confirm I am at least 18 years old (or have authorized guardian consent) and explicitly
              consent to the temporary processing of this photograph solely for stylistic
              transformation under the{' '}
              <Link href="/privacy" target="_blank" className="text-white underline hover:text-[#9CA3AF]">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms" target="_blank" className="text-white underline hover:text-[#9CA3AF]">
                Terms of Service
              </Link>
              . My image is never used to train AI models and is permanently deleted within 24 hours.
            </span>
          </div>
        </label>
        {consentError && (
          <p className="text-xs text-red-400 mt-2 font-medium">
            You must agree to the data processing terms before capturing or uploading a photograph.
          </p>
        )}
      </div>

      {/* Identity & Gender Likeness Anchor */}
      <div className="p-3.5 rounded-lg bg-[#111319] border border-[#212530] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-white block">Identity & Likeness Anchor</span>
          <span className="text-[11px] text-[#9CA3AF]">
            Guarantees accurate gender preservation and zero identity reversal
          </span>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-md bg-[#08090C] border border-[#212530] shrink-0">
          <button
            type="button"
            onClick={() => setGenderHint('auto')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer',
              genderHint === 'auto'
                ? 'bg-white text-[#08090C] font-semibold shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            )}
          >
            Auto-Detect (AI)
          </button>
          <button
            type="button"
            onClick={() => setGenderHint('male')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer',
              genderHint === 'male'
                ? 'bg-white text-[#08090C] font-semibold shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            )}
          >
            Gentleman / Male
          </button>
          <button
            type="button"
            onClick={() => setGenderHint('female')}
            className={cn(
              'px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer',
              genderHint === 'female'
                ? 'bg-white text-[#08090C] font-semibold shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            )}
          >
            Lady / Female
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!hasConsent) {
            setConsentError(true);
            return;
          }
          fileInputRef.current?.click();
        }}
        className={cn(
          'relative flex flex-col items-center justify-center p-10 rounded-lg border-2 border-dashed transition-colors min-h-[260px] bg-[#111319] text-center cursor-pointer',
          !hasConsent && 'opacity-60 cursor-not-allowed',
          isDragging
            ? 'border-white bg-[#161922]'
            : 'border-[#212530] hover:border-[#374151]'
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload portrait photograph"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (!hasConsent) setConsentError(true);
            else fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={!hasConsent}
          aria-hidden="true"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-lg bg-[#161922] border border-[#212530] text-white">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-white">Select Portrait Image to Upload</p>
            <p className="text-xs text-[#9CA3AF]">JPEG, PNG, or WebP format. Maximum file size 15 MB.</p>
          </div>
        </div>

        {isCompressing && (
          <div className="absolute inset-0 rounded-lg bg-black/70 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs text-white font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Validating and optimizing photograph...</span>
            </div>
          </div>
        )}
      </div>

      {/* Camera Capture Option */}
      <button
        type="button"
        onClick={() => startCamera('user')}
        className={cn(
          'w-full flex items-center justify-center gap-2.5 p-3.5 rounded-lg border transition-colors text-sm font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-white',
          hasConsent
            ? 'bg-[#111319] hover:bg-[#161922] text-white border-[#212530]'
            : 'bg-[#111319]/50 text-[#6B7280] border-[#212530] cursor-not-allowed'
        )}
      >
        <Camera className="w-4 h-4" />
        <span>Open Camera to Take Live Photograph</span>
      </button>

      {/* Error Notice */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
