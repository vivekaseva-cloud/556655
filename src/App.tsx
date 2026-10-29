import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  Eye,
  Youtube,
  MapPin,
  Megaphone,
  ExternalLink,
  Smartphone,
  Newspaper,
  UserPlus,
  ShieldCheck,
  Video,
  CheckCircle2,
} from 'lucide-react';
import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  OperationType,
  handleFirestoreError,
} from './firebase';
import {
  ALL_INDIA_LOCATIONS,
  setActiveLocationsStore,
  getDistrictsByState,
  getMandalsByDistrict,
  getArticleText,
  TRANSLATIONS,
  type StateEntry,
} from './data/indiaLocations';
import {
  INITIAL_NEWS_ARTICLES,
  INITIAL_REPORTERS,
  INITIAL_PRIVATE_ADS,
  INITIAL_FEEDBACK,
  INITIAL_ADSENSE_CONFIG,
  INITIAL_BRANDING_CONFIG,
} from './data/seedData';
import {
  filterNewsArticles,
  filterTargetedAds,
  incrementArticleViews,
  extractYouTubeId,
  addDistrictAndMandalsToLocations,
  mergeWithDefaultLocations,
  updateReporterCredentialsAndDetails,
  getPrivateAdImageUrl,
  buildArticleWindowUrl,
  buildCanonicalArticleUrl,
  extractArticleIdFromUrl,
  type ApprovalStatus,
  type LanguageCode,
  type NewsArticleItem,
  type NewsCategory,
  type NewsLevel,
  type PrivateAdItem,
  type ReporterRecord,
  type ReporterEditPatch,
  type UserFeedbackItem,
  type AdSenseConfig,
  type SiteBrandingConfig,
} from './utils/newsLogic';
import { EdiNijamLogo, NetiBharatamHeroBanner } from './components/EdiNijamLogo';
import { EditorialIllustration } from './components/EditorialIllustration';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { MandalPageView } from './components/MandalPageView';
import { ReporterPortal } from './components/ReporterPortal';
import { AdvertisePortal } from './components/AdvertisePortal';
import { AdminDashboard } from './components/AdminDashboard';
import { PWAInstallButton } from './pwa/PWAInstallButton';
import { OfflineIndicator } from './pwa/OfflineIndicator';
import { PlayStoreModal } from './components/PlayStoreModal';

type ActiveSection = 'home' | 'mandalPage' | 'videos' | 'reporter' | 'advertise' | 'admin';

const STORAGE_KEYS = {
  ARTICLES: 'netibharatam_articles_v1',
  REPORTERS: 'netibharatam_reporters_v2',
  ADS: 'netibharatam_ads_v3',
  FEEDBACK: 'netibharatam_feedback_v1',
  ADSENSE: 'netibharatam_adsense_v1',
  LOCATIONS: 'netibharatam_locations_v2',
  BRANDING: 'netibharatam_branding_v1',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>('te');
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');

  // Persistent State (Hydrated with Seed Data + LocalStorage + Firestore Sync)
  const [locations, setLocations] = useState<StateEntry[]>(() => {
    const loaded = loadStored(STORAGE_KEYS.LOCATIONS, ALL_INDIA_LOCATIONS);
    const merged = mergeWithDefaultLocations(loaded, ALL_INDIA_LOCATIONS);
    setActiveLocationsStore(merged);
    return merged;
  });
  const [articles, setArticles] = useState<NewsArticleItem[]>(() =>
    loadStored(STORAGE_KEYS.ARTICLES, INITIAL_NEWS_ARTICLES)
  );
  const [reporters, setReporters] = useState<ReporterRecord[]>(() =>
    loadStored(STORAGE_KEYS.REPORTERS, INITIAL_REPORTERS)
  );
  const [ads, setAds] = useState<PrivateAdItem[]>(() =>
    loadStored(STORAGE_KEYS.ADS, INITIAL_PRIVATE_ADS)
  );
  const [feedbackList, setFeedbackList] = useState<UserFeedbackItem[]>(() =>
    loadStored(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK)
  );
  const [adsenseConfig, setAdsenseConfig] = useState<AdSenseConfig>(() =>
    loadStored(STORAGE_KEYS.ADSENSE, INITIAL_ADSENSE_CONFIG)
  );
  const [brandingConfig, setBrandingConfig] = useState<SiteBrandingConfig>(() =>
    loadStored(STORAGE_KEYS.BRANDING, INITIAL_BRANDING_CONFIG)
  );

  // Save to localStorage on change
  useEffect(() => {
    setActiveLocationsStore(locations);
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    } catch {
      // ignore
    }
  }, [locations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    } catch {
      // ignore storage quota errors
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTERS, JSON.stringify(reporters));
    } catch {
      // ignore
    }
  }, [reporters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
    } catch {
      // ignore
    }
  }, [ads]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbackList));
    } catch {
      // ignore
    }
  }, [feedbackList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADSENSE, JSON.stringify(adsenseConfig));
    } catch {
      // ignore
    }
  }, [adsenseConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(brandingConfig));
    } catch {
      // ignore
    }
  }, [brandingConfig]);

  // Firebase Auth & Firestore Live Sync when authenticated
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (
        (user?.email === 'viveka.seva@gmail.com' ||
          user?.email === 'howtolivetherealman@gmail.com') &&
        user.emailVerified
      ) {
        setIsAdminAuthenticated(true);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubNews = onSnapshot(
      collection(db, 'news'),
      (snap) => {
        if (!snap.empty) {
          const remoteItems: NewsArticleItem[] = [];
          snap.forEach((d) => {
            const data = d.data();
            remoteItems.push({
              id: d.id,
              titleTe: data.titleTe || '',
              titleHi: data.titleHi || '',
              titleEn: data.titleEn || '',
              summaryTe: data.summaryTe || '',
              summaryHi: data.summaryHi || '',
              summaryEn: data.summaryEn || '',
              contentTe: data.contentTe || '',
              contentHi: data.contentHi || '',
              contentEn: data.contentEn || '',
              level: data.level || 'mandal',
              state: data.state || 'Andhra Pradesh',
              district: data.district || 'Guntur',
              mandal: data.mandal || 'Mangalagiri',
              category: data.category || 'local',
              youtubeUrl: data.youtubeUrl || '',
              imageType: data.imageType || 'mandal_sabha',
              reporterId: data.reporterId || 'admin',
              reporterName: data.reporterName || 'Neti Bharatam',
              views: typeof data.views === 'number' ? data.views : 0,
              status: data.status || 'approved',
              authorUid: data.authorUid || '',
              createdAt:
                data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
              updatedAt:
                data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            });
          });
          setArticles((prev) => {
            const map = new Map(prev.map((a) => [a.id, a]));
            for (const item of remoteItems) {
              map.set(item.id, item);
            }
            return Array.from(map.values());
          });
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'news');
        } catch {
          // logged by handleFirestoreError
        }
      }
    );
    return () => unsubNews();
  }, [firebaseUser]);

  // Filtering & Location State
  const [selectedLevel, setSelectedLevel] = useState<NewsLevel | 'all'>('all');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedMandal, setSelectedMandal] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [activeArticle, setActiveArticle] = useState<NewsArticleItem | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPlayStoreModal, setShowPlayStoreModal] = useState(false);
  const [reporterPrefillLocation, setReporterPrefillLocation] = useState<{
    state: string;
    district: string;
    mandal: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const t = TRANSLATIONS[language];

  const availableDistricts = useMemo(
    () => (selectedState !== 'ALL' ? getDistrictsByState(selectedState, locations) : []),
    [selectedState, locations]
  );

  const availableMandals = useMemo(
    () =>
      selectedState !== 'ALL' && selectedDistrict !== 'ALL'
        ? getMandalsByDistrict(selectedState, selectedDistrict, locations)
        : [],
    [selectedState, selectedDistrict, locations]
  );

  // Filtered Articles for Current Feed
  const filteredArticles = useMemo(
    () =>
      filterNewsArticles(articles, {
        level: selectedLevel,
        state: selectedState,
        district: selectedDistrict,
        mandal: selectedMandal,
        category: selectedCategory,
        searchQuery,
        onlyYoutube: activeSection === 'videos',
      }),
    [
      articles,
      selectedLevel,
      selectedState,
      selectedDistrict,
      selectedMandal,
      selectedCategory,
      searchQuery,
      activeSection,
    ]
  );

  // Targeted Approved Private Ads for Current View
  const targetedAds = useMemo(
    () =>
      filterTargetedAds(ads, {
        state: selectedState,
        district: selectedDistrict,
        mandal: selectedMandal,
        category: selectedCategory,
      }),
    [ads, selectedState, selectedDistrict, selectedMandal, selectedCategory]
  );

  // Deep Link Synchronizer: Opens the exact news story when a shared URL is opened or back/forward pressed
  useEffect(() => {
    const handleUrlStateChange = () => {
      if (typeof window === 'undefined') return;
      const targetId = extractArticleIdFromUrl(window.location.search, window.location.hash);
      if (targetId) {
        const found = articles.find((a) => a.id === targetId);
        if (found) {
          setActiveArticle((current) => {
            if (current?.id === found.id) return current;
            return {
              ...found,
              views: found.views + 1,
            };
          });
          setArticles((prev) => incrementArticleViews(prev, found.id));
          const text = getArticleText(found, language);
          document.title = `${text.title} | ఏది నిజం · నేటిభారతం`;
        }
      }
    };

    handleUrlStateChange();
    window.addEventListener('popstate', handleUrlStateChange);
    window.addEventListener('hashchange', handleUrlStateChange);
    return () => {
      window.removeEventListener('popstate', handleUrlStateChange);
      window.removeEventListener('hashchange', handleUrlStateChange);
    };
  }, [articles, language]);

  // Handlers
  const handleOpenArticle = async (article: NewsArticleItem) => {
    // Increment views by +1 immediately
    setArticles((prev) => incrementArticleViews(prev, article.id));
    setActiveArticle({
      ...article,
      views: article.views + 1,
    });

    // Update browser address bar to ?article=... so address bar reflects the exact news story
    if (typeof window !== 'undefined' && window.history?.pushState) {
      const url = new URL(window.location.href);
      url.searchParams.set('article', article.id);
      window.history.pushState({ articleId: article.id }, '', url.toString());
    }

    if (typeof document !== 'undefined') {
      const text = getArticleText(article, language);
      document.title = `${text.title} | ఏది నిజం · నేటిభారతం`;
    }

    if (firebaseUser) {
      try {
        await updateDoc(doc(db, 'news', article.id), {
          views: article.views + 1,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Local state already updated
      }
    }
  };

  const handleCloseArticle = () => {
    setActiveArticle(null);
    if (typeof window !== 'undefined' && window.history?.pushState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('article');
      url.searchParams.delete('news');
      window.history.pushState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
    }
    if (typeof document !== 'undefined') {
      document.title =
        'నేటిభారతం (Neti Bharatam) — ఒక దేశం ఒకే చట్టం | All-India Mandal, District, State & National News Portal';
    }
  };

  const handleOpenMandalPage = (state: string, district: string, mandal: string) => {
    setSelectedState(state);
    setSelectedDistrict(district);
    setSelectedMandal(mandal);
    setActiveSection('mandalPage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterReporter = async (newReporter: ReporterRecord) => {
    setReporters((prev) => [newReporter, ...prev]);
    triggerToast(
      `${newReporter.name} (${newReporter.mandal} మండలం) రిపోర్టర్ దరఖాస్తు అడ్మిన్ ఆమోదం కోసం పంపబడింది.`
    );

    if (firebaseUser) {
      try {
        const batch = writeBatch(db);
        const pubRef = doc(db, 'reporterDirectory', newReporter.id);
        const privRef = doc(db, 'reporterApplications', newReporter.id);
        batch.set(pubRef, {
          name: newReporter.name,
          username: newReporter.username,
          state: newReporter.state,
          district: newReporter.district,
          mandal: newReporter.mandal,
          photoDataUrl: newReporter.photoDataUrl,
          status: 'pending',
          ownerUid: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        batch.set(privRef, {
          name: newReporter.name,
          username: newReporter.username,
          passwordHash: newReporter.passwordHash,
          mobile: newReporter.mobile,
          aadhaarNumber: newReporter.aadhaarNumber,
          aadhaarDocName: newReporter.aadhaarDocName,
          aadhaarDocDataUrl: newReporter.aadhaarDocDataUrl || '',
          state: newReporter.state,
          district: newReporter.district,
          mandal: newReporter.mandal,
          photoDataUrl: newReporter.photoDataUrl,
          status: 'pending',
          ownerUid: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, 'reporterApplications');
        } catch {
          // handled
        }
      }
    }
  };

  const handleAddDistrictAndMandals = async (params: {
    state: string;
    district: string;
    districtLabelTe?: string;
    mandalsInput: string;
  }) => {
    const result = addDistrictAndMandalsToLocations(locations, params);
    if (!result.error) {
      setLocations(result.updatedLocations);
      setActiveLocationsStore(result.updatedLocations);
      triggerToast(
        `${params.state} — ${params.district} జిల్లాలో మండలాలు (${result.addedMandals.join(', ')}) జతచేయబడ్డాయి!`
      );

      if (firebaseUser) {
        try {
          const slug = `${params.state}_${params.district}`
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '_')
            .slice(0, 60);
          const updatedState = result.updatedLocations.find(
            (s) => s.state.toLowerCase() === params.state.toLowerCase()
          );
          const updatedDist = updatedState?.districts.find(
            (d) => d.district.toLowerCase() === params.district.toLowerCase()
          );
          if (updatedDist) {
            await setDoc(doc(db, 'customLocations', slug), {
              state: params.state,
              district: updatedDist.district,
              districtLabelTe: updatedDist.labelTe || updatedDist.district,
              mandals: updatedDist.mandals,
              updatedByUid: firebaseUser.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch {
          // Local state already updated
        }
      }
    }
    return {
      error: result.error,
      addedDistrict: result.addedDistrict,
      addedMandals: result.addedMandals,
    };
  };

  const handlePublishNews = async (newArticle: NewsArticleItem) => {
    setArticles((prev) => [newArticle, ...prev]);
    triggerToast(`కొత్త వార్త పబ్లిష్ చేయబడింది: ${newArticle.mandal} మండలం`);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'news', newArticle.id), {
          titleTe: newArticle.titleTe,
          titleHi: newArticle.titleHi,
          titleEn: newArticle.titleEn,
          summaryTe: newArticle.summaryTe,
          summaryHi: newArticle.summaryHi,
          summaryEn: newArticle.summaryEn,
          contentTe: newArticle.contentTe,
          contentHi: newArticle.contentHi,
          contentEn: newArticle.summaryEn,
          level: newArticle.level,
          state: newArticle.state,
          district: newArticle.district,
          mandal: newArticle.mandal,
          category: newArticle.category,
          youtubeUrl: newArticle.youtubeUrl,
          imageType: newArticle.imageType,
          reporterId: newArticle.reporterId,
          reporterName: newArticle.reporterName,
          views: 0,
          status: newArticle.status,
          authorUid: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.CREATE, 'news');
        } catch {
          // handled
        }
      }
    }
  };

  const handleUpdateReporterStatus = async (reporterId: string, status: ApprovalStatus) => {
    setReporters((prev) =>
      prev.map((r) =>
        r.id === reporterId ? { ...r, status, updatedAt: new Date().toISOString() } : r
      )
    );
    const target = reporters.find((r) => r.id === reporterId);
    if (target) {
      triggerToast(
        `రిపోర్టర్ ${target.name} (${target.mandal} మండలం) స్థితి "${status.toUpperCase()}" కు మార్చబడింది.`
      );
    }
  };

  const handleUpdateReporterDetails = (
    reporterId: string,
    patch: ReporterEditPatch
  ): { error?: string } => {
    const res = updateReporterCredentialsAndDetails(reporters, reporterId, patch);
    if (res.error) {
      return { error: res.error };
    }
    setReporters(res.updatedReporters);
    if (res.updatedReporter) {
      triggerToast(
        `రిపోర్టర్ ${res.updatedReporter.name} (Username: ${res.updatedReporter.username}) వివరాలు సేవ్ చేయబడ్డాయి.`
      );
      if (firebaseUser) {
        const updated = res.updatedReporter;
        updateDoc(doc(db, 'reporterApplications', updated.id), {
          name: updated.name,
          username: updated.username,
          passwordHash: updated.passwordHash,
          mobile: updated.mobile,
          state: updated.state,
          district: updated.district,
          mandal: updated.mandal,
          updatedAt: serverTimestamp(),
        }).catch(() => {
          // local state already updated
        });
      }
    }
    return {};
  };

  const handleSaveBrandingConfig = (newBranding: SiteBrandingConfig) => {
    setBrandingConfig(newBranding);
    triggerToast('లోగో మరియు బ్యానర్ సెట్టింగ్స్ విజయవంతంగా సేవ్ చేయబడ్డాయి!');
  };

  const handleUpdateAdStatus = async (adId: string, status: ApprovalStatus) => {
    setAds((prev) =>
      prev.map((a) =>
        a.id === adId ? { ...a, status, updatedAt: new Date().toISOString() } : a
      )
    );
    triggerToast(`ప్రైవేట్ యాడ్ స్థితి "${status.toUpperCase()}" కు అప్‌డేట్ చేయబడింది.`);
  };

  const handleSubmitPrivateAd = async (newAd: PrivateAdItem) => {
    setAds((prev) => [newAd, ...prev]);
    triggerToast('ప్రైవేట్ ప్రకటన అడ్మిన్ ఆమోదం కోసం పంపబడింది.');
  };

  const handleSubmitFeedback = async (newFb: UserFeedbackItem) => {
    setFeedbackList((prev) => [newFb, ...prev]);
    triggerToast('మీ ఫీడ్‌బ్యాక్ విజయవంతంగా నమోదు చేయబడింది.');
  };

  const handleDeleteNews = async (articleId: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    triggerToast('వార్త తొలగించబడింది.');
    if (firebaseUser) {
      try {
        await deleteDoc(doc(db, 'news', articleId));
      } catch {
        // ignore if local-only seed
      }
    }
  };

  const handleSaveAdsenseConfig = async (newConfig: AdSenseConfig) => {
    setAdsenseConfig(newConfig);
    triggerToast('Google AdSense లింక్ మరియు సెట్టింగ్స్ సేవ్ చేయబడ్డాయి.');
    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'siteSettings', 'global'), {
          ...newConfig,
          updatedByUid: firebaseUser.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, 'siteSettings/global');
        } catch {
          // handled
        }
      }
    }
  };

  const handleGoogleAdminSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      triggerToast('Google సైన్-ఇన్ పాప్అప్ మూసివేయబడింది.');
    }
  };

  const leadArticle = filteredArticles[0] || null;
  const secondaryArticles = filteredArticles.slice(1, 5);
  const archiveArticles = filteredArticles.slice(5);
  const youtubeBulletins = useMemo(
    () => articles.filter((a) => a.status === 'approved' && !!extractYouTubeId(a.youtubeUrl)),
    [articles]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] pb-16 md:pb-0">
      <OfflineIndicator />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-[#0B1D3A] text-amber-300 px-4 py-3 text-xs font-bold shadow-xl border border-amber-400/40"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 bg-[#0B1D3A] text-white border-b border-amber-500/30 px-4 md:px-8 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Title with Official Attached Emblem */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('home');
          }}
          className="flex items-center gap-3 text-lg md:text-xl font-bold tracking-tight text-amber-300 whitespace-nowrap shrink-0"
        >
          <EdiNijamLogo size={44} customLogoUrl={brandingConfig.logoDataUrl} />
          <span>ఏది నిజం · నేటి భారతం</span>
        </a>

        {/* Zone 2: 5 Single-Line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-200"
        >
          <button
            type="button"
            onClick={() => setActiveSection('home')}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'home' ? 'text-amber-300 underline underline-offset-8' : ''
            }`}
          >
            {t.navNews}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('mandalPage')}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'mandalPage' ? 'text-amber-300 underline underline-offset-8' : ''
            }`}
          >
            {t.navMandalExplorer}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('videos')}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'videos' ? 'text-amber-300 underline underline-offset-8' : ''
            }`}
          >
            {t.navVideos}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('reporter')}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'reporter' ? 'text-amber-300 underline underline-offset-8' : ''
            }`}
          >
            {t.navReporter}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('advertise')}
            className={`hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'advertise' ? 'text-amber-300 underline underline-offset-8' : ''
            }`}
          >
            {t.navAdvertise}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('admin')}
            className="px-4 py-2 text-xs font-bold text-[#0B1D3A] bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.navAdmin}
          </button>
        </div>
      </header>

      {/* BELOW-HEADER EDITORIAL UTILITY RIBBON (Language Switcher, Breaking News, Notifications & PWA/Play Store) */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Motto & Breaking News Ticker */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9A3412] whitespace-nowrap shrink-0">
              ఒక దేశం ఒకే చట్టం · {t.breakingTickerLabel}:
            </span>
            <button
              type="button"
              onClick={() => {
                if (articles[0]) handleOpenArticle(articles[0]);
              }}
              className="text-xs font-semibold text-stone-800 truncate hover:text-[#9A3412] text-left cursor-pointer"
            >
              {articles[0] ? getArticleText(articles[0], language).title : ''}
            </button>
          </div>

          {/* Right: Language Selector (Telugu / Hindi / English), Notifications & Mobile App / Play Store */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div
              role="group"
              aria-label="Language Selection"
              className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200"
            >
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === 'te'
                    ? 'bg-[#0B1D3A] text-amber-300 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                తెలుగు
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === 'hi'
                    ? 'bg-[#0B1D3A] text-amber-300 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#0B1D3A] text-amber-300 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                English
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              aria-label="Toggle News Notifications"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-100 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>నోటిఫికేషన్లు ({articles.length})</span>
            </button>

            <PWAInstallButton
              onOpenPlayStoreGuide={() => setShowPlayStoreModal(true)}
              label={t.installAppButton}
            />

            <button
              type="button"
              onClick={() => setShowPlayStoreModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.playStoreGuideButton}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Notifications Drawer */}
        {showNotifications && (
          <div className="max-w-7xl mx-auto mt-3 p-4 rounded-xl bg-[#FBF9F5] border border-stone-300 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A3412]">
                తాజా వార్తా నోటిఫికేషన్లు (Live News Alerts — National, State, District &amp; Mandal)
              </h3>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                మూసివేయి (Close)
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {articles.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    handleOpenArticle(item);
                  }}
                  className="p-3 rounded-lg bg-white border border-stone-200 text-left hover:border-[#9A3412] transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-[#9A3412]">
                    {item.mandal} మండలం · {item.district}
                  </div>
                  <div className="text-xs font-bold text-stone-900 line-clamp-2 mt-0.5">
                    {getArticleText(item, language).title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        {activeSection === 'mandalPage' ? (
          <MandalPageView
            language={language}
            locations={locations}
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            selectedMandal={selectedMandal}
            onSelectLocation={(state, district, mandal) => {
              setSelectedState(state);
              setSelectedDistrict(district);
              setSelectedMandal(mandal);
            }}
            articles={articles}
            ads={ads}
            reporters={reporters}
            onOpenArticle={handleOpenArticle}
            onNavigateReporterPortal={(state, district, mandal) => {
              if (state && district && mandal) {
                setReporterPrefillLocation({ state, district, mandal });
              }
              setActiveSection('reporter');
            }}
            onBackToHome={() => setActiveSection('home')}
          />
        ) : activeSection === 'reporter' ? (
          <ReporterPortal
            language={language}
            locations={locations}
            reporters={reporters}
            articles={articles}
            prefillLocation={reporterPrefillLocation}
            onRegisterReporter={handleRegisterReporter}
            onPublishNews={handlePublishNews}
            onOpenMandalPage={handleOpenMandalPage}
          />
        ) : activeSection === 'advertise' ? (
          <AdvertisePortal
            language={language}
            locations={locations}
            ads={ads}
            feedbackList={feedbackList}
            onSubmitPrivateAd={handleSubmitPrivateAd}
            onSubmitFeedback={handleSubmitFeedback}
          />
        ) : activeSection === 'admin' ? (
          <AdminDashboard
            isAdminAuthenticated={isAdminAuthenticated}
            onAdminLoginSuccess={() => {
              setIsAdminAuthenticated(true);
              triggerToast('అడ్మిన్ డ్యాష్‌బోర్డ్‌లోకి స్వాగతం (Admin Logged In)');
            }}
            onAdminLogout={() => {
              setIsAdminAuthenticated(false);
              triggerToast('అడ్మిన్ లాగ్ అవుట్ పూర్తయింది');
            }}
            onGoogleAdminSignIn={handleGoogleAdminSignIn}
            firebaseUserEmail={firebaseUser?.email}
            reporters={reporters}
            onUpdateReporterStatus={handleUpdateReporterStatus}
            onUpdateReporterDetails={handleUpdateReporterDetails}
            locations={locations}
            onAddDistrictAndMandals={handleAddDistrictAndMandals}
            ads={ads}
            onUpdateAdStatus={handleUpdateAdStatus}
            articles={articles}
            onPublishNews={handlePublishNews}
            onDeleteNews={handleDeleteNews}
            adsenseConfig={adsenseConfig}
            onSaveAdsenseConfig={handleSaveAdsenseConfig}
            brandingConfig={brandingConfig}
            onSaveBrandingConfig={handleSaveBrandingConfig}
            feedbackList={feedbackList}
          />
        ) : (
          /* HOME & VIDEO UPDATES EDITORIAL BROADSHEET VIEW */
          <div className="space-y-8">
            {/* Official Neti Bharatam Hero Banner ("ఏది నిజం - నేటి భారతం") */}
            <NetiBharatamHeroBanner branding={brandingConfig} />

            {/* Brand Hero & All-India State/District/Mandal Search Filter Bar */}
            <section
              aria-label="News Search and Mandal Filter"
              className="rounded-2xl bg-white border border-stone-200 p-5 md:p-6 shadow-xs space-y-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="flex items-center gap-4">
                  <EdiNijamLogo size={64} customLogoUrl={brandingConfig.logoDataUrl} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#9A3412]">
                      ఏది నిజం · నేటి భారతం · ఒక దేశం ఒకే చట్టం
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-stone-900 mt-0.5">
                      {t.brandTagline}
                    </h1>
                  </div>
                </div>

                {/* Global News & Mandal Search Box */}
                <div className="w-full lg:w-96 relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="search"
                    aria-label={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full rounded-xl border border-stone-300 bg-[#FBF9F5] pl-10 pr-4 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:border-[#0B1D3A]"
                  />
                </div>
              </div>

              {/* Level Filter Tabs: All / National / State / District / Mandal */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div
                  role="group"
                  aria-label="News Level Filter"
                  className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200"
                >
                  {(
                    [
                      ['all', t.levelAll],
                      ['national', t.levelNational],
                      ['state', t.levelState],
                      ['district', t.levelDistrict],
                      ['mandal', t.levelMandal],
                    ] as [NewsLevel | 'all', string][]
                  ).map(([lvl, label]) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedLevel === lvl
                          ? 'bg-[#0B1D3A] text-amber-300 shadow-xs'
                          : 'text-stone-700 hover:text-stone-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {(
                    [
                      'all',
                      'justice',
                      'politics',
                      'agriculture',
                      'local',
                      'education',
                      'business',
                      'crime',
                    ] as (NewsCategory | 'all')[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#9A3412] text-white'
                          : 'bg-[#FBF9F5] border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {t.categories[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* All-India State -> District -> Mandal Cascading Filter & Dedicated Mandal Page Launcher */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-stone-100">
                <div>
                  <label htmlFor="home-state-select" className="block text-xs font-bold text-stone-700 mb-1">
                    {t.selectState}
                  </label>
                  <select
                    id="home-state-select"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict('ALL');
                      setSelectedMandal('ALL');
                    }}
                    className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-xs font-semibold text-stone-900"
                  >
                    <option value="ALL">{t.allStates}</option>
                    {locations.map((s) => (
                      <option key={s.state} value={s.state}>
                        {s.labelTe} ({s.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="home-district-select" className="block text-xs font-bold text-stone-700 mb-1">
                    {t.selectDistrict}
                  </label>
                  <select
                    id="home-district-select"
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedMandal('ALL');
                    }}
                    disabled={selectedState === 'ALL'}
                    className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-xs font-semibold text-stone-900 disabled:opacity-50"
                  >
                    <option value="ALL">{t.allDistricts}</option>
                    {availableDistricts.map((d) => (
                      <option key={d.district} value={d.district}>
                        {d.labelTe ? `${d.labelTe} (${d.district})` : d.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="home-mandal-select" className="block text-xs font-bold text-stone-700 mb-1">
                    {t.selectMandal}
                  </label>
                  <select
                    id="home-mandal-select"
                    value={selectedMandal}
                    onChange={(e) => setSelectedMandal(e.target.value)}
                    disabled={selectedDistrict === 'ALL'}
                    className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-xs font-bold text-[#9A3412] disabled:opacity-50"
                  >
                    <option value="ALL">{t.allMandals}</option>
                    {availableMandals.map((m) => (
                      <option key={m} value={m}>
                        {m} మండలం
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      const st = selectedState === 'ALL' ? 'Andhra Pradesh' : selectedState;
                      const dists = getDistrictsByState(st, locations);
                      const dt =
                        selectedDistrict === 'ALL'
                          ? dists[0]?.district || 'Guntur'
                          : selectedDistrict;
                      const mands = getMandalsByDistrict(st, dt, locations);
                      const mn =
                        selectedMandal === 'ALL'
                          ? mands[0] || 'Mangalagiri'
                          : selectedMandal;
                      handleOpenMandalPage(st, dt, mn);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#0B1D3A] text-amber-300 text-xs font-bold hover:bg-[#142F5A] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {selectedMandal !== 'ALL'
                        ? `${selectedMandal} మండల పేజీ తెరవండి`
                        : t.openMandalPage}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* 3-TIER EDITORIAL BROADSHEET FRONT PAGE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 8 Columns: Lead Story + Secondary Feature Grid */}
              <div className="lg:col-span-8 space-y-8">
                {leadArticle ? (
                  <article className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-xs">
                    <div className="h-56 md:h-72 w-full">
                      <EditorialIllustration
                        imageType={leadArticle.imageType}
                        category={leadArticle.category}
                        level={leadArticle.level}
                        mandal={leadArticle.mandal}
                        district={leadArticle.district}
                      />
                    </div>

                    <div className="p-6 md:p-8 space-y-4">
                      {/* Unboxed Metadata with Typographic Separators */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold uppercase tracking-wider text-[#9A3412]">
                            {t.leadStoryKicker}
                          </span>
                          <span aria-hidden="true">·</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenMandalPage(
                                leadArticle.state,
                                leadArticle.district,
                                leadArticle.mandal
                              )
                            }
                            className="font-semibold text-[#0B1D3A] hover:underline cursor-pointer"
                          >
                            {leadArticle.mandal} మండలం ({leadArticle.district}, {leadArticle.state})
                          </button>
                        </div>

                        <div className="font-mono tabular-nums font-bold text-stone-900 inline-flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-[#9A3412]" />
                          <span>
                            {leadArticle.views.toLocaleString('en-IN')} {t.viewsLabel}
                          </span>
                        </div>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold text-stone-900 leading-snug">
                        <button
                          type="button"
                          onClick={() => handleOpenArticle(leadArticle)}
                          className="text-left hover:text-[#9A3412] transition-colors cursor-pointer"
                        >
                          {getArticleText(leadArticle, language).title}
                        </button>
                      </h2>

                      <p className="text-sm md:text-base text-stone-600 leading-relaxed">
                        {getArticleText(leadArticle, language).summary}
                      </p>

                      <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="text-stone-600">
                          రిపోర్టర్: <strong>{leadArticle.reporterName}</strong>
                        </span>

                        <div className="flex flex-wrap items-center gap-2.5">
                          {extractYouTubeId(leadArticle.youtubeUrl) && (
                            <button
                              type="button"
                              onClick={() => handleOpenArticle(leadArticle)}
                              className="inline-flex items-center gap-1.5 font-bold text-red-700 hover:underline cursor-pointer"
                            >
                              <Youtube className="w-4 h-4" />
                              <span>{t.youtubeWatch}</span>
                            </button>
                          )}
                          <a
                            href={buildArticleWindowUrl(leadArticle.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="కొత్త విండోలో తెరవండి (Open in New Window)"
                            className="px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0B1D3A] font-extrabold inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>కొత్త విండో (New Window)</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenArticle(leadArticle)}
                            className="px-4 py-2 rounded-lg bg-[#0B1D3A] text-amber-300 font-bold hover:bg-[#142F5A] cursor-pointer"
                          >
                            పూర్తి కథనం చదవండి →
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ) : (
                  <div className="rounded-2xl bg-white border border-stone-200 p-10 text-center space-y-3">
                    <h3 className="text-lg font-bold text-stone-900">
                      ఈ ఫిల్టర్‌లో ప్రస్తుతం వార్తలు లేవు
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLevel('all');
                        setSelectedState('ALL');
                        setSelectedDistrict('ALL');
                        setSelectedMandal('ALL');
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0B1D3A] text-amber-300 text-xs font-bold cursor-pointer"
                    >
                      అన్ని వార్తలు చూపించు (Reset Filters)
                    </button>
                  </div>
                )}

                {/* Secondary Feature Grid (Tier 2 Salience) */}
                {secondaryArticles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {secondaryArticles.map((article) => {
                      const { title, summary } = getArticleText(article, language);
                      const hasVideo = !!extractYouTubeId(article.youtubeUrl);

                      return (
                        <article
                          key={article.id}
                          className="rounded-2xl bg-white border border-stone-200 overflow-hidden flex flex-col justify-between hover:border-stone-400 transition-colors"
                        >
                          <div>
                            <div className="aspect-4/3 w-full">
                              <EditorialIllustration
                                imageType={article.imageType}
                                category={article.category}
                                level={article.level}
                                mandal={article.mandal}
                                district={article.district}
                              />
                            </div>
                            <div className="p-5 space-y-2.5">
                              {/* Unboxed Metadata */}
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                                <div>
                                  <span className="font-bold text-[#9A3412]">
                                    {t.categories[article.category]}
                                  </span>
                                  <span aria-hidden="true"> · </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenMandalPage(
                                        article.state,
                                        article.district,
                                        article.mandal
                                      )
                                    }
                                    className="font-semibold text-stone-800 hover:underline cursor-pointer"
                                  >
                                    {article.mandal} మండలం
                                  </button>
                                </div>
                                <span className="font-mono tabular-nums font-bold text-stone-800 inline-flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5 text-[#9A3412]" />
                                  {article.views.toLocaleString('en-IN')}
                                </span>
                              </div>

                              <h3 className="text-base font-bold text-stone-900 leading-snug">
                                <button
                                  type="button"
                                  onClick={() => handleOpenArticle(article)}
                                  className="text-left hover:text-[#9A3412] transition-colors cursor-pointer"
                                >
                                  {title}
                                </button>
                              </h3>

                              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                {summary}
                              </p>
                            </div>
                          </div>

                          <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between text-xs">
                            <span className="text-stone-500 truncate max-w-[140px]">
                              {article.reporterName}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={buildArticleWindowUrl(article.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="కొత్త విండోలో తెరవండి (Open in New Window)"
                                className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-[#0B1D3A] font-bold text-[11px] inline-flex items-center gap-1 border border-stone-300"
                              >
                                <ExternalLink className="w-3 h-3 text-[#9A3412]" />
                                <span>కొత్త విండో</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleOpenArticle(article)}
                                className="font-bold text-[#0B1D3A] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                {hasVideo && <Youtube className="w-3.5 h-3.5 text-red-700" />}
                                <span>చదవండి →</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* Archive List (Tier 3 Salience) */}
                {archiveArticles.length > 0 && (
                  <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
                    <h3 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
                      మరిన్ని జాతీయ, రాష్ట్ర, జిల్లా &amp; మండల వార్తలు
                    </h3>
                    <div className="divide-y divide-stone-200">
                      {archiveArticles.map((art) => (
                        <div
                          key={art.id}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="text-xs text-stone-500">
                              <span className="font-bold text-[#9A3412]">
                                {art.mandal} మండలం ({art.district})
                              </span>
                              <span aria-hidden="true"> · </span>
                              <span>{t.categories[art.category]}</span>
                            </div>
                            <h4 className="text-sm font-bold text-stone-900">
                              <button
                                type="button"
                                onClick={() => handleOpenArticle(art)}
                                className="text-left hover:text-[#9A3412] cursor-pointer"
                              >
                                {getArticleText(art, language).title}
                              </button>
                            </h4>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <a
                              href={buildArticleWindowUrl(art.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="కొత్త విండోలో తెరవండి (Open in New Window)"
                              className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-[#0B1D3A] font-bold text-[11px] inline-flex items-center gap-1 border border-stone-300"
                            >
                              <ExternalLink className="w-3 h-3 text-[#9A3412]" />
                              <span>కొత్త విండో</span>
                            </a>
                            <div className="font-mono tabular-nums text-xs font-bold text-stone-700 inline-flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-[#9A3412]" />
                              <span>{art.views.toLocaleString('en-IN')} views</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right 4 Columns: YouTube Video Updates, Targeted Private Ads & Google AdSense */}
              <aside className="lg:col-span-4 space-y-6">
                {/* 1. Video Bulletins Widget (YouTube Channel Link Removed from Home Page per User Request) */}
                <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3 gap-2">
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#9A3412] shrink-0" />
                      <span>నేటిభారతం వీడియో వార్తలు (Video Bulletins)</span>
                    </h3>
                  </div>

                  {youtubeBulletins[0] && (
                    <div className="space-y-2">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-stone-300">
                        <iframe
                          title={getArticleText(youtubeBulletins[0], language).title}
                          src={`https://www.youtube.com/embed/${extractYouTubeId(
                            youtubeBulletins[0].youtubeUrl
                          )}?rel=0`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenArticle(youtubeBulletins[0])}
                        className="text-xs font-bold text-stone-900 hover:text-[#9A3412] text-left block cursor-pointer"
                      >
                        {getArticleText(youtubeBulletins[0], language).title}
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    {youtubeBulletins.slice(1, 4).map((vid) => (
                      <button
                        key={vid.id}
                        type="button"
                        onClick={() => handleOpenArticle(vid)}
                        className="w-full p-2.5 rounded-xl bg-[#FBF9F5] hover:bg-stone-100 text-left flex items-start gap-2.5 transition-colors cursor-pointer"
                      >
                        <Youtube className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-stone-900 line-clamp-1">
                            {getArticleText(vid, language).title}
                          </div>
                          <div className="text-[11px] text-stone-500 font-mono tabular-nums">
                            {vid.mandal} · {vid.views.toLocaleString('en-IN')} views
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Targeted Private Ads (Mandal / District / State / Category) */}
                <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#9A3412]" />
                      <span>ప్రైవేట్ ప్రకటనలు (Targeted Pvt Ads)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveSection('advertise')}
                      className="text-xs font-bold text-[#9A3412] hover:underline cursor-pointer"
                    >
                      + యాడ్ ఇవ్వండి
                    </button>
                  </div>

                  <div className="space-y-4">
                    {targetedAds.map((ad) => (
                      <div
                        key={ad.id}
                        data-testid={`home-private-ad-card-${ad.id}`}
                        className="rounded-xl bg-[#FBF9F5] border border-amber-500/40 overflow-hidden shadow-xs"
                      >
                        <div className="aspect-16/9 w-full bg-stone-900 border-b border-amber-500/30 overflow-hidden">
                          <img
                            src={getPrivateAdImageUrl(ad)}
                            alt={ad.title}
                            data-testid={`home-private-ad-img-${ad.id}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-stone-500">
                            <span className="font-bold uppercase text-[#9A3412]">
                              {ad.targetLevel} AD · {ad.mandal}
                            </span>
                            <span>{ad.district}</span>
                          </div>
                          <h4 className="text-sm font-bold text-stone-900 leading-snug">
                            {ad.title}
                          </h4>
                          <p className="text-xs text-stone-600 leading-relaxed">{ad.bannerText}</p>
                          <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
                            <span className="font-semibold text-stone-800 truncate">
                              {ad.sponsorName}
                            </span>
                            <a
                              href={ad.ctaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-[#0B1D3A] underline shrink-0"
                            >
                              <span>సంప్రదించండి</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* EDITORIAL FOOTER */}
      <footer className="bg-[#0B1D3A] text-stone-300 border-t border-amber-500/30 py-8 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <EdiNijamLogo size={48} customLogoUrl={brandingConfig.logoDataUrl} />
            <div>
              <div className="text-base font-bold text-amber-300">
                ఏది నిజం · నేటి భారతం (NETI BHARATAM NEWS NETWORK)
              </div>
              <div className="text-xs text-stone-400">
                నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం · National, State, District &amp; Mandal News
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setActiveSection('mandalPage')}
              className="hover:text-amber-300 cursor-pointer"
            >
              ఆల్ ఇండియా మండల పేజీలు
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveSection('reporter')}
              className="hover:text-amber-300 cursor-pointer"
            >
              రిపోర్టర్ రిజిస్ట్రేషన్
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveSection('advertise')}
              className="hover:text-amber-300 cursor-pointer"
            >
              ప్రైవేట్ యాడ్స్ &amp; ఫీడ్‌బ్యాక్
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setShowPlayStoreModal(true)}
              className="hover:text-amber-300 cursor-pointer"
            >
              Play Store మొబైల్ యాప్
            </button>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-Zone Ergonomics, <= 15% Sticky Cap) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 grid grid-cols-5 items-center h-14"
      >
        <button
          type="button"
          onClick={() => setActiveSection('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] text-[10px] font-bold ${
            activeSection === 'home' ? 'text-[#9A3412]' : 'text-stone-600'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span className="mt-0.5">వార్తలు</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('mandalPage')}
          className={`flex flex-col items-center justify-center min-h-[44px] text-[10px] font-bold ${
            activeSection === 'mandalPage' ? 'text-[#9A3412]' : 'text-stone-600'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="mt-0.5">మండల పేజీ</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('videos')}
          className={`flex flex-col items-center justify-center min-h-[44px] text-[10px] font-bold ${
            activeSection === 'videos' ? 'text-[#9A3412]' : 'text-stone-600'
          }`}
        >
          <Video className="w-4 h-4" />
          <span className="mt-0.5">వీడియోలు</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('reporter')}
          className={`flex flex-col items-center justify-center min-h-[44px] text-[10px] font-bold ${
            activeSection === 'reporter' ? 'text-[#9A3412]' : 'text-stone-600'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span className="mt-0.5">రిపోర్టర్</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('admin')}
          className={`flex flex-col items-center justify-center min-h-[44px] text-[10px] font-bold ${
            activeSection === 'admin' ? 'text-[#9A3412]' : 'text-stone-600'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="mt-0.5">అడ్మిన్</span>
        </button>
      </nav>

      {/* Modals */}
      <ArticleDetailModal
        article={activeArticle}
        language={language}
        onLanguageChange={setLanguage}
        onClose={handleCloseArticle}
        onSelectMandal={handleOpenMandalPage}
        allArticles={articles}
        allAds={ads}
        onSelectArticle={handleOpenArticle}
      />

      <PlayStoreModal
        isOpen={showPlayStoreModal}
        onClose={() => setShowPlayStoreModal(false)}
      />
    </div>
  );
}
