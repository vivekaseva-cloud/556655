import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Eye,
  Youtube,
  UserCheck,
  ArrowLeft,
  Megaphone,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import {
  getStates,
  getDistrictsByState,
  getMandalsByDistrict,
  searchAllMandals,
  getArticleText,
  TRANSLATIONS,
  type StateEntry,
} from '../data/indiaLocations';
import {
  filterNewsArticles,
  filterTargetedAds,
  extractYouTubeId,
  getPrivateAdImageUrl,
  buildArticleWindowUrl,
  type LanguageCode,
  type NewsArticleItem,
  type PrivateAdItem,
  type ReporterRecord,
} from '../utils/newsLogic';
import { EditorialIllustration, ReporterAvatar } from './EditorialIllustration';
import { SocialShareRow } from './ArticleDetailModal';

interface MandalPageViewProps {
  language: LanguageCode;
  selectedState: string;
  selectedDistrict: string;
  selectedMandal: string;
  onSelectLocation: (state: string, district: string, mandal: string) => void;
  articles: NewsArticleItem[];
  ads: PrivateAdItem[];
  reporters: ReporterRecord[];
  onOpenArticle: (article: NewsArticleItem) => void;
  onNavigateReporterPortal: (prefillState?: string, prefillDistrict?: string, prefillMandal?: string) => void;
  onBackToHome: () => void;
  locations?: StateEntry[];
}

export const MandalPageView: React.FC<MandalPageViewProps> = ({
  language,
  selectedState,
  selectedDistrict,
  selectedMandal,
  onSelectLocation,
  articles,
  ads,
  reporters,
  onOpenArticle,
  onNavigateReporterPortal,
  onBackToHome,
  locations,
}) => {
  const t = TRANSLATIONS[language];
  const stateLocations = useMemo(() => locations || getStates(), [locations]);
  const [directorySearch, setDirectorySearch] = useState('');

  const activeState = selectedState === 'ALL' ? 'Andhra Pradesh' : selectedState;
  const districts = useMemo(
    () => getDistrictsByState(activeState, stateLocations),
    [activeState, stateLocations]
  );
  const defaultDistrictName = useMemo(() => {
    if (districts.some((d) => d.district === 'Guntur')) return 'Guntur';
    if (districts.some((d) => d.district === 'Hyderabad')) return 'Hyderabad';
    return districts[0]?.district || 'Guntur';
  }, [districts]);
  const activeDistrict =
    selectedDistrict === 'ALL' || !districts.some((d) => d.district === selectedDistrict)
      ? defaultDistrictName
      : selectedDistrict;
  const mandals = useMemo(
    () => getMandalsByDistrict(activeState, activeDistrict, stateLocations),
    [activeState, activeDistrict, stateLocations]
  );
  const defaultMandalName = useMemo(() => {
    if (mandals.includes('Mangalagiri')) return 'Mangalagiri';
    if (mandals.includes('Tirupati (Urban)')) return 'Tirupati (Urban)';
    return mandals[0] || 'Mangalagiri';
  }, [mandals]);
  const activeMandal =
    selectedMandal === 'ALL' || !mandals.includes(selectedMandal)
      ? defaultMandalName
      : selectedMandal;

  // News strictly for this Mandal
  const mandalArticles = useMemo(
    () =>
      filterNewsArticles(articles, {
        state: activeState,
        district: activeDistrict,
        mandal: activeMandal,
      }),
    [articles, activeState, activeDistrict, activeMandal]
  );

  // District / State fallback news when user wants to see nearby updates
  const districtArticles = useMemo(
    () =>
      filterNewsArticles(articles, {
        state: activeState,
        district: activeDistrict,
      }).filter((a) => a.mandal !== activeMandal),
    [articles, activeState, activeDistrict, activeMandal]
  );

  // Targeted Private Ads for this Mandal
  const mandalAds = useMemo(
    () =>
      filterTargetedAds(ads, {
        state: activeState,
        district: activeDistrict,
        mandal: activeMandal,
      }),
    [ads, activeState, activeDistrict, activeMandal]
  );

  // Approved Reporters for this Mandal
  const mandalReporters = useMemo(
    () =>
      reporters.filter(
        (r) =>
          r.status === 'approved' &&
          r.state === activeState &&
          r.district === activeDistrict &&
          r.mandal === activeMandal
      ),
    [reporters, activeState, activeDistrict, activeMandal]
  );

  // Quick search results across all India Mandals
  const matchingMandals = useMemo(
    () => searchAllMandals(directorySearch, stateLocations).slice(0, 18),
    [directorySearch, stateLocations]
  );

  const totalMandalViews = useMemo(
    () => mandalArticles.reduce((acc, item) => acc + item.views, 0),
    [mandalArticles]
  );

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Back Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800 hover:bg-stone-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>హోమ్ పేజీ (All News)</span>
          </button>
          <div className="text-xs text-stone-600 flex items-center gap-1.5 flex-wrap">
            <span>భారతదేశం (India)</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-stone-900">{activeState}</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-stone-900">{activeDistrict} జిల్లా</span>
            <span aria-hidden="true">/</span>
            <span className="font-bold text-[#9A3412]">{activeMandal} మండల పేజీ</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateReporterPortal(activeState, activeDistrict, activeMandal)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#9A3412] text-white text-xs font-semibold hover:bg-[#7C2D12] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{activeMandal} మండల న్యూస్ అప్‌లోడ్ / రిపోర్టర్ నమోదు</span>
        </button>
      </div>

      {/* All-India State -> District -> Mandal Selector & Search Bar */}
      <section
        aria-label="Mandal Directory Selector"
        className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#9A3412]" />
            <span>ఆల్ ఇండియా స్టేట్స్, జిల్లా &amp; మండల వారీగా పేజీ ఎంపిక (All-India Mandal Selector)</span>
          </h2>
          <span className="text-xs text-stone-500">
            28 రాష్ట్రాలు &amp; కేంద్రపాలిత ప్రాంతాలు · మండల వారీ ప్రత్యేక పేజీలు
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="mandal-page-state" className="block text-xs font-semibold text-stone-700 mb-1">
              1. రాష్ట్రం (State)
            </label>
            <select
              id="mandal-page-state"
              value={activeState}
              onChange={(e) => {
                const newState = e.target.value;
                const firstDist = getDistrictsByState(newState, stateLocations)[0];
                const firstMandal = firstDist?.mandals[0] || '';
                onSelectLocation(newState, firstDist?.district || '', firstMandal);
              }}
              className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm font-medium text-stone-900"
            >
              {stateLocations.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.labelTe} ({s.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mandal-page-district" className="block text-xs font-semibold text-stone-700 mb-1">
              2. జిల్లా (District)
            </label>
            <select
              id="mandal-page-district"
              value={activeDistrict}
              onChange={(e) => {
                const newDist = e.target.value;
                const firstMandal =
                  getMandalsByDistrict(activeState, newDist, stateLocations)[0] || '';
                onSelectLocation(activeState, newDist, firstMandal);
              }}
              className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm font-medium text-stone-900"
            >
              {districts.map((d) => (
                <option key={d.district} value={d.district}>
                  {d.labelTe ? `${d.labelTe} (${d.district})` : d.district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mandal-page-mandal" className="block text-xs font-semibold text-stone-700 mb-1">
              3. మండలం (Mandal)
            </label>
            <select
              id="mandal-page-mandal"
              value={activeMandal}
              onChange={(e) => onSelectLocation(activeState, activeDistrict, e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm font-bold text-[#9A3412]"
            >
              {mandals.map((m) => (
                <option key={m} value={m}>
                  {m} మండలం
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mandal-quick-search" className="block text-xs font-semibold text-stone-700 mb-1">
              మండలం పేరుతో నేరుగా వెతకండి
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                id="mandal-quick-search"
                type="search"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="ఉదా: Mangalagiri, Kukatpally, Tirupati..."
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] pl-9 pr-3 py-2 text-sm text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Instant Mandal Search Results */}
        {directorySearch.trim().length > 0 && (
          <div className="pt-2 border-t border-stone-200">
            <div className="text-xs font-semibold text-stone-600 mb-2">
              మండల సెర్చ్ ఫలితాలు ({matchingMandals.length}):
            </div>
            <div className="flex flex-wrap gap-2">
              {matchingMandals.map((item) => (
                <button
                  key={`${item.state}-${item.district}-${item.mandal}`}
                  type="button"
                  onClick={() => {
                    onSelectLocation(item.state, item.district, item.mandal);
                    setDirectorySearch('');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 bg-[#FBF9F5] hover:bg-[#0B1D3A] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <strong>{item.mandal}</strong> · {item.district} ({item.stateLabelTe})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Other Mandals in Selected District Quick Bar */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-stone-500 whitespace-nowrap shrink-0">
            {activeDistrict} జిల్లాలోని మండలాలు:
          </span>
          {mandals.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onSelectLocation(activeState, activeDistrict, m)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                m === activeMandal
                  ? 'bg-[#0B1D3A] text-amber-300'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      {/* Dedicated Mandal Header Banner */}
      <div className="rounded-2xl bg-[#0B1D3A] text-white p-6 md:p-8 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
            నేటిభారతం · మండల ప్రత్యేక వార్తా పేజీ (OFFICIAL MANDAL NEWS DESK)
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            {activeMandal} మండల వార్తలు
          </h1>
          <p className="text-sm text-stone-300">
            {activeDistrict} జిల్లా · {activeState} · స్థానిక వార్తలు, యూట్యూబ్ వీడియో అప్‌డేట్స్ &amp; ప్రజా సమస్యలు
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 bg-white/10 rounded-xl p-4 border border-white/15 shrink-0 font-mono tabular-nums text-center">
          <div>
            <div className="text-xl font-bold text-amber-300">{mandalArticles.length}</div>
            <div className="text-[11px] text-stone-300 font-sans">మండల వార్తలు</div>
          </div>
          <div className="border-x border-white/15 px-3">
            <div className="text-xl font-bold text-amber-300">{mandalAds.length}</div>
            <div className="text-[11px] text-stone-300 font-sans">ప్రైవేట్ యాడ్స్</div>
          </div>
          <div className="border-r border-white/15 pr-3">
            <div className="text-xl font-bold text-amber-300">
              {totalMandalViews.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-300 font-sans">మొత్తం Views</div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-300">{mandalReporters.length}</div>
            <div className="text-[11px] text-stone-300 font-sans">రిపోర్టర్లు</div>
          </div>
        </div>
      </div>

      {/* Unified Single-Page Mandal News & Private Ads Container */}
      <div
        data-testid="unified-mandal-news-and-ads"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Left 8 Columns: All News AND Unified Private Ads in this Mandal on One Page */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-300 pb-3">
            <h2 className="text-lg font-bold text-stone-900">
              {activeMandal} మండలంలోని వార్తలు &amp; ప్రైవేట్ యాడ్స్ — ఒకే పేజీలో ({mandalArticles.length} News · {mandalAds.length} Pvt Ads)
            </h2>
            <span className="text-xs font-semibold text-[#9A3412]">
              మండల వార్తలు మరియు ప్రైవేట్ ప్రకటనలు ఒకే పేజీలో (Unified Mandal Page)
            </span>
          </div>

          {mandalArticles.length === 0 ? (
            <div className="rounded-2xl bg-white border border-stone-200 p-8 text-center space-y-4">
              <h3 className="text-base font-bold text-stone-900">
                ప్రస్తుతం {activeMandal} మండలంలో కొత్త వార్తలు ఏవీ అప్‌లోడ్ కాలేదు
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                మీరు {activeMandal} మండల రిపోర్టర్ అయితే లాగిన్ అయి వెంటనే వార్తలను మరియు యూట్యూబ్ వీడియో లింక్‌లను అప్‌లోడ్ చేయవచ్చు.
              </p>
              <button
                type="button"
                onClick={() => onNavigateReporterPortal(activeState, activeDistrict, activeMandal)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#9A3412] text-white text-xs font-semibold hover:bg-[#7C2D12] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{activeMandal} మండల రిపోర్టర్‌గా నమోదు / న్యూస్ అప్‌లోడ్</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {mandalArticles.map((article) => {
                const { title, summary } = getArticleText(article, language);
                const hasYoutube = !!extractYouTubeId(article.youtubeUrl);

                return (
                  <article
                    key={article.id}
                    className="rounded-2xl bg-white border border-stone-200 overflow-hidden hover:border-stone-400 transition-colors grid grid-cols-1 md:grid-cols-12"
                  >
                    <div className="md:col-span-5 aspect-video md:aspect-auto">
                      <EditorialIllustration
                        imageType={article.imageType}
                        category={article.category}
                        level={article.level}
                        mandal={article.mandal}
                        district={article.district}
                      />
                    </div>
                    <div className="md:col-span-7 p-5 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                          <span className="font-bold text-[#9A3412]">
                            {t.categories[article.category]}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{article.mandal} మండలం</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums inline-flex items-center gap-1 font-semibold text-stone-800">
                            <Eye className="w-3.5 h-3.5 text-[#9A3412]" />
                            {article.views.toLocaleString('en-IN')} {t.viewsLabel}
                          </span>
                          {hasYoutube && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                                <Youtube className="w-3.5 h-3.5" />
                                Video
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-stone-900 leading-snug">
                          <a
                            href={buildArticleWindowUrl(article.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (!e.ctrlKey && !e.metaKey) {
                                e.preventDefault();
                                onOpenArticle(article);
                              }
                            }}
                            className="text-left hover:text-[#9A3412] transition-colors cursor-pointer"
                          >
                            {title}
                          </a>
                        </h3>

                        <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                          {summary}
                        </p>
                      </div>

                      {/* Social Share (WhatsApp, Facebook, Instagram) & Read Full Story New Window Action */}
                      <div className="pt-3 border-t border-stone-100 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-stone-500">
                            రిపోర్టర్: <strong>{article.reporterName}</strong>
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={buildArticleWindowUrl(article.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid={`mandal-new-window-${article.id}`}
                              title="కొత్త విండోలో తెరవండి (Open in New Window)"
                              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0B1D3A] text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>కొత్త విండో (New Window)</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => onOpenArticle(article)}
                              data-testid={`mandal-read-full-${article.id}`}
                              className="px-3.5 py-1.5 rounded-lg bg-[#0B1D3A] text-amber-300 text-xs font-bold hover:bg-[#142F5A] inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>పూర్తి కథనం చదవండి →</span>
                            </button>
                          </div>
                        </div>

                        <SocialShareRow
                          id={article.id}
                          title={title}
                          summary={summary}
                          mandal={article.mandal}
                          district={article.district}
                          state={article.state}
                          compact
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Inline Mandal Private Ads Showcase on the Same Page Feed */}
          {mandalAds.length > 0 && (
            <div
              data-testid="mandal-inline-private-ads-section"
              className="rounded-2xl bg-white border border-amber-500/40 p-5 space-y-4 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#9A3412]" />
                  <span>
                    {activeMandal} మండల ప్రైవేట్ ప్రకటనలు (Mandal Private Ads on Same Page)
                  </span>
                </h3>
                <span className="text-xs font-bold text-[#9A3412]">
                  {mandalAds.length} ఆమోదించబడిన ప్రకటనలు
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mandalAds.map((ad) => (
                  <div
                    key={`inline-${ad.id}`}
                    className="rounded-xl bg-[#FBF9F5] border border-amber-500/40 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-16/9 w-full bg-stone-900 border-b border-amber-500/30 overflow-hidden">
                        <img
                          src={getPrivateAdImageUrl(ad)}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-1.5">
                        <div className="text-[11px] font-bold uppercase text-[#9A3412]">
                          {ad.targetLevel} PVT AD · {ad.mandal} ({ad.district})
                        </div>
                        <h4 className="text-sm font-bold text-stone-900">{ad.title}</h4>
                        <p className="text-xs text-stone-600">{ad.bannerText}</p>
                      </div>
                    </div>
                    <div className="p-4 pt-2 border-t border-stone-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">{ad.sponsorName}</span>
                        {ad.ctaUrl && (
                          <a
                            href={ad.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-[#0B1D3A] underline"
                          >
                            <span>సంప్రదించండి</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <SocialShareRow
                        id={`mandal-ad-${ad.id}`}
                        title={`${ad.title} — ${ad.sponsorName}`}
                        summary={ad.bannerText}
                        mandal={ad.mandal}
                        district={ad.district}
                        state={ad.state}
                        compact
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other News from the Same District */}
          {districtArticles.length > 0 && (
            <div className="pt-6 space-y-4">
              <h3 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-2">
                {activeDistrict} జిల్లాలోని ఇతర మండలాల వార్తలు
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {districtArticles.map((article) => {
                  const { title } = getArticleText(article, language);
                  return (
                    <div
                      key={article.id}
                      className="p-4 rounded-xl bg-white border border-stone-200 space-y-2"
                    >
                      <div className="text-xs text-stone-500 flex items-center justify-between">
                        <span className="font-semibold text-[#9A3412]">
                          {article.mandal} మండలం
                        </span>
                        <span className="font-mono tabular-nums">
                          {article.views.toLocaleString('en-IN')} views
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900">
                        <button
                          type="button"
                          onClick={() => onOpenArticle(article)}
                          className="text-left hover:text-[#9A3412] cursor-pointer"
                        >
                          {title}
                        </button>
                      </h4>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Columns: Verified Mandal Reporters & Mandal-Targeted Private Ads */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Verified Reporters in this Mandal */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>{activeMandal} మండల అధికారిక రిపోర్టర్లు</span>
              </h3>
              <span className="text-xs font-mono tabular-nums text-stone-500">
                {mandalReporters.length} Verified
              </span>
            </div>

            {mandalReporters.length === 0 ? (
              <div className="text-xs text-stone-600 space-y-3">
                <p>ఈ మండలానికి కొత్త రిపోర్టర్ల నియామకం జరుగుతోంది.</p>
                <button
                  type="button"
                  onClick={() =>
                    onNavigateReporterPortal(activeState, activeDistrict, activeMandal)
                  }
                  className="w-full py-2 rounded-lg bg-[#0B1D3A] text-amber-300 font-semibold hover:bg-[#142F5A] cursor-pointer"
                >
                  రిపోర్టర్‌గా అప్లై చేయండి
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {mandalReporters.map((rep) => (
                  <div
                    key={rep.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FBF9F5] border border-stone-200"
                  >
                    <ReporterAvatar photoDataUrl={rep.photoDataUrl} name={rep.name} size="md" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-stone-900 truncate">{rep.name}</div>
                      <div className="text-xs text-emerald-800 font-medium">
                        ఆమోదించబడిన రిపోర్టర్ · {rep.mandal}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Targeted Private Ads for this Mandal / District / State */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#9A3412]" />
                <span>{activeMandal} మండల &amp; జిల్లా ప్రకటనలు (Pvt Ads)</span>
              </h3>
              <span className="text-[11px] text-stone-500">Admin Approved</span>
            </div>

            {mandalAds.map((ad) => (
              <div
                key={ad.id}
                data-testid={`mandal-private-ad-card-${ad.id}`}
                className="rounded-xl bg-[#FBF9F5] border border-amber-500/40 overflow-hidden shadow-xs"
              >
                <div className="aspect-16/9 w-full bg-stone-900 border-b border-amber-500/30 overflow-hidden">
                  <img
                    src={getPrivateAdImageUrl(ad)}
                    alt={ad.title}
                    data-testid={`mandal-private-ad-img-${ad.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-[11px] text-stone-500 flex items-center justify-between">
                    <span className="font-semibold uppercase tracking-wider text-[#9A3412]">
                      ప్రైవేట్ ప్రకటన · {ad.targetLevel.toUpperCase()}
                    </span>
                    <span>{ad.mandal}</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 leading-snug">{ad.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{ad.bannerText}</p>
                  <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 truncate">{ad.sponsorName}</span>
                    {ad.ctaUrl && (
                      <a
                        href={ad.ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#0B1D3A] underline shrink-0"
                      >
                        <span>వివరాలు</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
