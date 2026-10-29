import React, { useState, useMemo } from 'react';
import {
  X,
  Eye,
  MapPin,
  Share2,
  ExternalLink,
  UserCheck,
  Copy,
  Check,
  Megaphone,
  Newspaper,
  ArrowLeft,
  MessageCircle,
  Facebook,
  Instagram,
} from 'lucide-react';
import {
  extractYouTubeId,
  buildArticleWindowUrl,
  buildCanonicalArticleUrl,
  CANONICAL_NETIBHAARATHAM_DOMAIN,
  buildSocialShareLinks,
  getUnifiedMandalBundle,
  getPrivateAdImageUrl,
  type LanguageCode,
  type NewsArticleItem,
  type PrivateAdItem,
} from '../utils/newsLogic';
import { getArticleText, TRANSLATIONS } from '../data/indiaLocations';
import { EditorialIllustration } from './EditorialIllustration';

interface SocialShareRowProps {
  id: string;
  title: string;
  summary?: string;
  mandal: string;
  district: string;
  state: string;
  compact?: boolean;
}

export const SocialShareRow: React.FC<SocialShareRowProps> = ({
  id,
  title,
  summary,
  mandal,
  district,
  state,
  compact = false,
}) => {
  const [copiedType, setCopiedType] = useState<'link' | 'insta' | null>(null);

  const shareLinks = useMemo(
    () =>
      buildSocialShareLinks({
        id,
        title,
        summary,
        mandal,
        district,
        state,
      }),
    [id, title, summary, mandal, district, state]
  );

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareLinks.canonicalUrl || shareLinks.articleUrl);
    }
    setCopiedType('link');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleInstagramShare = async () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareLinks.instagramShareCaption);
    }
    setCopiedType('insta');
    setTimeout(() => setCopiedType(null), 3000);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareLinks.shareText,
          url: shareLinks.articleUrl,
        });
      } catch {
        // user cancelled native share sheet
      }
    }
  };

  return (
    <div
      data-testid={compact ? `card-share-row-${id}` : 'article-social-share-bar'}
      className="flex flex-wrap items-center gap-2"
    >
      {/* WhatsApp Share */}
      <a
        href={shareLinks.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={compact ? `card-share-whatsapp-${id}` : 'share-whatsapp-btn'}
        aria-label={`Share on WhatsApp: ${title}`}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold transition-colors whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-2 text-xs shadow-xs'
        }`}
      >
        <MessageCircle className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>WhatsApp</span>
      </a>

      {/* Facebook Share */}
      <a
        href={shareLinks.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={compact ? `card-share-facebook-${id}` : 'share-facebook-btn'}
        aria-label={`Share on Facebook: ${title}`}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-[#1877F2] hover:bg-[#1D4ED8] text-white font-bold transition-colors whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-2 text-xs shadow-xs'
        }`}
      >
        <Facebook className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>Facebook</span>
      </a>

      {/* Instagram Share (Copies Story Caption + Link & Opens Instagram / Share Sheet) */}
      <a
        href={shareLinks.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          void handleInstagramShare();
        }}
        data-testid={compact ? `card-share-instagram-${id}` : 'share-instagram-btn'}
        aria-label={`Share on Instagram: ${title}`}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#E1306C] via-[#C13584] to-[#833AB4] hover:opacity-95 text-white font-bold transition-opacity whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-2 text-xs shadow-xs'
        }`}
      >
        <Instagram className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>
          {copiedType === 'insta' ? 'Instagram లింక్ కాపీ అయింది!' : 'Instagram'}
        </span>
      </a>

      {/* Copy Direct Link */}
      <button
        type="button"
        onClick={handleCopyLink}
        data-testid={compact ? `card-share-copylink-${id}` : 'share-copylink-btn'}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-2 text-xs'
        }`}
      >
        {copiedType === 'link' ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-emerald-800">లింక్ కాపీ అయింది!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-[#0B1D3A]" />
            <span>లింక్ కాపీ (Copy Link)</span>
          </>
        )}
      </button>
    </div>
  );
};

interface ArticleDetailModalProps {
  article: NewsArticleItem | null;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onClose: () => void;
  onSelectMandal: (state: string, district: string, mandal: string) => void;
  allArticles?: NewsArticleItem[];
  allAds?: PrivateAdItem[];
  onSelectArticle?: (article: NewsArticleItem) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  language,
  onLanguageChange,
  onClose,
  onSelectMandal,
  allArticles = [],
  allAds = [],
  onSelectArticle,
}) => {
  if (!article) return null;

  const t = TRANSLATIONS[language];
  const { title, summary, content } = getArticleText(article, language);
  const youtubeId = extractYouTubeId(article.youtubeUrl);
  const newWindowHref = buildArticleWindowUrl(article.id);
  const canonicalUrl = buildCanonicalArticleUrl(article.id);
  const [addressCopied, setAddressCopied] = useState(false);

  // Unified Mandal Bundle: All News + All Targeted Private Ads for this Article's Mandal on the SAME page
  const unifiedBundle = useMemo(
    () =>
      getUnifiedMandalBundle(allArticles, allAds, {
        state: article.state,
        district: article.district,
        mandal: article.mandal,
      }),
    [allArticles, allAds, article.state, article.district, article.mandal]
  );

  const otherMandalArticles = useMemo(
    () =>
      unifiedBundle.mandalArticles
        .filter((a) => a.id !== article.id)
        .concat(unifiedBundle.districtArticles)
        .slice(0, 6),
    [unifiedBundle, article.id]
  );

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [article.id]);

  return (
    <div
      data-testid="article-reader-window"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#FBF9F5] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
    >
      {/* Dedicated Full-Window Top Header Bar */}
      <div className="sticky top-0 z-20 bg-[#0B1D3A] text-white px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/40 shadow-md shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            data-testid="close-article-window-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-[#0B1D3A] text-xs font-extrabold hover:bg-amber-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>వెనక్కి / హోమ్ పేజీ (Back)</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <span>నేటిభారతం · పూర్తి కథనం విండో</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectMandal(article.state, article.district, article.mandal);
              }}
              className="inline-flex items-center gap-1 underline hover:text-white cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {article.mandal} మండలం ({article.district}, {article.state})
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Open in New Browser Tab / Window Link */}
          <a
            href={newWindowHref}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="open-article-new-tab-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-amber-300 border border-amber-400/40 text-xs font-bold transition-colors"
          >
            <span>కొత్త ట్యాబ్ / విండోలో తెరవండి (New Window)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center bg-white/10 rounded-lg p-0.5">
            {(['te', 'hi', 'en'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  language === lang
                    ? 'bg-amber-400 text-[#0B1D3A]'
                    : 'text-stone-200 hover:text-white'
                }`}
              >
                {lang === 'te' ? 'తెలుగు' : lang === 'hi' ? 'हिन्दी' : 'EN'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close article reader"
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Full-Window Body: Full Article + Same-Page Mandal News & Mandal Private Ads */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Columns: Full News Story & Mandal Other News on the Same Page */}
        <div className="lg:col-span-8 space-y-8">
          <article className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8 shadow-xs space-y-6">
            {/* Unboxed Metadata Line */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 border-b border-stone-200 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-[#9A3412]">
                  {t.categories[article.category] || article.category}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {article.state} / {article.district} /{' '}
                  <strong className="text-[#0B1D3A]">{article.mandal} మండలం</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>{new Date(article.createdAt).toLocaleDateString('en-IN')}</span>
              </div>

              <div className="flex items-center gap-4 font-mono tabular-nums font-semibold text-stone-800">
                <span className="inline-flex items-center gap-1.5" title="Total Article Views">
                  <Eye className="w-4 h-4 text-[#9A3412]" />
                  <span>
                    {article.views.toLocaleString('en-IN')} {t.viewsLabel}
                  </span>
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1
              id="article-modal-title"
              className="text-2xl md:text-4xl font-bold text-stone-900 leading-snug"
            >
              {title}
            </h1>

            {/* Prominent Website Address & Social Share Bar */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/50 via-[#FBF9F5] to-amber-50/50 border border-amber-300/80 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-[#9A3412]" />
                  <span>వార్త వెబ్‌సైట్ అడ్రస్ (Website Address to Share):</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/60">
                  ఈ అడ్రస్ షేర్ చేస్తే నేరుగా ఈ వార్త ఓపెన్ అవుతుంది
                </span>
              </div>

              {/* Exact Shareable URL Display Bar */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2 rounded-lg border border-stone-300">
                <span className="text-[11px] font-bold text-stone-500 uppercase shrink-0 px-1 font-mono">
                  URL:
                </span>
                <input
                  type="text"
                  readOnly
                  value={canonicalUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full text-xs font-mono font-semibold text-[#0B1D3A] bg-transparent outline-none truncate selection:bg-amber-200"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(canonicalUrl);
                        setAddressCopied(true);
                        setTimeout(() => setAddressCopied(false), 2500);
                      }
                    }}
                    className="px-3 py-1.5 rounded-md bg-[#0B1D3A] text-amber-300 hover:bg-[#142F5A] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {addressCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>కాపీ అయింది!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>అడ్రస్ కాపీ (Copy URL)</span>
                      </>
                    )}
                  </button>
                  <a
                    href={newWindowHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="కొత్త విండోలో తెరవండి"
                    className="px-3 py-1.5 rounded-md bg-amber-400 hover:bg-amber-300 text-[#0B1D3A] text-xs font-extrabold inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>కొత్త విండో (New Window)</span>
                  </a>
                </div>
              </div>

              {/* Social Share Buttons (WhatsApp, Facebook, Instagram, Direct Link) */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                <SocialShareRow
                  id={article.id}
                  title={title}
                  summary={summary}
                  mandal={article.mandal}
                  district={article.district}
                  state={article.state}
                />
              </div>
            </div>

            {/* Lead Deck / Summary */}
            <p className="text-base md:text-lg font-medium text-stone-700 leading-relaxed border-y border-stone-200 py-4">
              {summary}
            </p>

            {/* YouTube Video Embed OR Editorial Illustration */}
            {youtubeId ? (
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-stone-300 shadow-sm">
                <iframe
                  title={title}
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-stone-200">
                <EditorialIllustration
                  imageType={article.imageType}
                  category={article.category}
                  level={article.level}
                  mandal={article.mandal}
                  district={article.district}
                />
              </div>
            )}

            {/* Full Story Prose */}
            <div className="space-y-4 text-base md:text-lg text-stone-800 leading-relaxed max-w-prose">
              {content.split('\n\n').map((para, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? 'first-letter:text-4xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:text-[#9A3412]'
                      : ''
                  }
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Reporter Attribution & Bottom Social Share */}
            <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0B1D3A] text-amber-300 flex items-center justify-center font-bold text-sm">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">{article.reporterName}</div>
                  <div className="text-xs text-stone-600">
                    ధృవీకరించబడిన రిపోర్టర్ · {article.mandal} మండలం, {article.district}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectMandal(article.state, article.district, article.mandal);
                }}
                className="px-4 py-2 rounded-lg bg-[#0B1D3A] text-amber-300 text-xs font-bold hover:bg-[#142F5A] cursor-pointer"
              >
                {article.mandal} మండల ప్రత్యేక పేజీ తెరవండి →
              </button>
            </div>
          </article>

          {/* Same-Page Mandal News Section (All Other News in this Mandal / District) */}
          <section
            data-testid="article-window-mandal-news"
            aria-label={`${article.mandal} Mandal News on Same Page`}
            className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <h2 className="text-base md:text-lg font-bold text-stone-900 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#9A3412]" />
                <span>
                  {article.mandal} మండలం &amp; {article.district} జిల్లా ఇతర వార్తలు (Oke Page Lo Mandal News)
                </span>
              </h2>
              <span className="text-xs font-bold text-[#9A3412]">
                {unifiedBundle.mandalArticles.length} మండల వార్తలు
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherMandalArticles.map((otherArt) => {
                const otherText = getArticleText(otherArt, language);
                return (
                  <div
                    key={otherArt.id}
                    className="p-4 rounded-xl bg-[#FBF9F5] border border-stone-200 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span className="font-bold text-[#9A3412]">
                          {otherArt.mandal} మండలం ({otherArt.district})
                        </span>
                        <span className="font-mono tabular-nums">
                          {otherArt.views.toLocaleString('en-IN')} views
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 leading-snug">
                        <a
                          href={buildArticleWindowUrl(otherArt.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (onSelectArticle && !e.ctrlKey && !e.metaKey) {
                              e.preventDefault();
                              onSelectArticle(otherArt);
                            }
                          }}
                          className="hover:text-[#9A3412] transition-colors"
                        >
                          {otherText.title}
                        </a>
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2">{otherText.summary}</p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
                      <SocialShareRow
                        id={otherArt.id}
                        title={otherText.title}
                        mandal={otherArt.mandal}
                        district={otherArt.district}
                        state={otherArt.state}
                        compact
                      />
                      <a
                        href={buildArticleWindowUrl(otherArt.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (onSelectArticle && !e.ctrlKey && !e.metaKey) {
                            e.preventDefault();
                            onSelectArticle(otherArt);
                          }
                        }}
                        className="text-xs font-bold text-[#0B1D3A] hover:underline inline-flex items-center gap-1"
                      >
                        <span>పూర్తి కథనం చదవండి →</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right 4 Columns: Same-Page Mandal Private Ads (Pvt Ads in this Mandal / District) */}
        <aside
          data-testid="article-window-mandal-ads"
          aria-label={`${article.mandal} Mandal Private Ads on Same Page`}
          className="lg:col-span-4 space-y-6"
        >
          <div className="rounded-2xl bg-white border border-stone-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#9A3412]" />
                <span>
                  {article.mandal} మండల &amp; జిల్లా ప్రైవేట్ ప్రకటనలు (Pvt Ads on Same Page)
                </span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-800">
                {unifiedBundle.mandalAds.length} యాడ్స్
              </span>
            </div>

            <div className="space-y-4">
              {unifiedBundle.mandalAds.map((ad) => (
                <div
                  key={ad.id}
                  data-testid={`article-window-ad-${ad.id}`}
                  className="rounded-xl bg-[#FBF9F5] border border-amber-500/40 overflow-hidden shadow-xs"
                >
                  <div className="aspect-16/9 w-full bg-stone-900 border-b border-amber-500/30 overflow-hidden">
                    <img
                      src={getPrivateAdImageUrl(ad)}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-bold uppercase text-[#9A3412]">
                        {ad.targetLevel} PVT AD · {ad.mandal}
                      </span>
                      <span>{ad.district}</span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 leading-snug">{ad.title}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">{ad.bannerText}</p>
                    <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800 truncate">
                        {ad.sponsorName}
                      </span>
                      {ad.ctaUrl && (
                        <a
                          href={ad.ctaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-[#0B1D3A] underline shrink-0"
                        >
                          <span>వివరాలు</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="pt-2 border-t border-stone-200/60">
                      <SocialShareRow
                        id={ad.id}
                        title={`${ad.title} — ${ad.sponsorName}`}
                        summary={ad.bannerText}
                        mandal={ad.mandal}
                        district={ad.district}
                        state={ad.state}
                        compact
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

