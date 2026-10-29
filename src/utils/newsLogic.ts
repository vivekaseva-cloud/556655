export type LanguageCode = 'te' | 'hi' | 'en';
export type NewsLevel = 'national' | 'state' | 'district' | 'mandal';
export type NewsCategory =
  | 'politics'
  | 'agriculture'
  | 'crime'
  | 'education'
  | 'business'
  | 'local'
  | 'justice';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface NewsArticleItem {
  id: string;
  titleTe: string;
  titleHi: string;
  titleEn: string;
  summaryTe: string;
  summaryHi: string;
  summaryEn: string;
  contentTe: string;
  contentHi: string;
  contentEn: string;
  level: NewsLevel;
  state: string;
  district: string;
  mandal: string;
  category: NewsCategory;
  youtubeUrl: string;
  imageType: string;
  reporterId: string;
  reporterName: string;
  views: number;
  status: ApprovalStatus;
  authorUid: string;
  createdAt: string;
  updatedAt: string;
  isBreaking?: boolean;
}

export interface ReporterRecord {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  mobile: string;
  aadhaarNumber: string;
  aadhaarDocName: string;
  aadhaarDocDataUrl?: string;
  state: string;
  district: string;
  mandal: string;
  photoDataUrl: string;
  status: ApprovalStatus;
  ownerUid: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrivateAdItem {
  id: string;
  title: string;
  sponsorName: string;
  targetLevel: NewsLevel;
  state: string;
  district: string;
  mandal: string;
  category: NewsCategory | 'all';
  ctaUrl: string;
  bannerText: string;
  imageDataUrl?: string;
  imageName?: string;
  status: ApprovalStatus;
  ownerUid: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFeedbackItem {
  id: string;
  readerName: string;
  mandal: string;
  rating: number;
  message: string;
  category: string;
  ownerUid: string;
  createdAt: string;
}

export interface AdSenseConfig {
  adsenseClientId: string;
  adsenseSlotId: string;
  adsenseScriptUrl: string;
  adsenseEnabled: boolean;
  updatedByUid: string;
  updatedAt: string;
}

export interface SiteBrandingConfig {
  logoDataUrl: string;
  bannerDataUrl: string;
  topLeftBadgeText: string;
  sloganLine1Te: string;
  sloganLine2Te: string;
  bottomMottoTe: string;
  updatedByUid: string;
  updatedAt: string;
}

export const ADMIN_USERNAME = 'Admin';
export const ADMIN_PASSWORD = 'Bchakriraju1992@';
export const NETI_BHARATAM_YOUTUBE_CHANNEL_URL =
  'https://www.youtube.com/channel/UCyfLbWdu0fNqEJdH7Ldi4Fg';

export function validateAdminCredentials(username: string, password: string): boolean {
  return username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export interface ReporterRegistrationInput {
  name: string;
  username: string;
  password: string;
  mobile: string;
  aadhaarNumber: string;
  aadhaarDocName: string;
  aadhaarDocDataUrl?: string;
  state: string;
  district: string;
  mandal: string;
  photoDataUrl: string;
}

export function validateReporterRegistration(
  input: ReporterRegistrationInput,
  existingReporters: ReporterRecord[] = []
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const name = input.name?.trim() || '';
  if (name.length < 2 || name.length > 120) {
    errors.push('రిపోర్టర్ పూర్తి పేరు కనీసం 2 అక్షరాలు ఉండాలి (Full name is required).');
  }

  const username = input.username?.trim() || '';
  if (!/^[a-zA-Z0-9_-]{3,60}$/.test(username)) {
    errors.push('యూజర్‌నేమ్ 3-60 అక్షరాలు (ఇంగ్లీష్ అక్షరాలు/అంకెలు మాత్రమే) ఉండాలి.');
  } else if (
    existingReporters.some((r) => r.username.toLowerCase() === username.toLowerCase())
  ) {
    errors.push('ఈ యూజర్‌నేమ్ ఇప్పటికే నమోదు చేయబడింది (Username already exists).');
  }

  const password = input.password || '';
  if (password.length < 6 || password.length > 128) {
    errors.push('పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి (Password must be at least 6 characters).');
  }

  const cleanMobile = (input.mobile || '').replace(/[\s-]/g, '');
  if (!/^\+?[0-9]{10,13}$/.test(cleanMobile)) {
    errors.push('సరైన 10 అంకెల మొబైల్ నంబర్ ఎంటర్ చేయండి (Valid 10-digit mobile number required).');
  }

  const cleanAadhaar = (input.aadhaarNumber || '').replace(/[\s-]/g, '');
  if (!/^[0-9]{12}$/.test(cleanAadhaar)) {
    errors.push('సరైన 12 అంకెల ఆధార్ కార్డు నంబర్ ఎంటర్ చేయండి (Valid 12-digit Aadhaar required).');
  }

  if (!input.aadhaarDocName || input.aadhaarDocName.trim().length === 0) {
    errors.push('ఆధార్ కార్డు కాపీ/వివరాలు అప్‌లోడ్ చేయడం తప్పనిసరి (Aadhaar upload is required).');
  }

  if (!input.state || input.state.trim().length < 2) {
    errors.push('రాష్ట్రాన్ని ఎంచుకోండి (State is required).');
  }
  if (!input.district || input.district.trim().length < 2) {
    errors.push('జిల్లాను ఎంచుకోండి (District is required).');
  }
  if (!input.mandal || input.mandal.trim().length < 2) {
    errors.push('మండలాన్ని ఎంచుకోండి (Mandal is required).');
  }

  if (!input.photoDataUrl || input.photoDataUrl.trim().length === 0) {
    errors.push('రిపోర్టర్ పాస్‌పోర్ట్ సైజ్ ఫోటో అప్‌లోడ్ చేయండి (Reporter photo is required).');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function canReporterPublishToMandal(
  reporter: Pick<ReporterRecord, 'status' | 'state' | 'district' | 'mandal'> | null | undefined,
  targetState: string,
  targetDistrict: string,
  targetMandal: string
): { allowed: boolean; reason?: string } {
  if (!reporter) {
    return { allowed: false, reason: 'రిపోర్టర్ లాగిన్ అయి ఉండాలి (Reporter must be logged in).' };
  }
  if (reporter.status !== 'approved') {
    return {
      allowed: false,
      reason: 'అడ్మిన్ అప్రూవల్ పెండింగ్‌లో ఉంది. అడ్మిన్ ఆమోదించిన తర్వాతే న్యూస్ అప్‌లోడ్ చేయగలరు.',
    };
  }
  if (
    reporter.state !== targetState ||
    reporter.district !== targetDistrict ||
    reporter.mandal !== targetMandal
  ) {
    return {
      allowed: false,
      reason: `మీరు నమోదు చేసుకున్న మండలం (${reporter.mandal}, ${reporter.district}) లో మాత్రమే న్యూస్ అప్‌లోడ్ చేయగలరు.`,
    };
  }
  return { allowed: true };
}

export interface NewsFilterCriteria {
  level?: NewsLevel | 'all';
  state?: string;
  district?: string;
  mandal?: string;
  category?: NewsCategory | 'all';
  searchQuery?: string;
  onlyYoutube?: boolean;
}

export function filterNewsArticles(
  articles: NewsArticleItem[],
  criteria: NewsFilterCriteria
): NewsArticleItem[] {
  const query = (criteria.searchQuery || '').trim().toLowerCase();

  return articles
    .filter((article) => {
      if (article.status !== 'approved') return false;

      if (criteria.level && criteria.level !== 'all' && article.level !== criteria.level) {
        return false;
      }

      if (criteria.state && criteria.state !== 'ALL') {
        if (article.state !== criteria.state && article.level !== 'national') {
          return false;
        }
        // When filtering specifically for a state/district/mandal, strictly match state
        if (article.state !== criteria.state) {
          return false;
        }
      }

      if (criteria.district && criteria.district !== 'ALL') {
        if (article.district !== criteria.district) {
          return false;
        }
      }

      if (criteria.mandal && criteria.mandal !== 'ALL') {
        if (article.mandal !== criteria.mandal) {
          return false;
        }
      }

      if (criteria.category && criteria.category !== 'all') {
        if (article.category !== criteria.category) {
          return false;
        }
      }

      if (criteria.onlyYoutube) {
        if (!extractYouTubeId(article.youtubeUrl)) {
          return false;
        }
      }

      if (query) {
        const haystack = [
          article.titleTe,
          article.titleHi,
          article.titleEn,
          article.summaryTe,
          article.summaryHi,
          article.summaryEn,
          article.contentTe,
          article.contentHi,
          article.contentEn,
          article.state,
          article.district,
          article.mandal,
          article.reporterName,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export interface AdTargetContext {
  state?: string;
  district?: string;
  mandal?: string;
  category?: NewsCategory | 'all';
}

export function filterTargetedAds(
  ads: PrivateAdItem[],
  context: AdTargetContext
): PrivateAdItem[] {
  return ads.filter((ad) => {
    if (ad.status !== 'approved') return false;

    if (
      context.category &&
      context.category !== 'all' &&
      ad.category !== 'all' &&
      ad.category !== context.category
    ) {
      return false;
    }

    if (context.mandal && context.mandal !== 'ALL') {
      if (ad.targetLevel === 'mandal') {
        return ad.mandal === context.mandal;
      }
      if (ad.targetLevel === 'district' && context.district && context.district !== 'ALL') {
        return ad.district === context.district;
      }
      if (ad.targetLevel === 'state' && context.state && context.state !== 'ALL') {
        return ad.state === context.state;
      }
      return ad.targetLevel === 'national';
    }

    if (context.district && context.district !== 'ALL') {
      if (ad.targetLevel === 'district' || ad.targetLevel === 'mandal') {
        return ad.district === context.district;
      }
      if (ad.targetLevel === 'state' && context.state && context.state !== 'ALL') {
        return ad.state === context.state;
      }
      return ad.targetLevel === 'national';
    }

    if (context.state && context.state !== 'ALL') {
      if (ad.targetLevel === 'national') return true;
      return ad.state === context.state;
    }

    return true;
  });
}

export function incrementArticleViews(
  articles: NewsArticleItem[],
  articleId: string
): NewsArticleItem[] {
  return articles.map((item) =>
    item.id === articleId
      ? {
          ...item,
          views: item.views + 1,
          updatedAt: new Date().toISOString(),
        }
      : item
  );
}

export function maskAadhaar(aadhaar: string): string {
  const clean = (aadhaar || '').replace(/[\s-]/g, '');
  if (clean.length < 4) return 'XXXX-XXXX-XXXX';
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

export function formatFullAadhaar(aadhaar: string): string {
  const clean = (aadhaar || '').replace(/[\s-]/g, '');
  if (clean.length !== 12) return aadhaar || 'N/A';
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
}

export function generateReporterIdCode(
  reporter: Pick<ReporterRecord, 'id' | 'state' | 'district' | 'mandal'>
): string {
  const stCode = (reporter.state || 'IN')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase()
    .padEnd(2, 'X');
  const distCode = (reporter.district || 'DST')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');
  const mandalCode = (reporter.mandal || 'MND')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');
  const numTail =
    (reporter.id || '101').replace(/[^0-9]/g, '').slice(-4).padStart(3, '0') || '101';
  return `NB-${stCode}-${distCode}-${mandalCode}-${numTail}`;
}

export function canReporterDownloadIdCard(
  reporter: Pick<ReporterRecord, 'status' | 'photoDataUrl'> | null | undefined
): { canCreatePreview: boolean; canDownload: boolean; reason?: string } {
  if (!reporter || !reporter.photoDataUrl || reporter.photoDataUrl.trim().length === 0) {
    return {
      canCreatePreview: false,
      canDownload: false,
      reason: 'రిపోర్టర్ ఫోటో అప్‌లోడ్ చేసిన వెంటనే ఆటోమేటిక్‌గా ID కార్డు క్రియేట్ అవుతుంది.',
    };
  }
  if (reporter.status !== 'approved') {
    return {
      canCreatePreview: true,
      canDownload: false,
      reason:
        'అడ్మిన్ పర్మిషన్ (Admin Approval) వచ్చిన తరువాత మాత్రమే మీరు ID కార్డును డౌన్‌లోడ్ చేసుకోగలరు.',
    };
  }
  return {
    canCreatePreview: true,
    canDownload: true,
  };
}

export interface StateLocationEntry {
  state: string;
  labelTe: string;
  labelHi: string;
  districts: {
    district: string;
    labelTe?: string;
    mandals: string[];
  }[];
}

export function addDistrictAndMandalsToLocations(
  locations: StateLocationEntry[],
  params: {
    state: string;
    district: string;
    districtLabelTe?: string;
    mandalsInput?: string;
  }
): {
  updatedLocations: StateLocationEntry[];
  addedDistrict: boolean;
  addedMandals: string[];
  error?: string;
} {
  const stateName = (params.state || '').trim();
  const districtName = (params.district || '').trim();
  const districtLabelTe = (params.districtLabelTe || '').trim();
  const rawMandals = (params.mandalsInput || '')
    .split(',')
    .map((m) => m.trim())
    .filter((m) => m.length >= 2);

  if (stateName.length < 2) {
    return {
      updatedLocations: locations,
      addedDistrict: false,
      addedMandals: [],
      error: 'దయచేసి రాష్ట్రాన్ని ఎంచుకోండి (State is required).',
    };
  }

  if (districtName.length < 2) {
    return {
      updatedLocations: locations,
      addedDistrict: false,
      addedMandals: [],
      error: 'దయచేసి జిల్లా పేరు నమోదు చేయండి లేదా ఎంచుకోండి (District name is required).',
    };
  }

  let addedDistrict = false;
  const addedMandals: string[] = [];

  const stateExists = locations.some(
    (s) => s.state.toLowerCase() === stateName.toLowerCase()
  );

  if (!stateExists) {
    addedDistrict = true;
    const uniqueMandals = Array.from(new Set(rawMandals.length > 0 ? rawMandals : [districtName]));
    addedMandals.push(...uniqueMandals);
    const newStateEntry: StateLocationEntry = {
      state: stateName,
      labelTe: stateName,
      labelHi: stateName,
      districts: [
        {
          district: districtName,
          labelTe: districtLabelTe || undefined,
          mandals: uniqueMandals,
        },
      ],
    };
    return {
      updatedLocations: [...locations, newStateEntry],
      addedDistrict,
      addedMandals,
    };
  }

  const updatedLocations = locations.map((s) => {
    if (s.state.toLowerCase() !== stateName.toLowerCase()) return s;

    const existingDistIndex = s.districts.findIndex(
      (d) => d.district.toLowerCase() === districtName.toLowerCase()
    );

    if (existingDistIndex === -1) {
      addedDistrict = true;
      const initialMandals =
        rawMandals.length > 0 ? Array.from(new Set(rawMandals)) : [districtName];
      addedMandals.push(...initialMandals);
      return {
        ...s,
        districts: [
          ...s.districts,
          {
            district: districtName,
            labelTe: districtLabelTe || undefined,
            mandals: initialMandals,
          },
        ],
      };
    }

    // District exists; add any new mandals
    const targetDist = s.districts[existingDistIndex];
    const currentMandals = [...targetDist.mandals];
    for (const candidate of rawMandals) {
      const alreadyExists = currentMandals.some(
        (m) => m.toLowerCase() === candidate.toLowerCase()
      );
      if (!alreadyExists) {
        currentMandals.push(candidate);
        addedMandals.push(candidate);
      }
    }

    const updatedDistricts = s.districts.map((d, idx) =>
      idx === existingDistIndex
        ? {
            ...d,
            labelTe: districtLabelTe || d.labelTe,
            mandals: currentMandals,
          }
        : d
    );

    return {
      ...s,
      districts: updatedDistricts,
    };
  });

  if (!addedDistrict && addedMandals.length === 0 && rawMandals.length > 0) {
    return {
      updatedLocations,
      addedDistrict: false,
      addedMandals: [],
      error: 'ఈ మండలం పేరు ఇప్పటికే ఈ జిల్లాలో ఉంది (Mandal already exists in this District).',
    };
  }

  if (!addedDistrict && rawMandals.length === 0 && !districtLabelTe) {
    return {
      updatedLocations,
      addedDistrict: false,
      addedMandals: [],
      error: 'దయచేసి కొత్త మండలం పేరు లేదా కొత్త జిల్లా పేరు నమోదు చేయండి.',
    };
  }

  return {
    updatedLocations,
    addedDistrict,
    addedMandals,
  };
}

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateAadhaarCardSvgDataUrl(params: {
  name: string;
  aadhaarNumber: string;
  mobile: string;
  mandal: string;
  district: string;
  state: string;
}): string {
  const formattedAadhaar = formatFullAadhaar(params.aadhaarNumber);
  const safeName = escapeXml(params.name || 'Reporter');
  const safeMobile = escapeXml(params.mobile || '');
  const safeAddress = escapeXml(`${params.mandal} Mandal, ${params.district}, ${params.state}`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
    <rect width="640" height="400" rx="20" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3"/>
    <rect x="0" y="0" width="640" height="58" rx="20" fill="#FF9933"/>
    <rect x="0" y="42" width="640" height="16" fill="#FF9933"/>
    <rect x="0" y="58" width="640" height="12" fill="#FFFFFF"/>
    <rect x="0" y="70" width="640" height="28" fill="#138808"/>
    <text x="320" y="38" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="20" fill="#0B1D3A">భారత విశిష్ట గుర్తింపు ప్రాధికార సంస్థ · UIDAI AADHAAR VERIFICATION COPY</text>
    <text x="320" y="89" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="13" fill="#FFFFFF">నేటిభారతం (NETI BHARATAM) — REPORTER KYC DOCUMENT</text>
    <rect x="32" y="122" width="120" height="145" rx="12" fill="#0B1D3A" stroke="#D4AF37" stroke-width="3"/>
    <circle cx="92" cy="175" r="28" fill="#FDE68A"/>
    <path d="M 52,248 C 52,215 132,215 132,248 Z" fill="#FDE68A"/>
    <text x="176" y="148" font-family="sans-serif" font-size="14" font-weight="700" fill="#64748B">పూర్తి పేరు / Name:</text>
    <text x="176" y="172" font-family="sans-serif" font-size="20" font-weight="800" fill="#0F172A">${safeName}</text>
    <text x="176" y="206" font-family="sans-serif" font-size="14" font-weight="700" fill="#64748B">మొబైల్ నెంబర్ / Mobile:</text>
    <text x="176" y="228" font-family="monospace" font-size="17" font-weight="700" fill="#0F172A">+91 ${safeMobile}</text>
    <text x="176" y="260" font-family="sans-serif" font-size="14" font-weight="700" fill="#64748B">చిరునామా / Mandal &amp; District:</text>
    <text x="176" y="282" font-family="sans-serif" font-size="15" font-weight="700" fill="#9A3412">${safeAddress}</text>
    <line x1="32" y1="312" x2="608" y2="312" stroke="#E2E8F0" stroke-width="2"/>
    <text x="320" y="352" text-anchor="middle" font-family="monospace" font-size="30" font-weight="800" letter-spacing="4" fill="#0B1D3A">${formattedAadhaar}</text>
    <text x="320" y="382" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#15803D">VERIFIED FOR NETI BHARATAM MANDAL REPORTER ACCREDITATION</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generatePressIdCardSvgDataUrl(reporter: {
  id: string;
  name: string;
  username: string;
  mobile: string;
  state: string;
  district: string;
  mandal: string;
  photoDataUrl: string;
  status: ApprovalStatus;
}): string {
  const idCode = generateReporterIdCode(reporter);
  const safeName = escapeXml(reporter.name || 'రిపోర్టర్ పేరు');
  const safeMandal = escapeXml(reporter.mandal || 'మండలం');
  const safeDistrict = escapeXml(reporter.district || 'జిల్లా');
  const safeState = escapeXml(reporter.state || 'రాష్ట్రం');
  const safeMobile = escapeXml(reporter.mobile || '');
  const safeUsername = escapeXml(reporter.username || '');
  const isApproved = reporter.status === 'approved';
  const statusText = isApproved
    ? 'APPROVED · అడ్మిన్ ఆమోదించిన అధికారిక గుర్తింపు కార్డు'
    : 'PENDING · అడ్మిన్ ఆమోదం కోసం వేచి ఉంది';
  const statusBg = isApproved ? '#15803D' : '#B45309';
  const photoHref = escapeXml(reporter.photoDataUrl || '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="450" viewBox="0 0 720 450">
    <defs>
      <linearGradient id="nbHeaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0B1D3A"/>
        <stop offset="55%" stop-color="#1E3A8A"/>
        <stop offset="100%" stop-color="#7C2D12"/>
      </linearGradient>
      <clipPath id="photoClip">
        <rect x="38" y="138" width="150" height="180" rx="14"/>
      </clipPath>
    </defs>
    <rect width="720" height="450" rx="22" fill="#FFFDF9" stroke="#D4AF37" stroke-width="4"/>
    <rect x="0" y="0" width="720" height="106" rx="20" fill="url(#nbHeaderGrad)"/>
    <rect x="0" y="88" width="720" height="18" fill="url(#nbHeaderGrad)"/>
    <line x1="0" y1="106" x2="720" y2="106" stroke="#F59E0B" stroke-width="4"/>
    <text x="36" y="46" font-family="sans-serif" font-weight="900" font-size="30" fill="#FDE047">నేటిభారతం · NETI BHARATAM</text>
    <text x="36" y="74" font-family="sans-serif" font-weight="700" font-size="14" fill="#FED7AA">జాతీయ · రాష్ట్ర · జిల్లా · మండల స్థాయి అధికారిక ప్రెస్ అక్రిడిటేషన్ కార్డు</text>
    <text x="36" y="95" font-family="sans-serif" font-weight="700" font-size="12" fill="#E2E8F0">ఒక దేశం - ఒకే చట్టం | ప్రతి పౌరుడికి సమాన న్యాయం | 24x7 NEWS NETWORK</text>
    <rect x="556" y="24" width="132" height="58" rx="10" fill="#991B1B" stroke="#FDE047" stroke-width="2"/>
    <text x="622" y="52" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="22" fill="#FFFFFF" letter-spacing="3">PRESS</text>
    <text x="622" y="72" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="10" fill="#FDE047">MANDAL REPORTER</text>

    <rect x="38" y="138" width="150" height="180" rx="14" fill="#0B1D3A" stroke="#D4AF37" stroke-width="3"/>
    ${
      photoHref
        ? `<image href="${photoHref}" x="38" y="138" width="150" height="180" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>`
        : ''
    }
    <rect x="38" y="138" width="150" height="180" rx="14" fill="none" stroke="#D4AF37" stroke-width="3"/>
    <rect x="38" y="328" width="150" height="30" rx="8" fill="#0B1D3A"/>
    <text x="113" y="348" text-anchor="middle" font-family="monospace" font-weight="800" font-size="11" fill="#FDE047">${escapeXml(idCode)}</text>

    <text x="216" y="156" font-family="sans-serif" font-weight="700" font-size="13" fill="#64748B">రిపోర్టర్ పూర్తి పేరు / REPORTER NAME</text>
    <text x="216" y="184" font-family="sans-serif" font-weight="900" font-size="24" fill="#0F172A">${safeName}</text>

    <text x="216" y="218" font-family="sans-serif" font-weight="700" font-size="13" fill="#64748B">కేటాయించిన మండలం / ASSIGNED MANDAL DESK</text>
    <rect x="216" y="226" width="466" height="38" rx="8" fill="#FFFbeb" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="230" y="251" font-family="sans-serif" font-weight="800" font-size="18" fill="#9A3412">${safeMandal} మండలం (${safeDistrict}, ${safeState})</text>

    <text x="216" y="294" font-family="sans-serif" font-weight="700" font-size="13" fill="#64748B">మొబైల్ / MOBILE</text>
    <text x="216" y="316" font-family="monospace" font-weight="800" font-size="17" fill="#0F172A">+91 ${safeMobile}</text>

    <text x="430" y="294" font-family="sans-serif" font-weight="700" font-size="13" fill="#64748B">యూజర్ ఐడి / USERNAME</text>
    <text x="430" y="316" font-family="monospace" font-weight="800" font-size="16" fill="#0F172A">@${safeUsername}</text>

    <text x="216" y="346" font-family="sans-serif" font-weight="700" font-size="12" fill="#64748B">అధికారిక సంతకం / AUTHORIZED BY: నేటిభారతం చీఫ్ ఎడిటర్ డెస్క్ (Admin Approved)</text>

    <rect x="0" y="384" width="720" height="66" rx="18" fill="${statusBg}"/>
    <rect x="0" y="384" width="720" height="22" fill="${statusBg}"/>
    <text x="360" y="416" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="16" fill="#FFFFFF">${statusText}</text>
    <text x="360" y="436" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="12" fill="#FEF3C7">ఈ ఐడి కార్డు ఉన్న రిపోర్టర్ మాత్రమే తన మండలంలో నేటిభారతం వార్తలను అప్‌లోడ్ చేయగలరు</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generatePrivateAdBannerSvgDataUrl(params: {
  title: string;
  sponsorName: string;
  bannerText?: string;
  mandal?: string;
  district?: string;
  state?: string;
  targetLevel?: NewsLevel;
  category?: NewsCategory | 'all';
  theme?: 'gold' | 'agri' | 'royal' | 'medical';
}): string {
  const safeLocation = escapeXml(
    `${params.mandal || 'Mangalagiri'}, ${params.district || 'Guntur'}`
  );
  const safeLevel = escapeXml(`${(params.targetLevel || 'mandal').toUpperCase()} SPONSORED AD`);

  const inferredTheme =
    params.theme ||
    (params.category === 'agriculture'
      ? 'agri'
      : params.category === 'education' || params.targetLevel === 'national'
        ? 'royal'
        : params.category === 'local'
          ? 'medical'
          : 'gold');

  if (inferredTheme === 'agri') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
      <defs>
        <linearGradient id="agriSky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064E3B"/>
          <stop offset="55%" stop-color="#047857"/>
          <stop offset="100%" stop-color="#022C22"/>
        </linearGradient>
        <linearGradient id="solarPanel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1E3A8A"/>
          <stop offset="100%" stop-color="#0B1D3A"/>
        </linearGradient>
      </defs>
      <rect width="720" height="405" fill="url(#agriSky)"/>
      <!-- Golden Sun -->
      <circle cx="595" cy="92" r="56" fill="#FDE047" opacity="0.22"/>
      <circle cx="595" cy="92" r="36" fill="#FACC15"/>
      <!-- Lush Rolling Crop Hills -->
      <path d="M 0,285 Q 190,235 390,275 T 720,260 L 720,405 L 0,405 Z" fill="#065F46"/>
      <path d="M 0,325 Q 240,280 480,320 T 720,305 L 720,405 L 0,405 Z" fill="#10B981" opacity="0.45"/>
      <!-- Solar Pump Array on Left -->
      <polygon points="75,205 245,205 215,285 45,285" fill="url(#solarPanel)" stroke="#FDE047" stroke-width="2.5"/>
      <line x1="130" y1="205" x2="100" y2="285" stroke="#93C5FD" stroke-width="1.5" opacity="0.7"/>
      <line x1="185" y1="205" x2="155" y2="285" stroke="#93C5FD" stroke-width="1.5" opacity="0.7"/>
      <line x1="60" y1="245" x2="230" y2="245" stroke="#93C5FD" stroke-width="1.5" opacity="0.7"/>
      <rect x="132" y="285" width="16" height="42" fill="#CBD5E1"/>
      <!-- Water Spray Arc -->
      <path d="M 245,275 Q 310,220 365,295" fill="none" stroke="#38BDF8" stroke-width="4" stroke-dasharray="6,4"/>
      <path d="M 245,285 Q 325,245 385,310" fill="none" stroke="#7DD3FC" stroke-width="3" stroke-dasharray="5,4"/>
      <!-- Agricultural Drone in Center-Right Sky -->
      <line x1="330" y1="115" x2="470" y2="115" stroke="#F8FAFC" stroke-width="5" stroke-linecap="round"/>
      <rect x="372" y="102" width="56" height="28" rx="10" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="400" cy="116" r="6" fill="#0B1D3A"/>
      <ellipse cx="330" cy="105" rx="28" ry="5" fill="#FDE047"/>
      <ellipse cx="470" cy="105" rx="28" ry="5" fill="#FDE047"/>
      <path d="M 382,130 L 368,154 M 418,130 L 432,154" stroke="#E2E8F0" stroke-width="3"/>
      <!-- Spray Mist from Drone -->
      <polygon points="365,155 435,155 475,245 325,245" fill="#A7F3D0" opacity="0.22"/>
      <!-- Top & Bottom Badges -->
      <rect x="24" y="22" width="230" height="32" rx="8" fill="#0B1D3A" stroke="#FDE047" stroke-width="1.5"/>
      <text x="139" y="43" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="12" fill="#FDE047">${safeLevel}</text>
      <rect x="520" y="22" width="176" height="34" rx="17" fill="#FACC15"/>
      <text x="608" y="44" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="13" fill="#022C22">40% AGRI SUBSIDY</text>
      <rect x="0" y="345" width="720" height="60" fill="#0B1D3A" opacity="0.92"/>
      <line x1="0" y1="345" x2="720" y2="345" stroke="#F59E0B" stroke-width="3"/>
      <text x="28" y="381" font-family="sans-serif" font-weight="900" font-size="18" fill="#FDE047">KISAN AGRI DRONE &amp; SOLAR PUMP SETS</text>
      <text x="692" y="381" text-anchor="end" font-family="sans-serif" font-weight="700" font-size="14" fill="#A7F3D0">${safeLocation}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (inferredTheme === 'royal') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
      <defs>
        <linearGradient id="royalBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0B1D3A"/>
          <stop offset="55%" stop-color="#1E3A8A"/>
          <stop offset="100%" stop-color="#172554"/>
        </linearGradient>
      </defs>
      <rect width="720" height="405" fill="url(#royalBg)"/>
      <circle cx="580" cy="180" r="130" fill="#FDE047" opacity="0.08"/>
      <!-- Classical Pillar & Constitutional Dome Illustration -->
      <path d="M 105,150 Q 195,70 285,150 Z" fill="#F59E0B" stroke="#FDE047" stroke-width="2.5"/>
      <rect x="100" y="150" width="190" height="14" rx="4" fill="#FDE047"/>
      <rect x="118" y="164" width="18" height="115" fill="#E2E8F0"/>
      <rect x="162" y="164" width="18" height="115" fill="#E2E8F0"/>
      <rect x="208" y="164" width="18" height="115" fill="#E2E8F0"/>
      <rect x="252" y="164" width="18" height="115" fill="#E2E8F0"/>
      <rect x="92" y="279" width="206" height="18" rx="4" fill="#CBD5E1"/>
      <!-- Scales of Justice & Open Book on Right -->
      <line x1="520" y1="95" x2="520" y2="265" stroke="#FDE047" stroke-width="6" stroke-linecap="round"/>
      <rect x="470" y="265" width="100" height="14" rx="6" fill="#F59E0B"/>
      <line x1="440" y1="130" x2="600" y2="130" stroke="#FDE047" stroke-width="5" stroke-linecap="round"/>
      <line x1="445" y1="130" x2="425" y2="195" stroke="#FEF08A" stroke-width="2.5"/>
      <line x1="445" y1="130" x2="465" y2="195" stroke="#FEF08A" stroke-width="2.5"/>
      <path d="M 418,195 Q 445,222 472,195 Z" fill="#F59E0B" stroke="#FDE047" stroke-width="2"/>
      <line x1="595" y1="130" x2="575" y2="195" stroke="#FEF08A" stroke-width="2.5"/>
      <line x1="595" y1="130" x2="615" y2="195" stroke="#FEF08A" stroke-width="2.5"/>
      <path d="M 568,195 Q 595,222 622,195 Z" fill="#F59E0B" stroke="#FDE047" stroke-width="2"/>
      <!-- Top & Bottom Badges -->
      <rect x="24" y="22" width="230" height="32" rx="8" fill="#0F172A" stroke="#FDE047" stroke-width="1.5"/>
      <text x="139" y="43" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="12" fill="#FDE047">${safeLevel}</text>
      <rect x="520" y="22" width="176" height="34" rx="17" fill="#F59E0B"/>
      <text x="608" y="44" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="13" fill="#0B1D3A">FREE GUIDE &amp; CLASSES</text>
      <rect x="0" y="345" width="720" height="60" fill="#09152B"/>
      <line x1="0" y1="345" x2="720" y2="345" stroke="#F59E0B" stroke-width="3"/>
      <text x="28" y="381" font-family="sans-serif" font-weight="900" font-size="18" fill="#FDE047">LEGAL AWARENESS &amp; CIVIL SERVICES ACADEMY</text>
      <text x="692" y="381" text-anchor="end" font-family="sans-serif" font-weight="700" font-size="14" fill="#93C5FD">${safeLocation}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (inferredTheme === 'medical') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
      <defs>
        <linearGradient id="medBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0F172A"/>
          <stop offset="55%" stop-color="#0F766E"/>
          <stop offset="100%" stop-color="#115E59"/>
        </linearGradient>
      </defs>
      <rect width="720" height="405" fill="url(#medBg)"/>
      <!-- Medical Cross Shield on Left -->
      <circle cx="170" cy="195" r="88" fill="#FFFFFF" opacity="0.12" stroke="#5EEAD4" stroke-width="3"/>
      <circle cx="170" cy="195" r="68" fill="#FFFFFF"/>
      <rect x="152" y="147" width="36" height="96" rx="6" fill="#E11D48"/>
      <rect x="122" y="177" width="96" height="36" rx="6" fill="#E11D48"/>
      <!-- ECG Pulse Line Across Center-Right -->
      <polyline points="290,205 360,205 385,145 415,265 445,120 475,240 500,185 525,205 660,205" fill="none" stroke="#5EEAD4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Price Offer Circle -->
      <circle cx="605" cy="145" r="54" fill="#F43F5E" stroke="#FFFFFF" stroke-width="3"/>
      <text x="605" y="138" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="13" fill="#FFE4E6">FULL CHECKUP</text>
      <text x="605" y="164" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="22" fill="#FFFFFF">Rs. 999</text>
      <!-- Top & Bottom Badges -->
      <rect x="24" y="22" width="230" height="32" rx="8" fill="#0B1D3A" stroke="#5EEAD4" stroke-width="1.5"/>
      <text x="139" y="43" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="12" fill="#5EEAD4">${safeLevel}</text>
      <rect x="520" y="22" width="176" height="34" rx="17" fill="#5EEAD4"/>
      <text x="608" y="44" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="13" fill="#0F172A">24x7 DIAGNOSTICS</text>
      <rect x="0" y="345" width="720" height="60" fill="#0B1D3A"/>
      <line x1="0" y1="345" x2="720" y2="345" stroke="#5EEAD4" stroke-width="3"/>
      <text x="28" y="381" font-family="sans-serif" font-weight="900" font-size="18" fill="#5EEAD4">MEDICAL DIAGNOSTICS &amp; HEALTH CARE CENTER</text>
      <text x="692" y="381" text-anchor="end" font-family="sans-serif" font-weight="700" font-size="14" fill="#E2E8F0">${safeLocation}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Default 'gold' theme: Handloom Saree / Mega Retail Showroom Illustration
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
    <defs>
      <linearGradient id="goldBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7C2D12"/>
        <stop offset="52%" stop-color="#9A3412"/>
        <stop offset="100%" stop-color="#431407"/>
      </linearGradient>
      <linearGradient id="sareeSilk" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#DC2626"/>
        <stop offset="60%" stop-color="#B91C1C"/>
        <stop offset="100%" stop-color="#7F1D1D"/>
      </linearGradient>
    </defs>
    <rect width="720" height="405" fill="url(#goldBg)"/>
    <!-- Decorative Festive Arch & Mandala Glow -->
    <circle cx="230" cy="195" r="125" fill="#FDE047" opacity="0.1"/>
    <!-- Illustrated Silk Saree Drape with Golden Nizam Zari Border -->
    <rect x="70" y="92" width="290" height="205" rx="16" fill="url(#sareeSilk)" stroke="#FDE047" stroke-width="4"/>
    <rect x="70" y="248" width="290" height="49" rx="6" fill="#F59E0B"/>
    <!-- Traditional Mangalagiri Temple Zari Motifs -->
    <polygon points="85,248 105,222 125,248" fill="#FDE047"/>
    <polygon points="130,248 150,222 170,248" fill="#FDE047"/>
    <polygon points="175,248 195,222 215,248" fill="#FDE047"/>
    <polygon points="220,248 240,222 260,248" fill="#FDE047"/>
    <polygon points="265,248 285,222 305,248" fill="#FDE047"/>
    <polygon points="310,248 330,222 350,248" fill="#FDE047"/>
    <circle cx="145" cy="155" r="18" fill="#FDE047" opacity="0.85"/>
    <circle cx="215" cy="145" r="14" fill="#FDE047" opacity="0.85"/>
    <circle cx="285" cy="165" r="18" fill="#FDE047" opacity="0.85"/>
    <!-- Festive Shopping Bags & Discount Starburst on Right -->
    <rect x="420" y="135" width="95" height="125" rx="10" fill="#F59E0B" stroke="#FEF08A" stroke-width="2.5"/>
    <path d="M 445,135 C 445,102 490,102 490,135" fill="none" stroke="#FEF08A" stroke-width="4"/>
    <rect x="485" y="160" width="90" height="115" rx="10" fill="#15803D" stroke="#FDE047" stroke-width="2.5"/>
    <path d="M 510,160 C 510,130 550,130 550,160" fill="none" stroke="#FDE047" stroke-width="4"/>
    <!-- Discount Seal -->
    <circle cx="615" cy="145" r="56" fill="#FDE047" stroke="#0B1D3A" stroke-width="4"/>
    <text x="615" y="140" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="24" fill="#7C2D12">25% OFF</text>
    <text x="615" y="164" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="12" fill="#0B1D3A">SPECIAL OFFER</text>
    <!-- Top & Bottom Badges -->
    <rect x="24" y="22" width="230" height="32" rx="8" fill="#0B1D3A" stroke="#FDE047" stroke-width="1.5"/>
    <text x="139" y="43" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="12" fill="#FDE047">${safeLevel}</text>
    <rect x="520" y="22" width="176" height="34" rx="17" fill="#F59E0B"/>
    <text x="608" y="44" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="13" fill="#0B1D3A">HANDLOOM EXPO</text>
    <rect x="0" y="345" width="720" height="60" fill="#0B1D3A"/>
    <line x1="0" y1="345" x2="720" y2="345" stroke="#F59E0B" stroke-width="3"/>
    <text x="28" y="381" font-family="sans-serif" font-weight="900" font-size="18" fill="#FDE047">MANGALAGIRI SILK &amp; HANDLOOM MEGA EXPO</text>
    <text x="692" y="381" text-anchor="end" font-family="sans-serif" font-weight="700" font-size="14" fill="#FED7AA">${safeLocation}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getPrivateAdImageUrl(ad: PrivateAdItem): string {
  if (ad.imageDataUrl && ad.imageDataUrl.trim().length > 0) {
    return ad.imageDataUrl;
  }
  return generatePrivateAdBannerSvgDataUrl({
    title: ad.title,
    sponsorName: ad.sponsorName,
    bannerText: ad.bannerText,
    mandal: ad.mandal,
    district: ad.district,
    state: ad.state,
    targetLevel: ad.targetLevel,
    category: ad.category,
  });
}

export interface ReporterEditPatch {
  name?: string;
  username?: string;
  passwordHash?: string;
  mobile?: string;
  state?: string;
  district?: string;
  mandal?: string;
}

export function updateReporterCredentialsAndDetails(
  reporters: ReporterRecord[],
  reporterId: string,
  patch: ReporterEditPatch
): {
  updatedReporters: ReporterRecord[];
  updatedReporter: ReporterRecord | null;
  error?: string;
} {
  const target = reporters.find((r) => r.id === reporterId);
  if (!target) {
    return {
      updatedReporters: reporters,
      updatedReporter: null,
      error: 'రిపోర్టర్ రికార్డు కనుగొనబడలేదు (Reporter not found).',
    };
  }

  const nextName = patch.name !== undefined ? patch.name.trim() : target.name;
  const nextUsername = patch.username !== undefined ? patch.username.trim() : target.username;
  const nextPassword =
    patch.passwordHash !== undefined ? patch.passwordHash.trim() : target.passwordHash;
  const nextMobile =
    patch.mobile !== undefined ? patch.mobile.replace(/[\s-]/g, '') : target.mobile;
  const nextState = patch.state !== undefined ? patch.state.trim() : target.state;
  const nextDistrict = patch.district !== undefined ? patch.district.trim() : target.district;
  const nextMandal = patch.mandal !== undefined ? patch.mandal.trim() : target.mandal;

  if (nextName.length < 2 || nextName.length > 120) {
    return {
      updatedReporters: reporters,
      updatedReporter: null,
      error: 'రిపోర్టర్ పేరు కనీసం 2 అక్షరాలు ఉండాలి (Valid name is required).',
    };
  }

  if (!/^[a-zA-Z0-9_-]{3,60}$/.test(nextUsername)) {
    return {
      updatedReporters: reporters,
      updatedReporter: null,
      error: 'యూజర్‌నేమ్ 3-60 అక్షరాలు (ఇంగ్లీష్ అక్షరాలు/అంకెలు/అండర్‌స్కోర్ మాత్రమే) ఉండాలి.',
    };
  }

  const duplicateUser = reporters.some(
    (r) => r.id !== reporterId && r.username.toLowerCase() === nextUsername.toLowerCase()
  );
  if (duplicateUser) {
    return {
      updatedReporters: reporters,
      updatedReporter: null,
      error: 'ఈ యూజర్‌నేమ్ ఇప్పటికే వేరొక రిపోర్టర్‌కు ఉంది (Username already exists).',
    };
  }

  if (nextPassword.length < 4 || nextPassword.length > 128) {
    return {
      updatedReporters: reporters,
      updatedReporter: null,
      error: 'పాస్‌వర్డ్ కనీసం 4 అక్షరాలు ఉండాలి (Password must be at least 4 characters).',
    };
  }

  if (!/^\+?[0-9]{10,13}$/.test(nextMobile)) {
    return {
      updatedReporters: reporters,
      updatedReporter: null,
      error: 'సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి (Valid 10-digit mobile required).',
    };
  }

  const updatedRecord: ReporterRecord = {
    ...target,
    name: nextName,
    username: nextUsername,
    passwordHash: nextPassword,
    mobile: nextMobile,
    state: nextState || target.state,
    district: nextDistrict || target.district,
    mandal: nextMandal || target.mandal,
    updatedAt: new Date().toISOString(),
  };

  const updatedReporters = reporters.map((r) => (r.id === reporterId ? updatedRecord : r));
  return {
    updatedReporters,
    updatedReporter: updatedRecord,
  };
}

export function mergeWithDefaultLocations(
  stored: StateLocationEntry[],
  defaults: StateLocationEntry[]
): StateLocationEntry[] {
  if (!Array.isArray(stored) || stored.length === 0) return defaults;

  const merged: StateLocationEntry[] = defaults.map((defState) => {
    const customState = stored.find(
      (s) => s.state.toLowerCase() === defState.state.toLowerCase()
    );
    if (!customState) return defState;

    const districtMap = new Map<
      string,
      { district: string; labelTe?: string; mandals: string[] }
    >();

    for (const d of defState.districts) {
      districtMap.set(d.district.toLowerCase(), {
        district: d.district,
        labelTe: d.labelTe,
        mandals: [...d.mandals],
      });
    }

    for (const cd of customState.districts) {
      const key = cd.district.toLowerCase();
      // Skip legacy aliases that were renamed in official 26-district directory
      if (
        defState.state === 'Andhra Pradesh' &&
        (key === 'ntr vijayawada' || key === 'konaseema' || key === 'anantapur' || key === 'spsr nellore')
      ) {
        continue;
      }
      const existing = districtMap.get(key);
      if (!existing) {
        districtMap.set(key, {
          district: cd.district,
          labelTe: cd.labelTe,
          mandals: [...cd.mandals],
        });
      } else {
        for (const m of cd.mandals) {
          if (!existing.mandals.some((em) => em.toLowerCase() === m.toLowerCase())) {
            existing.mandals.push(m);
          }
        }
      }
    }

    return {
      ...defState,
      districts: Array.from(districtMap.values()),
    };
  });

  // Also preserve any completely custom states added by Admin
  for (const s of stored) {
    if (!merged.some((ms) => ms.state.toLowerCase() === s.state.toLowerCase())) {
      merged.push(s);
    }
  }

  return merged;
}

export const CANONICAL_NETIBHAARATHAM_DOMAIN = 'https://netibhaaratham.com';

export function buildArticleWindowUrl(articleId: string, baseOrigin?: string): string {
  const origin =
    baseOrigin ||
    (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : CANONICAL_NETIBHAARATHAM_DOMAIN);
  return `${origin}/?article=${encodeURIComponent(articleId)}`;
}

export function buildCanonicalArticleUrl(articleId: string): string {
  return `${CANONICAL_NETIBHAARATHAM_DOMAIN}/?article=${encodeURIComponent(articleId)}`;
}

export function extractArticleIdFromUrl(
  searchOrUrl: string,
  hash: string = ''
): string | null {
  if (!searchOrUrl && !hash) return null;

  try {
    if (searchOrUrl.includes('?') || searchOrUrl.includes('://')) {
      const urlObj = new URL(searchOrUrl, 'https://dummy.local');
      const param = urlObj.searchParams.get('article') || urlObj.searchParams.get('news');
      if (param) return param.trim();
      if (urlObj.hash) {
        return extractArticleIdFromUrl('', urlObj.hash);
      }
    } else {
      const sp = new URLSearchParams(searchOrUrl);
      const param = sp.get('article') || sp.get('news');
      if (param) return param.trim();
    }
  } catch {
    // fallback
  }

  const searchMatch = searchOrUrl.match(/[?&](?:article|news)=([^&#]+)/);
  if (searchMatch && searchMatch[1]) {
    return decodeURIComponent(searchMatch[1]).trim();
  }

  if (hash) {
    const cleanHash = hash.replace(/^#/, '');
    const hashMatch = cleanHash.match(/(?:^|[&?])(?:article|news)=([^&]+)/);
    if (hashMatch && hashMatch[1]) {
      return decodeURIComponent(hashMatch[1]).trim();
    }
    if (/^(?:rep_news_|art_|news_)/.test(cleanHash)) {
      return cleanHash.trim();
    }
  }

  return null;
}

export interface SocialShareLinks {
  articleUrl: string;
  canonicalUrl: string;
  shareText: string;
  whatsappUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  instagramShareCaption: string;
}

export function buildSocialShareLinks(params: {
  id: string;
  title: string;
  summary?: string;
  mandal: string;
  district: string;
  state: string;
  baseOrigin?: string;
}): SocialShareLinks {
  const articleUrl = buildArticleWindowUrl(params.id, params.baseOrigin);
  const canonicalUrl = buildCanonicalArticleUrl(params.id);
  const locationTag = `${params.mandal} మండలం (${params.district}, ${params.state})`;
  const summaryPart = params.summary ? `\n${params.summary.trim()}` : '';
  const shareText = `📰 ఏది నిజం · నేటిభారతం | ${locationTag}\n${params.title.trim()}${summaryPart}\n🔗 పూర్తి వార్త: ${canonicalUrl}`;
  const instagramShareCaption = `${shareText}\n#NetiBharatam #EdiNijam #${params.mandal.replace(/\s+/g, '')} #${params.district.replace(/\s+/g, '')}`;

  return {
    articleUrl,
    canonicalUrl,
    shareText,
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    facebookUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}&quote=${encodeURIComponent(params.title)}`,
    instagramUrl: 'https://www.instagram.com/',
    instagramShareCaption,
  };
}

export interface UnifiedMandalBundle {
  mandalArticles: NewsArticleItem[];
  districtArticles: NewsArticleItem[];
  mandalAds: PrivateAdItem[];
}

export function getUnifiedMandalBundle(
  articles: NewsArticleItem[],
  ads: PrivateAdItem[],
  location: {
    state: string;
    district: string;
    mandal: string;
  }
): UnifiedMandalBundle {
  const mandalArticles = filterNewsArticles(articles, {
    state: location.state,
    district: location.district,
    mandal: location.mandal,
  });

  const districtArticles = filterNewsArticles(articles, {
    state: location.state,
    district: location.district,
  }).filter((a) => a.mandal.toLowerCase() !== location.mandal.toLowerCase());

  const mandalAds = filterTargetedAds(ads, {
    state: location.state,
    district: location.district,
    mandal: location.mandal,
  });

  return {
    mandalArticles,
    districtArticles,
    mandalAds,
  };
}

