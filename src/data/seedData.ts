import {
  generateAadhaarCardSvgDataUrl,
  generatePrivateAdBannerSvgDataUrl,
  type NewsArticleItem,
  type ReporterRecord,
  type PrivateAdItem,
  type UserFeedbackItem,
  type AdSenseConfig,
  type SiteBrandingConfig,
} from '../utils/newsLogic';

function createSeedPortraitDataUrl(initials: string, bgHex: string, accentHex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="280" viewBox="0 0 240 280">
    <rect width="240" height="280" rx="18" fill="${bgHex}"/>
    <circle cx="120" cy="102" r="46" fill="${accentHex}"/>
    <path d="M 46,246 C 46,184 194,184 194,246 Z" fill="${accentHex}"/>
    <rect x="20" y="232" width="200" height="34" rx="8" fill="#0B1D3A" opacity="0.9"/>
    <text x="120" y="254" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="14" fill="#FDE047">PRESS REPORTER · ${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_NEWS_ARTICLES: NewsArticleItem[] = [
  {
    id: 'news-nat-101',
    titleTe: 'ఒక దేశం ఒకే చట్టం: పౌర న్యాయ వ్యవస్థలో పారదర్శకత కోసం డిజిటల్ కోర్టుల విస్తరణ',
    titleHi: 'एक देश एक कानून: नागरिक न्याय प्रणाली में पारदर्शिता के लिए डिजिटल न्यायालयों का विस्तार',
    titleEn: 'One Nation One Law: Expansion of Digital Constitutional Courts for Transparent Justice Across India',
    summaryTe:
      'దేశవ్యాప్తంగా ప్రతి మండల స్థాయి పౌరుడికి సత్వర న్యాయం అందించేలా ఈ-కోర్టులు మరియు ఏకీకృత చట్టపరమైన సమాచార వేదికను కేంద్ర న్యాయ శాఖ ప్రారంభించింది.',
    summaryHi:
      'देश भर में प्रत्येक मंडल स्तर के नागरिक को त्वरित न्याय प्रदान करने के लिए केंद्रीय विधि मंत्रालय ने ई-कोर्ट और एकीकृत कानूनी सूचना मंच का शुभारंभ किया।',
    summaryEn:
      'The Union Law Ministry has launched unified digital court access and vernacular legal portals so citizens in every Mandal receive timely constitutional remedies.',
    contentTe:
      'న్యూఢిల్లీ: "ఒక దేశం - ఒకే చట్టం" స్ఫూర్తితో భారతదేశంలోని ప్రతి సామాన్యుడికి రాజ్యాంగబద్ధమైన హక్కులు, న్యాయ సేవలు మాతృభాషలోనే అందేలా కేంద్ర ప్రభుత్వం కీలక ముందడుగు వేసింది. సుప్రీంకోర్టు మరియు హైకోర్టుల తీర్పులను తెలుగు, హిందీ, ఇంగ్లీష్ సహా ప్రాంతీయ భాషల్లో తక్షణమే అందుబాటులోకి తెచ్చారు.\n\nఈ నూతన విధానం ద్వారా గ్రామీణ మండలాల్లోని పౌరులు సైతం తమ భూమి రికార్డులు, పౌర వివాదాలు మరియు ప్రభుత్వ పథకాల అర్హతలపై నేరుగా న్యాయ సహాయం పొందే అవకాశం కలుగుతుంది. "నేటిభారతం" చానెల్ నిర్వహించిన ప్రత్యేక చర్చలో న్యాయ నిపుణులు ఈ సంస్కరణను చారిత్రాత్మకమైనదిగా అభివర్ణించారు.',
    contentHi:
      'नई दिल्ली: "एक देश - एक कानून" की भावना के साथ भारत के प्रत्येक आम नागरिक को मातृभाषा में संवैधानिक अधिकार और न्यायिक सेवाएं उपलब्ध कराने के लिए केंद्र सरकार ने बड़ा कदम उठाया है। सुप्रीम कोर्ट और हाईकोर्ट के निर्णयों को तेलुगु, हिंदी और अंग्रेजी सहित क्षेत्रीय भाषाओं में तुरंत उपलब्ध कराया गया है।\n\nइस नई प्रणाली के माध्यम से ग्रामीण मंडलों के नागरिक भी भूमि रिकॉर्ड, नागरिक विवादों और सरकारी योजनाओं पर सीधे कानूनी सहायता प्राप्त कर सकेंगे।',
    contentEn:
      'New Delhi: Advancing the vision of "One Nation, One Law", the Government has rolled out vernacular digital court judgments in Telugu, Hindi, and English across all states and union territories.\n\nCitizens at the grassroots Mandal level can now track civic petitions, land record verifications, and public welfare entitlements transparently without middlemen. Legal scholars speaking to Neti Bharatam highlighted how constitutional literacy empowers every village.',
    level: 'national',
    state: 'Delhi (NCT)',
    district: 'New Delhi',
    mandal: 'Chanakyapuri',
    category: 'justice',
    youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    imageType: 'national_justice',
    reporterId: 'rep-admin-1',
    reporterName: 'నేటిభారతం నేషనల్ డెస్క్ (Neti Bharatam Desk)',
    views: 4820,
    status: 'approved',
    authorUid: 'system-admin',
    createdAt: '2026-10-19T03:30:00.000Z',
    updatedAt: '2026-10-19T03:30:00.000Z',
    isBreaking: true,
  },
  {
    id: 'news-state-102',
    titleTe: 'ఆంధ్రప్రదేశ్ సాగునీటి ప్రాజెక్టుల ఆధునీకరణ: కృష్ణా, గోదావరి డెల్టా రైతులకు రబీ భరోసా',
    titleHi: 'आंध्र प्रदेश सिंचाई परियोजनाओं का आधुनिकीकरण: कृष्णा और गोदावरी डेल्टा किसानों को रबी भरोसा',
    titleEn: 'Andhra Pradesh Irrigation Modernization: Assured Rabi Water Release for Krishna & Godavari Delta Farmers',
    summaryTe:
      'పోలవరం కుడి, ఎడమ కాలువల అనుసంధానం మరియు గుంటూరు ఛానల్ విస్తరణ పనులపై జలవనరుల శాఖ ప్రత్యేక సమీక్ష నిర్వహించింది.',
    summaryHi:
      'पोलावरम दाएं और बाएं नहर संपर्क तथा गुंटूर चैनल विस्तार कार्यों पर जल संसाधन विभाग ने विशेष समीक्षा बैठक की।',
    summaryEn:
      'The Water Resources Department completed real-time telemetry gates across Krishna and Godavari delta canals to guarantee tail-end irrigation water.',
    contentTe:
      'అమరావతి / గుంటూరు: ఆంధ్రప్రదేశ్ రాష్ట్రంలోని రైతాంగానికి సకాలంలో సాగునీరు అందించేందుకు జలవనరుల శాఖ ఆటోమేటెడ్ టెలిమెట్రీ గేట్లను ఏర్పాటు చేసింది. కృష్ణా, గుంటూరు, ఉభయ గోదావరి జిల్లాల్లోని ప్రతి మండలంలో చివరి ఆయకట్టు వరకు నీరు చేరేలా ఇంజనీరింగ్ అధికారులు పర్యవేక్షిస్తున్నారు.\n\nరైతులు తమ మండల స్థాయి నీటి విడుదల వివరాలను మొబైల్ ద్వారానే తెలుసుకునే సదుపాయం కల్పించారు. ధాన్యం కొనుగోలు కేంద్రాల్లో మద్దతు ధర తక్షణమే రైతుల ఖాతాల్లో జమ అయ్యేలా చర్యలు తీసుకున్నారు.',
    contentHi:
      'अमरावती / गुंटूर: आंध्र प्रदेश के किसानों को समय पर सिंचाई जल उपलब्ध कराने के लिए जल संसाधन विभाग ने स्वचालित टेलीमेट्री गेट स्थापित किए हैं। कृष्णा, गुंटूर और गोदावरी जिलों के प्रत्येक मंडल में अंतिम छोर तक पानी पहुंचाने की निगरानी की जा रही है।',
    contentEn:
      'Amaravati / Guntur: To ensure zero water loss across agricultural canals in Andhra Pradesh, the Irrigation Department has activated digital flow monitoring across all delta Mandals. Paddy procurement centers have also been instructed to credit Minimum Support Price payments within 48 hours.',
    level: 'state',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    mandal: 'Mangalagiri',
    category: 'agriculture',
    youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    imageType: 'state_irrigation',
    reporterId: 'rep-ap-1',
    reporterName: 'కె. వెంకటేశ్వరరావు (AP State Bureau)',
    views: 3190,
    status: 'approved',
    authorUid: 'system-admin',
    createdAt: '2026-10-19T02:45:00.000Z',
    updatedAt: '2026-10-19T02:45:00.000Z',
    isBreaking: true,
  },
  {
    id: 'news-state-103',
    titleTe: 'తెలంగాణలో రీజినల్ రింగ్ రోడ్ మరియు మండల స్థాయి డిజిటల్ హెల్త్ ప్రొఫైల్ కార్యక్రమం వేగవంతం',
    titleHi: 'तेलंगाना में रीजनल रिंग रोड और मंडल स्तरीय डिजिटल हेल्थ प्रोफाइल कार्यक्रम में तेजी',
    titleEn: 'Telangana Accelerates Regional Ring Road & Mandal-Level Digital Citizen Health Registry',
    summaryTe:
      'హైదరాబాద్, రంగారెడ్డి, సంగారెడ్డి, యాదాద్రి జిల్లాలను కలుపుతూ సాగే రీజినల్ రింగ్ రోడ్ మరియు ప్రాథమిక ఆరోగ్య కేంద్రాల ఆధునీకరణపై ప్రత్యేక నివేదిక.',
    summaryHi:
      'हैदराबाद, रंगारेड्डी, संगारेड्डी और यादाद्री जिलों को जोड़ने वाली रीजनल रिंग रोड और प्राथमिक स्वास्थ्य केंद्रों के आधुनिकीकरण पर विशेष रिपोर्ट।',
    summaryEn:
      'Telangana infrastructure and health ministries announced 24x7 diagnostic labs across Mandal headquarters alongside Regional Ring Road connectivity.',
    contentTe:
      'హైదరాబాద్: తెలంగాణ రాష్ట్రంలోని అన్ని జిల్లాలు మరియు మండల కేంద్రాల్లో పౌరులకు ఉచిత డయాగ్నస్టిక్ పరీక్షలు అందించేలా "మండల ఆరోగ్య సురక్ష" కేంద్రాలు విస్తరిస్తున్నాయి. మరోవైపు రీజినల్ రింగ్ రోడ్ (RRR) నిర్మాణంతో గ్రామీణ మండలాల నుంచి రాజధానికి రవాణా సదుపాయాలు మెరుగుపడనున్నాయి.',
    contentHi:
      'हैदराबाद: तेलंगाना राज्य के सभी जिलों और मंडल मुख्यालयों में नागरिकों को निःशुल्क जांच सेवाएं प्रदान करने के लिए मंडल स्वास्थ्य सुरक्षा केंद्रों का विस्तार किया जा रहा है।',
    contentEn:
      'Hyderabad: Every Mandal Primary Health Center in Telangana is being upgraded with automated pathology diagnostics and telemedicine links to Osmania and Gandhi hospitals, while Regional Ring Road land acquisition progresses transparently.',
    level: 'state',
    state: 'Telangana',
    district: 'Hyderabad',
    mandal: 'Secunderabad',
    category: 'politics',
    youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    imageType: 'district_infra',
    reporterId: 'rep-tg-1',
    reporterName: 'ఎం. శ్రీనివాస్ రెడ్డి (Telangana Bureau)',
    views: 2645,
    status: 'approved',
    authorUid: 'system-admin',
    createdAt: '2026-10-19T01:50:00.000Z',
    updatedAt: '2026-10-19T01:50:00.000Z',
    isBreaking: true,
  },
  {
    id: 'news-dist-104',
    titleTe: 'ఎన్టీఆర్ విజయవాడ - గుంటూరు జిల్లాల్లో స్మార్ట్ ఇండస్ట్రియల్ కారిడార్: 15,000 మంది యువతకు ఉపాధి',
    titleHi: 'एनटीआर विजयवाड़ा - गुंटूर जिलों में स्मार्ट इंडस्ट्रियल कॉरिडोर: 15,000 युवाओं को रोजगार',
    titleEn: 'NTR Vijayawada & Guntur Smart Industrial Corridor to Generate 15,000 Youth Jobs',
    summaryTe:
      'మంగళగిరి, ఇబ్రహీంపట్నం, గన్నవరం మండలాల పరిధిలో ఐటీ మరియు ఫుడ్ ప్రాసెసింగ్ యూనిట్ల ఏర్పాటుకు నూతన పెట్టుబడులు.',
    summaryHi:
      'मंगलगिरि, इब्राहिमपटनम और गन्नवरम मंडलों में आईटी और फूड प्रोसेसिंग यूनिट स्थापित करने के लिए नए निवेश।',
    summaryEn:
      'New MSME parks across Mangalagiri, Ibrahimpatnam, and Gannavaram Mandals will offer skill training and direct employment to local graduates.',
    contentTe:
      'విజయవాడ / గుంటూరు: కృష్ణా మరియు గుంటూరు జిల్లాల పరిధిలోని యువతకు స్థానికంగానే ఉపాధి కల్పించే లక్ష్యంతో ఇండస్ట్రియల్ కారిడార్ పనులు వేగవంతమయ్యాయి. ప్రతి మండలంలో స్కిల్ డెవలప్‌మెంట్ సెంటర్ ద్వారా డిగ్రీ, పాలిటెక్నిక్ విద్యార్థులకు ఉచిత శిక్షణ అందిస్తున్నారు.',
    contentHi:
      'विजयवाड़ा / गुंटूर: कृष्णा और गुंटूर जिलों के युवाओं को स्थानीय स्तर पर रोजगार उपलब्ध कराने के उद्देश्य से इंडस्ट्रियल कॉरिडोर का कार्य तेज हो गया है।',
    contentEn:
      'Vijayawada / Guntur: District skill hubs in NTR Vijayawada and Guntur have partnered with technology and agro-processing enterprises to onboard 15,000 youth directly from Mandal campuses.',
    level: 'district',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    mandal: 'Vijayawada Central',
    category: 'education',
    youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    imageType: 'district_infra',
    reporterId: 'rep-ap-1',
    reporterName: 'పి. రమేష్ బాబు (Vijayawada Desk)',
    views: 1890,
    status: 'approved',
    authorUid: 'system-admin',
    createdAt: '2026-10-19T00:40:00.000Z',
    updatedAt: '2026-10-19T00:40:00.000Z',
  },
  {
    id: 'news-mandal-105',
    titleTe: 'మంగళగిరి మండల ప్రజా వేదిక: త్రాగునీరు, చేనేత పార్క్ మరియు డిజిటల్ లైబ్రరీ పనులకు ఆమోదం',
    titleHi: 'मंगलगिरि मंडल जन मंच: पेयजल, हथकरघा पार्क और डिजिटल लाइब्रेरी कार्यों को मंजूरी',
    titleEn: 'Mangalagiri Mandal Grama Sabha Approves 24x7 Drinking Water Grid, Handloom Park & Digital Library',
    summaryTe:
      'మంగళగిరి మండల పరిషత్ కార్యాలయంలో జరిగిన ప్రత్యేక సమావేశంలో చేనేత కార్మికులకు సబ్సిడీ రుణాలు మరియు ప్రతి వార్డులో ఎల్ఈడీ వీధి దీపాల ఏర్పాటుపై తీర్మానం.',
    summaryHi:
      'मंगलगिरि मंडल परिषद कार्यालय में आयोजित विशेष बैठक में हथकरघा बुनकरों को सब्सिडी ऋण और हर वार्ड में एलईडी स्ट्रीट लाइट लगाने का प्रस्ताव पारित।',
    summaryEn:
      'The Mangalagiri Mandal Parishad passed resolutions funding solar street lighting, handloom weaver yarn subsidies, and a free competitive exam digital library.',
    contentTe:
      'మంగళగిరి (గుంటూరు జిల్లా): మంగళగిరి మండలంలోని అన్ని గ్రామాలు మరియు వార్డుల్లో 100 శాతం రక్షిత త్రాగునీటి కుళాయిలు, చేనేత కార్మికులకు నూలు సబ్సిడీ, మరియు పోటీ పరీక్షలకు సిద్ధమయ్యే యువత కోసం ఆధునిక డిజిటల్ లైబ్రరీని ఏర్పాటు చేయాలని మండల సర్వసభ్య సమావేశం ఏకగ్రీవంగా తీర్మానించింది.\n\n"నేటిభారతం" మండల రిపోర్టర్ క్షేత్రస్థాయిలో సేకరించిన ప్రజా సమస్యలను అధికారులు తక్షణమే పరిష్కరిస్తామని హామీ ఇచ్చారు.',
    contentHi:
      'मंगलगिरि (गुंटूर जिला): मंगलगिरि मंडल के सभी गांवों और वार्डों में 100 प्रतिशत सुरक्षित पेयजल नल, हथकरघा बुनकरों के लिए धागा सब्सिडी और युवाओं के लिए डिजिटल लाइब्रेरी स्थापित करने का सर्वसम्मति से निर्णय लिया गया।',
    contentEn:
      'Mangalagiri (Guntur District): Following ground reports by Neti Bharatam Mandal correspondents, civic authorities sanctioned immediate funds for overhead water tanks, weaver yarn credit cards, and a high-speed digital reading room at the Mandal headquarters.',
    level: 'mandal',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    mandal: 'Mangalagiri',
    category: 'local',
    youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    imageType: 'mandal_sabha',
    reporterId: 'rep-mangalagiri-1',
    reporterName: 'చక్రి రాజు (Mangalagiri Mandal Reporter)',
    views: 1425,
    status: 'approved',
    authorUid: 'system-admin',
    createdAt: '2026-10-18T22:15:00.000Z',
    updatedAt: '2026-10-18T22:15:00.000Z',
    isBreaking: true,
  },
  {
    id: 'news-mandal-106',
    titleTe: 'తిరుపతి అర్బన్ మండలంలో భక్తుల సౌకర్యార్థం నూతన ఎలక్ట్రిక్ బస్సు కారిడార్ మరియు ట్రాఫిక్ నియంత్రణ',
    titleHi: 'तिरुपति अर्बन मंडल में श्रद्धालुओं की सुविधा के लिए नया इलेक्ट्रिक बस कॉरिडोर और ट्रैफिक नियंत्रण',
    titleEn: 'Tirupati Urban Mandal Launches Zero-Emission Electric Bus Corridor & Smart Pilgrim Traffic Grid',
    summaryTe:
      'తిరుపతి రైల్వే స్టేషన్ నుంచి అలిపిరి, శ్రీనివాసం వరకు ప్రతి 3 నిమిషాలకు ఉచిత ఎలక్ట్రిక్ షటిల్ సేవలు.',
    summaryHi:
      'तिरुपति रेलवे स्टेशन से अलिपिरि और श्रीनिवासम तक हर 3 मिनट में इलेक्ट्रिक शटल सेवाएं शुरू।',
    summaryEn:
      'Tirupati Urban Mandal officials inaugurated green electric shuttles and AI-assisted pedestrian crossings from the railway station to Alipiri.',
    contentTe:
      'తిరుపతి అర్బన్: తిరుపతి అర్బన్ మండల పరిధిలో స్థానికులు మరియు యాత్రికులకు ట్రాఫిక్ ఇబ్బందులు లేకుండా స్మార్ట్ సిగ్నలింగ్ వ్యవస్థను ప్రారంభించారు. ప్రధాన కూడళ్లలో భద్రతా కెమెరాలు, 24 గంటల పౌర సహాయ కేంద్రాలు అందుబాటులోకి వచ్చాయి.',
    contentHi:
      'तिरुपति अर्बन: स्थानीय नागरिकों और तीर्थयात्रियों को ट्रैफिक समस्या से बचाने के लिए स्मार्ट सिग्नलिंग प्रणाली शुरू की गई है।',
    contentEn:
      'Tirupati Urban: Civic authorities in Tirupati Urban Mandal have deployed 50 noiseless electric buses and round-the-clock citizen helpdesks at every major junction.',
    level: 'mandal',
    state: 'Andhra Pradesh',
    district: 'Tirupati',
    mandal: 'Tirupati Urban',
    category: 'local',
    youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    imageType: 'district_infra',
    reporterId: 'rep-tirupati-1',
    reporterName: 'డి. సుబ్రహ్మణ్యం (Tirupati Mandal Reporter)',
    views: 980,
    status: 'approved',
    authorUid: 'system-admin',
    createdAt: '2026-10-18T19:20:00.000Z',
    updatedAt: '2026-10-18T19:20:00.000Z',
  },
  {
    id: 'news-mandal-107',
    titleTe: 'కూకట్‌పల్లి మండలంలో చెరువుల సుందరీకరణ మరియు భూగర్భ డ్రైనేజీ ఆధునీకరణ పనులు ప్రారంభం',
    titleHi: 'कूकटपल्ली मंडल में झीलों का सौंदर्यीकरण और भूमिगत ड्रेनेज आधुनिकीकरण कार्य शुरू',
    titleEn: 'Kukatpally Mandal Begins Lake Rejuvenation Walkways & Underground Storm Water Upgrade',
    summaryTe:
      'వర్షాకాలంలో కాలనీల్లో నీరు నిలవకుండా కూకట్‌పల్లి మండల వ్యాప్తంగా ప్రత్యేక ఇంజనీరింగ్ బృందాల తనిఖీలు.',
    summaryHi:
      'मानसून के दौरान कॉलोनियों में जलभराव रोकने के लिए कूकटपल्ली मंडल में विशेष इंजीनियरिंग टीमों का अभियान।',
    summaryEn:
      'Kukatpally Mandal civic teams launched desilting and walking-track lighting projects across three urban lakes.',
    contentTe:
      'కూకట్‌పల్లి (మేడ్చల్-మల్కాజిగిరి): కూకట్‌పల్లి మండల పరిధిలోని ప్రధాన కాలనీల్లో భూగర్భ డ్రైనేజీ పైప్‌లైన్ల విస్తరణ మరియు చెరువుల చుట్టూ వాకింగ్ ట్రాక్‌లు, సోలార్ లైట్ల ఏర్పాటు పనులు వేగంగా జరుగుతున్నాయి.',
    contentHi:
      'कूकटपल्ली (मेडचल-मल्काजगिरि): कूकटपल्ली मंडल की प्रमुख कॉलोनियों में भूमिगत ड्रेनेज पाइपलाइन और झीलों के चारों ओर वॉकिंग ट्रैक का निर्माण शुरू हो गया है।',
    contentEn:
      'Kukatpally (Medchal-Malkajgiri): Residents welcomed the new storm-water box drain network and lakefront parks initiated across Kukatpally Mandal.',
    level: 'mandal',
    state: 'Telangana',
    district: 'Medchal-Malkajgiri',
    mandal: 'Kukatpally',
    category: 'local',
    youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    imageType: 'mandal_sabha',
    reporterId: 'rep-kukatpally-1',
    reporterName: 'కె. ప్రశాంత్ కుమార్ (Kukatpally Mandal Reporter)',
    views: 1120,
    status: 'approved',
    authorUid: 'system-admin',
    createdAt: '2026-10-18T17:10:00.000Z',
    updatedAt: '2026-10-18T17:10:00.000Z',
  },
];

export const INITIAL_REPORTERS: ReporterRecord[] = [
  {
    id: 'rep-mangalagiri-1',
    name: 'చక్రి రాజు (Chakri Raju)',
    username: 'chakri_mangalagiri',
    passwordHash: 'NetiBharatam@123',
    mobile: '9848012345',
    aadhaarNumber: '458912349012',
    aadhaarDocName: 'chakri_aadhaar_verified.svg',
    aadhaarDocDataUrl: generateAadhaarCardSvgDataUrl({
      name: 'చక్రి రాజు (Chakri Raju)',
      aadhaarNumber: '458912349012',
      mobile: '9848012345',
      mandal: 'Mangalagiri',
      district: 'Guntur',
      state: 'Andhra Pradesh',
    }),
    state: 'Andhra Pradesh',
    district: 'Guntur',
    mandal: 'Mangalagiri',
    photoDataUrl: createSeedPortraitDataUrl('CR', '#0B1D3A', '#F59E0B'),
    status: 'approved',
    ownerUid: 'system-admin',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T12:00:00.000Z',
  },
  {
    id: 'rep-kukatpally-1',
    name: 'కె. ప్రశాంత్ కుమార్ (Prashanth Kumar)',
    username: 'prashanth_kp',
    passwordHash: 'NetiBharatam@123',
    mobile: '9949054321',
    aadhaarNumber: '671289340192',
    aadhaarDocName: 'prashanth_aadhaar.svg',
    aadhaarDocDataUrl: generateAadhaarCardSvgDataUrl({
      name: 'కె. ప్రశాంత్ కుమార్ (Prashanth Kumar)',
      aadhaarNumber: '671289340192',
      mobile: '9949054321',
      mandal: 'Kukatpally',
      district: 'Medchal-Malkajgiri',
      state: 'Telangana',
    }),
    state: 'Telangana',
    district: 'Medchal-Malkajgiri',
    mandal: 'Kukatpally',
    photoDataUrl: createSeedPortraitDataUrl('PK', '#1E3A8A', '#FBBF24'),
    status: 'approved',
    ownerUid: 'system-admin',
    createdAt: '2026-10-16T08:30:00.000Z',
    updatedAt: '2026-10-16T09:15:00.000Z',
  },
  {
    id: 'rep-tenali-pending',
    name: 'ఎస్. నరేష్ బాబు (Naresh Babu)',
    username: 'naresh_tenali',
    passwordHash: 'Naresh@123',
    mobile: '9701234567',
    aadhaarNumber: '883412095678',
    aadhaarDocName: 'naresh_aadhaar_card.svg',
    aadhaarDocDataUrl: generateAadhaarCardSvgDataUrl({
      name: 'ఎస్. నరేష్ బాబు (Naresh Babu)',
      aadhaarNumber: '883412095678',
      mobile: '9701234567',
      mandal: 'Tenali',
      district: 'Guntur',
      state: 'Andhra Pradesh',
    }),
    state: 'Andhra Pradesh',
    district: 'Guntur',
    mandal: 'Tenali',
    photoDataUrl: createSeedPortraitDataUrl('NB', '#065F46', '#FDE047'),
    status: 'pending',
    ownerUid: 'demo-applicant',
    createdAt: '2026-10-19T01:10:00.000Z',
    updatedAt: '2026-10-19T01:10:00.000Z',
  },
];

export const INITIAL_PRIVATE_ADS: PrivateAdItem[] = [
  {
    id: 'ad-mandal-1',
    title: 'మంగళగిరి పట్టు & కాటన్ హ్యాండ్లూమ్ మెగా ఎక్స్‌పో — 25% ప్రత్యేక తగ్గింపు',
    sponsorName: 'శ్రీ లక్ష్మీ నరసింహ చేనేత సొసైటీ, మంగళగిరి',
    targetLevel: 'mandal',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    mandal: 'Mangalagiri',
    category: 'all',
    ctaUrl: 'https://handlooms.ap.gov.in',
    bannerText:
      'మంగళగిరి మండల ప్రజలకు మరియు వివాహ వేడుకలకు స్వచ్ఛమైన చేనేత పట్టు చీరలు నేరుగా ఉత్పత్తిదారుల ధరలకే లభించును.',
    imageName: 'mangalagiri_handloom_expo_banner.svg',
    imageDataUrl: generatePrivateAdBannerSvgDataUrl({
      title: 'మంగళగిరి పట్టు & కాటన్ హ్యాండ్లూమ్ మెగా ఎక్స్‌పో — 25% తగ్గింపు',
      sponsorName: 'శ్రీ లక్ష్మీ నరసింహ చేనేత సొసైటీ, మంగళగిరి',
      bannerText: 'స్వచ్ఛమైన చేనేత పట్టు చీరలు నేరుగా ఉత్పత్తిదారుల ధరలకే లభించును',
      mandal: 'Mangalagiri',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      targetLevel: 'mandal',
      theme: 'gold',
    }),
    status: 'approved',
    ownerUid: 'system-admin',
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T11:00:00.000Z',
  },
  {
    id: 'ad-state-2',
    title: 'కిసాన్ అగ్రి డ్రోన్ & సోలార్ పంప్ సెట్స్ — రైతులకు 40% సబ్సిడీ సౌకర్యం',
    sponsorName: 'భారత్ అగ్రి టెక్ సొల్యూషన్స్ (AP & Telangana)',
    targetLevel: 'state',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    mandal: 'Mangalagiri',
    category: 'agriculture',
    ctaUrl: 'https://agricoop.nic.in',
    bannerText:
      'అన్ని జిల్లాలు మరియు మండలాల్లోని రైతులకు ఆధునిక డ్రోన్ స్ప్రేయింగ్ మరియు సోలార్ మోటార్లు సబ్సిడీపై అందించబడును.',
    imageName: 'kisan_agri_drone_solar_banner.svg',
    imageDataUrl: generatePrivateAdBannerSvgDataUrl({
      title: 'కిసాన్ అగ్రి డ్రోన్ & సోలార్ పంప్ సెట్స్ — 40% సబ్సిడీ',
      sponsorName: 'భారత్ అగ్రి టెక్ సొల్యూషన్స్ (AP & Telangana)',
      bannerText: 'ఆధునిక డ్రోన్ స్ప్రేయింగ్ మరియు సోలార్ మోటార్లు సబ్సిడీపై అందించబడును',
      mandal: 'Mangalagiri',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      targetLevel: 'state',
      theme: 'agri',
    }),
    status: 'approved',
    ownerUid: 'system-admin',
    createdAt: '2026-10-18T12:00:00.000Z',
    updatedAt: '2026-10-18T12:30:00.000Z',
  },
  {
    id: 'ad-national-3',
    title: 'నేటిభారతం లీగల్ అవేర్‌నెస్ & సివిల్ సర్వీసెస్ అకాడమీ — ఉచిత రాజ్యాంగ గైడ్',
    sponsorName: 'నేటిభారతం ఎడ్యుకేషన్ ఫౌండేషన్ (All India)',
    targetLevel: 'national',
    state: 'Delhi (NCT)',
    district: 'New Delhi',
    mandal: 'Chanakyapuri',
    category: 'all',
    ctaUrl: 'https://india.gov.in',
    bannerText:
      '"ఒక దేశం ఒకే చట్టం" అవగాహన పుస్తకం మరియు గ్రూప్-1, గ్రూప్-2, సివిల్స్ ఆన్‌లైన్ తరగతులు తెలుగు, హిందీ, ఇంగ్లీష్ భాషల్లో.',
    imageName: 'netibharatam_legal_academy_banner.svg',
    imageDataUrl: generatePrivateAdBannerSvgDataUrl({
      title: 'నేటిభారతం లీగల్ అవేర్‌నెస్ & సివిల్ సర్వీసెస్ అకాడమీ',
      sponsorName: 'నేటిభారతం ఎడ్యుకేషన్ ఫౌండేషన్ (All India)',
      bannerText: 'ఒక దేశం ఒకే చట్టం అవగాహన పుస్తకం & సివిల్స్ ఆన్‌లైన్ తరగతులు',
      mandal: 'Chanakyapuri',
      district: 'New Delhi',
      state: 'Delhi (NCT)',
      targetLevel: 'national',
      theme: 'royal',
    }),
    status: 'approved',
    ownerUid: 'system-admin',
    createdAt: '2026-10-18T14:00:00.000Z',
    updatedAt: '2026-10-18T14:30:00.000Z',
  },
  {
    id: 'ad-pending-4',
    title: 'విజయవాడ మెడికల్ డయాగ్నస్టిక్స్ — పూర్తి హెల్త్ చెకప్ రూ. 999 మాత్రమే',
    sponsorName: 'ఆరోగ్య శ్రీ డయాగ్నస్టిక్ సెంటర్, విజయవాడ',
    targetLevel: 'district',
    state: 'Andhra Pradesh',
    district: 'NTR District',
    mandal: 'Vijayawada Central',
    category: 'local',
    ctaUrl: 'https://example.com/health',
    bannerText: 'ఎన్టీఆర్ విజయవాడ జిల్లాలోని అన్ని మండలాల ప్రజలకు ఉచిత హోమ్ శాంపిల్ కలెక్షన్.',
    imageName: 'vijayawada_medical_diagnostics_banner.svg',
    imageDataUrl: generatePrivateAdBannerSvgDataUrl({
      title: 'విజయవాడ మెడికల్ డయాగ్నస్టిక్స్ — పూర్తి హెల్త్ చెకప్ రూ. 999',
      sponsorName: 'ఆరోగ్య శ్రీ డయాగ్నస్టిక్ సెంటర్, విజయవాడ',
      bannerText: 'అన్ని మండలాల ప్రజలకు ఉచిత హోమ్ శాంపిల్ కలెక్షన్',
      mandal: 'Vijayawada Urban',
      district: 'NTR Vijayawada',
      state: 'Andhra Pradesh',
      targetLevel: 'district',
      theme: 'medical',
    }),
    status: 'pending',
    ownerUid: 'demo-advertiser',
    createdAt: '2026-10-19T02:00:00.000Z',
    updatedAt: '2026-10-19T02:00:00.000Z',
  },
];

export const INITIAL_FEEDBACK: UserFeedbackItem[] = [
  {
    id: 'fb-1',
    readerName: 'వి. రామకృష్ణ (V. Ramakrishna)',
    mandal: 'Mangalagiri, Guntur',
    rating: 5,
    message:
      'మా మంగళగిరి మండల వార్తలు మరియు యూట్యూబ్ వీడియో అప్‌డేట్స్ తెలుగులో చాలా స్పష్టంగా వస్తున్నాయి. నేటిభారతం బృందానికి అభినందనలు!',
    category: 'Mandal Coverage',
    ownerUid: 'system-admin',
    createdAt: '2026-10-18T20:00:00.000Z',
  },
  {
    id: 'fb-2',
    readerName: 'అనిత శర్మ (Anita Sharma)',
    mandal: 'Secunderabad, Hyderabad',
    rating: 5,
    message:
      'एक देश एक कानून और मंडल स्तर की खबरें हिंदी, तेलुगु और अंग्रेजी तीनों भाषाओं में पढ़ना बहुत उपयोगी है।',
    category: 'Multilingual Experience',
    ownerUid: 'system-admin',
    createdAt: '2026-10-19T01:20:00.000Z',
  },
];

export const INITIAL_ADSENSE_CONFIG: AdSenseConfig = {
  adsenseClientId: 'ca-pub-9823419201823491',
  adsenseSlotId: '4910293841',
  adsenseScriptUrl:
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9823419201823491',
  adsenseEnabled: true,
  updatedByUid: 'Admin',
  updatedAt: '2026-10-19T00:00:00.000Z',
};

export const INITIAL_BRANDING_CONFIG: SiteBrandingConfig = {
  logoDataUrl: '',
  bannerDataUrl: '',
  topLeftBadgeText: 'ఏది నిజం',
  sloganLine1Te: 'జ్ఞానాన్ని పెంచే విద్య ఉపాది చూపే విద్య',
  sloganLine2Te: 'ఫ్రీ విద్య ఫ్రీ వైద్యం దేశ అభివృద్ధికి నాంది.',
  bottomMottoTe: 'నిజాన్ని నిర్భయంగా చెప్పడమే మా లక్ష్యం',
  updatedByUid: 'Admin',
  updatedAt: '2026-10-29T00:00:00.000Z',
};

