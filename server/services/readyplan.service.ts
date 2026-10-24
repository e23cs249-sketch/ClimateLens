import { ReadyPlanItem } from '../types/index.ts';

export const READY_PLAN_DATA: ReadyPlanItem[] = [
  {
    id: 'plan-extreme-heat',
    category: 'extreme_heat',
    categoryLabel: {
      en: 'Extreme Heat Preparedness',
      ta: 'கடுமையான வெப்ப அலை தயார்நிலை',
    },
    title: {
      en: 'Thermal Stress & Heat Health Mitigation',
      ta: 'வெப்ப அழுத்த தணிப்பு மற்றும் ஆரோக்கிய பாதுகாப்பு',
    },
    description: {
      en: 'Guidelines to protect vulnerable family members, pets, and livestock during sustained high-ambient and high-humidity periods.',
      ta: 'அதிக வெப்பம் மற்றும் ஈரப்பதமான காலங்களில் குழந்தைகள், முதியவர்கள் மற்றும் வளர்ப்பு பிராணிகளைப் பாதுகாப்பதற்கான வழிகாட்டுதல்கள்.',
    },
    practicalSteps: {
      en: [
        'Pre-chill insulated water bottles; consume oral rehydration fluids (electrolytes, ORS, tender coconut water) every 45–60 minutes.',
        'Block direct solar radiant heat on windows with reflective shades or heavy curtains between 10:00 AM and 4:30 PM.',
        'Schedule outdoor physical labor, athletic activity, or errands strictly before 08:30 AM or after 06:00 PM.',
        'Recognize heat exhaustion signs (profuse sweating, dizziness, rapid pulse) vs heat stroke (confusion, cessation of sweating, loss of consciousness).',
        'Ensure continuous fresh air cross-ventilation during night hours when ambient temperature drops.',
      ],
      ta: [
        'குடிநீர் மற்றும் எலக்ட்ரோலைட், ஓ.ஆர்.எஸ் அல்லது இளநீர் போன்ற நீராகாரங்களை 45–60 நிமிடங்களுக்கு ஒருமுறை அருந்தவும்.',
        'காலை 10:00 மணி முதல் மாலை 4:30 மணி வரை ஜன்னல்களில் நேரடி சூரிய ஒளி படாதவாறு திரைச்சீலைகளை மூடவும்.',
        'கடினமான வெளிப்புற வேலைகள் அல்லது உடற்பயிற்சிகளை காலை 8:30 மணிக்கு முன்போ அல்லது மாலை 6:00 மணிக்கு பின்போ திட்டமிடவும்.',
        'வெப்ப சோர்வு (அதிக வியர்வை, தலைசுற்றல்) மற்றும் வெப்ப பக்கவாதம் (குழப்பம், வியர்வை நிற்றல்) அறிகுறிகளை அறிந்து கொள்ளவும்.',
        'இரவு நேரங்களில் குளிர்ந்த காற்று எளிதாக வந்து செல்லும் வகையில் காற்றோட்டத்தை பராமரிக்கவும்.',
      ],
    },
    safetyNotice: {
      en: 'If any individual exhibits confusion, fainting, or hot dry skin, immediately move them to shade, apply ice packs to axillae/groin, and call emergency services (108 / 112).',
      ta: 'மயக்கம் அல்லது உடல் நடுக்கம் ஏற்பட்டால் உடனடியாக நிழலில் படுக்க வைத்து அவசர மருத்துவ உதவிக்கு (108 / 112) அழைக்கவும்.',
    },
    officialAuthorityRef: {
      name: 'National Disaster Management Authority (NDMA) Heatwave Guidelines',
      url: 'https://ndma.gov.in/Governance/Guidelines/HeatWave',
    },
  },
  {
    id: 'plan-heavy-rainfall',
    category: 'heavy_rainfall',
    categoryLabel: {
      en: 'Heavy Rainfall & Waterlogging',
      ta: 'கனமழை மற்றும் வெள்ள தயார்நிலை',
    },
    title: {
      en: 'Precipitation Readiness & Urban Runoff Precautions',
      ta: 'மழைக்கால முன்னெச்சரிக்கை மற்றும் நீர் தேங்குதல் பாதுகாப்பு',
    },
    description: {
      en: 'Actionable steps to safeguard dwelling structures, electrical circuits, and essential communications during intensive monsoon bouts.',
      ta: 'கனமழை மற்றும் சூறாவளி காலங்களில் வீடு, மின்சாதனங்கள் மற்றும் குடும்ப பாதுகாப்பை உறுதி செய்வதற்கான வழிகாட்டுதல்கள்.',
    },
    practicalSteps: {
      en: [
        'Clear rooftop downspouts, drain gullies, and compound runoff channels of fallen leaves and plastic debris.',
        'Charge power banks, flashlights, and mobile devices; store key physical documents in waterproof vacuum-sealed pouches.',
        'Elevate ground-floor electrical appliances (refrigerators, inverters, power strips) if residing in low-lying topography.',
        'Inspect household water supply valves; prevent surface storm runoff from back-siphoning into drinking sumps.',
        'Never walk, wade, or drive through flowing water or submerged underpasses. 15 cm of moving water can stall vehicles.',
      ],
      ta: [
        'வீட்டின் கூரை வடிகால்கள் மற்றும் மழைநீர் பாதைகளில் உள்ள இலைகள் மற்றும் பிளாஸ்டிக் கழிவுகளை அகற்றவும்.',
        'செல்போன்கள், டார்ச் விளக்குகள் மற்றும் பவர் பேங்குகளை முன்கூட்டியே சார்ஜ் செய்து வைக்கவும்; முக்கிய ஆவணங்களை நீர் புகா பைகளில் வைக்கவும்.',
        'தாழ்வான பகுதிகளில் வசிப்பவர்கள் தரைத்தளத்தில் உள்ள மின்சாதனங்களை மேடான இடங்களில் வைக்கவும்.',
        'மழைநீர் குடிநீர் தொட்டிகளில் கலக்காதவாறு தொட்டி மூடிகளை பாதுகாப்பாக மூடவும்.',
        'தேங்கி நிற்கும் அல்லது ஓடும் மழைநீரில் வாகனங்களை ஓட்டவோ அல்லது நடக்கவோ வேண்டாம்.',
      ],
    },
    safetyNotice: {
      en: 'Never touch sagging powerlines or submerged utility poles. Follow local municipal evacuation orders immediately without waiting for private forecasts.',
      ta: 'அறுந்து கிடக்கும் மின்கம்பிகளைத் தொடாதீர்கள். உள்ளூர் நிர்வாகம் வெளியேற்ற உத்தரவிட்டால் உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.',
    },
    officialAuthorityRef: {
      name: 'India Meteorological Department (IMD) Severe Weather Bulletins',
      url: 'https://mausam.imd.gov.in',
    },
  },
  {
    id: 'plan-household-readiness',
    category: 'household_readiness',
    categoryLabel: {
      en: 'Household Resilience Kit',
      ta: 'வீட்டு அவசர தயார்நிலை தொகுப்பு',
    },
    title: {
      en: '72-Hour Self-Sufficiency & First-Response Packing',
      ta: '72 மணி நேர அவசர தன்னிறைவு தொகுப்பு',
    },
    description: {
      en: 'Baseline provisions to maintain basic safety, lighting, food, and medication during severe weather utility outages.',
      ta: 'மின்வெட்டு மற்றும் பேரிடர் காலங்களில் 3 நாட்களுக்கு தேவையான அத்தியாவசிய உணவு மற்றும் மருந்துகளை தயார் செய்தல்.',
    },
    practicalSteps: {
      en: [
        'Stock at least 3 liters of potable drinking water per person per day for a minimum 72-hour window.',
        'Maintain a 7-day buffer of essential chronic medications (insulin, cardiac, antihypertensives) in a labeled dry pack.',
        'Keep a dry-cell battery or hand-crank AM/FM radio to monitor civil emergency broadcasts if cellular towers lose power.',
        'Prepare ready-to-eat calorie-dense staples that do not require cooking fuel or refrigeration (nuts, biscuits, dried pulses).',
        'Assemble a certified first-aid kit containing antiseptic, sterile gauze dressings, adhesive bandages, and burn ointment.',
      ],
      ta: [
        'ஒரு நபருக்கு ஒரு நாளைக்கு குறைந்தபட்சம் 3 லிட்டர் வீதம் 3 நாட்களுக்கு தேவையான குடிநீரை சேமித்து வைக்கவும்.',
        'முதியவர்களுக்கான அத்தியாவசிய மருந்துகளை (நீரிழிவு, ரத்த அழுத்தம்) குறைந்தபட்சம் ஒரு வாரத்திற்கு தேவையான அளவு எடுத்து வைக்கவும்.',
        'மொபைல் நெட்வொர்க் துண்டிக்கப்பட்டால் அரசு செய்திகளைக் கேட்க பேட்டரியில் இயங்கும் சிறிய ரேடியோவை வைத்திருக்கவும்.',
        'சமைக்க தேவையில்லாத உலர் பழங்கள், பிஸ்கட், பொரி போன்ற உணவுகளை இருப்பு வைக்கவும்.',
        'முதலுதவி பெட்டியில் பேண்டேஜ், கிருமிநாசினி மற்றும் களிம்புகளை தயாராக வைத்திருக்கவும்.',
      ],
    },
    safetyNotice: {
      en: 'Keep emergency numbers (Police 100, Fire 101, Ambulance 108, Disaster Helpline 1070/1077) printed on physical paper.',
      ta: 'அவசர உதவி எண்களை (காவல்துறை 100, தீயணைப்பு 101, ஆம்புலன்ஸ் 108, பேரிடர் மேலாண்மை 1070) காகிதத்தில் எழுதி வைக்கவும்.',
    },
    officialAuthorityRef: {
      name: 'NDMA Household Disaster Management Plan',
      url: 'https://ndma.gov.in',
    },
  },
  {
    id: 'plan-water-conservation',
    category: 'water_conservation',
    categoryLabel: {
      en: 'Water Stewardship',
      ta: 'நீர் சேமிப்பு மற்றும் பாதுகாப்பு',
    },
    title: {
      en: 'Groundwater Recharge & Household Water Conservation',
      ta: 'நிலத்தடி நீர் மறுஊட்டம் மற்றும் சிக்கன பயன்பாடு',
    },
    description: {
      en: 'Practical daily interventions to reduce potable water draw, capture precipitation, and mitigate localized drought risks.',
      ta: 'மழைநீரை சேகரித்தல் மற்றும் அன்றாட வாழ்க்கையில் நீரை சிக்கனமாக பயன்படுத்துவதற்கான வழிமுறைகள்.',
    },
    practicalSteps: {
      en: [
        'Inspect rooftop Rainwater Harvesting (RWH) filters and first-flush diverters ahead of anticipated rain systems.',
        'Reuse graywater from vegetable rinsing and air conditioning condenser drains for garden and non-potable cleaning.',
        'Install low-flow aerators on kitchen and washbasin faucets (reduces volumetric flow from 12L/min to 4L/min).',
        'Check flush cisterns and toilet flappers for silent seepage (a leaking flapper wastes up to 200 liters daily).',
        'Mulch exposed garden soil with dry leaves or compost to suppress surface evaporation during hot spells.',
      ],
      ta: [
        'மழை பெய்யத் தொடங்கும் முன் கூரை மழைநீர் சேகரிப்பு வடிகட்டிகளை சுத்தம் செய்து தயார் நிலையில் வைக்கவும்.',
        'காய்கறி கழுவிய நீர் மற்றும் ஏசி அவுட்டோர் நீரைக் கொண்டு செடிகளுக்கு ஊற்றவும்.',
        'குழாய்களில் நீர் சேமிப்பு ஏரேட்டர்களை பொருத்தி நீர் வீணாவதை பாதியாக குறைக்கவும்.',
        'கழிவறைகளில் நீர் கசிவு உள்ளதா என பரிசோதித்து உடனடியாக சரிசெய்யவும்.',
        'மரங்கள் மற்றும் செடிகளைச் சுற்றி இலைகளைப் பரப்பி மண்ணின் ஈரப்பதம் ஆவியாகாமல் காக்கவும்.',
      ],
    },
    safetyNotice: {
      en: 'Never consume non-potable harvested rain or graywater without secondary multi-stage filtration and boiling.',
      ta: 'மழைநீரை குடிப்பதற்கு முன் நன்கு காய்ச்சி வடிகட்டிய பின்பே பருக வேண்டும்.',
    },
    officialAuthorityRef: {
      name: 'Central Ground Water Board (CGWB) Rainwater Harvesting Guide',
      url: 'http://cgwb.gov.in',
    },
  },
  {
    id: 'plan-everyday-awareness',
    category: 'everyday_awareness',
    categoryLabel: {
      en: 'Climate Literacy & Action',
      ta: 'சுற்றுச்சூழல் விழிப்புணர்வு மற்றும் நடவடிக்கை',
    },
    title: {
      en: 'Everyday Decarbonization & Air Quality Protection',
      ta: 'தினசரி கார்பன் குறைப்பு மற்றும் காற்று மாசுபாடு தடுப்பு',
    },
    description: {
      en: 'Empirical, individual-level micro-actions that reduce emission intensity and safeguard respiratory health in urban corridors.',
      ta: 'நாம் வாழும் பகுதியின் காற்றை தூய்மையாக வைத்திருக்கவும், சுற்றுச்சூழல் பாதிப்பை குறைக்கவும் எளிய தினசரி பழக்கங்கள்.',
    },
    practicalSteps: {
      en: [
        'Check localized Particulate Matter (PM2.5) indices before morning cardiovascular or unmasked jogging sessions.',
        'Combine vehicle trips and utilize public urban transit or non-motorized cycling for errands under 3 km.',
        'Refrain completely from burning dry garden biomass, leaves, or plastic waste; compost organic fractions.',
        'Set air conditioning units to 24°C–26°C with ceiling fan circulation (each 1°C elevation saves ~6% electricity).',
        'Choose native, drought-tolerant flora (Neem, Pungan, Peepal) for home gardens to maximize localized urban cooling.',
      ],
      ta: [
        'காலை நேர நடைப்பயிற்சிக்கு முன் காற்றின் தரக் குறியீட்டை (AQI) பரிசோதிக்கவும்.',
        '3 கி.மீ-க்குள் உள்ள பயணங்களுக்கு பொதுப்போக்குவரத்து அல்லது மிதிவண்டியைப் பயன்படுத்தவும்.',
        'காய்ந்த இலைகள் அல்லது பிளாஸ்டிக் கழிவுகளை திறந்தவெளியில் எரிக்காமல் மண்புழு உரமாக்கவும்.',
        'ஏர் கண்டிஷனரை 24°C–26°C வெப்பநிலையில் வைத்து மின்சாரத்தை சேமிக்கவும்.',
        'வீட்டுத் தோட்டம் மற்றும் தெருவோரங்களில் வேம்பு, புங்கன் போன்ற உள்நாட்டு மரங்களை வளர்க்கவும்.',
      ],
    },
    safetyNotice: {
      en: 'When PM2.5 levels exceed 150 µg/m³, wear certified N95 respirators outdoors, particularly for children and asthmatics.',
      ta: 'காற்றின் தரம் மிகவும் மோசமாக இருக்கும்போது ஆஸ்துமா நோயாளிகள் மற்றும் குழந்தைகள் N95 முகக்கவசம் அணியவும்.',
    },
    officialAuthorityRef: {
      name: 'Central Pollution Control Board (CPCB) Sameer Portal',
      url: 'https://cpcb.nic.in',
    },
  },
];

export function getReadyPlanItems(category?: string): ReadyPlanItem[] {
  if (category) {
    return READY_PLAN_DATA.filter((item) => item.category === category);
  }
  return READY_PLAN_DATA;
}
