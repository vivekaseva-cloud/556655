import React from 'react';
import type { SiteBrandingConfig } from '../utils/newsLogic';

interface EdiNijamLogoProps {
  size?: number;
  className?: string;
  customLogoUrl?: string;
}

export const EdiNijamLogo: React.FC<EdiNijamLogoProps> = ({
  size = 56,
  className = '',
  customLogoUrl,
}) => {
  if (customLogoUrl && customLogoUrl.trim().length > 0) {
    return (
      <img
        src={customLogoUrl}
        alt="నేటిభారతం - ఏది నిజం అధికారిక లోగో"
        style={{ width: size, height: size }}
        className={`shrink-0 select-none object-contain rounded-lg bg-[#2E2B2B] p-0.5 border border-amber-400/50 ${className}`}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label="ఏది నిజం - నేటి భారతం లోగో"
    >
      <defs>
        <linearGradient id="nbRedTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF3B30" />
          <stop offset="50%" stopColor="#D70015" />
          <stop offset="100%" stopColor="#8E0000" />
        </linearGradient>
        <linearGradient id="nbSaffronBrush" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="70%" stopColor="#FF6B00" />
          <stop offset="100%" stopColor="#FF5500" />
        </linearGradient>
        <linearGradient id="nbGreenBrush" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1DB954" />
          <stop offset="65%" stopColor="#138808" />
          <stop offset="100%" stopColor="#0A5C04" />
        </linearGradient>
        <filter id="nbDropShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.65" />
        </filter>
      </defs>

      {/* Dark Charcoal Emblem Background matching the new Banner */}
      <rect
        x="4"
        y="4"
        width="252"
        height="252"
        rx="28"
        fill="#2E2B2B"
        stroke="#FACC15"
        strokeWidth="4"
      />

      {/* Top Left Badge: ఏది నిజం */}
      <g filter="url(#nbDropShadow)">
        <text
          x="44"
          y="42"
          textAnchor="middle"
          fontFamily="'Noto Sans Telugu', sans-serif"
          fontWeight="900"
          fontSize="24"
          fill="url(#nbRedTextGrad)"
          stroke="#FFFFFF"
          strokeWidth="4"
          paintOrder="stroke fill"
        >
          ఏది
        </text>
        <text
          x="48"
          y="68"
          textAnchor="middle"
          fontFamily="'Noto Sans Telugu', sans-serif"
          fontWeight="900"
          fontSize="22"
          fill="url(#nbRedTextGrad)"
          stroke="#FFFFFF"
          strokeWidth="4"
          paintOrder="stroke fill"
        >
          నిజం
        </text>
      </g>

      {/* Brushed Indian Tricolour Flag Strokes behind నేటి */}
      <g>
        {/* Saffron Brush Stroke */}
        <path
          d="M 105,64 C 145,56 205,54 242,60 C 236,70 245,76 232,84 C 190,82 140,86 105,90 Z"
          fill="url(#nbSaffronBrush)"
        />
        {/* White Brush Stroke */}
        <path
          d="M 108,86 C 150,82 200,82 234,86 C 228,96 234,104 226,110 C 188,108 142,110 108,112 Z"
          fill="#FFFFFF"
        />
        {/* Green Brush Stroke */}
        <path
          d="M 106,108 C 148,105 196,106 230,110 C 222,120 225,126 214,132 C 178,130 140,132 106,134 Z"
          fill="url(#nbGreenBrush)"
        />

        {/* 24-Spoke Ashoka Chakra Wheel */}
        <g transform="translate(196, 98)">
          <circle cx="0" cy="0" r="24" fill="#FFFFFF" opacity="0.92" />
          <circle cx="0" cy="0" r="23" fill="none" stroke="#000080" strokeWidth="3.5" />
          <circle cx="0" cy="0" r="4.5" fill="#000080" />
          {Array.from({ length: 12 }).map((_, idx) => {
            const angle = idx * 15;
            return (
              <line
                key={idx}
                x1="-22"
                y1="0"
                x2="22"
                y2="0"
                stroke="#000080"
                strokeWidth="1.4"
                transform={`rotate(${angle})`}
              />
            );
          })}
        </g>
      </g>

      {/* Main Bold 3D Red Textured Title: నేటి భారతం */}
      <g filter="url(#nbDropShadow)">
        <text
          x="108"
          y="128"
          textAnchor="middle"
          fontFamily="'Noto Sans Telugu', sans-serif"
          fontWeight="900"
          fontSize="64"
          fill="url(#nbRedTextGrad)"
          stroke="#FFFFFF"
          strokeWidth="8"
          paintOrder="stroke fill"
        >
          నేటి
        </text>
        <text
          x="134"
          y="196"
          textAnchor="middle"
          fontFamily="'Noto Sans Telugu', sans-serif"
          fontWeight="900"
          fontSize="54"
          fill="url(#nbRedTextGrad)"
          stroke="#FFFFFF"
          strokeWidth="8"
          paintOrder="stroke fill"
        >
          భారతం
        </text>
      </g>

      {/* Bottom Yellow Motto Ribbon */}
      <text
        x="130"
        y="236"
        textAnchor="middle"
        fontFamily="'Noto Sans Telugu', sans-serif"
        fontWeight="900"
        fontSize="14.5"
        fill="#FFD700"
      >
        నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం
      </text>
    </svg>
  );
};

interface NetiBharatamHeroBannerProps {
  branding?: SiteBrandingConfig;
  className?: string;
}

export const NetiBharatamHeroBanner: React.FC<NetiBharatamHeroBannerProps> = ({
  branding,
  className = '',
}) => {
  const customBannerUrl = branding?.bannerDataUrl?.trim();
  const topLeftTitle = branding?.topLeftBadgeText?.trim() || 'ఏది నిజం';
  const topLeftParts = topLeftTitle.split(/\s+/);
  const line1Slogan =
    branding?.sloganLine1Te?.trim() || 'జ్ఞానాన్ని పెంచే విద్య ఉపాది చూపే విద్య';
  const line2Slogan =
    branding?.sloganLine2Te?.trim() || 'ఫ్రీ విద్య ఫ్రీ వైద్యం దేశ అభివృద్ధికి నాంది.';
  const bottomMotto =
    branding?.bottomMottoTe?.trim() || 'నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం';

  if (customBannerUrl) {
    return (
      <div
        data-testid="neti-bharatam-hero-banner"
        className={`w-full rounded-2xl overflow-hidden bg-[#2E2B2B] border-2 border-stone-700 shadow-md ${className}`}
      >
        <img
          src={customBannerUrl}
          alt="నేటి భారతం - ఏది నిజం అధికారిక బ్యానర్"
          className="w-full h-auto max-h-64 object-contain mx-auto block"
        />
      </div>
    );
  }

  return (
    <div
      data-testid="neti-bharatam-hero-banner"
      className={`w-full rounded-2xl overflow-hidden bg-[#2E2B2B] border-2 border-stone-700 shadow-md ${className}`}
    >
      <svg
        viewBox="0 0 1280 270"
        className="w-full h-auto block select-none"
        role="img"
        aria-label="ఏది నిజం - నేటి భారతం: జ్ఞానాన్ని పెంచే విద్య ఉపాది చూపే విద్య, ఫ్రీ విద్య ఫ్రీ వైద్యం దేశ అభివృద్ధికి నాంది, నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం"
      >
        <defs>
          <linearGradient id="bannerRedFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF2E2E" />
            <stop offset="48%" stopColor="#D90416" />
            <stop offset="100%" stopColor="#8F000B" />
          </linearGradient>
          <linearGradient id="bannerTexturedRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E61919" />
            <stop offset="35%" stopColor="#B80000" />
            <stop offset="70%" stopColor="#E01111" />
            <stop offset="100%" stopColor="#7A0000" />
          </linearGradient>
          <linearGradient id="bannerBlueFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E2BFF" />
            <stop offset="55%" stopColor="#0812D6" />
            <stop offset="100%" stopColor="#03078A" />
          </linearGradient>
          <linearGradient id="bannerSaffron" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9933" />
            <stop offset="60%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>
          <linearGradient id="bannerGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#32CD32" />
            <stop offset="55%" stopColor="#138808" />
            <stop offset="100%" stopColor="#095404" />
          </linearGradient>
          <filter id="bannerHeavyShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Solid Dark Charcoal Banner Canvas (#2F2C2C) matching neti bharatham.png.jpg */}
        <rect width="1280" height="270" fill="#2F2C2C" />

        {/* 1. TOP-LEFT RED 3D BADGE: ఏది / నిజం */}
        <g filter="url(#bannerHeavyShadow)">
          <text
            x="68"
            y="56"
            textAnchor="middle"
            fontFamily="'Noto Sans Telugu', sans-serif"
            fontWeight="900"
            fontSize="42"
            fill="url(#bannerRedFill)"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          >
            {topLeftParts[0] || 'ఏది'}
          </text>
          <text
            x="68"
            y="96"
            textAnchor="middle"
            fontFamily="'Noto Sans Telugu', sans-serif"
            fontWeight="900"
            fontSize="38"
            fill="url(#bannerRedFill)"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          >
            {topLeftParts.slice(1).join(' ') || 'నిజం'}
          </text>
        </g>

        {/* 2. BOTTOM-LEFT WAVING FLAG & MINI నేటి భారతం EMBLEM */}
        <g transform="translate(18, 174)" filter="url(#bannerHeavyShadow)">
          {/* Flagpole */}
          <line
            x1="44"
            y1="88"
            x2="52"
            y2="4"
            stroke="#D6D3D1"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="52" cy="4" r="3.5" fill="#FACC15" />
          {/* Waving Tricolour Flag on Pole */}
          <path d="M 52,7 Q 72,12 90,18 L 88,28 Q 70,22 50,17 Z" fill="#FF8C1A" />
          <path d="M 50,17 Q 70,22 88,28 L 86,38 Q 68,32 49,27 Z" fill="#FFFFFF" />
          <path d="M 49,27 Q 68,32 86,38 L 84,48 Q 66,42 47,37 Z" fill="#138808" />
          <circle cx="68" cy="27" r="4" fill="none" stroke="#000080" strokeWidth="1.2" />

          {/* Mini నేటి భారతం Text over Flagpole */}
          <text
            x="44"
            y="48"
            textAnchor="middle"
            fontFamily="'Noto Sans Telugu', sans-serif"
            fontWeight="900"
            fontSize="24"
            fill="#B91C1C"
            stroke="#FFFBEB"
            strokeWidth="5"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          >
            నేటి
          </text>
          <text
            x="48"
            y="72"
            textAnchor="middle"
            fontFamily="'Noto Sans Telugu', sans-serif"
            fontWeight="900"
            fontSize="22"
            fill="#B91C1C"
            stroke="#FFFBEB"
            strokeWidth="5"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          >
            భారతం
          </text>
        </g>

        {/* 3. CENTER-LEFT BRUSHED TRICOLOUR FLAG + ASHOKA CHAKRA + LARGE నేటి భారతం LOGO */}
        <g transform="translate(155, 16)">
          {/* Painted Tricolour Brush Strokes behind నేటి */}
          {/* Saffron Top Brush */}
          <path
            d="M 105,34 C 155,24 235,20 295,24 C 284,32 302,38 286,46 C 235,44 165,48 105,54 Z"
            fill="url(#bannerSaffron)"
          />
          <path
            d="M 115,24 C 175,16 245,14 282,18 C 274,23 260,26 115,30 Z"
            fill="#FDBA74"
            opacity="0.65"
          />
          {/* White Middle Brush */}
          <path
            d="M 110,50 C 165,44 235,44 282,48 C 274,58 284,64 272,72 C 225,70 160,72 110,76 Z"
            fill="#FFFFFF"
          />
          {/* Green Bottom Brush */}
          <path
            d="M 105,72 C 158,68 228,68 272,72 C 264,82 272,90 256,96 C 210,94 155,96 105,100 Z"
            fill="url(#bannerGreen)"
          />

          {/* 24-Spoke Navy Blue Ashoka Chakra Wheel */}
          <g transform="translate(218, 66)">
            <circle cx="0" cy="0" r="30" fill="#FFFFFF" opacity="0.95" />
            <circle cx="0" cy="0" r="28" fill="none" stroke="#000080" strokeWidth="4.5" />
            <circle cx="0" cy="0" r="5.5" fill="#000080" />
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = idx * 15;
              return (
                <line
                  key={idx}
                  x1="-27"
                  y1="0"
                  x2="27"
                  y2="0"
                  stroke="#000080"
                  strokeWidth="1.6"
                  transform={`rotate(${angle})`}
                />
              );
            })}
          </g>

          {/* Large 3D Red Textured Telugu Title: నేటి */}
          <g filter="url(#bannerHeavyShadow)">
            <text
              x="92"
              y="112"
              textAnchor="middle"
              fontFamily="'Noto Sans Telugu', sans-serif"
              fontWeight="900"
              fontSize="88"
              fill="url(#bannerTexturedRed)"
              stroke="#FFFFFF"
              strokeWidth="10"
              strokeLinejoin="round"
              paintOrder="stroke fill"
            >
              నేటి
            </text>

            {/* Large 3D Red Textured Telugu Title: భారతం */}
            <text
              x="162"
              y="188"
              textAnchor="middle"
              fontFamily="'Noto Sans Telugu', sans-serif"
              fontWeight="900"
              fontSize="78"
              fill="url(#bannerTexturedRed)"
              stroke="#FFFFFF"
              strokeWidth="10"
              strokeLinejoin="round"
              paintOrder="stroke fill"
            >
              భారతం
            </text>
          </g>
        </g>

        {/* 4. RIGHT SIDE SLOGANS (Red Outlined Line 1, Blue Outlined Line 2, Yellow Bottom Motto) */}
        <g filter="url(#bannerHeavyShadow)">
          {/* Line 1: జ్ఞానాన్ని పెంచే విద్య ఉపాది చూపే విద్య (Red with thick White stroke) */}
          <text
            x="895"
            y="64"
            textAnchor="middle"
            fontFamily="'Noto Sans Telugu', sans-serif"
            fontWeight="900"
            fontSize="38"
            fill="#EA0000"
            stroke="#FFFFFF"
            strokeWidth="8"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          >
            {line1Slogan}
          </text>

          {/* Line 2: ఫ్రీ విద్య ఫ్రీ వైద్యం దేశ అభివృద్ధికి నాంది. (Royal Blue with thick White stroke) */}
          <text
            x="895"
            y="126"
            textAnchor="middle"
            fontFamily="'Noto Sans Telugu', sans-serif"
            fontWeight="900"
            fontSize="37"
            fill="url(#bannerBlueFill)"
            stroke="#FFFFFF"
            strokeWidth="8"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          >
            {line2Slogan}
          </text>

          {/* Bottom Line: నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం (Bright Golden Yellow) */}
          <text
            x="845"
            y="236"
            textAnchor="middle"
            fontFamily="'Noto Sans Telugu', sans-serif"
            fontWeight="900"
            fontSize="43"
            fill="#FFD700"
          >
            {bottomMotto}
          </text>
        </g>
      </svg>
    </div>
  );
};
