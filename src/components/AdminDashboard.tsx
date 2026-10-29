import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Megaphone,
  Newspaper,
  Globe,
  MessageSquareHeart,
  Lock,
  LogOut,
  CheckCircle2,
  Eye,
  Trash2,
  KeyRound,
  FileText,
  Download,
  MapPin,
  PlusCircle,
  CreditCard,
  Edit3,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Upload,
  Server,
  Copy,
  ExternalLink,
  FolderCheck,
} from 'lucide-react';
import {
  validateAdminCredentials,
  ADMIN_USERNAME,
  formatFullAadhaar,
  generateReporterIdCode,
  generateAadhaarCardSvgDataUrl,
  generatePressIdCardSvgDataUrl,
  getPrivateAdImageUrl,
  type ApprovalStatus,
  type NewsArticleItem,
  type NewsCategory,
  type NewsLevel,
  type PrivateAdItem,
  type ReporterRecord,
  type ReporterEditPatch,
  type UserFeedbackItem,
  type AdSenseConfig,
  type SiteBrandingConfig,
} from '../utils/newsLogic';
import {
  getStates,
  getDistrictsByState,
  getMandalsByDistrict,
  type StateEntry,
} from '../data/indiaLocations';
import {
  downloadReporterAadhaarDocument,
  downloadReporterPressIdCard,
} from '../utils/cardDownload';
import { ReporterAvatar } from './EditorialIllustration';
import { AadhaarCardPreview, PressIdCardPreview } from './IdentityCards';
import { EdiNijamLogo, NetiBharatamHeroBanner } from './EdiNijamLogo';

interface AdminDashboardProps {
  isAdminAuthenticated: boolean;
  onAdminLoginSuccess: () => void;
  onAdminLogout: () => void;
  onGoogleAdminSignIn?: () => Promise<void>;
  firebaseUserEmail?: string | null;
  reporters: ReporterRecord[];
  onUpdateReporterStatus: (reporterId: string, status: ApprovalStatus) => Promise<void> | void;
  onUpdateReporterDetails?: (
    reporterId: string,
    patch: ReporterEditPatch
  ) => Promise<{ error?: string }> | { error?: string };
  locations?: StateEntry[];
  onAddDistrictAndMandals?: (params: {
    state: string;
    district: string;
    districtLabelTe?: string;
    mandalsInput: string;
  }) => Promise<{ error?: string; addedDistrict: boolean; addedMandals: string[] }> | {
    error?: string;
    addedDistrict: boolean;
    addedMandals: string[];
  };
  ads: PrivateAdItem[];
  onUpdateAdStatus: (adId: string, status: ApprovalStatus) => Promise<void> | void;
  articles: NewsArticleItem[];
  onPublishNews: (article: NewsArticleItem) => Promise<void> | void;
  onDeleteNews: (articleId: string) => Promise<void> | void;
  adsenseConfig: AdSenseConfig;
  onSaveAdsenseConfig: (config: AdSenseConfig) => Promise<void> | void;
  brandingConfig?: SiteBrandingConfig;
  onSaveBrandingConfig?: (config: SiteBrandingConfig) => Promise<void> | void;
  feedbackList: UserFeedbackItem[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAdminAuthenticated,
  onAdminLoginSuccess,
  onAdminLogout,
  onGoogleAdminSignIn,
  firebaseUserEmail,
  reporters,
  onUpdateReporterStatus,
  onUpdateReporterDetails,
  locations,
  onAddDistrictAndMandals,
  ads,
  onUpdateAdStatus,
  articles,
  onPublishNews,
  onDeleteNews,
  adsenseConfig,
  onSaveAdsenseConfig,
  brandingConfig,
  onSaveBrandingConfig,
  feedbackList,
}) => {
  const stateLocations = useMemo(() => locations || getStates(), [locations]);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<
    'reporters' | 'locations' | 'branding' | 'ads' | 'adsense' | 'news' | 'security' | 'hostinger'
  >('reporters');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedSnippet(label);
      setTimeout(() => setCopiedSnippet(null), 3000);
    } catch {
      // fallback
    }
  };

  // Expanded reporter ID for Aadhaar & Press ID inspection
  const [expandedReporterId, setExpandedReporterId] = useState<string | null>(
    reporters[0]?.id || null
  );

  // Reporter Inline Editing State (Username, Password, Name, Mobile, Mandal)
  const [editingReporterId, setEditingReporterId] = useState<string | null>(null);
  const [editRepName, setEditRepName] = useState('');
  const [editRepUsername, setEditRepUsername] = useState('');
  const [editRepPassword, setEditRepPassword] = useState('');
  const [editRepMobile, setEditRepMobile] = useState('');
  const [editRepState, setEditRepState] = useState('Andhra Pradesh');
  const [editRepDistrict, setEditRepDistrict] = useState('Guntur');
  const [editRepMandal, setEditRepMandal] = useState('Mangalagiri');
  const [editRepFeedback, setEditRepFeedback] = useState<{
    reporterId: string;
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Branding / Logo & Banner Change State
  const [logoDataUrlInput, setLogoDataUrlInput] = useState(brandingConfig?.logoDataUrl || '');
  const [bannerDataUrlInput, setBannerDataUrlInput] = useState(brandingConfig?.bannerDataUrl || '');
  const [topLeftBadgeInput, setTopLeftBadgeInput] = useState(
    brandingConfig?.topLeftBadgeText || 'ఏది నిజం'
  );
  const [sloganLine1Input, setSloganLine1Input] = useState(
    brandingConfig?.sloganLine1Te || 'జ్ఞానాన్ని పెంచే విద్య ఉపాది చూపే విద్య'
  );
  const [sloganLine2Input, setSloganLine2Input] = useState(
    brandingConfig?.sloganLine2Te || 'ఫ్రీ విద్య ఫ్రీ వైద్యం దేశ అభివృద్ధికి నాంది.'
  );
  const [bottomMottoInput, setBottomMottoInput] = useState(
    brandingConfig?.bottomMottoTe || 'నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం'
  );
  const [brandingSavedMsg, setBrandingSavedMsg] = useState('');

  // State / District / Mandal Addition State
  const [locState, setLocState] = useState('Andhra Pradesh');
  const [locDistrictMode, setLocDistrictMode] = useState<'existing' | 'new'>('existing');
  const [locExistingDistrict, setLocExistingDistrict] = useState('Guntur');
  const [locNewDistrictName, setLocNewDistrictName] = useState('');
  const [locNewDistrictLabelTe, setLocNewDistrictLabelTe] = useState('');
  const [locMandalsInput, setLocMandalsInput] = useState('');
  const [locFeedbackMsg, setLocFeedbackMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const selectedStateDistricts = useMemo(
    () => getDistrictsByState(locState, stateLocations),
    [locState, stateLocations]
  );

  // AdSense Form State
  const [adsenseUrl, setAdsenseUrl] = useState(adsenseConfig.adsenseScriptUrl);
  const [adsenseClient, setAdsenseClient] = useState(adsenseConfig.adsenseClientId);
  const [adsenseSlot, setAdsenseSlot] = useState(adsenseConfig.adsenseSlotId);
  const [adsenseActive, setAdsenseActive] = useState(adsenseConfig.adsenseEnabled);
  const [adsenseSavedMsg, setAdsenseSavedMsg] = useState('');

  // Admin Direct News Upload State
  const [adminNewsTitleTe, setAdminNewsTitleTe] = useState('');
  const [adminNewsSummaryTe, setAdminNewsSummaryTe] = useState('');
  const [adminNewsContentTe, setAdminNewsContentTe] = useState('');
  const [adminNewsLevel, setAdminNewsLevel] = useState<NewsLevel>('national');
  const [adminNewsState, setAdminNewsState] = useState('Andhra Pradesh');
  const [adminNewsDistrict, setAdminNewsDistrict] = useState('Guntur');
  const [adminNewsMandal, setAdminNewsMandal] = useState('Mangalagiri');
  const [adminNewsCategory, setAdminNewsCategory] = useState<NewsCategory>('justice');
  const [adminNewsYoutube, setAdminNewsYoutube] = useState('');
  const [adminNewsSuccess, setAdminNewsSuccess] = useState('');

  const districts = useMemo(
    () => getDistrictsByState(adminNewsState, stateLocations),
    [adminNewsState, stateLocations]
  );
  const mandals = useMemo(
    () => getMandalsByDistrict(adminNewsState, adminNewsDistrict, stateLocations),
    [adminNewsState, adminNewsDistrict, stateLocations]
  );

  const pendingReportersCount = useMemo(
    () => reporters.filter((r) => r.status === 'pending').length,
    [reporters]
  );
  const pendingAdsCount = useMemo(
    () => ads.filter((a) => a.status === 'pending').length,
    [ads]
  );

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (validateAdminCredentials(usernameInput, passwordInput)) {
      onAdminLoginSuccess();
    } else {
      setLoginError(
        'అడ్మిన్ యూజర్‌నేమ్ లేదా పాస్‌వర్డ్ తప్పుగా ఉంది. (Use Admin / Bchakriraju1992@)'
      );
    }
  };

  const handleSaveAdsense = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdsenseSavedMsg('');
    const updated: AdSenseConfig = {
      adsenseScriptUrl: adsenseUrl.trim(),
      adsenseClientId: adsenseClient.trim(),
      adsenseSlotId: adsenseSlot.trim(),
      adsenseEnabled: adsenseActive,
      updatedByUid: ADMIN_USERNAME,
      updatedAt: new Date().toISOString(),
    };
    await onSaveAdsenseConfig(updated);
    setAdsenseSavedMsg(
      'Google AdSense లింక్ మరియు పబ్లిషర్ సెట్టింగ్స్ విజయవంతంగా సేవ్ చేయబడ్డాయి!'
    );
  };

  const handleAdminPublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminNewsSuccess('');
    if (adminNewsTitleTe.trim().length < 4 || adminNewsContentTe.trim().length < 10) return;

    const now = new Date().toISOString();
    const summary =
      adminNewsSummaryTe.trim() || adminNewsContentTe.trim().slice(0, 180) + '...';
    const newItem: NewsArticleItem = {
      id: `news-admin-${Date.now()}`,
      titleTe: adminNewsTitleTe.trim(),
      titleHi: adminNewsTitleTe.trim(),
      titleEn: adminNewsTitleTe.trim(),
      summaryTe: summary,
      summaryHi: summary,
      summaryEn: summary,
      contentTe: adminNewsContentTe.trim(),
      contentHi: adminNewsContentTe.trim(),
      contentEn: adminNewsContentTe.trim(),
      level: adminNewsLevel,
      state: adminNewsState,
      district: adminNewsDistrict,
      mandal: adminNewsMandal,
      category: adminNewsCategory,
      youtubeUrl: adminNewsYoutube.trim(),
      imageType: adminNewsLevel === 'national' ? 'national_justice' : 'mandal_sabha',
      reporterId: 'admin',
      reporterName: 'నేటిభారతం చీఫ్ ఎడిటర్ డెస్క్ (Admin)',
      views: 1,
      status: 'approved',
      authorUid: 'admin',
      createdAt: now,
      updatedAt: now,
      isBreaking: true,
    };

    await onPublishNews(newItem);
    setAdminNewsTitleTe('');
    setAdminNewsSummaryTe('');
    setAdminNewsContentTe('');
    setAdminNewsYoutube('');
    setAdminNewsSuccess('కొత్త వార్త విజయవంతంగా పబ్లిష్ చేయబడింది!');
  };

  const handleAddLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocFeedbackMsg(null);
    if (!onAddDistrictAndMandals) return;

    const targetDistrict =
      locDistrictMode === 'new' ? locNewDistrictName.trim() : locExistingDistrict.trim();

    const result = await onAddDistrictAndMandals({
      state: locState,
      district: targetDistrict,
      districtLabelTe: locDistrictMode === 'new' ? locNewDistrictLabelTe.trim() : undefined,
      mandalsInput: locMandalsInput,
    });

    if (result.error) {
      setLocFeedbackMsg({ type: 'error', text: result.error });
      return;
    }

    setLocFeedbackMsg({
      type: 'success',
      text: `${locState} రాష్ట్రంలోని "${targetDistrict}" జిల్లాలో ${
        result.addedDistrict ? 'కొత్త జిల్లా మరియు ' : ''
      }మండలాలు (${result.addedMandals.join(', ')}) విజయవంతంగా జతచేయబడ్డాయి! ఇవి ఇప్పుడు రిపోర్టర్ రిజిస్ట్రేషన్ మరియు న్యూస్ సెర్చింగ్‌లో వెంటనే కనిపిస్తాయి.`,
    });
    setLocMandalsInput('');
    if (locDistrictMode === 'new') {
      setLocExistingDistrict(targetDistrict);
      setLocNewDistrictName('');
      setLocNewDistrictLabelTe('');
      setLocDistrictMode('existing');
    }
  };

  const handleStartEditReporter = (rep: ReporterRecord) => {
    setEditingReporterId(rep.id);
    setEditRepName(rep.name);
    setEditRepUsername(rep.username);
    setEditRepPassword(rep.passwordHash);
    setEditRepMobile(rep.mobile);
    setEditRepState(rep.state);
    setEditRepDistrict(rep.district);
    setEditRepMandal(rep.mandal);
    setEditRepFeedback(null);
  };

  const handleSaveReporterEdit = async (e: React.FormEvent, reporterId: string) => {
    e.preventDefault();
    if (!onUpdateReporterDetails) return;
    const res = await onUpdateReporterDetails(reporterId, {
      name: editRepName,
      username: editRepUsername,
      passwordHash: editRepPassword,
      mobile: editRepMobile,
      state: editRepState,
      district: editRepDistrict,
      mandal: editRepMandal,
    });
    if (res?.error) {
      setEditRepFeedback({
        reporterId,
        type: 'error',
        text: res.error,
      });
      return;
    }
    setEditRepFeedback({
      reporterId,
      type: 'success',
      text: `రిపోర్టర్ యూజర్ నేమ్ (@${editRepUsername.trim()}) & పాస్‌వర్డ్ వివరాలు విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి!`,
    });
    setEditingReporterId(null);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoDataUrlInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBannerDataUrlInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBrandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandingSavedMsg('');
    if (!onSaveBrandingConfig) return;
    await onSaveBrandingConfig({
      logoDataUrl: logoDataUrlInput.trim(),
      bannerDataUrl: bannerDataUrlInput.trim(),
      topLeftBadgeText: topLeftBadgeInput.trim() || 'ఏది నిజం',
      sloganLine1Te:
        sloganLine1Input.trim() || 'జ్ఞానాన్ని పెంచే విద్య ఉపాది చూపే విద్య',
      sloganLine2Te:
        sloganLine2Input.trim() || 'ఫ్రీ విద్య ఫ్రీ వైద్యం దేశ అభివృద్ధికి నాంది.',
      bottomMottoTe:
        bottomMottoInput.trim() || 'నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం',
      updatedByUid: ADMIN_USERNAME,
      updatedAt: new Date().toISOString(),
    });
    setBrandingSavedMsg(
      'వెబ్‌సైట్ లోగో మరియు బ్యానర్ సెట్టింగ్స్ విజయవంతంగా సేవ్ చేయబడ్డాయి!'
    );
  };

  const editRepDistricts = useMemo(
    () => getDistrictsByState(editRepState, stateLocations),
    [editRepState, stateLocations]
  );
  const editRepMandals = useMemo(
    () => getMandalsByDistrict(editRepState, editRepDistrict, stateLocations),
    [editRepState, editRepDistrict, stateLocations]
  );

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 rounded-2xl bg-white border border-stone-200 shadow-lg overflow-hidden">
        <div className="bg-[#0B1D3A] text-white p-6 space-y-1 border-b border-amber-500/30">
          <div className="text-xs uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>CHIEF EDITOR &amp; SECURITY CONSOLE</span>
          </div>
          <h1 className="text-xl font-bold">నేటిభారతం — అడ్మిన్ లాగిన్ (Admin Login)</h1>
          <p className="text-xs text-stone-300">
            రిపోర్టర్ల ఆమోదం, ప్రైవేట్ యాడ్స్ ఆమోదం &amp; Google AdSense కంట్రోల్
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
          {loginError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold"
            >
              {loginError}
            </div>
          )}

          <div>
            <label htmlFor="admin-user-input" className="block text-xs font-bold text-stone-800 mb-1">
              అడ్మిన్ యూజర్ నేమ్ (Admin Username)
            </label>
            <input
              id="admin-user-input"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Admin"
              className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm font-mono text-stone-900"
            />
          </div>

          <div>
            <label htmlFor="admin-pass-input" className="block text-xs font-bold text-stone-800 mb-1">
              అడ్మిన్ పాస్‌వర్డ్ (Admin Password)
            </label>
            <input
              id="admin-pass-input"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••••••••"
              className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm font-mono text-stone-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#0B1D3A] text-amber-300 text-sm font-bold hover:bg-[#142F5A] transition-colors cursor-pointer"
          >
            అడ్మిన్ డ్యాష్‌బోర్డ్‌లోకి లాగిన్ అవ్వండి
          </button>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setUsernameInput('Admin');
                setPasswordInput('Bchakriraju1992@');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9A3412] hover:underline cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>ఆటో-ఫిల్ అడ్మిన్ క్రెడెన్షియల్స్ (Admin)</span>
            </button>

            {onGoogleAdminSignIn && (
              <button
                type="button"
                onClick={onGoogleAdminSignIn}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 underline cursor-pointer"
              >
                Google Cloud Sync
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="rounded-2xl bg-[#0B1D3A] text-white p-6 md:p-8 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-widest text-amber-300 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>నేటిభారతం · MASTER ADMIN CONTROL DASHBOARD (USER: Admin)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">
            అడ్మిన్ కంట్రోల్ సెంటర్ — రిపోర్టర్లు, ప్రైవేట్ యాడ్స్ &amp; Google AdSense
          </h1>
          <p className="text-xs text-stone-300">
            Zero-Trust Firestore Security Rules Active · PII Aadhaar Isolation Enabled
            {firebaseUserEmail ? ` · Cloud Auth: ${firebaseUserEmail}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onAdminLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 border border-white/15 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>అడ్మిన్ లాగ్ అవుట్ (Logout)</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-300 pb-3">
        <button
          type="button"
          data-testid="admin-tab-reporters"
          onClick={() => setActiveTab('reporters')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'reporters'
              ? 'bg-[#0B1D3A] text-amber-300'
              : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>1. రిపోర్టర్ల యూజర్‌నేమ్, పాస్‌వర్డ్ &amp; ID ఆమోదం ({pendingReportersCount} Pending)</span>
        </button>

        <button
          type="button"
          data-testid="admin-tab-locations"
          onClick={() => setActiveTab('locations')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'locations'
              ? 'bg-[#0B1D3A] text-amber-300'
              : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>2. జిల్లాలు &amp; మండలాలు (AP 26 / TS 33)</span>
        </button>

        <button
          type="button"
          data-testid="admin-tab-branding"
          onClick={() => setActiveTab('branding')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-[#0B1D3A] text-amber-300'
              : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>3. లోగో &amp; బ్యానర్ మార్పు (Logo &amp; Banner Change)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ads')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'ads'
              ? 'bg-[#0B1D3A] text-amber-300'
              : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>4. ప్రైవేట్ యాడ్స్ ఆమోదం ({pendingAdsCount} Pending)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('adsense')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'adsense'
              ? 'bg-[#0B1D3A] text-amber-300'
              : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>5. Google AdSense లింక్</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('news')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'news'
              ? 'bg-[#0B1D3A] text-amber-300'
              : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>6. న్యూస్ అప్‌లోడ్ ({articles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#0B1D3A] text-amber-300'
              : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100'
          }`}
        >
          <MessageSquareHeart className="w-4 h-4" />
          <span>7. యూజర్ ఫీడ్‌బ్యాక్ ({feedbackList.length})</span>
        </button>

        <button
          type="button"
          data-testid="admin-tab-hostinger"
          onClick={() => setActiveTab('hostinger')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'hostinger'
              ? 'bg-[#0B1D3A] text-amber-300'
              : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100'
          }`}
        >
          <Server className="w-4 h-4 text-emerald-500" />
          <span>8. హోస్టింగర్ అప్‌లోడ్ ఫైల్స్ (Hostinger Deploy)</span>
        </button>
      </div>

      {/* ADMIN-ONLY GOOGLE ADSENSE SPONSORED UNIT PREVIEW */}
      {adsenseConfig.adsenseEnabled && (
        <div
          data-testid="admin-only-adsense-unit"
          className="rounded-2xl bg-white border border-stone-200 p-4 md:p-5 space-y-2 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
            <span className="font-mono uppercase font-bold text-[#9A3412]">
              Google AdSense Sponsored Unit (Admin Only — Hidden on Public Home Page)
            </span>
            <span className="font-mono font-semibold text-stone-700">
              {adsenseConfig.adsenseClientId}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-dashed border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-stone-800">
                నేటిభారతం — Google AdSense Active Slot #{adsenseConfig.adsenseSlotId}
              </div>
              <p className="text-[11px] text-stone-500 break-all font-mono mt-0.5">
                {adsenseConfig.adsenseScriptUrl}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('adsense')}
              className="px-3 py-1.5 rounded-lg bg-[#0B1D3A] text-amber-300 text-xs font-bold hover:bg-[#142F5A] shrink-0 cursor-pointer"
            >
              AdSense సెట్టింగ్స్ మార్చండి
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: REPORTER FULL DETAILS, AADHAAR CARD & PRESS ID CARD APPROVALS */}
      {activeTab === 'reporters' && (
        <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                మండల రిపోర్టర్ల యూజర్‌నేమ్, పాస్‌వర్డ్ వివరాలు, ఎడిట్ ఆప్షన్, ఆధార్ &amp; ప్రెస్ ఐడి పర్మిషన్
              </h2>
              <p className="text-xs text-stone-600">
                రిపోర్టర్ యూజర్‌నేమ్ &amp; పాస్‌వర్డ్ వివరాలను చూడవచ్చు మరియు ఎడిట్ చేయవచ్చు, అలాగే 12-అంకెల ఆధార్ కార్డు మరియు ప్రెస్ ఐడి కార్డును డౌన్‌లోడ్ చేసుకొని ఆమోదించవచ్చు.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {reporters.map((rep) => {
              const isExpanded = expandedReporterId === rep.id;
              const isEditing = editingReporterId === rep.id;

              return (
                <div
                  key={rep.id}
                  data-testid={`admin-reporter-card-${rep.id}`}
                  className="rounded-2xl bg-[#FBF9F5] border border-stone-300 overflow-hidden shadow-xs"
                >
                  <div className="p-5 space-y-4">
                    {/* Top Row: Avatar, Name/ID/Status Badges & Admin Action Buttons */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <ReporterAvatar photoDataUrl={rep.photoDataUrl} name={rep.name} size="lg" />
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-base font-bold text-stone-900">{rep.name}</span>
                            <span className="font-mono font-bold text-[#0B1D3A] bg-amber-100 px-2.5 py-0.5 rounded">
                              ID: {generateReporterIdCode(rep)}
                            </span>
                            <span
                              className={`font-bold uppercase px-2.5 py-0.5 rounded ${
                                rep.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : rep.status === 'pending'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-red-100 text-red-900'
                              }`}
                            >
                              {rep.status === 'approved'
                                ? 'APPROVED (పర్మిషన్ ఇవ్వబడింది)'
                                : rep.status === 'pending'
                                  ? 'PENDING (అడ్మిన్ పర్మిషన్ పెండింగ్)'
                                  : 'REJECTED'}
                            </span>
                          </div>
                          <div className="text-stone-600 font-medium">
                            {rep.mandal} మండలం · {rep.district} జిల్లా · {rep.state}
                          </div>
                        </div>
                      </div>

                      {/* Action, Edit & Download Buttons for Admin */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          data-testid={`admin-edit-reporter-btn-${rep.id}`}
                          onClick={() =>
                            isEditing ? setEditingReporterId(null) : handleStartEditReporter(rep)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#9A3412] text-white text-xs font-bold hover:bg-[#7C2D12] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>
                            {isEditing ? 'ఎడిట్ మూసివేయి' : 'యూజర్‌నేమ్ & పాస్‌వర్డ్ ఎడిట్ (Edit)'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReporterId(isExpanded ? null : rep.id)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#0B1D3A]" />
                          <span>
                            {isExpanded ? 'కార్డులు మూసివేయి' : 'ఆధార్ & ID కార్డు చూడండి'}
                          </span>
                        </button>

                        <button
                          type="button"
                          data-testid={`admin-download-aadhaar-${rep.id}`}
                          onClick={() => downloadReporterAadhaarDocument(rep)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B1D3A] text-amber-300 text-xs font-bold hover:bg-[#142F5A] cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ఆధార్ డౌన్‌లోడ్ (Download Aadhaar)</span>
                        </button>

                        <button
                          type="button"
                          data-testid={`admin-download-id-${rep.id}`}
                          onClick={() => downloadReporterPressIdCard(rep)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-500 bg-amber-50 text-amber-950 text-xs font-bold hover:bg-amber-100 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>ID కార్డు డౌన్‌లోడ్</span>
                        </button>

                        {rep.status !== 'approved' && (
                          <button
                            type="button"
                            data-testid={`admin-approve-reporter-${rep.id}`}
                            onClick={() => onUpdateReporterStatus(rep.id, 'approved')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>ఆమోదించు (Grant ID &amp; News Permission)</span>
                          </button>
                        )}
                        {rep.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => onUpdateReporterStatus(rep.id, 'rejected')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-300 bg-white text-red-700 text-xs font-bold hover:bg-red-50 cursor-pointer"
                          >
                            <UserX className="w-4 h-4" />
                            <span>తిరస్కరించు</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Full-Width Reporter Credentials (Username & Password) + Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-stone-700">
                      <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] text-amber-900 font-semibold block">
                            యూజర్ నేమ్ (Reporter Username):
                          </span>
                          <strong
                            data-testid={`admin-reporter-username-${rep.id}`}
                            className="font-mono text-[#0B1D3A] text-sm"
                          >
                            {rep.username}
                          </strong>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-200/70 text-[#0B1D3A] text-[10px] font-bold uppercase shrink-0">
                          LOGIN ID
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] text-amber-900 font-semibold block">
                            పాస్‌వర్డ్ (Reporter Password):
                          </span>
                          <strong
                            data-testid={`admin-reporter-password-${rep.id}`}
                            className="font-mono text-[#9A3412] text-sm"
                          >
                            {rep.passwordHash}
                          </strong>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-200/70 text-[#9A3412] text-[10px] font-bold uppercase shrink-0">
                          PASSWORD
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-stone-200">
                        <span className="text-[11px] text-stone-500 block">
                          మండలం &amp; జిల్లా (Assigned Mandal):
                        </span>
                        <strong className="text-[#9A3412] text-xs">
                          {rep.mandal} మండలం ({rep.district}, {rep.state})
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-stone-200">
                        <span className="text-[11px] text-stone-500 block">
                          మొబైల్ నెంబర్ (Mobile Number):
                        </span>
                        <strong className="font-mono text-stone-900 text-xs">
                          +91 {rep.mobile}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-stone-200">
                        <span className="text-[11px] text-stone-500 block">
                          పూర్తి ఆధార్ నంబర్ (Full Aadhaar):
                        </span>
                        <strong className="font-mono text-emerald-900 text-xs">
                          {formatFullAadhaar(rep.aadhaarNumber)}
                        </strong>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-stone-200">
                        <span className="text-[11px] text-stone-500 block">
                          ఆధార్ ఫైల్ (Aadhaar Doc):
                        </span>
                        <strong className="text-stone-800 truncate block text-xs">
                          {rep.aadhaarDocName}
                        </strong>
                      </div>
                    </div>

                    {editRepFeedback && editRepFeedback.reporterId === rep.id && (
                      <div
                        role="status"
                        className={`p-2.5 rounded-lg border text-xs font-semibold ${
                          editRepFeedback.type === 'success'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-red-50 border-red-200 text-red-900'
                        }`}
                      >
                        {editRepFeedback.text}
                      </div>
                    )}
                  </div>

                  {/* Inline Edit Form for Reporter Username, Password & Details */}
                  {isEditing && (
                    <form
                      onSubmit={(e) => handleSaveReporterEdit(e, rep.id)}
                      data-testid={`admin-edit-reporter-form-${rep.id}`}
                      className="p-5 bg-amber-50/70 border-t border-amber-300 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A3412] flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4" />
                          <span>
                            రిపోర్టర్ యూజర్ నేమ్, పాస్‌వర్డ్ &amp; వివరాలు మార్చండి (Edit Reporter Login &amp; Assignment)
                          </span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingReporterId(null)}
                          className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                        >
                          రద్దు చేయండి (Cancel)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label
                            htmlFor={`edit-rep-username-${rep.id}`}
                            className="block text-xs font-bold text-stone-800 mb-1"
                          >
                            యూజర్ నేమ్ (Username) *
                          </label>
                          <input
                            id={`edit-rep-username-${rep.id}`}
                            type="text"
                            value={editRepUsername}
                            onChange={(e) => setEditRepUsername(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono font-bold text-stone-900"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-rep-password-${rep.id}`}
                            className="block text-xs font-bold text-stone-800 mb-1"
                          >
                            పాస్‌వర్డ్ (Password) *
                          </label>
                          <input
                            id={`edit-rep-password-${rep.id}`}
                            type="text"
                            value={editRepPassword}
                            onChange={(e) => setEditRepPassword(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono font-bold text-[#9A3412]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-rep-name-${rep.id}`}
                            className="block text-xs font-bold text-stone-800 mb-1"
                          >
                            రిపోర్టర్ పేరు (Full Name) *
                          </label>
                          <input
                            id={`edit-rep-name-${rep.id}`}
                            type="text"
                            value={editRepName}
                            onChange={(e) => setEditRepName(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-900"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-rep-mobile-${rep.id}`}
                            className="block text-xs font-bold text-stone-800 mb-1"
                          >
                            మొబైల్ నెంబర్ (Mobile) *
                          </label>
                          <input
                            id={`edit-rep-mobile-${rep.id}`}
                            type="tel"
                            value={editRepMobile}
                            onChange={(e) => setEditRepMobile(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label
                            htmlFor={`edit-rep-state-${rep.id}`}
                            className="block text-xs font-bold text-stone-800 mb-1"
                          >
                            రాష్ట్రం (State)
                          </label>
                          <select
                            id={`edit-rep-state-${rep.id}`}
                            value={editRepState}
                            onChange={(e) => {
                              const st = e.target.value;
                              setEditRepState(st);
                              const dList = getDistrictsByState(st, stateLocations);
                              const firstD = dList[0]?.district || '';
                              setEditRepDistrict(firstD);
                              setEditRepMandal(dList[0]?.mandals[0] || '');
                            }}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold"
                          >
                            {stateLocations.map((s) => (
                              <option key={s.state} value={s.state}>
                                {s.labelTe} ({s.state})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-rep-district-${rep.id}`}
                            className="block text-xs font-bold text-stone-800 mb-1"
                          >
                            జిల్లా (District)
                          </label>
                          <select
                            id={`edit-rep-district-${rep.id}`}
                            value={editRepDistrict}
                            onChange={(e) => {
                              const dt = e.target.value;
                              setEditRepDistrict(dt);
                              const mList = getMandalsByDistrict(editRepState, dt, stateLocations);
                              setEditRepMandal(mList[0] || '');
                            }}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold"
                          >
                            {editRepDistricts.map((d) => (
                              <option key={d.district} value={d.district}>
                                {d.labelTe ? `${d.labelTe} (${d.district})` : d.district}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-rep-mandal-${rep.id}`}
                            className="block text-xs font-bold text-stone-800 mb-1"
                          >
                            మండలం (Mandal)
                          </label>
                          <select
                            id={`edit-rep-mandal-${rep.id}`}
                            value={editRepMandal}
                            onChange={(e) => setEditRepMandal(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-[#9A3412]"
                          >
                            {editRepMandals.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="submit"
                          data-testid={`admin-save-reporter-edit-${rep.id}`}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0B1D3A] text-amber-300 text-xs font-bold hover:bg-[#142F5A] cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>రిపోర్టర్ యూజర్ నేమ్ &amp; పాస్‌వర్డ్ సేవ్ చేయండి (Save Changes)</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Expanded Aadhaar Card & Auto-Created Press ID Card Inspection View */}
                  {isExpanded && (
                    <div className="p-5 bg-white border-t border-stone-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Reporter Aadhaar Card Document */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-700" />
                            <span>
                              రిపోర్టర్ ఆధార్ కార్డు (Aadhaar Card — {formatFullAadhaar(rep.aadhaarNumber)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadReporterAadhaarDocument(rep)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#9A3412] hover:underline cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ఆధార్ కార్డు డౌన్‌లోడ్ చేయండి</span>
                          </button>
                        </div>
                        <AadhaarCardPreview reporter={rep} />
                      </div>

                      {/* Right: Auto-Created Press ID Card */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-[#0B1D3A]" />
                            <span>
                              ఆటోమేటిక్‌గా క్రియేట్ అయిన ప్రెస్ ఐడి కార్డు ({generateReporterIdCode(rep)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadReporterPressIdCard(rep)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ప్రెస్ ఐడి కార్డు డౌన్‌లోడ్ చేయండి</span>
                          </button>
                        </div>
                        <PressIdCardPreview reporter={rep} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ADD DISTRICTS & MANDALS IN ANY STATE */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleAddLocationSubmit}
            className="lg:col-span-5 rounded-2xl bg-white border border-stone-200 p-6 space-y-5 shadow-xs"
          >
            <div className="border-b border-stone-200 pb-4">
              <div className="text-xs uppercase tracking-widest text-[#9A3412] font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>ALL-INDIA STATE · DISTRICT · MANDAL MANAGER</span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-1">
                ప్రతి రాష్ట్రంలో జిల్లాలు &amp; మండలాల పేర్లు ఆడ్ చేయండి
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                ఇక్కడ మీరు ఏ రాష్ట్రంలోనైనా కొత్త జిల్లాను లేదా కొత్త మండలాల పేర్లను జతచేయవచ్చు. జతచేసిన వెంటనే అవి రిపోర్టర్ రిజిస్ట్రేషన్ మరియు న్యూస్ సెర్చింగ్‌లో కనిపిస్తాయి.
              </p>
            </div>

            {locFeedbackMsg && (
              <div
                role="status"
                className={`p-3.5 rounded-xl border text-xs font-semibold ${
                  locFeedbackMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                {locFeedbackMsg.text}
              </div>
            )}

            {/* 1. Select State */}
            <div>
              <label htmlFor="admin-loc-state" className="block text-xs font-bold text-stone-800 mb-1.5">
                1. రాష్ట్రం ఎంచుకోండి (Select State) *
              </label>
              <select
                id="admin-loc-state"
                value={locState}
                onChange={(e) => {
                  const nextState = e.target.value;
                  setLocState(nextState);
                  const dists = getDistrictsByState(nextState, stateLocations);
                  setLocExistingDistrict(dists[0]?.district || '');
                }}
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm font-semibold text-stone-900"
              >
                {stateLocations.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.labelTe} ({s.state})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Choose Existing District or Add New District */}
            <div className="space-y-3 p-4 rounded-xl bg-[#FBF9F5] border border-stone-200">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-800">
                  2. జిల్లా ఎంపిక (Select Existing or Add New District) *
                </span>
                <div className="inline-flex rounded-lg border border-stone-300 bg-white p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLocDistrictMode('existing')}
                    className={`px-2.5 py-1 rounded-md cursor-pointer ${
                      locDistrictMode === 'existing'
                        ? 'bg-[#0B1D3A] text-amber-300'
                        : 'text-stone-700'
                    }`}
                  >
                    ఉన్న జిల్లాలో మండలం
                  </button>
                  <button
                    type="button"
                    data-testid="admin-new-district-mode-btn"
                    onClick={() => setLocDistrictMode('new')}
                    className={`px-2.5 py-1 rounded-md cursor-pointer ${
                      locDistrictMode === 'new'
                        ? 'bg-[#9A3412] text-white'
                        : 'text-stone-700'
                    }`}
                  >
                    + కొత్త జిల్లా ఆడ్ చేయండి
                  </button>
                </div>
              </div>

              {locDistrictMode === 'existing' ? (
                <div>
                  <label htmlFor="admin-loc-existing-dist" className="block text-xs font-semibold text-stone-700 mb-1">
                    జిల్లా ఎంచుకోండి (District in {locState})
                  </label>
                  <select
                    id="admin-loc-existing-dist"
                    value={locExistingDistrict}
                    onChange={(e) => setLocExistingDistrict(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
                  >
                    {selectedStateDistricts.map((d) => (
                      <option key={d.district} value={d.district}>
                        {d.labelTe ? `${d.labelTe} (${d.district})` : d.district}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="admin-loc-new-dist" className="block text-xs font-semibold text-stone-700 mb-1">
                      కొత్త జిల్లా పేరు (New District Name) *
                    </label>
                    <input
                      id="admin-loc-new-dist"
                      type="text"
                      value={locNewDistrictName}
                      onChange={(e) => setLocNewDistrictName(e.target.value)}
                      placeholder="ఉదా: Palnadu / Bapatla"
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="admin-loc-new-dist-te" className="block text-xs font-semibold text-stone-700 mb-1">
                      జిల్లా తెలుగు పేరు (Optional)
                    </label>
                    <input
                      id="admin-loc-new-dist-te"
                      type="text"
                      value={locNewDistrictLabelTe}
                      onChange={(e) => setLocNewDistrictLabelTe(e.target.value)}
                      placeholder="ఉదా: పల్నాడు"
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Enter Mandal Names */}
            <div>
              <label htmlFor="admin-loc-mandals" className="block text-xs font-bold text-stone-800 mb-1.5">
                3. కొత్త మండలాల పేర్లు (Mandal Names — కామాతో వేరు చేసి ఎన్ని మండలాలైనా ఆడ్ చేయవచ్చు) *
              </label>
              <input
                id="admin-loc-mandals"
                type="text"
                value={locMandalsInput}
                onChange={(e) => setLocMandalsInput(e.target.value)}
                placeholder="ఉదా: Tadikonda, Pedakurapadu, Amaravati"
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-stone-900"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                ఒకటి కంటే ఎక్కువ మండలాలను ఒకేసారి చేర్చడానికి కామా (,) ఉపయోగించండి.
              </p>
            </div>

            <button
              type="submit"
              data-testid="admin-add-location-submit"
              className="w-full py-3.5 rounded-xl bg-[#9A3412] text-white text-xs font-bold hover:bg-[#7C2D12] inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>జిల్లా &amp; మండలాల పేర్లు ఆడ్ చేయండి (Save to State Directory)</span>
            </button>
          </form>

          {/* Right 7 Columns: Live Districts & Mandals Directory for Selected State */}
          <div className="lg:col-span-7 rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {locState} — జిల్లాలు &amp; మండలాల జాబితా ({selectedStateDistricts.length} Districts)
                </h3>
                <p className="text-xs text-stone-500">
                  ఈ క్రింది జిల్లాలు మరియు మండలాలు రిపోర్టర్ రిజిస్ట్రేషన్ మరియు న్యూస్ సెర్చింగ్‌లో అందుబాటులో ఉన్నాయి.
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {selectedStateDistricts.map((dist) => (
                <div
                  key={dist.district}
                  className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-[#0B1D3A]">
                      {dist.labelTe ? `${dist.labelTe} (${dist.district})` : dist.district} జిల్లా
                    </div>
                    <span className="text-xs font-mono font-bold text-[#9A3412]">
                      {dist.mandals.length} మండలాలు
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dist.mandals.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-800"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOGO & BANNER CHANGE OPTION */}
      {activeTab === 'branding' && (
        <form
          onSubmit={handleSaveBrandingSubmit}
          data-testid="admin-branding-form"
          className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8 space-y-6 shadow-xs"
        >
          <div className="border-b border-stone-200 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#9A3412] font-bold flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>SITE LOGO &amp; HERO BANNER CUSTOMIZATION</span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-1">
                వెబ్‌సైట్ లోగో &amp; బ్యానర్ మార్పు (Admin Logo &amp; Banner Change Option)
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                ఇక్కడ మీరు నేటిభారతం అధికారిక లోగోను, హోమ్ పేజీ బ్యానర్ లోగోను మరియు స్లోగన్‌లను ఎప్పుడైనా మార్చవచ్చు లేదా కొత్త లోగో ఫోటోను అప్‌లోడ్ చేయవచ్చు.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLogoDataUrlInput('');
                setBannerDataUrlInput('');
                setTopLeftBadgeInput('ఏది నిజం');
                setSloganLine1Input('జ్ఞానాన్ని పెంచే విద్య ఉపాది చూపే విద్య');
                setSloganLine2Input('ఫ్రీ విద్య ఫ్రీ వైద్యం దేశ అభివృద్ధికి నాంది.');
                setBottomMottoInput('నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 bg-[#FBF9F5] text-xs font-bold text-stone-800 hover:bg-stone-100 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>డిఫాల్ట్ నేటిభారతం బ్యానర్ &amp; లోగో రీసెట్ చేయండి</span>
            </button>
          </div>

          {brandingSavedMsg && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{brandingSavedMsg}</span>
            </div>
          )}

          {/* Live Banner & Logo Previews */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#FBF9F5] border border-stone-200">
            <div className="text-xs font-bold text-stone-800">
              ప్రస్తుత బ్యానర్ &amp; లోగో ప్రివ్యూ (Live Banner &amp; Emblem Preview):
            </div>
            <NetiBharatamHeroBanner
              branding={{
                logoDataUrl: logoDataUrlInput,
                bannerDataUrl: bannerDataUrlInput,
                topLeftBadgeText: topLeftBadgeInput,
                sloganLine1Te: sloganLine1Input,
                sloganLine2Te: sloganLine2Input,
                bottomMottoTe: bottomMottoInput,
                updatedByUid: ADMIN_USERNAME,
                updatedAt: '',
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Header Emblem Logo Upload / URL */}
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200 space-y-3">
              <div className="flex items-center gap-3">
                <EdiNijamLogo size={60} customLogoUrl={logoDataUrlInput} />
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    1. సైట్ లోగో (Header &amp; Footer Logo Change)
                  </div>
                  <p className="text-[11px] text-stone-500">
                    కొత్త లోగో ఇమేజ్ ఫైల్ (PNG/JPG/SVG) అప్‌లోడ్ చేయండి లేదా URL ఇవ్వండి
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="admin-logo-upload"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B1D3A] text-amber-300 text-xs font-bold hover:bg-[#142F5A] cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>లోగో ఇమేజ్ అప్‌లోడ్ చేయండి</span>
                  <input
                    id="admin-logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="sr-only"
                  />
                </label>
                {logoDataUrlInput && (
                  <button
                    type="button"
                    onClick={() => setLogoDataUrlInput('')}
                    className="px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    డిఫాల్ట్ లోగో ఉంచండి
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="admin-logo-url-input" className="block text-[11px] font-semibold text-stone-700 mb-1">
                  లేదా లోగో ఇమేజ్ URL (Logo Image URL):
                </label>
                <input
                  id="admin-logo-url-input"
                  type="text"
                  value={logoDataUrlInput}
                  onChange={(e) => setLogoDataUrlInput(e.target.value)}
                  placeholder="https://... లేదా data:image/..."
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900"
                />
              </div>
            </div>

            {/* 2. Full Banner Logo Image Upload / URL */}
            <div className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200 space-y-3">
              <div>
                <div className="text-xs font-bold text-stone-900">
                  2. మెయిన్ బ్యానర్ లోగో ఇమేజ్ (Banner Image Upload)
                </div>
                <p className="text-[11px] text-stone-500">
                  మీ స్వంత బ్యానర్ ఇమేజ్ (PNG/JPG) అప్‌లోడ్ చేయవచ్చు లేదా క్రింది టెక్స్ట్ స్లోగన్‌లను ఎడిట్ చేయవచ్చు
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="admin-banner-upload"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9A3412] text-white text-xs font-bold hover:bg-[#7C2D12] cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>బ్యానర్ ఇమేజ్ అప్‌లోడ్ చేయండి</span>
                  <input
                    id="admin-banner-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    className="sr-only"
                  />
                </label>
                {bannerDataUrlInput && (
                  <button
                    type="button"
                    onClick={() => setBannerDataUrlInput('')}
                    className="px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    డిఫాల్ట్ నేటిభారతం బ్యానర్ ఉంచండి
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="admin-banner-url-input" className="block text-[11px] font-semibold text-stone-700 mb-1">
                  లేదా బ్యానర్ ఇమేజ్ URL (Banner Image URL):
                </label>
                <input
                  id="admin-banner-url-input"
                  type="text"
                  value={bannerDataUrlInput}
                  onChange={(e) => setBannerDataUrlInput(e.target.value)}
                  placeholder="https://... లేదా data:image/..."
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* 3. Banner Text & Slogan Customization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
            <div>
              <label htmlFor="admin-banner-badge" className="block text-xs font-bold text-stone-800 mb-1">
                ఎడమవైపు బ్యాడ్జ్ టెక్స్ట్ (Top-Left Badge Text)
              </label>
              <input
                id="admin-banner-badge"
                type="text"
                value={topLeftBadgeInput}
                onChange={(e) => setTopLeftBadgeInput(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm font-bold text-stone-900"
              />
            </div>
            <div>
              <label htmlFor="admin-banner-motto" className="block text-xs font-bold text-stone-800 mb-1">
                క్రింది పసుపు రంగు నినాదం (Bottom Yellow Motto)
              </label>
              <input
                id="admin-banner-motto"
                type="text"
                value={bottomMottoInput}
                onChange={(e) => setBottomMottoInput(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm font-bold text-stone-900"
              />
            </div>
            <div>
              <label htmlFor="admin-banner-line1" className="block text-xs font-bold text-stone-800 mb-1">
                స్లోగన్ లైన్ 1 (Red Outlined Slogan)
              </label>
              <input
                id="admin-banner-line1"
                type="text"
                value={sloganLine1Input}
                onChange={(e) => setSloganLine1Input(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm font-bold text-stone-900"
              />
            </div>
            <div>
              <label htmlFor="admin-banner-line2" className="block text-xs font-bold text-stone-800 mb-1">
                స్లోగన్ లైన్ 2 (Blue Outlined Slogan)
              </label>
              <input
                id="admin-banner-line2"
                type="text"
                value={sloganLine2Input}
                onChange={(e) => setSloganLine2Input(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm font-bold text-stone-900"
              />
            </div>
          </div>

          <button
            type="submit"
            data-testid="admin-save-branding-btn"
            className="px-6 py-3 rounded-xl bg-[#0B1D3A] text-amber-300 text-xs font-bold hover:bg-[#142F5A] inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>లోగో &amp; బ్యానర్ సెట్టింగ్స్ సేవ్ చేయండి (Save Logo &amp; Banner)</span>
          </button>
        </form>
      )}

      {/* TAB 4: PRIVATE ADS APPROVALS */}
      {activeTab === 'ads' && (
        <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-5">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="text-lg font-bold text-stone-900">
              ప్రైవేట్ యాడ్స్ ఆమోదం (Mandal / District / State / Category Private Ads)
            </h2>
            <p className="text-xs text-stone-600">
              అడ్మిన్ ఆమోదించిన ప్రైవేట్ ప్రకటనలు మాత్రమే సంబంధిత మండల, జిల్లా మరియు రాష్ట్ర పేజీల్లో కనిపిస్తాయి.
            </p>
          </div>

          <div className="space-y-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                data-testid={`admin-private-ad-card-${ad.id}`}
                className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0 flex-1">
                  <div className="w-full sm:w-56 h-32 rounded-xl overflow-hidden bg-stone-900 border border-stone-300 shrink-0">
                    <img
                      src={getPrivateAdImageUrl(ad)}
                      alt={ad.title}
                      data-testid={`admin-private-ad-img-${ad.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 text-xs min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold uppercase text-[#9A3412]">
                        [{ad.targetLevel.toUpperCase()} AD] · {ad.mandal} ({ad.district}, {ad.state})
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Category: {ad.category}</span>
                      <span aria-hidden="true">·</span>
                      <strong
                        className={
                          ad.status === 'approved'
                            ? 'text-emerald-800'
                            : ad.status === 'pending'
                              ? 'text-amber-700'
                              : 'text-red-700'
                        }
                      >
                        {ad.status.toUpperCase()}
                      </strong>
                    </div>
                    <div className="text-base font-bold text-stone-900">{ad.title}</div>
                    <p className="text-stone-600 leading-relaxed">{ad.bannerText}</p>
                    <div className="text-stone-500">
                      ప్రకటనకర్త: <strong>{ad.sponsorName}</strong> · URL: {ad.ctaUrl}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ad.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => onUpdateAdStatus(ad.id, 'approved')}
                      className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                    >
                      యాడ్ ఆమోదించు (Approve Ad)
                    </button>
                  )}
                  {ad.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => onUpdateAdStatus(ad.id, 'rejected')}
                      className="px-3.5 py-2 rounded-lg border border-red-300 bg-white text-red-700 text-xs font-bold hover:bg-red-50 cursor-pointer"
                    >
                      తిరస్కరించు (Reject)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE ADSENSE CONFIGURATION */}
      {activeTab === 'adsense' && (
        <form
          onSubmit={handleSaveAdsense}
          className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8 space-y-5 max-w-3xl"
        >
          <div className="border-b border-stone-200 pb-4">
            <h2 className="text-lg font-bold text-stone-900">
              Google AdSense లింక్ &amp; యాడ్ స్లాట్ కాన్ఫిగరేషన్ (Admin Only)
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              ఈ Google AdSense Sponsored Unit హోమ్ పేజీలో పబ్లిక్‌కు కనిపించదు — కేవలం అడ్మిన్ డ్యాష్‌బోర్డ్‌లో మాత్రమే కనిపిస్తుంది మరియు నిర్వహించబడుతుంది.
            </p>
          </div>

          {adsenseSavedMsg && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{adsenseSavedMsg}</span>
            </div>
          )}

          <div>
            <label htmlFor="adsense-script-url" className="block text-xs font-bold text-stone-800 mb-1">
              Google AdSense లింక్ (AdSense Script / Publisher Link) *
            </label>
            <input
              id="adsense-script-url"
              type="url"
              value={adsenseUrl}
              onChange={(e) => setAdsenseUrl(e.target.value)}
              placeholder="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..."
              className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm font-mono text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="adsense-client-id" className="block text-xs font-bold text-stone-800 mb-1">
                AdSense Publisher Client ID (ca-pub-XXXX)
              </label>
              <input
                id="adsense-client-id"
                type="text"
                value={adsenseClient}
                onChange={(e) => setAdsenseClient(e.target.value)}
                placeholder="ca-pub-9823419201823491"
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm font-mono text-stone-900"
              />
            </div>

            <div>
              <label htmlFor="adsense-slot-id" className="block text-xs font-bold text-stone-800 mb-1">
                AdSense Ad Unit Slot ID
              </label>
              <input
                id="adsense-slot-id"
                type="text"
                value={adsenseSlot}
                onChange={(e) => setAdsenseSlot(e.target.value)}
                placeholder="4910293841"
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm font-mono text-stone-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200">
            <input
              id="adsense-enabled-toggle"
              type="checkbox"
              checked={adsenseActive}
              onChange={(e) => setAdsenseActive(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="adsense-enabled-toggle" className="text-xs font-bold text-stone-900">
              వెబ్‌సైట్‌లో Google AdSense బ్యానర్ స్లాట్‌ను యాక్టివేట్ చేయండి (Enable Google AdSense Display)
            </label>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#0B1D3A] text-amber-300 text-xs font-bold hover:bg-[#142F5A] cursor-pointer"
          >
            Google AdSense సెట్టింగ్స్ సేవ్ చేయండి (Save AdSense Link)
          </button>
        </form>
      )}

      {/* TAB 4: CHIEF EDITOR NEWS UPLOAD & MANAGEMENT */}
      {activeTab === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleAdminPublishNews}
            className="lg:col-span-6 rounded-2xl bg-white border border-stone-200 p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
              చీఫ్ ఎడిటర్ డైరెక్ట్ న్యూస్ అప్‌లోడ్ (National / State / District / Mandal)
            </h2>

            {adminNewsSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                {adminNewsSuccess}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="adm-news-level" className="block text-xs font-bold text-stone-800 mb-1">
                  న్యూస్ స్థాయి (Level)
                </label>
                <select
                  id="adm-news-level"
                  value={adminNewsLevel}
                  onChange={(e) => setAdminNewsLevel(e.target.value as NewsLevel)}
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm text-stone-900"
                >
                  <option value="national">National News</option>
                  <option value="state">State News</option>
                  <option value="district">District News</option>
                  <option value="mandal">Mandal News</option>
                </select>
              </div>
              <div>
                <label htmlFor="adm-news-cat" className="block text-xs font-bold text-stone-800 mb-1">
                  విభాగం (Category)
                </label>
                <select
                  id="adm-news-cat"
                  value={adminNewsCategory}
                  onChange={(e) => setAdminNewsCategory(e.target.value as NewsCategory)}
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm text-stone-900"
                >
                  <option value="justice">ఒక దేశం ఒకే చట్టం (Justice)</option>
                  <option value="politics">రాజకీయం (Politics)</option>
                  <option value="agriculture">వ్యవసాయం (Agriculture)</option>
                  <option value="local">మండల అభివృద్ధి (Mandal Civic)</option>
                  <option value="education">విద్య &amp; ఉపాధి (Education)</option>
                  <option value="business">వాణిజ్యం (Business)</option>
                  <option value="crime">క్రైమ్ &amp; నిఘా (Vigilance)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="adm-state" className="block text-[11px] font-semibold text-stone-700 mb-1">
                  State
                </label>
                <select
                  id="adm-state"
                  value={adminNewsState}
                  onChange={(e) => {
                    const s = e.target.value;
                    setAdminNewsState(s);
                    const d = getDistrictsByState(s, stateLocations)[0];
                    setAdminNewsDistrict(d?.district || '');
                    setAdminNewsMandal(d?.mandals[0] || '');
                  }}
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-2 py-1.5 text-xs"
                >
                  {stateLocations.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="adm-dist" className="block text-[11px] font-semibold text-stone-700 mb-1">
                  District
                </label>
                <select
                  id="adm-dist"
                  value={adminNewsDistrict}
                  onChange={(e) => {
                    const d = e.target.value;
                    setAdminNewsDistrict(d);
                    setAdminNewsMandal(
                      getMandalsByDistrict(adminNewsState, d, stateLocations)[0] || ''
                    );
                  }}
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-2 py-1.5 text-xs"
                >
                  {districts.map((d) => (
                    <option key={d.district} value={d.district}>
                      {d.district}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="adm-mandal" className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Mandal
                </label>
                <select
                  id="adm-mandal"
                  value={adminNewsMandal}
                  onChange={(e) => setAdminNewsMandal(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-2 py-1.5 text-xs font-bold"
                >
                  {mandals.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="adm-title" className="block text-xs font-bold text-stone-800 mb-1">
                వార్త శీర్షిక (Headline) *
              </label>
              <input
                id="adm-title"
                type="text"
                value={adminNewsTitleTe}
                onChange={(e) => setAdminNewsTitleTe(e.target.value)}
                placeholder="వార్త శీర్షిక..."
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="adm-yt" className="block text-xs font-bold text-stone-800 mb-1">
                యూట్యూబ్ వీడియో లింక్ (YouTube Link)
              </label>
              <input
                id="adm-yt"
                type="url"
                value={adminNewsYoutube}
                onChange={(e) => setAdminNewsYoutube(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="adm-content" className="block text-xs font-bold text-stone-800 mb-1">
                పూర్తి వార్త వివరాలు (Full Content) *
              </label>
              <textarea
                id="adm-content"
                rows={4}
                value={adminNewsContentTe}
                onChange={(e) => setAdminNewsContentTe(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] p-3 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#9A3412] text-white text-xs font-bold hover:bg-[#7C2D12] cursor-pointer"
            >
              వార్తను పబ్లిష్ చేయండి (Publish Official News)
            </button>
          </form>

          <div className="lg:col-span-6 rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
              అన్ని వార్తలు &amp; Views గణాంకాలు ({articles.length})
            </h2>
            <div className="space-y-3 max-h-[520px] overflow-y-auto">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#9A3412]">
                      {art.level.toUpperCase()} · {art.mandal} ({art.district})
                    </div>
                    <div className="text-sm font-bold text-stone-900 truncate">{art.titleTe}</div>
                    <div className="text-xs text-stone-500 flex items-center gap-3 mt-0.5 font-mono tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {art.views.toLocaleString('en-IN')} views
                      </span>
                      <span>by {art.reporterName}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteNews(art.id)}
                    aria-label={`Delete ${art.titleTe}`}
                    className="p-2 rounded-lg text-stone-500 hover:text-red-700 hover:bg-red-50 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: USER FEEDBACK & ZERO-TRUST DATABASE SECURITY */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
              యూజర్ ఫీడ్‌బ్యాక్ నివేదికలు ({feedbackList.length})
            </h2>
            <div className="space-y-3">
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-stone-900">{fb.readerName}</strong>
                    <span className="font-mono font-bold text-amber-700">
                      Rating: {fb.rating}/5
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">{fb.message}</p>
                  <div className="text-[11px] text-stone-500">
                    Mandal: {fb.mandal} · {new Date(fb.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
              డేటాబేస్ భద్రతా కవచం (Zero-Trust Firestore Security Audit)
            </h2>
            <ul className="space-y-3 text-xs text-stone-700 leading-relaxed">
              <li className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <strong>1. PII Aadhaar &amp; Mobile Isolation:</strong> రిపోర్టర్ల ఆధార్ మరియు మొబైల్ నంబర్లు పబ్లిక్ డైరెక్టరీ నుండి వేరు చేయబడి <code>/reporterApplications</code> కలెక్షన్‌లో కేవలం అడ్మిన్ మాత్రమే చదవగలిగేలా రక్షించబడ్డాయి.
              </li>
              <li className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <strong>2. Mandal Lock Relational Gate:</strong> ఏ రిపోర్టర్ అయినా తమకు కేటాయించిన మండలం కాకుండా వేరే మండలంలో న్యూస్ అప్‌లోడ్ చేయడానికి ప్రయత్నిస్తే డేటాబేస్ రూల్స్ తిరస్కరిస్తాయి.
              </li>
              <li className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <strong>3. Atomic View Counter Protection:</strong> వార్తల వ్యూస్ (Views) ఒకేసారి +1 మాత్రమే పెరిగేలా <code>affectedKeys().hasOnly([&apos;views&apos;, &apos;updatedAt&apos;])</code> రూల్ అమలులో ఉంది.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 8: HOSTINGER DEPLOYMENT SUPPORTING FILES & INSTRUCTIONS */}
      {activeTab === 'hostinger' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[#0B1D3A] via-[#162f5e] to-[#0B1D3A] text-white p-6 md:p-8 space-y-4 shadow-md border border-amber-500/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <FolderCheck className="w-4 h-4" />
                <span>HOSTINGER SUPPORTING FILES READY</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <Server className="w-4 h-4" />
                <span>Target: Hostinger Shared / Cloud / VPS Hosting</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-editorial">
                హోస్టింగర్ అప్‌లోడ్ &amp; లైవ్ డిప్లాయ్‌మెంట్ గైడ్ (Hostinger Deployment Guide)
              </h2>
              <p className="text-sm text-stone-200 mt-1 max-w-3xl leading-relaxed">
                నేటిభారతం న్యూస్ పోర్టల్‌ను హోస్టింగర్ (Hostinger) సర్వర్‌లో అప్‌లోడ్ చేయడానికి అవసరమైన అన్ని సపోర్టింగ్ ఫైల్స్ (<code>.htaccess</code>, <code>hostinger-dist.zip</code>, <code>robots.txt</code>, <code>sitemap.xml</code>, <code>server.cjs</code>) సిద్ధం చేయబడ్డాయి.
              </p>
            </div>
          </div>

          {/* 4 Essential Supporting Files Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">1. hostinger-dist.zip</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                పూర్తి బిల్డ్, <code>.htaccess</code>, ఇమేజ్‌లు మరియు PWA ఫైల్స్ కలిగిన రెడీ-టు-అప్‌లోడ్ జిప్ ఫైల్. <code>public_html</code> లో Extract చేయండి.
              </p>
              <div className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg">
                Size: ~1.01 MB · Ready to Upload
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">2. .htaccess</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                పేజీ రీలోడ్ చేసినప్పుడు 404 Error రాకుండా ఆపే SPA Rewrite Rules, Gzip కంప్రెషన్ &amp; PWA Cache Headers.
              </p>
              <div className="text-[11px] font-mono text-blue-700 font-semibold bg-blue-50 p-2 rounded-lg">
                Location: /public/.htaccess &amp; /dist/.htaccess
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">3. SEO &amp; Sitemap</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Googlebot మరియు సెర్చ్ ఇంజన్ల కోసం <code>robots.txt</code> మరియు మండలాలు, వీడియోలు లింక్ చేసే <code>sitemap.xml</code>.
              </p>
              <div className="text-[11px] font-mono text-purple-700 font-semibold bg-purple-50 p-2 rounded-lg">
                Location: /public/robots.txt &amp; sitemap.xml
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">4. Node / VPS Config</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                మీరు హోస్టింగర్ VPS లేదా Node.js యాప్ వాడుతుంటే రన్ చేయడానికి <code>server.cjs</code> మరియు PM2 కోసం <code>ecosystem.config.cjs</code>.
              </p>
              <div className="text-[11px] font-mono text-stone-700 font-semibold bg-stone-100 p-2 rounded-lg">
                Command: npm start
              </div>
            </div>
          </div>

          {/* 3 Step Deployment Guide */}
          <div className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>హోస్టింగర్ షేర్డ్ / క్లౌడ్ హోస్టింగ్‌లో అప్‌లోడ్ చేసే 3 సులభమైన దశలు (3-Step Guide)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0B1D3A] text-amber-300 font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-sm text-stone-900">Hostinger File Manager ఓపెన్ చేయండి</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  హోస్టింగర్ <strong>hPanel</strong> లోకి లాగిన్ అయి, <strong>Websites → Manage → File Manager</strong> ఓపెన్ చేయండి. అందులో <strong>`public_html`</strong> ఫోల్డర్‌పై డబుల్ క్లిక్ చేయండి.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0B1D3A] text-amber-300 font-bold text-xs">
                  2
                </div>
                <h4 className="font-bold text-sm text-stone-900">hostinger-dist.zip అప్‌లోడ్ &amp; Extract</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  File Manager లో <strong>Upload</strong> పై క్లిక్ చేసి <code>hostinger-dist.zip</code> ను అప్‌లోడ్ చేయండి. అప్‌లోడ్ అయ్యాక Right Click చేసి <strong>Extract</strong> ఎంచుకుని <code>public_html</code> లోనే విప్పదీయండి.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0B1D3A] text-amber-300 font-bold text-xs">
                  3
                </div>
                <h4 className="font-bold text-sm text-stone-900">Firebase Authorized Domains లో డొమైన్ జోడించండి</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Firebase Console → Authentication → Settings → Authorized domains లో మీ Hostinger డొమైన్ (ఉదా: <code>yourdomain.com</code>) ను Add Domain క్లిక్ చేసి నమోదు చేయండి.
                </p>
              </div>
            </div>
          </div>

          {/* Copyable Code Snippets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* .htaccess snippet */}
            <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>.htaccess కంటెంట్ (Hostinger Apache / LiteSpeed)</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>`,
                      'htaccess'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSnippet === 'htaccess' ? 'కాపీ చేయబడింది!' : 'కాపీ చేయండి'}</span>
                </button>
              </div>
              <p className="text-xs text-stone-600">
                ఈ రూల్స్ Hostinger లో సింగిల్ పేజ్ అప్లికేషన్ (SPA) రూటింగ్ 404 రాకుండా చేస్తుంది:
              </p>
              <pre className="p-3.5 rounded-xl bg-stone-900 text-amber-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>`}
              </pre>
            </div>

            {/* Build & Package Command */}
            <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span>బిల్డ్ కమాండ్ (Generate Hostinger Zip)</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('npm run build:hostinger', 'buildcmd')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSnippet === 'buildcmd' ? 'కాపీ చేయబడింది!' : 'కాపీ చేయండి'}</span>
                </button>
              </div>
              <p className="text-xs text-stone-600">
                ఎప్పుడైనా కొత్త వార్తలు, అప్‌డేట్‌లు చేసినప్పుడు తాజా <code>hostinger-dist.zip</code> ను రీ-బిల్డ్ చేయడానికి:
              </p>
              <pre className="p-3.5 rounded-xl bg-stone-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
npm run build:hostinger
              </pre>
              <div className="text-xs text-stone-700 bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1">
                <strong>గమనిక:</strong> ప్రాజెక్ట్ రూట్ ఫోల్డర్‌లో పూర్తి వివరాలతో <code>HOSTINGER_DEPLOYMENT_GUIDE.md</code> ఫైల్ కూడా ఇవ్వబడింది.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
