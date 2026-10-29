import React from 'react';
import type { NewsCategory, NewsLevel } from '../utils/newsLogic';

interface EditorialIllustrationProps {
  imageType?: string;
  category?: NewsCategory;
  level?: NewsLevel;
  mandal?: string;
  district?: string;
  className?: string;
}

export const EditorialIllustration: React.FC<EditorialIllustrationProps> = ({
  imageType = 'national_justice',
  category = 'justice',
  level = 'national',
  mandal = 'India',
  district = '',
  className = 'w-full h-full',
}) => {
  const isJustice = imageType.includes('justice') || category === 'justice';
  const isAgri = imageType.includes('irrigation') || category === 'agriculture';
  const isMandal = imageType.includes('mandal') || level === 'mandal';

  return (
    <div
      className={`relative overflow-hidden bg-[#0F2342] select-none ${className}`}
      role="img"
      aria-label={`${mandal} ${category} editorial illustration`}
    >
      <svg
        viewBox="0 0 800 450"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full object-cover"
      >
        <defs>
          <linearGradient id="edSky" x1="0%" y1="0%" x2="100%" y2="100%">
            {isJustice ? (
              <>
                <stop offset="0%" stopColor="#0B1D3A" />
                <stop offset="55%" stopColor="#1E3A5F" />
                <stop offset="100%" stopColor="#7C2D12" />
              </>
            ) : isAgri ? (
              <>
                <stop offset="0%" stopColor="#0D3B2E" />
                <stop offset="55%" stopColor="#14532D" />
                <stop offset="100%" stopColor="#78350F" />
              </>
            ) : isMandal ? (
              <>
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="55%" stopColor="#0F3460" />
                <stop offset="100%" stopColor="#9A3412" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="60%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#78350F" />
              </>
            )}
          </linearGradient>
          <radialGradient id="edSun" cx="72%" cy="32%" r="42%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.65" />
            <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="800" height="450" fill="url(#edSky)" />
        <rect width="800" height="450" fill="url(#edSun)" />

        {/* Subtle Architectural Grid Lines */}
        <g stroke="#FFFFFF" strokeOpacity="0.07" strokeWidth="1">
          <line x1="0" y1="110" x2="800" y2="110" />
          <line x1="0" y1="220" x2="800" y2="220" />
          <line x1="0" y1="330" x2="800" y2="330" />
          <line x1="200" y1="0" x2="200" y2="450" />
          <line x1="400" y1="0" x2="400" y2="450" />
          <line x1="600" y1="0" x2="600" y2="450" />
        </g>

        {/* Golden Sun Orb */}
        <circle cx="576" cy="144" r="58" fill="#FDE047" opacity="0.25" />
        <circle cx="576" cy="144" r="36" fill="#FBBF24" opacity="0.45" />

        {isJustice && (
          <g transform="translate(110, 95)">
            {/* Constitutional Dome & Pillars */}
            <path
              d="M 180,90 C 180,25 320,25 320,90 Z"
              fill="#F59E0B"
              fillOpacity="0.25"
              stroke="#FDE68A"
              strokeWidth="2"
            />
            <rect x="130" y="90" width="240" height="16" fill="#FDE68A" fillOpacity="0.35" />
            <g fill="#F8FAFC" fillOpacity="0.22">
              <rect x="148" y="106" width="18" height="130" />
              <rect x="192" y="106" width="18" height="130" />
              <rect x="236" y="106" width="18" height="130" />
              <rect x="280" y="106" width="18" height="130" />
              <rect x="324" y="106" width="18" height="130" />
            </g>
            <rect x="110" y="236" width="280" height="22" fill="#FDE68A" fillOpacity="0.3" />
            {/* Scales of Justice Emblem */}
            <g stroke="#FDE68A" strokeWidth="3.5" fill="none" transform="translate(420, 40)">
              <line x1="60" y1="20" x2="60" y2="145" />
              <line x1="10" y1="48" x2="110" y2="48" />
              <path d="M 10,48 L -6,88 L 26,88 Z" fill="#F59E0B" fillOpacity="0.4" />
              <path d="M 110,48 L 94,88 L 126,88 Z" fill="#F59E0B" fillOpacity="0.4" />
              <line x1="35" y1="145" x2="85" y2="145" />
            </g>
          </g>
        )}

        {isAgri && (
          <g transform="translate(60, 120)">
            {/* Dam Spillway & Green Canals */}
            <path d="M 40,180 L 180,70 L 420,70 L 520,180 Z" fill="#F8FAFC" fillOpacity="0.18" stroke="#FDE68A" strokeWidth="2" />
            <path d="M 200,70 L 170,220 M 260,70 L 245,220 M 320,70 L 320,220 M 380,70 L 395,220" stroke="#38BDF8" strokeWidth="5" strokeOpacity="0.55" />
            <path d="M 0,220 Q 200,190 400,220 T 740,210 L 740,330 L 0,330 Z" fill="#10B981" fillOpacity="0.28" />
          </g>
        )}

        {!isJustice && !isAgri && (
          <g transform="translate(80, 115)">
            {/* Mandal Parishad & Civic Infrastructure Silhouette */}
            <rect x="60" y="80" width="260" height="150" rx="6" fill="#F8FAFC" fillOpacity="0.16" stroke="#FDE68A" strokeWidth="1.5" />
            <path d="M 40,80 L 190,15 L 340,80 Z" fill="#F59E0B" fillOpacity="0.28" stroke="#FDE68A" strokeWidth="1.5" />
            <rect x="165" y="145" width="50" height="85" fill="#FDE68A" fillOpacity="0.3" />
            <rect x="90" y="110" width="45" height="40" fill="#38BDF8" fillOpacity="0.25" />
            <rect x="245" y="110" width="45" height="40" fill="#38BDF8" fillOpacity="0.25" />
            {/* Highway / Bridge Arc */}
            <path d="M 360,220 Q 500,120 660,190" fill="none" stroke="#FDE68A" strokeWidth="4" strokeOpacity="0.5" />
          </g>
        )}

        {/* Measured Contrast Scrim */}
        <rect
          x="0"
          y="225"
          width="800"
          height="225"
          fill="url(#edScrim)"
          opacity="0.7"
        />
        <defs>
          <linearGradient id="edScrim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#061126" stopOpacity="0" />
            <stop offset="100%" stopColor="#061126" stopOpacity="0.92" />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle Editorial Watermark Stamp */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-medium text-amber-200/90 tracking-wide">
        <span>నేటిభారతం · NETI BHARATAM ARCHIVE</span>
        <span>{district ? `${mandal}, ${district}` : mandal}</span>
      </div>
    </div>
  );
};

export const ReporterAvatar: React.FC<{
  photoDataUrl: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ photoDataUrl, name, size = 'md' }) => {
  const dims = size === 'sm' ? 'w-9 h-9 text-xs' : size === 'lg' ? 'w-16 h-16 text-lg' : 'w-12 h-12 text-sm';

  if (photoDataUrl && photoDataUrl.startsWith('data:image/')) {
    return (
      <img
        src={photoDataUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${dims} rounded-full object-cover border border-stone-300 shrink-0`}
      />
    );
  }

  const initials =
    name
      .replace(/[^a-zA-Z\u0C00-\u0C7F\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase() || 'NB';

  return (
    <div
      className={`${dims} rounded-full bg-[#0B1D3A] text-amber-300 font-bold flex items-center justify-center border border-amber-500/40 shrink-0`}
      aria-label={name}
    >
      {initials.slice(0, 2)}
    </div>
  );
};
