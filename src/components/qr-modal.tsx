'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';

interface QRModalProps {
  sessionId: string;
  onClose: () => void;
}

export function QRModal({ sessionId, onClose }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const resultUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/result/${sessionId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, resultUrl, {
        width: 250,
        margin: 2,
        color: {
          dark: '#F8FAFC',
          light: '#070B17',
        },
      }).then(() => setQrReady(true));
    }
  }, [resultUrl]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-lg bg-[#0E1118] border border-[#262C3D] p-8 text-center shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-white/10 transition-colors text-[#9CA3AF] hover:text-white"
          aria-label="Close QR code"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Smartphone className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Scan to Download</h3>
        </div>

        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-lg bg-[#08090C] border border-[#212530]">
            <canvas ref={canvasRef} className={qrReady ? 'opacity-100' : 'opacity-0'} />
          </div>
        </div>

        <p className="text-sm text-[#D1D5DB] mb-2 font-medium">
          Scan this QR code with your phone
        </p>
        <p className="text-xs text-[#9CA3AF]">
          Link expires in 24 hours
        </p>
      </motion.div>
    </motion.div>
  );
}
