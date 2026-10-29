import React, { useState, useMemo } from 'react';
import { Megaphone, MessageSquareHeart, CheckCircle2, Star, ImagePlus, ExternalLink } from 'lucide-react';
import {
  getStates,
  getDistrictsByState,
  getMandalsByDistrict,
  TRANSLATIONS,
  type StateEntry,
} from '../data/indiaLocations';
import {
  generatePrivateAdBannerSvgDataUrl,
  getPrivateAdImageUrl,
  type LanguageCode,
  type NewsCategory,
  type NewsLevel,
  type PrivateAdItem,
  type UserFeedbackItem,
} from '../utils/newsLogic';

interface AdvertisePortalProps {
  language: LanguageCode;
  ads: PrivateAdItem[];
  feedbackList: UserFeedbackItem[];
  locations?: StateEntry[];
  onSubmitPrivateAd: (ad: PrivateAdItem) => Promise<void> | void;
  onSubmitFeedback: (fb: UserFeedbackItem) => Promise<void> | void;
}

export const AdvertisePortal: React.FC<AdvertisePortalProps> = ({
  language,
  ads,
  feedbackList,
  locations,
  onSubmitPrivateAd,
  onSubmitFeedback,
}) => {
  const t = TRANSLATIONS[language];
  const stateLocations = useMemo(() => locations || getStates(), [locations]);

  // Private Ad Form State
  const [adTitle, setAdTitle] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [targetLevel, setTargetLevel] = useState<NewsLevel>('mandal');
  const [adState, setAdState] = useState('Andhra Pradesh');
  const [adDistrict, setAdDistrict] = useState('Guntur');
  const [adMandal, setAdMandal] = useState('Mangalagiri');
  const [adCategory, setAdCategory] = useState<NewsCategory | 'all'>('all');
  const [ctaUrl, setCtaUrl] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [adImageDataUrl, setAdImageDataUrl] = useState('');
  const [adImageName, setAdImageName] = useState('');
  const [adSubmittedMsg, setAdSubmittedMsg] = useState('');
  const [adError, setAdError] = useState('');

  const districts = useMemo(
    () => getDistrictsByState(adState, stateLocations),
    [adState, stateLocations]
  );
  const mandals = useMemo(
    () => getMandalsByDistrict(adState, adDistrict, stateLocations),
    [adState, adDistrict, stateLocations]
  );

  // Reader Feedback Form State
  const [fbName, setFbName] = useState('');
  const [fbMandal, setFbMandal] = useState('Mangalagiri, Guntur');
  const [fbRating, setFbRating] = useState(5);
  const [fbCategory, setFbCategory] = useState('Mandal Coverage');
  const [fbMessage, setFbMessage] = useState('');
  const [fbSuccess, setFbSuccess] = useState('');

  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAdImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const livePreviewImageUrl = useMemo(() => {
    if (adImageDataUrl) return adImageDataUrl;
    return generatePrivateAdBannerSvgDataUrl({
      title: adTitle.trim() || 'మీ వ్యాపార ప్రకటన శీర్షిక ఇక్కడ కనిపిస్తుంది',
      sponsorName: sponsorName.trim() || 'మీ వ్యాపార సంస్థ పేరు',
      bannerText: bannerText.trim() || 'ప్రత్యేక ఆఫర్లు మరియు సేవల వివరాలు ఇక్కడ కనిపిస్తాయి',
      mandal: adMandal,
      district: adDistrict,
      state: adState,
      targetLevel,
      category: adCategory,
    });
  }, [adImageDataUrl, adTitle, sponsorName, bannerText, adMandal, adDistrict, adState, targetLevel, adCategory]);

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdError('');
    setAdSubmittedMsg('');

    if (adTitle.trim().length < 3 || sponsorName.trim().length < 2 || bannerText.trim().length < 5) {
      setAdError('దయచేసి ప్రకటన శీర్షిక, సంస్థ పేరు మరియు ప్రకటన వివరాలు పూర్తిగా నమోదు చేయండి.');
      return;
    }

    const now = new Date().toISOString();
    const finalImageDataUrl =
      adImageDataUrl ||
      generatePrivateAdBannerSvgDataUrl({
        title: adTitle.trim(),
        sponsorName: sponsorName.trim(),
        bannerText: bannerText.trim(),
        mandal: adMandal,
        district: adDistrict,
        state: adState,
        targetLevel,
        category: adCategory,
      });

    const newAd: PrivateAdItem = {
      id: `ad-${Date.now()}`,
      title: adTitle.trim(),
      sponsorName: sponsorName.trim(),
      targetLevel,
      state: adState,
      district: adDistrict,
      mandal: adMandal,
      category: adCategory,
      ctaUrl: ctaUrl.trim() || 'https://netibharatam.in',
      bannerText: bannerText.trim(),
      imageDataUrl: finalImageDataUrl,
      imageName: adImageName || 'auto_ad_banner.svg',
      status: 'pending', // Mandatory Admin Approval!
      ownerUid: 'advertiser-self',
      createdAt: now,
      updatedAt: now,
    };

    await onSubmitPrivateAd(newAd);
    setAdTitle('');
    setSponsorName('');
    setBannerText('');
    setCtaUrl('');
    setAdImageDataUrl('');
    setAdImageName('');
    setAdSubmittedMsg(
      `మీ ప్రైవేట్ ప్రకటన (${targetLevel.toUpperCase()} — ${adMandal}, ${adDistrict}) ఇమేజ్ & వివరాలతో నమోదు చేయబడింది! అడ్మిన్ అప్రూవల్ (Admin Approval) పూర్తయిన వెంటనే సంబంధిత మండల/జిల్లా/రాష్ట్ర పేజీల్లో కనిపిస్తుంది.`
    );
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbSuccess('');
    if (fbName.trim().length < 2 || fbMessage.trim().length < 5) return;

    const newFb: UserFeedbackItem = {
      id: `fb-${Date.now()}`,
      readerName: fbName.trim(),
      mandal: fbMandal.trim() || 'India',
      rating: fbRating,
      message: fbMessage.trim(),
      category: fbCategory,
      ownerUid: 'reader-self',
      createdAt: new Date().toISOString(),
    };

    await onSubmitFeedback(newFb);
    setFbName('');
    setFbMessage('');
    setFbSuccess('మీ విలువైన అభిప్రాయం (Feedback) నమోదు చేయబడింది. ధన్యవాదాలు!');
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Targeted Private Ads Submission */}
        <form
          onSubmit={handleAdSubmit}
          className="lg:col-span-7 rounded-2xl bg-white border border-stone-200 p-6 md:p-8 space-y-5 shadow-xs"
        >
          <div className="border-b border-stone-200 pb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#9A3412] flex items-center gap-1.5">
              <Megaphone className="w-4 h-4" />
              <span>PRIVATE ADVERTISEMENT BOOKING (MANDAL / DISTRICT / STATE / CATEGORY)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-stone-900 mt-1">
              ప్రైవేట్ యాడ్స్ (Pvt Ads) — మండల, జిల్లా, రాష్ట్ర &amp; కేటగిరీ వారీగా ప్రకటనలు
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              గమనిక: ప్రతి ప్రైవేట్ యాడ్‌కు <strong>అడ్మిన్ అప్రూవల్ (Admin Approval) తప్పనిసరి</strong>. అడ్మిన్ ఆమోదించిన తర్వాతే ఎంపిక చేసిన మండలం/జిల్లా/రాష్ట్రంలో కనిపిస్తుంది.
            </p>
          </div>

          {adError && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold">
              {adError}
            </div>
          )}

          {adSubmittedMsg && (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <span>{adSubmittedMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ad-title" className="block text-xs font-bold text-stone-800 mb-1">
                ప్రకటన శీర్షిక (Ad Headline) *
              </label>
              <input
                id="ad-title"
                type="text"
                value={adTitle}
                onChange={(e) => setAdTitle(e.target.value)}
                placeholder="ఉదా: గుంటూరు మెగా టెక్స్‌టైల్ షోరూమ్ ప్రారంభం"
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-stone-900"
              />
            </div>

            <div>
              <label htmlFor="ad-sponsor" className="block text-xs font-bold text-stone-800 mb-1">
                వ్యాపార సంస్థ / ప్రకటనకర్త పేరు (Sponsor Name) *
              </label>
              <input
                id="ad-sponsor"
                type="text"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="ఉదా: శ్రీనివాస ఎంటర్‌ప్రైజెస్"
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2.5 text-sm text-stone-900"
              />
            </div>
          </div>

          {/* Target Scope & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ad-target-level" className="block text-xs font-bold text-stone-800 mb-1">
                ప్రకటన పరిధి (Target Level: Mandal / District / State) *
              </label>
              <select
                id="ad-target-level"
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as NewsLevel)}
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2.5 text-sm font-bold text-[#9A3412]"
              >
                <option value="mandal">మండల వారీగా (Mandal-wise Ad)</option>
                <option value="district">జిల్లా వారీగా (District-wise Ad)</option>
                <option value="state">రాష్ట్ర వారీగా (State-wise Ad)</option>
                <option value="national">జాతీయ స్థాయి (All-India National Ad)</option>
              </select>
            </div>

            <div>
              <label htmlFor="ad-category" className="block text-xs font-bold text-stone-800 mb-1">
                కేటగిరీ వారీగా (Target Category) *
              </label>
              <select
                id="ad-category"
                value={adCategory}
                onChange={(e) => setAdCategory(e.target.value as NewsCategory | 'all')}
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2.5 text-sm text-stone-900"
              >
                {(
                  [
                    'all',
                    'business',
                    'agriculture',
                    'education',
                    'local',
                    'politics',
                    'justice',
                  ] as (NewsCategory | 'all')[]
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {t.categories[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* State / District / Mandal Targeting */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FBF9F5] border border-stone-200">
            <div>
              <label htmlFor="ad-state" className="block text-xs font-semibold text-stone-700 mb-1">
                రాష్ట్రం (State)
              </label>
              <select
                id="ad-state"
                value={adState}
                onChange={(e) => {
                  const s = e.target.value;
                  setAdState(s);
                  const d = getDistrictsByState(s, stateLocations)[0];
                  setAdDistrict(d?.district || '');
                  setAdMandal(d?.mandals[0] || '');
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
              <label htmlFor="ad-district" className="block text-xs font-semibold text-stone-700 mb-1">
                జిల్లా (District)
              </label>
              <select
                id="ad-district"
                value={adDistrict}
                onChange={(e) => {
                  const d = e.target.value;
                  setAdDistrict(d);
                  setAdMandal(getMandalsByDistrict(adState, d)[0] || '');
                }}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900"
              >
                {districts.map((d) => (
                  <option key={d.district} value={d.district}>
                    {d.labelTe ? `${d.labelTe} (${d.district})` : d.district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ad-mandal" className="block text-xs font-semibold text-stone-700 mb-1">
                మండలం (Mandal)
              </label>
              <select
                id="ad-mandal"
                value={adMandal}
                onChange={(e) => setAdMandal(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-[#9A3412]"
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
            <label htmlFor="ad-banner-text" className="block text-xs font-bold text-stone-800 mb-1">
              ప్రకటన సమాచారం (Ad Description / Offer Details) *
            </label>
            <textarea
              id="ad-banner-text"
              rows={3}
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="మీ వ్యాపార ప్రకటన వివరాలు, ఆఫర్లు మరియు సంప్రదించవలసిన వివరాలు..."
              className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] p-3 text-sm text-stone-900"
            />
          </div>

          {/* Ad Banner Image Upload & Live Visual Preview */}
          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-amber-500/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="ad-image-upload"
                className="text-xs font-bold text-stone-900 flex items-center gap-1.5"
              >
                <ImagePlus className="w-4 h-4 text-[#9A3412]" />
                <span>ప్రకటన ఫోటో / బ్యానర్ ఇమేజ్ అప్‌లోడ్ చేయండి (Ad Banner Image)</span>
              </label>
              {adImageDataUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setAdImageDataUrl('');
                    setAdImageName('');
                  }}
                  className="text-[11px] font-bold text-red-700 hover:underline cursor-pointer"
                >
                  కస్టమ్ ఫోటో తొలగించు (Use Auto Poster)
                </button>
              )}
            </div>

            <input
              id="ad-image-upload"
              data-testid="ad-image-upload-input"
              type="file"
              accept="image/*"
              onChange={handleAdImageUpload}
              className="w-full text-xs text-stone-700 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0B1D3A] file:text-amber-300 hover:file:bg-[#142F5A] cursor-pointer"
            />

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-stone-600 flex items-center justify-between">
                <span>ప్రైవేట్ యాడ్ ఇమేజ్ ప్రివ్యూ (Live Ad Image + Matter Preview):</span>
                <span className="font-mono text-[#9A3412]">
                  {adImageName ? `Uploaded: ${adImageName}` : 'Auto HD Promotional Poster'}
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-stone-300 bg-white">
                <img
                  src={livePreviewImageUrl}
                  alt="Private Ad Banner Preview"
                  data-testid="ad-form-live-preview-img"
                  className="w-full h-44 object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="ad-cta-url" className="block text-xs font-semibold text-stone-700 mb-1">
              వెబ్‌సైట్ లింక్ (Website / Catalogue Link - Optional)
            </label>
            <input
              id="ad-cta-url"
              type="url"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3.5 py-2 text-sm text-stone-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#0B1D3A] text-amber-300 text-sm font-bold hover:bg-[#142F5A] transition-colors cursor-pointer"
          >
            ప్రైవేట్ యాడ్ అడ్మిన్ ఆమోదం కోసం పంపండి (Submit Ad for Admin Approval)
          </button>
        </form>

        {/* Right 5 Columns: User Feedback System */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleFeedbackSubmit}
            className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4 shadow-xs"
          >
            <div className="border-b border-stone-200 pb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <MessageSquareHeart className="w-4 h-4" />
                <span>READER FEEDBACK SYSTEM (యూజర్ ఫీడ్‌బ్యాక్ సిస్టమ్)</span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-1">
                పాఠకుల అభిప్రాయం &amp; సూచనలు
              </h2>
            </div>

            {fbSuccess && (
              <div
                role="status"
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold"
              >
                {fbSuccess}
              </div>
            )}

            <div>
              <label htmlFor="fb-name" className="block text-xs font-bold text-stone-800 mb-1">
                మీ పేరు (Your Name) *
              </label>
              <input
                id="fb-name"
                type="text"
                value={fbName}
                onChange={(e) => setFbName(e.target.value)}
                placeholder="మీ పూర్తి పేరు"
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fb-mandal" className="block text-xs font-bold text-stone-800 mb-1">
                  మీ మండలం / జిల్లా
                </label>
                <input
                  id="fb-mandal"
                  type="text"
                  value={fbMandal}
                  onChange={(e) => setFbMandal(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm text-stone-900"
                />
              </div>

              <div>
                <label htmlFor="fb-rating" className="block text-xs font-bold text-stone-800 mb-1">
                  రేటింగ్ (Rating 1-5)
                </label>
                <select
                  id="fb-rating"
                  value={fbRating}
                  onChange={(e) => setFbRating(Number(e.target.value))}
                  className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] px-3 py-2 text-sm font-bold text-amber-700"
                >
                  <option value={5}>★★★★★ (5/5 Excellent)</option>
                  <option value={4}>★★★★☆ (4/5 Good)</option>
                  <option value={3}>★★★☆☆ (3/5 Average)</option>
                  <option value={2}>★★☆☆☆ (2/5 Needs Improvement)</option>
                  <option value={1}>★☆☆☆☆ (1/5 Poor)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="fb-message" className="block text-xs font-bold text-stone-800 mb-1">
                మీ ఫీడ్‌బ్యాక్ / సూచన (Feedback Message) *
              </label>
              <textarea
                id="fb-message"
                rows={3}
                value={fbMessage}
                onChange={(e) => setFbMessage(e.target.value)}
                placeholder="నేటిభారతం వార్తల కవరేజ్, మండల వార్తలు లేదా యాప్ పై మీ అభిప్రాయం..."
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] p-3 text-sm text-stone-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#9A3412] text-white text-xs font-bold hover:bg-[#7C2D12] cursor-pointer"
            >
              ఫీడ్‌బ్యాక్ పంపండి (Submit Feedback)
            </button>
          </form>

          {/* Recent Reader Feedback List */}
          <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-stone-900">
              పాఠకుల తాజా అభిప్రాయాలు ({feedbackList.length})
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="p-3.5 rounded-xl bg-[#FBF9F5] border border-stone-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-stone-900">{fb.readerName}</strong>
                    <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{fb.rating}/5</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">{fb.message}</p>
                  <div className="text-[11px] text-stone-500">{fb.mandal}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Status of Submitted Ads with Full Banner Image + Matter */}
      <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-stone-900">
          ప్రైవేట్ యాడ్స్ జాబితా — ఇమేజ్ &amp; వివరాలు ({ads.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ads.map((ad) => (
            <div
              key={ad.id}
              data-testid={`portal-private-ad-card-${ad.id}`}
              className="rounded-xl bg-[#FBF9F5] border border-stone-200 overflow-hidden flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="aspect-16/9 w-full bg-stone-900 border-b border-stone-200 overflow-hidden">
                  <img
                    src={getPrivateAdImageUrl(ad)}
                    alt={ad.title}
                    data-testid={`portal-private-ad-img-${ad.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#9A3412] uppercase">
                      {ad.targetLevel} · {ad.mandal}
                    </span>
                    <span
                      className={`font-bold ${
                        ad.status === 'approved'
                          ? 'text-emerald-800'
                          : ad.status === 'pending'
                            ? 'text-amber-700'
                            : 'text-red-700'
                      }`}
                    >
                      {ad.status === 'approved'
                        ? 'Approved (Live)'
                        : ad.status === 'pending'
                          ? 'Pending Admin Approval'
                          : 'Rejected'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-stone-900 leading-snug">{ad.title}</div>
                  <p className="text-xs text-stone-600 leading-relaxed">{ad.bannerText}</p>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-stone-200/80 flex items-center justify-between text-xs bg-white">
                <span className="font-semibold text-stone-800 truncate">{ad.sponsorName}</span>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
