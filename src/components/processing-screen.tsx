'use client';

import { PROCESSING_STAGES, type ProcessingStage } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProcessingScreenProps {
  stage: ProcessingStage;
  styleName: string;
  inputImage: string | null;
}

export function ProcessingScreen({ stage, styleName, inputImage }: ProcessingScreenProps) {
  const stageKeys = Object.keys(PROCESSING_STAGES) as ProcessingStage[];
  const currentIndex = stageKeys.indexOf(stage);
  const progress = Math.round(((currentIndex + 1) / stageKeys.length) * 100);

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
      {/* Visual Frame */}
      <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-[#212530] bg-[#111319] flex items-center justify-center shadow-lg">
        {inputImage ? (
          <img
            src={inputImage}
            alt="Source photograph being transformed"
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="text-xs text-[#9CA3AF] font-mono">STANDBY</div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>

      {/* Status Information */}
      <div className="space-y-1.5 w-full">
        <p className="text-xs font-mono font-medium tracking-wider text-[#9CA3AF] uppercase">
          Processing {styleName}
        </p>
        <h3 className="text-xl font-bold text-white tracking-tight">
          {PROCESSING_STAGES[stage] || 'Generating transformation...'}
        </h3>
      </div>

      {/* Technical Progress Bar */}
      <div className="w-full space-y-2">
        <div className="w-full h-1.5 bg-[#1F2430] rounded-sm overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-[#9CA3AF]">
          <span>STAGE: {stage.toUpperCase()}</span>
          <span>{progress}%</span>
        </div>
      </div>

      <p className="text-xs text-[#6B7280]">
        Temporary processing in volatile memory. Biometric data is purged automatically.
      </p>
    </div>
  );
}
