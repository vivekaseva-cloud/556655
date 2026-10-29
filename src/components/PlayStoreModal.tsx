import React from 'react';
import { X, Smartphone, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { EdiNijamLogo } from './EdiNijamLogo';
import { usePWAInstall } from '../pwa/usePWAInstall';

interface PlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayStoreModal: React.FC<PlayStoreModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="playstore-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl bg-[#FBF9F5] border border-stone-300 shadow-2xl overflow-hidden">
        <div className="bg-[#0B1D3A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EdiNijamLogo size={42} />
            <div>
              <h2 id="playstore-modal-title" className="text-base font-bold text-amber-300">
                నేటిభారతం (Neti Bharatam) — మొబైల్ యాప్ & Google Play Store
              </h2>
              <p className="text-xs text-stone-300">
                Android PWA · Trusted Web Activity (TWA) Ready
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Play Store modal"
            className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="p-4 rounded-xl bg-white border border-stone-200 flex items-start gap-3.5">
            <Smartphone className="w-6 h-6 text-[#9A3412] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-stone-900">
                1. తక్షణ మొబైల్ యాప్ ఇన్‌స్టాలేషన్ (Direct Mobile App Install)
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                ఈ వెబ్‌సైట్ పూర్తి స్థాయి <strong>Progressive Web App (PWA)</strong> గా రూపొందించబడింది.
                మీరు Android లేదా iOS ఫోన్‌లో బ్రౌజర్ మెనూ నుండి <strong>&ldquo;Install App / Add to Home Screen&rdquo;</strong> నొక్కి నేరుగా మొబైల్ యాప్‌లా వాడుకోవచ్చు.
              </p>
              {isInstallable && (
                <button
                  type="button"
                  onClick={install}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#9A3412] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7C2D12] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ఇప్పుడే మొబైల్‌లో ఇన్‌స్టాల్ చేయండి (Install Now)</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>2. Google Play Store పబ్లిషింగ్ కాన్ఫిగరేషన్ (TWA / .AAB Ready)</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Google Play Console లో అప్‌లోడ్ చేయడానికి అవసరమైన <code>manifest.webmanifest</code>,
              <code>192x192</code> &amp; <code>512x512</code> Maskable PNG ఐకాన్లు, మరియు
              <code>/.well-known/assetlinks.json</code> ఈ యాప్‌లో ముందే జతచేయబడ్డాయి.
            </p>
            <div className="rounded-lg bg-stone-900 text-stone-100 p-3 font-mono text-[11px] overflow-x-auto">
              <div># Package ID: in.netibharatam.news.twa</div>
              <div>npx @bubblewrap/cli init --manifest=/manifest.webmanifest</div>
              <div>npx @bubblewrap/cli build</div>
              <div># Generates app-release-bundle.aab for Google Play Console</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>ఆఫ్‌లైన్ రీడింగ్, పుష్ నోటిఫికేషన్లు &amp; మండల ఫిల్టర్ సపోర్ట్</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#0B1D3A] text-white text-xs font-semibold hover:bg-[#142F5A] cursor-pointer"
            >
              మూసివేయి (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
