import { GoogleGenAI } from '@google/genai';
import { WeatherData } from '../types/index.ts';

export interface ExplanationResponse {
  meaning: string;
  context: string;
  significance: string;
  sourceAttribution: string;
  uncertainties: string;
  recommendedActions: string[];
  providerUsed: 'gemini' | 'deterministic_fallback';
  language: 'en' | 'ta';
}

function generateDeterministicExplanation(weather: WeatherData, lang: 'en' | 'ta' = 'en'): ExplanationResponse {
  const temp = weather.values.temperature;
  const apparent = weather.values.apparentTemperature;
  const humidity = weather.values.relativeHumidity;
  const precip = weather.values.precipitation;
  const wind = weather.values.windSpeed;
  const loc = weather.location.label;
  const source = weather.source.name;

  if (lang === 'ta') {
    // Tamil explanation
    const tempDesc =
      temp > 35
        ? 'கடுமையான வெப்ப நிலை நிலவுகிறது'
        : temp > 28
        ? 'மிதமான வெப்பம் மற்றும் ஈரப்பதம் உள்ளது'
        : 'சாதாரண இதமான வெப்பநிலை நிலவுகிறது';

    return {
      meaning: `${loc} பகுதியில் தற்போதைய வெப்பநிலை ${temp}°C (உணரப்படும் வெப்பநிலை ${apparent}°C). காற்றின் ஈரப்பதம் ${humidity}% மற்றும் காற்றின் வேகம் ${wind} km/h. ${tempDesc}.`,
      context: `இந்த தகவல் ${loc} பகுதிக்குரியது. தரவு பெறப்பட்ட நேரம்: ${new Date(
        weather.timestamps.retrievedAt
      ).toLocaleTimeString('ta-IN')}.`,
      significance:
        temp > 35
          ? 'அதிக வெப்பநிலை காரணமாக நீர்ச்சத்து குறைவு மற்றும் வெப்ப அலை தாக்கம் ஏற்பட வாய்ப்புள்ளது.'
          : precip > 5
          ? 'மழைப்பொழிவு காரணமாக சாலைகளில் நீர் தேங்குதல் ஏற்படலாம்.'
          : 'தற்போதைய வானிலை இயல்பான தினசரி நடவடிக்கைகளுக்கு ஏற்றதாக உள்ளது.',
      sourceAttribution: `இந்த தகவல் ${source} மூலத்திலிருந்து பெறப்பட்டு, CC BY 4.0 உரிமத்தின் கீழ் வழங்கப்படுகிறது.`,
      uncertainties:
        'இது ஒரு வானியல் மாதிரி முன்னறிவிப்பு (Numerical Weather Prediction). உள்ளூர் நிலப்பரப்பு மற்றும் உடனடி மேக மாற்றங்களால் மாறுபடலாம்.',
      recommendedActions: [
        temp > 32
          ? 'போதுமான அளவு குடிநீர் பருகவும், நண்பகல் நேரங்களில் நேரடி வெயிலைத் தவிர்க்கவும்.'
          : 'வழக்கமான தினசரி முன்னெச்சரிக்கை நடவடிக்கைகளை மேற்கொள்ளவும்.',
        precip > 2
          ? 'குடை அல்லது மழை பாதுகாப்பு உடைகளை எடுத்துச் செல்லவும்.'
          : 'வெளிப்புற நடவடிக்கைகளை முன்கூட்டியே திட்டமிடவும்.',
        'அவசர தேவைகளுக்கு இந்திய வானிலை மையம் (IMD) அல்லது உள்ளூர் பேரிடர் மேலாண்மை ஆணையத்தின் அதிகாரப்பூர்வ அறிவிப்புகளைப் பின்பற்றவும்.',
      ],
      providerUsed: 'deterministic_fallback',
      language: 'ta',
    };
  }

  // English explanation
  const heatStress =
    apparent > 38
      ? 'High thermal stress conditions: apparent heat exceeds safe prolonged outdoor activity limits.'
      : apparent > 32
      ? 'Moderate heat index: sustained exertion outdoors may induce fatigue.'
      : 'Comfortable thermal range for general daily activities.';

  const precipNotice =
    precip > 10
      ? 'Heavy precipitation observed: potential for surface water runoff and reduced vehicle traction.'
      : precip > 1
      ? 'Light to moderate rain present: damp roadway conditions.'
      : 'Minimal or nil immediate precipitation registered.';

  return {
    meaning: `In ${loc}, current ambient air temperature is ${temp}°C, with an apparent thermal feel of ${apparent}°C, relative humidity of ${humidity}%, and wind speed of ${wind} km/h. ${weather.values.weatherDescription}.`,
    context: `Applies specifically to ${loc} (Lat: ${weather.location.latitude.toFixed(
      2
    )}, Lon: ${weather.location.longitude.toFixed(2)}). Retrieved at ${new Date(
      weather.timestamps.retrievedAt
    ).toUTCString()}.`,
    significance: `${heatStress} ${precipNotice}`,
    sourceAttribution: `Data ingested from ${source} (${weather.source.model}) under CC BY 4.0 open license.`,
    uncertainties:
      'Numerical weather prediction models provide probabilistic estimations based on grid-scale barometric equations. Microclimatic variations (urban heat island, localized wind funnels) are not fully captured.',
    recommendedActions: [
      apparent > 32
        ? 'Maintain active hydration and limit unshaded mid-day solar exposure.'
        : 'Standard weather readiness; dress appropriately for ambient temperatures.',
      precip > 2
        ? 'Plan for wet transit conditions and secure water-sensitive outdoor gear.'
        : 'Favorable conditions for routine transport and ventilation.',
      'Always refer to national civil disaster agencies (e.g. IMD / NDMA) for official binding severe weather warnings.',
    ],
    providerUsed: 'deterministic_fallback',
    language: 'en',
  };
}

export async function explainWeatherData(weather: WeatherData, lang: 'en' | 'ta' = 'en'): Promise<ExplanationResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return generateDeterministicExplanation(weather, lang);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are the scientific ClimateLens Explainer for the IEEE ClimateChain Global Hackathon 2026.
Explain the following verified atmospheric dataset concisely, accurately, and objectively.
Do NOT invent unobserved values, flood guarantees, earthquake predictions, or fabricated official emergency orders.
Ground your response strictly in the structured values below.

Target Language: ${lang === 'ta' ? 'Tamil (தமிழ்)' : 'English'}

Atmospheric Data:
- Location: ${weather.location.label} (${weather.location.latitude}, ${weather.location.longitude})
- Temperature: ${weather.values.temperature} ${weather.units.temperature}
- Apparent Temperature: ${weather.values.apparentTemperature} ${weather.units.apparentTemperature}
- Humidity: ${weather.values.relativeHumidity} ${weather.units.relativeHumidity}
- Precipitation: ${weather.values.precipitation} ${weather.units.precipitation}
- Weather Condition: ${weather.values.weatherDescription} (WMO Code ${weather.values.weatherCode})
- Wind Speed: ${weather.values.windSpeed} ${weather.units.windSpeed}
- Air Quality US AQI: ${weather.airQuality ? weather.airQuality.usAqi + ' (' + weather.airQuality.statusLabel + ')' : 'Not reported'}
- Provider: ${weather.source.name}
- Ingestion Timestamp: ${weather.timestamps.retrievedAt}

Return a valid JSON object matching this schema exactly:
{
  "meaning": "Clear summary of current conditions in plain language",
  "context": "Spatial and temporal boundary of this data",
  "significance": "Why these atmospheric indicators matter to everyday health or transit",
  "sourceAttribution": "Exact provider and licensing attribution",
  "uncertainties": "Specific meteorological limitations of numerical models",
  "recommendedActions": ["Practical action 1", "Practical action 2", "Official warning referral advice"]
}`;

    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Gemini API call timed out after 15s')), 15000);
    });

    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      if (timer) clearTimeout(timer);

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return {
          meaning: parsed.meaning || '',
          context: parsed.context || '',
          significance: parsed.significance || '',
          sourceAttribution: parsed.sourceAttribution || weather.source.attribution,
          uncertainties: parsed.uncertainties || '',
          recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
          providerUsed: 'gemini',
          language: lang,
        };
      }
    } finally {
      if (timer) clearTimeout(timer);
    }
  } catch (err: any) {
    // Clean fallback to deterministic rules without throwing alarming errors
    console.info(`Notice: Serving deterministic climate explanation fallback (${err?.message || 'model unavailable'})`);
  }

  return generateDeterministicExplanation(weather, lang);
}
