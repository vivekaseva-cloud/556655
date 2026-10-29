import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  onOpenPlayStoreGuide?: () => void;
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenPlayStoreGuide,
  label = 'యాప్ ఇన్‌స్టాల్ (App)',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1D3A] px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-[#142F5A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
              <h3 className="text-base font-bold text-stone-900">
                iPhone / iPad లో నేటిభారతం యాప్ ఇన్‌స్టాల్ చేయండి
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                1. Safari బ్రౌజర్‌లో దిగువన ఉన్న <strong>Share</strong> బటన్ నొక్కండి.
                <br />
                2. క్రిందికి స్క్రోల్ చేసి <strong>Add to Home Screen</strong> ఎంచుకోండి.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-[#0B1D3A] py-2.5 text-xs font-semibold text-white hover:bg-[#142F5A]"
              >
                సరే (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenPlayStoreGuide}
      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
    >
      <Smartphone className="w-3.5 h-3.5 text-[#9A3412]" />
      <span>{label}</span>
    </button>
  );
};
