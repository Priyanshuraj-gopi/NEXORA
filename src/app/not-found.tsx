import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090C] text-[#F9FAFB] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-mono font-semibold tracking-widest text-[#9CA3AF] uppercase">
            HTTP 404 Error
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">Page Not Found</h1>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            The requested page or image session does not exist or has expired in accordance with our
            24-hour data retention policy.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold tracking-wide transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Photo Booth</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

