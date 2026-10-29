import React, { useState, useMemo, useEffect } from 'react';
import {
  UserPlus,
  LogIn,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Upload,
  Youtube,
  MapPin,
  Eye,
  LogOut,
  FileCheck2,
  Camera,
  Download,
  CreditCard,
} from 'lucide-react';
import {
  getStates,
  getDistrictsByState,
  getMandalsByDistrict,
  TRANSLATIONS,
  type StateEntry,
} from '../data/indiaLocations';
import {
  validateReporterRegistration,
  canReporterPublishToMandal,
  canReporterDownloadIdCard,
  generateReporterIdCode,
  generateAadhaarCardSvgDataUrl,
  generatePressIdCardSvgDataUrl,
  maskAadhaar,
  type LanguageCode,
  type NewsArticleItem,
  type NewsCategory,
  type ReporterRecord,
} from '../utils/newsLogic';
import { downloadReporterPressIdCard } from '../utils/cardDownload';
import { ReporterAvatar } from './EditorialIllustration';
import { PressIdCardPreview } from './IdentityCards';

interface ReporterPortalProps {
  language: LanguageCode;
  reporters: ReporterRecord[];
  articles: NewsArticleItem[];
  locations?: StateEntry[];
  prefillLocation?: { state: string; district: string; mandal: string } | null;
  onRegisterReporter: (newReporter: ReporterRecord) => Promise<void> | void;
  onPublishNews: (article: NewsArticleItem) => Promise<void> | void;
  onOpenMandalPage: (state: string, district: string, mandal: string) => void;
}

export const ReporterPortal: React.FC<ReporterPortalProps> = ({
  language,
  reporters,
  articles,
  locations,
  prefillLocation,
  onRegisterReporter,
  onPublishNews,
  onOpenMandalPage,
}) => {
  const t = TRANSLATIONS[language];
  const stateLocations = useMemo(() => locations || getStates(), [locations]);
  const [activeTab, setActiveTab] = useState<'register' | 'dashboard'>('register');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regState, setRegState] = useState(prefillLocation?.state || 'Andhra Pradesh');
  const [regDistrict, setRegDistrict] = useState(prefillLocation?.district || 'Guntur');
  const [regMandal, setRegMandal] = useState(prefillLocation?.mandal || 'Mangalagiri');
  const [regMobile, setRegMobile] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAadhaarNumber, setRegAadhaarNumber] = useState('');
  const [regAadhaarDocName, setRegAadhaarDocName] = useState('');
  const [regAadhaarDocDataUrl, setRegAadhaarDocDataUrl] = useState('');
  const [regPhotoDataUrl, setRegPhotoDataUrl] = useState('');
  const [regErrors, setRegErrors] = useState<string[]>([]);
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  useEffect(() => {
    if (prefillLocation && prefillLocation.state !== 'ALL') {
      setRegState(prefillLocation.state);
      const dists = getDistrictsByState(prefillLocation.state, stateLocations);
      const dist =
        prefillLocation.district && prefillLocation.district !== 'ALL'
          ? prefillLocation.district
          : dists[0]?.district || '';
      setRegDistrict(dist);
      const mands = getMandalsByDistrict(prefillLocation.state, dist, stateLocations);
      const mand =
        prefillLocation.mandal && prefillLocation.mandal !== 'ALL'
          ? prefillLocation.mandal
          : mands[0] || '';
      setRegMandal(mand);
    }
  }, [prefillLocation, stateLocations]);

  const availableDistricts = useMemo(
    () => getDistrictsByState(regState, stateLocations),
    [regState, stateLocations]
  );
  const availableMandals = useMemo(
    () => getMandalsByDistrict(regState, regDistrict, stateLocations),
    [regState, regDistrict, stateLocations]
  );

  // Reporter Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggedInReporterUsername, setLoggedInReporterUsername] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');

  // Always derive the current reporter record from the live `reporters` prop so Admin approvals reflect immediately
  const activeReporter = useMemo(
    () =>
      loggedInReporterUsername
        ? reporters.find(
            (r) => r.username.toLowerCase() === loggedInReporterUsername.toLowerCase()
          ) || null
        : null,
    [reporters, loggedInReporterUsername]
  );

  // News Upload State (in Reporter Dashboard)
  const [newsTitleTe, setNewsTitleTe] = useState('');
  const [newsTitleHi, setNewsTitleHi] = useState('');
  const [newsTitleEn, setNewsTitleEn] = useState('');
  const [newsSummaryTe, setNewsSummaryTe] = useState('');
  const [newsContentTe, setNewsContentTe] = useState('');
  const [newsCategory, setNewsCategory] = useState<NewsCategory>('local');
  const [newsYoutubeUrl, setNewsYoutubeUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRegPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAvatarPhoto = () => {
    const initials =
      regName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'NB';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="280" viewBox="0 0 240 280"><rect width="240" height="280" rx="18" fill="#0B1D3A"/><circle cx="120" cy="100" r="46" fill="#FDE68A"/><path d="M 46,244 C 46,182 194,182 194,244 Z" fill="#FDE68A"/><rect x="20" y="230" width="200" height="34" rx="8" fill="#9A3412"/><text x="120" y="252" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="14">PRESS PHOTO · ${initials}</text></svg>`;
    setRegPhotoDataUrl(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
  };

  // Live auto-created Press ID Card preview as soon as reporter provides their photo
  const autoCreatedIdCardUrl = useMemo(() => {
    if (!regPhotoDataUrl) return null;
    return generatePressIdCardSvgDataUrl({
      id: 'NEW-101',
      name: regName.trim() || 'రిపోర్టర్ పేరు (Reporter Name)',
      username: regUsername.trim() || 'reporter_id',
      mobile: regMobile.trim() || '98XXXXXXXX',
      state: regState,
      district: regDistrict,
      mandal: regMandal,
      photoDataUrl: regPhotoDataUrl,
      status: 'pending',
    });
  }, [regPhotoDataUrl, regName, regUsername, regMobile, regState, regDistrict, regMandal]);

  const handleAadhaarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRegAadhaarDocName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result.length < 145000) {
        setRegAadhaarDocDataUrl(reader.result);
      } else {
        setRegAadhaarDocDataUrl(
          generateAadhaarCardSvgDataUrl({
            name: regName.trim() || 'Reporter',
            aadhaarNumber: regAadhaarNumber.trim() || '000000000000',
            mobile: regMobile.trim() || '',
            mandal: regMandal,
            district: regDistrict,
            state: regState,
          })
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAttachDigiLockerAadhaar = () => {
    setRegAadhaarDocName('aadhaar_verified_copy.svg');
    setRegAadhaarDocDataUrl(
      generateAadhaarCardSvgDataUrl({
        name: regName.trim() || 'Reporter Applicant',
        aadhaarNumber: regAadhaarNumber.trim() || '458923419012',
        mobile: regMobile.trim() || '9848012345',
        mandal: regMandal,
        district: regDistrict,
        state: regState,
      })
    );
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrors([]);
    setRegSuccessMsg('');

    const finalAadhaarDataUrl =
      regAadhaarDocDataUrl ||
      generateAadhaarCardSvgDataUrl({
        name: regName.trim(),
        aadhaarNumber: regAadhaarNumber.trim(),
        mobile: regMobile.trim(),
        mandal: regMandal,
        district: regDistrict,
        state: regState,
      });

    const validation = validateReporterRegistration(
      {
        name: regName,
        username: regUsername,
        password: regPassword,
        mobile: regMobile,
        aadhaarNumber: regAadhaarNumber,
        aadhaarDocName: regAadhaarDocName,
        aadhaarDocDataUrl: finalAadhaarDataUrl,
        state: regState,
        district: regDistrict,
        mandal: regMandal,
        photoDataUrl: regPhotoDataUrl,
      },
      reporters
    );

    if (!validation.valid) {
      setRegErrors(validation.errors);
      return;
    }

    const now = new Date().toISOString();
    const newReporter: ReporterRecord = {
      id: `rep-${Date.now()}`,
      name: regName.trim(),
      username: regUsername.trim(),
      passwordHash: regPassword,
      mobile: regMobile.replace(/[\s-]/g, ''),
      aadhaarNumber: regAadhaarNumber.replace(/[\s-]/g, ''),
      aadhaarDocName: regAadhaarDocName.trim(),
      aadhaarDocDataUrl: finalAadhaarDataUrl,
      state: regState,
      district: regDistrict,
      mandal: regMandal,
      photoDataUrl: regPhotoDataUrl,
      status: 'pending',
      ownerUid: 'reporter-self',
      createdAt: now,
      updatedAt: now,
    };

    await onRegisterReporter(newReporter);
    setRegSuccessMsg(
      `రిజిస్ట్రేషన్ విజయవంతమైంది! మీ ఫోటో ఆధారంగా ప్రెస్ ఐడి కార్డు ఆటోమేటిక్‌గా క్రియేట్ చేయబడింది. అడ్మిన్ ఆమోదం (Admin Permission) వచ్చిన వెంటనే మీరు మీ అధికారిక ఐడి కార్డును డౌన్‌లోడ్ చేసుకోవచ్చు మరియు ${regMandal} మండల వార్తలు అప్‌లోడ్ చేయవచ్చు.`
    );
    setLoginUsername(newReporter.username);
    setLoginPassword(newReporter.passwordHash);
  };

  const handleReporterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const found = reporters.find(
      (r) =>
        r.username.toLowerCase() === loginUsername.trim().toLowerCase() &&
        r.passwordHash === loginPassword
    );
    if (!found) {
      setLoginError('యూజర్‌నేమ్ లేదా పాస్‌వర్డ్ తప్పుగా ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి.');
      return;
    }
    setLoggedInReporterUsername(found.username);
    setUploadError('');
    setUploadSuccess('');
  };

  const handlePublishMandalNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!activeReporter) return;

    const permission = canReporterPublishToMandal(
      activeReporter,
      activeReporter.state,
      activeReporter.district,
      activeReporter.mandal
    );
    if (!permission.allowed) {
      setUploadError(permission.reason || 'Permission denied');
      return;
    }

    if (newsTitleTe.trim().length < 5 || newsContentTe.trim().length < 15) {
      setUploadError('దయచేసి వార్త శీర్షిక (Title) మరియు పూర్తి వివరాలు (Content) నమోదు చేయండి.');
      return;
    }

    const now = new Date().toISOString();
    const summaryText =
      newsSummaryTe.trim() || newsContentTe.trim().slice(0, 180) + '...';

    const newArticle: NewsArticleItem = {
      id: `news-mandal-${Date.now()}`,
      titleTe: newsTitleTe.trim(),
      titleHi: newsTitleHi.trim() || `${activeReporter.mandal} मंडल: ${newsTitleTe.trim()}`,
      titleEn: newsTitleEn.trim() || `${activeReporter.mandal} Mandal: ${newsTitleTe.trim()}`,
      summaryTe: summaryText,
      summaryHi: summaryText,
      summaryEn: summaryText,
      contentTe: newsContentTe.trim(),
      contentHi: newsContentTe.trim(),
      contentEn: newsContentTe.trim(),
      level: 'mandal',
      // Strictly locked to the reporter's registered State, District, and Mandal!
      state: activeReporter.state,
      district: activeReporter.district,
      mandal: activeReporter.mandal,
      category: newsCategory,
      youtubeUrl: newsYoutubeUrl.trim(),
      imageType: 'mandal_sabha',
      reporterId: activeReporter.id,
      reporterName: `${activeReporter.name} (${activeReporter.mandal} Mandal Reporter)`,
      views: 1,
      status: 'approved',
      authorUid: activeReporter.id,
      createdAt: now,
      updatedAt: now,
      isBreaking: true,
    };

    await onPublishNews(newArticle);
    setNewsTitleTe('');
    setNewsTitleHi('');
    setNewsTitleEn('');
    setNewsSummaryTe('');
    setNewsContentTe('');
    setNewsYoutubeUrl('');
    setUploadSuccess(
      `మీ వార్త "${newArticle.titleTe}" విజయవంతంగా ${activeReporter.mandal} మండల పేజీలో పబ్లిష్ చేయబడింది!`
    );
  };

  const myUploadedArticles = useMemo(
    () =>
      activeReporter
        ? articles.filter(
            (a) => a.reporterId === activeReporter.id || a.mandal === activeReporter.mandal
          )
        : [],
    [articles, activeReporter]
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#0B1D3A] text-white p-6 md:p-8 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
            నేటిభారతం · MANDAL REPORTER NETWORK (ALL INDIA)
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">
            రిపోర్టర్ రిజిస్ట్రేషన్ &amp; మండల రిపోర్టర్ డ్యాష్‌బోర్డ్
          </h1>
          <p className="text-xs md:text-sm text-stone-300 max-w-2xl leading-relaxed">
            భారతదేశంలోని అన్ని రాష్ట్రాలు, జిల్లాలు మరియు మండలాల వారీగా రిపోర్టర్ నమోదు. అడ్మిన్ ఆమోదం (Admin Approval) పొందిన రిపోర్టర్లు తాము నమోదు చేసుకున్న మండలంలో నేరుగా వార్తలు మరియు యూట్యూబ్ వీడియో లింక్‌లను అప్‌లోడ్ చేయవచ్చు.
          </p>
        </div>

        {/* Segmented Mode Switch */}
        <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'bg-amber-400 text-[#0B1D3A]'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>రిపోర్టర్ రిజిస్ట్రేషన్ (Register)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-400 text-[#0B1D3A]'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>రిపోర్టర్ డ్యాష్‌బోర్డ్ (Login &amp; Upload)</span>
          </button>
        </div>
      </div>

      {activeTab === 'register' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleRegisterSubmit}
            className="lg:col-span-8 rounded-2xl bg-white border border-stone-200 p-6 md:p-8 space-y-6 shadow-xs"
          >
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-xl font-bold text-stone-900">
                మండల రిపోర్టర్ రిజిస్ట్రేషన్ ఫారమ్ (Reporter Registration Form)
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                ఫోటో, రాష్ట్రం, జిల్లా, మండలం, మొబైల్ నెంబర్, యూజర్ నేమ్, పాస్‌వర్డ్ మరియు ఆధార్ కార్డు వివరాలు తప్పనిసరిగా నమోదు చేయండి.
              </p>
            </div>

            {regErrors.length > 0 && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-1"
              >
                <div className="font-bold">దయచేసి క్రింది వివరాలను సరిచేయండి:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {regErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {regSuccessMsg && (
              <div
                role="status"
                className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-3"
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>రిపోర్టర్ దరఖాస్తు విజయవంతంగా సమర్పించబడింది!</span>
                </div>
                <p className="leading-relaxed">{regSuccessMsg}</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 rounded-lg bg-[#0B1D3A] text-amber-300 font-semibold hover:bg-[#142F5A] cursor-pointer"
                >
                  రిపోర్టర్ డ్యాష్‌బోర్డ్‌కు వెళ్ళండి →
                </button>
              </div>
            )}

            {/* 1. Reporter Name & Photo Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-bold text-stone-800 mb-1.5">
                  రిపోర్టర్ పూర్తి పేరు (Full Name) *
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="ఉదా: బి. చక్రి రాజు"
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  రిపోర్టర్ పాస్‌పోర్ట్ ఫోటో (Photo Upload) *
                </label>
                <div className="flex items-center gap-3">
                  {regPhotoDataUrl ? (
                    <ReporterAvatar photoDataUrl={regPhotoDataUrl} name={regName || 'R'} size="md" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-stone-100 border border-dashed border-stone-400 flex items-center justify-center text-stone-400 shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label
                      htmlFor="reg-photo-file"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ఫోటో అప్‌లోడ్</span>
                      <input
                        id="reg-photo-file"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAvatarPhoto}
                      className="px-3 py-2 rounded-lg bg-stone-100 text-xs font-semibold text-stone-700 hover:bg-stone-200 cursor-pointer"
                    >
                      ప్రెస్ ID ఫోటో సెట్ చేయండి
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. All-India State -> District -> Mandal Selection */}
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200 space-y-3">
              <div className="text-xs font-bold text-[#9A3412] flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>మీ మండలం ఎంపిక (All-India State, District &amp; Mandal Selection) *</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="reg-state" className="block text-xs font-semibold text-stone-700 mb-1">
                    రాష్ట్రం (State) *
                  </label>
                  <select
                    id="reg-state"
                    value={regState}
                    onChange={(e) => {
                      const nextState = e.target.value;
                      setRegState(nextState);
                      const dists = getDistrictsByState(nextState, stateLocations);
                      const firstDist = dists[0]?.district || '';
                      setRegDistrict(firstDist);
                      setRegMandal(dists[0]?.mandals[0] || '');
                    }}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
                  >
                    {stateLocations.map((s) => (
                      <option key={s.state} value={s.state}>
                        {s.labelTe} ({s.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reg-district" className="block text-xs font-semibold text-stone-700 mb-1">
                    జిల్లా (District) *
                  </label>
                  <select
                    id="reg-district"
                    value={regDistrict}
                    onChange={(e) => {
                      const nextDist = e.target.value;
                      setRegDistrict(nextDist);
                      const mands = getMandalsByDistrict(regState, nextDist, stateLocations);
                      setRegMandal(mands[0] || '');
                    }}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
                  >
                    {availableDistricts.map((d) => (
                      <option key={d.district} value={d.district}>
                        {d.labelTe ? `${d.labelTe} (${d.district})` : d.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reg-mandal" className="block text-xs font-semibold text-stone-700 mb-1">
                    మండలం నేమ్ (Mandal Name) *
                  </label>
                  <select
                    id="reg-mandal"
                    value={regMandal}
                    onChange={(e) => setRegMandal(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-[#9A3412]"
                  >
                    {availableMandals.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-stone-600">
                గమనిక: మీరు ఏ మండలం అయితే ఎంచుకుంటారో, అడ్మిన్ అప్రూవల్ తర్వాత అదే మండలంలో మాత్రమే మీ న్యూస్ అప్‌లోడ్ అవుతుంది.
              </p>
            </div>

            {/* 3. Mobile Number, Username & Password */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="reg-mobile" className="block text-xs font-bold text-stone-800 mb-1.5">
                  మొబైల్ నెంబర్ (Mobile Number) *
                </label>
                <input
                  id="reg-mobile"
                  type="tel"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  placeholder="9848012345"
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm font-mono text-stone-900"
                />
              </div>

              <div>
                <label htmlFor="reg-username" className="block text-xs font-bold text-stone-800 mb-1.5">
                  యూజర్ నేమ్ (Username) *
                </label>
                <input
                  id="reg-username"
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="ఉదా: raju_guntur"
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm font-mono text-stone-900"
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-bold text-stone-800 mb-1.5">
                  పాస్‌వర్డ్ (Password) *
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="కనీసం 6 అక్షరాలు"
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-stone-900"
                />
              </div>
            </div>

            {/* 4. Aadhaar Card Number & Document Upload */}
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200 space-y-3">
              <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-700" />
                <span>ఆధార్ కార్డు వివరాలు &amp; అప్‌లోడ్ (Aadhaar Verification — Visible &amp; Downloadable by Admin) *</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-aadhaar" className="block text-xs font-semibold text-stone-700 mb-1">
                    12 అంకెల ఆధార్ కార్డు నంబర్ (Aadhaar Number) *
                  </label>
                  <input
                    id="reg-aadhaar"
                    type="text"
                    value={regAadhaarNumber}
                    onChange={(e) => setRegAadhaarNumber(e.target.value)}
                    placeholder="XXXX XXXX XXXX (12 digits)"
                    maxLength={14}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-mono text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    ఆధార్ కార్డు కాపీ అప్‌లోడ్ (Upload Aadhaar Card PDF/JPG) *
                  </label>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="reg-aadhaar-file"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ఆధార్ ఫైల్ ఎంచుకోండి</span>
                      <input
                        id="reg-aadhaar-file"
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleAadhaarFileChange}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleAttachDigiLockerAadhaar}
                      className="px-2.5 py-2 rounded-lg bg-stone-100 text-xs font-medium text-stone-700 hover:bg-stone-200 cursor-pointer"
                    >
                      డిజిలాకర్ ఆధార్ జతచేయి
                    </button>
                  </div>
                  {regAadhaarDocName && (
                    <div className="mt-1 text-xs font-semibold text-emerald-800">
                      జతచేసిన ఫైల్: {regAadhaarDocName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#9A3412] text-white text-sm font-bold hover:bg-[#7C2D12] transition-colors cursor-pointer"
            >
              రిపోర్టర్ రిజిస్ట్రేషన్ సమర్పించండి (Submit for Admin Approval)
            </button>
          </form>

          {/* Right 4 Columns: Auto-Generated Press ID Card Preview & Reporter Guidelines */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Automatic Press ID Card Creation Panel */}
            <div className="p-5 rounded-2xl bg-white border-2 border-amber-300 space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B1D3A]">
                  <CreditCard className="w-4 h-4 text-[#9A3412]" />
                  <span>ఆటోమేటిక్ ప్రెస్ ఐడి కార్డు (Auto ID Card)</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  {autoCreatedIdCardUrl ? 'AUTO-CREATED' : 'UPLOAD PHOTO'}
                </span>
              </div>

              {autoCreatedIdCardUrl ? (
                <div className="space-y-3" data-testid="auto-created-id-preview">
                  <PressIdCardPreview
                    reporter={{
                      id: 'NEW-101',
                      name: regName.trim() || 'రిపోర్టర్ పేరు (Reporter Name)',
                      username: regUsername.trim() || 'reporter_id',
                      mobile: regMobile.trim() || '98XXXXXXXX',
                      state: regState,
                      district: regDistrict,
                      mandal: regMandal,
                      photoDataUrl: regPhotoDataUrl,
                      status: 'pending',
                    }}
                  />
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 font-semibold leading-relaxed">
                    మీ ఫోటో ఇచ్చిన వెంటనే ఆటోమేటిక్‌గా ప్రెస్ ఐడి కార్డు తయారైంది! రిజిస్ట్రేషన్ సబ్మిట్ చేసిన తర్వాత <strong>అడ్మిన్ పర్మిషన్ (Admin Approval)</strong> వచ్చిన వెంటనే మీరు మీ అధికారిక ఐడి కార్డును డౌన్‌లోడ్ చేసుకోవచ్చు.
                  </div>
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 rounded-xl bg-stone-200 text-stone-600 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>అడ్మిన్ పర్మిషన్ తర్వాత ID డౌన్‌లోడ్ ఓపెన్ అవుతుంది</span>
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-[#FBF9F5] border border-dashed border-stone-300 text-center space-y-2">
                  <Camera className="w-7 h-7 text-stone-400 mx-auto" />
                  <p className="text-xs font-semibold text-stone-800">
                    మీ ఫోటో ఇచ్చిన వెంటనే ఆటోమేటిక్‌గా ఐడి కార్డు ఇక్కడ క్రియేట్ అవుతుంది
                  </p>
                  <p className="text-[11px] text-stone-500">
                    ఫారమ్‌లో &ldquo;ఫోటో అప్‌లోడ్&rdquo; లేదా &ldquo;ప్రెస్ ID ఫోటో సెట్ చేయండి&rdquo; బటన్‌ను క్లిక్ చేయండి. అడ్మిన్ పర్మిషన్ వచ్చిన తరువాత ఐడి డౌన్‌లోడ్ చేసుకోవచ్చు.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
              <h3 className="text-base font-bold text-stone-900">
                నేటిభారతం రిపోర్టర్ నిబంధనలు
              </h3>
              <ol className="space-y-3 text-xs text-stone-600 leading-relaxed list-decimal pl-4">
                <li>
                  <strong>ఆటోమేటిక్ ఐడి కార్డు &amp; డౌన్‌లోడ్:</strong> మీరు ఫోటో అప్‌లోడ్ చేసిన వెంటనే ఐడి కార్డు ఆటోమేటిక్‌గా క్రియేట్ అవుతుంది. అడ్మిన్ పర్మిషన్ వచ్చిన తరువాత దానిని డౌన్‌లోడ్ చేసుకోవచ్చు.
                </li>
                <li>
                  <strong>అడ్మిన్ అప్రూవల్ తప్పనిసరి:</strong> రిజిస్ట్రేషన్ పూర్తయిన తర్వాత అడ్మిన్ మీ పూర్తి వివరాలు మరియు ఆధార్ కార్డును పరిశీలించి ఆమోదిస్తారు.
                </li>
                <li>
                  <strong>మండల లాక్ సిస్టమ్:</strong> రిపోర్టర్ ఏ మండలంలో అయితే నమోదు చేసుకున్నారో, ఆ మండలంలో మాత్రమే వార్తలు అప్‌లోడ్ చేయగలరు.
                </li>
                <li>
                  <strong>యూట్యూబ్ వీడియో అప్‌డేట్స్:</strong> ప్రతి వార్తతో పాటు యూట్యూబ్ వీడియో లింక్‌ను కూడా జతచేయవచ్చు.
                </li>
              </ol>
            </div>
          </aside>
        </div>
      ) : (
        /* Reporter Login & Dashboard View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {!activeReporter ? (
            <div className="lg:col-span-6 lg:col-start-4 rounded-2xl bg-white border border-stone-200 p-6 md:p-8 space-y-6 shadow-xs">
              <div className="border-b border-stone-200 pb-4">
                <h2 className="text-xl font-bold text-stone-900">
                  రిపోర్టర్ లాగిన్ (Reporter Dashboard Login)
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  మీ యూజర్‌నేమ్ మరియు పాస్‌వర్డ్‌తో లాగిన్ అయి మీ మండల వార్తలు అప్‌లోడ్ చేయండి.
                </p>
              </div>

              {loginError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold"
                >
                  {loginError}
                </div>
              )}

              <form onSubmit={handleReporterLogin} className="space-y-4">
                <div>
                  <label htmlFor="rep-login-user" className="block text-xs font-bold text-stone-800 mb-1">
                    యూజర్ నేమ్ (Username)
                  </label>
                  <input
                    id="rep-login-user"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="chakri_mangalagiri"
                    className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm font-mono text-stone-900"
                  />
                </div>
                <div>
                  <label htmlFor="rep-login-pass" className="block text-xs font-bold text-stone-800 mb-1">
                    పాస్‌వర్డ్ (Password)
                  </label>
                  <input
                    id="rep-login-pass"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-stone-900"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0B1D3A] text-amber-300 text-sm font-bold hover:bg-[#142F5A] cursor-pointer"
                >
                  రిపోర్టర్ డ్యాష్‌బోర్డ్‌లోకి లాగిన్ అవ్వండి
                </button>
              </form>

              {/* Quick Demo Reporter Accounts for Testing */}
              <div className="pt-4 border-t border-stone-200 space-y-2">
                <div className="text-xs font-semibold text-stone-500">
                  డెమో రిపోర్టర్ ఖాతాలు (1-Click Quick Fill):
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginUsername('chakri_mangalagiri');
                      setLoginPassword('NetiBharatam@123');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 cursor-pointer"
                  >
                    Approved Reporter (Mangalagiri Mandal)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginUsername('naresh_tenali');
                      setLoginPassword('Naresh@123');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
                  >
                    Pending Reporter (Tenali Mandal)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Logged-in Reporter ID Card & Status */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs">
                  <div className="bg-[#0B1D3A] text-white p-5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                        నేటిభారతం · PRESS ID CARD
                      </div>
                      <div className="text-base font-bold mt-0.5">{activeReporter.name}</div>
                      <div className="text-[11px] font-mono text-amber-200 mt-0.5">
                        ID: {generateReporterIdCode(activeReporter)}
                      </div>
                    </div>
                    <ReporterAvatar
                      photoDataUrl={activeReporter.photoDataUrl}
                      name={activeReporter.name}
                      size="lg"
                    />
                  </div>

                  {/* Auto-Created Official Press ID Card Graphic */}
                  <div className="p-4 bg-stone-50 border-b border-stone-200 space-y-2.5">
                    <PressIdCardPreview reporter={activeReporter} />
                    {canReporterDownloadIdCard(activeReporter).canDownload ? (
                      <button
                        type="button"
                        data-testid="reporter-download-id-btn"
                        onClick={() => downloadReporterPressIdCard(activeReporter)}
                        className="w-full py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Download className="w-4 h-4" />
                        <span>ప్రెస్ ఐడి కార్డు డౌన్‌లోడ్ (Download ID Card)</span>
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          disabled
                          data-testid="reporter-download-id-locked"
                          className="w-full py-2.5 rounded-xl bg-stone-200 text-stone-600 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>అడ్మిన్ పర్మిషన్ తర్వాత ID డౌన్‌లోడ్ ఓపెన్ అవుతుంది</span>
                        </button>
                        <p className="text-[11px] text-amber-900 font-semibold text-center">
                          {canReporterDownloadIdCard(activeReporter).reason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">యూజర్ నేమ్:</span>
                      <span className="font-mono font-bold text-stone-900">
                        {activeReporter.username}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">కేటాయించిన మండలం:</span>
                      <span className="font-bold text-[#9A3412]">
                        {activeReporter.mandal} మండలం
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">జిల్లా &amp; రాష్ట్రం:</span>
                      <span className="font-semibold text-stone-800">
                        {activeReporter.district}, {activeReporter.state}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">ఆధార్ నంబర్:</span>
                      <span className="font-mono text-stone-800">
                        {maskAadhaar(activeReporter.aadhaarNumber)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-stone-500">అడ్మిన్ అప్రూవల్ స్థితి:</span>
                      {activeReporter.status === 'approved' ? (
                        <span className="font-bold text-emerald-800">
                          ఆమోదించబడింది (Approved)
                        </span>
                      ) : activeReporter.status === 'pending' ? (
                        <span className="font-bold text-amber-700">
                          అడ్మిన్ ఆమోదం పెండింగ్ (Pending)
                        </span>
                      ) : (
                        <span className="font-bold text-red-700">తిరస్కరించబడింది (Rejected)</span>
                      )}
                    </div>

                    <div className="pt-3 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenMandalPage(
                            activeReporter.state,
                            activeReporter.district,
                            activeReporter.mandal
                          )
                        }
                        className="w-full py-2 rounded-lg bg-stone-100 text-stone-800 font-semibold hover:bg-stone-200 cursor-pointer"
                      >
                        {activeReporter.mandal} మండల పేజీ తెరవండి
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoggedInReporterUsername(null)}
                        className="w-full py-2 rounded-lg border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>లాగ్ అవుట్ (Logout)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 8 Columns: Mandal-Locked News Upload Form */}
              <div className="lg:col-span-8 space-y-6">
                {activeReporter.status !== 'approved' ? (
                  <div className="rounded-2xl bg-amber-50 border border-amber-300 p-8 space-y-4">
                    <div className="flex items-center gap-3 text-amber-900">
                      <ShieldAlert className="w-7 h-7 text-amber-700 shrink-0" />
                      <div>
                        <h3 className="text-lg font-bold">
                          అడ్మిన్ అప్రూవల్ పెండింగ్‌లో ఉంది (Waiting for Admin Approval)
                        </h3>
                        <p className="text-xs text-amber-800 mt-1">
                          మీ రిపోర్టర్ ఖాతా ({activeReporter.mandal} మండలం, {activeReporter.district}) ఇంకా అడ్మిన్ ఆమోదం పొందలేదు. అడ్మిన్ డ్యాష్‌బోర్డ్‌లో ఆమోదించిన వెంటనే మీరు వార్తలు అప్‌లోడ్ చేయవచ్చు.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handlePublishMandalNews}
                    className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8 space-y-5 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
                      <div>
                        <h2 className="text-xl font-bold text-stone-900">
                          {activeReporter.mandal} మండల న్యూస్ అప్‌లోడ్ (Upload Mandal News)
                        </h2>
                        <p className="text-xs text-stone-600 mt-0.5">
                          మీరు అప్‌లోడ్ చేసే వార్త నేరుగా <strong>{activeReporter.mandal} మండలం ({activeReporter.district}, {activeReporter.state})</strong> లో పబ్లిష్ అవుతుంది.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                        <Lock className="w-3.5 h-3.5" />
                        <span>మండలం లాక్: {activeReporter.mandal}</span>
                      </div>
                    </div>

                    {uploadError && (
                      <div
                        role="alert"
                        className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold"
                      >
                        {uploadError}
                      </div>
                    )}

                    {uploadSuccess && (
                      <div
                        role="status"
                        className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-center justify-between gap-4"
                      >
                        <span>{uploadSuccess}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenMandalPage(
                              activeReporter.state,
                              activeReporter.district,
                              activeReporter.mandal
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#0B1D3A] text-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          మండల పేజీలో చూడండి →
                        </button>
                      </div>
                    )}

                    {/* Locked Mandal Location Display */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-xs">
                      <div>
                        <span className="text-stone-500 block">రాష్ట్రం (Locked State):</span>
                        <strong className="text-stone-900">{activeReporter.state}</strong>
                      </div>
                      <div>
                        <span className="text-stone-500 block">జిల్లా (Locked District):</span>
                        <strong className="text-stone-900">{activeReporter.district}</strong>
                      </div>
                      <div>
                        <span className="text-stone-500 block">మండలం (Locked Mandal):</span>
                        <strong className="text-[#9A3412]">{activeReporter.mandal} మండలం</strong>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="news-title-te" className="block text-xs font-bold text-stone-800 mb-1">
                        వార్త శీర్షిక తెలుగులో (News Headline in Telugu) *
                      </label>
                      <input
                        id="news-title-te"
                        type="text"
                        value={newsTitleTe}
                        onChange={(e) => setNewsTitleTe(e.target.value)}
                        placeholder={`ఉదా: ${activeReporter.mandal} మండలంలో నూతన త్రాగునీటి పథకం ప్రారంభం`}
                        className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-stone-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="news-title-hi" className="block text-xs font-semibold text-stone-700 mb-1">
                          హిందీ శీర్షిక (Hindi Headline - Optional)
                        </label>
                        <input
                          id="news-title-hi"
                          type="text"
                          value={newsTitleHi}
                          onChange={(e) => setNewsTitleHi(e.target.value)}
                          placeholder="हिंदी शीर्षक (खाली छोड़ने पर स्वतः जुड़ेगा)"
                          className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm text-stone-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="news-title-en" className="block text-xs font-semibold text-stone-700 mb-1">
                          ఇంగ్లీష్ శీర్షిక (English Headline - Optional)
                        </label>
                        <input
                          id="news-title-en"
                          type="text"
                          value={newsTitleEn}
                          onChange={(e) => setNewsTitleEn(e.target.value)}
                          placeholder="English Headline (auto-filled if left blank)"
                          className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="news-category" className="block text-xs font-bold text-stone-800 mb-1">
                          వార్త విభాగం (Category) *
                        </label>
                        <select
                          id="news-category"
                          value={newsCategory}
                          onChange={(e) => setNewsCategory(e.target.value as NewsCategory)}
                          className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2.5 text-sm text-stone-900"
                        >
                          {(
                            [
                              'local',
                              'politics',
                              'agriculture',
                              'justice',
                              'education',
                              'business',
                              'crime',
                            ] as NewsCategory[]
                          ).map((cat) => (
                            <option key={cat} value={cat}>
                              {t.categories[cat]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="news-youtube" className="block text-xs font-bold text-stone-800 mb-1">
                          యూట్యూబ్ వీడియో లింక్ (YouTube Video Update URL)
                        </label>
                        <div className="relative">
                          <Youtube className="w-4 h-4 text-red-700 absolute left-3 top-3" />
                          <input
                            id="news-youtube"
                            type="url"
                            value={newsYoutubeUrl}
                            onChange={(e) => setNewsYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] pl-9 pr-3 py-2.5 text-sm text-stone-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="news-summary-te" className="block text-xs font-bold text-stone-800 mb-1">
                        వార్త క్లుప్త సారాంశం (Short Summary)
                      </label>
                      <input
                        id="news-summary-te"
                        type="text"
                        value={newsSummaryTe}
                        onChange={(e) => setNewsSummaryTe(e.target.value)}
                        placeholder="ఒకటి లేదా రెండు వాక్యాలలో వార్త సారాంశం..."
                        className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2 text-sm text-stone-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="news-content-te" className="block text-xs font-bold text-stone-800 mb-1">
                        పూర్తి వార్త వివరాలు (Full News Story) *
                      </label>
                      <textarea
                        id="news-content-te"
                        rows={4}
                        value={newsContentTe}
                        onChange={(e) => setNewsContentTe(e.target.value)}
                        placeholder={`${activeReporter.mandal} మండలంలోని పూర్తి వార్తా వివరాలను ఇక్కడ టైప్ చేయండి...`}
                        className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] p-3.5 text-sm text-stone-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#9A3412] text-white text-sm font-bold hover:bg-[#7C2D12] transition-colors cursor-pointer"
                    >
                      {activeReporter.mandal} మండల వార్తను పబ్లిష్ చేయండి (Publish News Now)
                    </button>
                  </form>
                )}

                {/* List of News Published in this Reporter's Mandal */}
                <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
                  <h3 className="text-base font-bold text-stone-900">
                    {activeReporter.mandal} మండలంలో అప్‌లోడ్ అయిన వార్తలు ({myUploadedArticles.length})
                  </h3>
                  <div className="space-y-3">
                    {myUploadedArticles.map((art) => (
                      <div
                        key={art.id}
                        className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-sm font-bold text-stone-900">{art.titleTe}</div>
                          <div className="text-xs text-stone-500 mt-0.5">
                            {art.mandal} మండలం · {art.district}
                          </div>
                        </div>
                        <div className="font-mono tabular-nums text-xs font-bold text-stone-800 inline-flex items-center gap-1 shrink-0">
                          <Eye className="w-3.5 h-3.5 text-[#9A3412]" />
                          <span>{art.views.toLocaleString('en-IN')} views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
