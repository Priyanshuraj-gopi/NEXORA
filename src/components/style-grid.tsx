'use client';

import { useState, useMemo, useEffect } from 'react';
import { Eye, ArrowRight, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StyleItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  prompt: string;
  negative_prompt?: string;
  category: string;
  enabled: boolean;
  featured: boolean;
  sort_order: number;
}

interface StyleGridProps {
  styles: StyleItem[];
  onSelect: (style: StyleItem) => void;
}

const categoryTabs = [
  { id: 'all', label: 'All Styles' },
  { id: 'era', label: 'Historical Eras' },
  { id: 'fantasy', label: 'Sci-Fi and Speculative' },
  { id: 'art', label: 'Art and Classical' },
  { id: 'professional', label: 'Studio Editorial' },
];

export function StyleGrid({ styles, onSelect }: StyleGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inspectingStyle, setInspectingStyle] = useState<StyleItem | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const filteredStyles = useMemo(() => {
    return styles
      .filter((s) => s.enabled)
      .filter((s) => selectedCategory === 'all' || s.category === selectedCategory);
  }, [styles, selectedCategory]);

  // Handle escape key to close inspect modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspectingStyle) {
        setInspectingStyle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingStyle]);

  const handleImageError = (slug: string) => {
    setImageErrorMap((prev) => ({ ...prev, [slug]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Category Navigation */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={cn(
              'px-3.5 py-2 rounded-lg text-xs font-medium transition-colors border cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus:outline-none',
              selectedCategory === tab.id
                ? 'bg-white text-[#08090C] font-semibold border-white shadow-sm'
                : 'bg-[#111319] text-[#9CA3AF] hover:text-white border-[#212530] hover:border-[#374151]'
            )}
            aria-pressed={selectedCategory === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Style Cards Grid with Minimalist Example Previews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredStyles.map((style) => {
          const hasError = imageErrorMap[style.slug];

          return (
            <div
              key={style.id}
              className="group flex flex-col justify-between rounded-lg border border-[#212530] bg-[#111319] hover:bg-[#151821] hover:border-[#4B5563] transition-all duration-200 overflow-hidden text-left"
            >
              {/* Visual Preview Container */}
              <div className="relative w-full aspect-[4/3] bg-[#0A0C10] overflow-hidden border-b border-[#212530]">
                {!hasError ? (
                  <img
                    src={style.thumbnail}
                    alt={`Sample transformation example for ${style.title}`}
                    loading="lazy"
                    onError={() => handleImageError(style.slug)}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#0D0F15] text-[#9CA3AF]">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#6B7280]">
                      {style.category}
                    </span>
                    <span className="text-sm font-semibold text-white mt-1">
                      {style.title}
                    </span>
                  </div>
                )}

                {/* Top Overlay Badges */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#08090C]/85 text-[#E5E7EB] border border-white/10 backdrop-blur-sm">
                    {style.category}
                  </span>

                  {style.featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white text-[#08090C] tracking-wide shadow-sm">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Bottom Overlay: Example Indicator & Quick Enlarge */}
                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-[#08090C]/85 text-[#9CA3AF] border border-white/10 backdrop-blur-sm">
                    SAMPLE RESULT
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingStyle(style);
                    }}
                    className="p-1.5 rounded bg-[#08090C]/85 hover:bg-white text-[#D1D5DB] hover:text-[#08090C] border border-white/10 transition-colors backdrop-blur-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus:outline-none"
                    title={`Inspect full example of ${style.title}`}
                    aria-label={`Inspect full example preview of ${style.title}`}
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors">
                    {style.title}
                  </h3>

                  <p className="text-xs text-[#9CA3AF] leading-relaxed line-clamp-2">
                    {style.prompt.split('.')[0]}.
                  </p>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={() => onSelect(style)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-[#1B202D] hover:bg-white text-xs font-semibold text-white hover:text-[#08090C] border border-[#2B3347] hover:border-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus:outline-none"
                  aria-label={`Apply ${style.title} style to your photo`}
                >
                  <span>Select Style</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Example Modal */}
      {inspectingStyle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspect-style-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setInspectingStyle(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-lg border border-[#262C3D] bg-[#0E1118] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#212530]">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono text-[#9CA3AF] uppercase tracking-wider">
                  {inspectingStyle.category} Style Example
                </span>
                <h2 id="inspect-style-title" className="text-xl font-bold text-white">
                  {inspectingStyle.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setInspectingStyle(null)}
                className="p-1.5 rounded-md text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close example inspection"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* High-Resolution Example Image */}
            <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#0A0C10] border border-[#212530]">
              <img
                src={inspectingStyle.thumbnail}
                alt={`High-resolution example output for ${inspectingStyle.title}`}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-3 left-3 bg-[#08090C]/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-mono text-white border border-white/15">
                Target Aesthetic Preview
              </div>
            </div>

            {/* Style Prompt Specifications */}
            <div className="space-y-2 rounded-md bg-[#131722] p-3.5 border border-[#212530] text-xs text-[#D1D5DB] leading-relaxed">
              <span className="text-[10px] font-mono uppercase text-[#9CA3AF] tracking-wider block font-semibold">
                Creative Direction & Aesthetic Schema
              </span>
              <p>{inspectingStyle.prompt}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInspectingStyle(null)}
                className="px-4 py-2 rounded-md border border-[#2B3347] text-xs font-medium text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-white"
              >
                Back to Styles
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = inspectingStyle;
                  setInspectingStyle(null);
                  onSelect(s);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-md bg-white text-[#08090C] text-xs font-bold hover:bg-[#E5E7EB] transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-white"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Apply This Style</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
