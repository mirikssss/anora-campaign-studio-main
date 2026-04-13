import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const API_URL = process.env.API_URL || ''; 
// On Vercel, if backend is on same domain, leave empty or set to full URL

app.get('/', (req, res) => {
  res.send('Anora Backend API is running successfully! 🚀');
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve SDK.js from backend so external sites can load it via <script src="https://api.anora.io/sdk.js">
app.get('/sdk.js', (req, res) => {
  const sdkPath = path.join(__dirname, '..', 'public', 'sdk.js');
  if (fs.existsSync(sdkPath)) {
    res.type('application/javascript').sendFile(sdkPath);
  } else {
    res.status(404).send('// Anora SDK not found');
  }
});

// Configure Multer to save uploaded banners
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ storage: storage });

const dbPath = path.join(__dirname, 'db.json');

// Synchronous JSON read/write helper
function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      console.warn(`[DB] ${dbPath} not found, using default.`);
      return { users: [], brands: [], campaigns: [], publisher_sites: [], notifications: [], ai_chats: [] };
    }
    const data = fs.readFileSync(dbPath, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure critical keys exist
    if (!parsed.users) parsed.users = [];
    if (!parsed.brands) parsed.brands = [];
    if (!parsed.campaigns) parsed.campaigns = [];
    if (!parsed.publisher_sites) parsed.publisher_sites = [];
    if (!parsed.notifications) parsed.notifications = [];
    if (!parsed.ai_chats) parsed.ai_chats = [];
    return parsed;
  } catch (e: any) {
    console.error('[DB READ ERROR]', e);
    return { users: [], brands: [], campaigns: [], publisher_sites: [], notifications: [], ai_chats: [] };
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.warn('[DB WRITE ERROR] Filesystem might be read-only (common on Vercel). Data not persisted.', e.message);
  }
}

// Ensure uploads dir exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// --- 1. USERS ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  let user = db.users.find((u: any) => u.email === email);

  if (!user) {
    // Auto-register for prototype simplicity
    user = {
      id: uuidv4(),
      email,
      password_hash: 'mock-hash',
      role: 'advertiser',
      plan: 'free',
      banner_gen_used: 0,
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString()
    };
    db.users.push(user);
    writeDb(db);
  }
  res.json({ token: 'mock-jwt-token', user });
});

// --- 2. BRANDS ---
app.post('/api/brands', (req, res) => {
  const { user_id, name, industry, website } = req.body;
  const db = readDb();
  const brand = {
    id: uuidv4(),
    user_id,
    name,
    industry,
    website,
    default_objective: 'traffic',
    default_geo: [],
    default_targeting: {},
    default_strategy: 'cpc',
    avg_order_value: null
  };
  db.brands.push(brand);
  writeDb(db);
  res.json(brand);
});

// --- 3. CAMPAIGNS ---
// "upload.single('banner')" saves the uploaded file and adds req.file
app.post('/api/campaigns', (req, res, next) => {
  // Use a wrapper to handle multer errors if they occur
  upload.single('banner')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ error: 'File upload failed (Filesystem might be read-only on Vercel)' });
    }
    
    try {
      const db = readDb();
      const data = req.body;

      // Some fields from FormData come as JSON strings
      const geo = data.geo ? JSON.parse(data.geo) : [];
      const targeting = data.targeting ? JSON.parse(data.targeting) : {};

      const campaign = {
        id: uuidv4(),
        brand_id: data.brand_id || '00000000-0000-0000-0000-000000000000',
        name: data.name,
        status: 'active',
        objective: data.objective,
        landing_url: data.landing_url,
        ad_format: data.ad_format || 'auto',
        geo,
        targeting,
        budget_lifetime: data.budget_lifetime,
        budget_daily: data.budget_daily,
        strategy: data.strategy,
        start_date: data.start_date,
        end_date: data.end_date,
        schedule_hours: null,
        frequency_cap: data.frequency_cap || 3,
        score_payload: data.score_payload ? JSON.parse(data.score_payload) : null,
        spent_total: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        banner_url: req.file ? `/uploads/${req.file.filename}` : null
      };

      db.campaigns.push(campaign);
      writeDb(db);
      res.json(campaign);
    } catch (error: any) {
      console.error('Campaign creation crash:', error);
      res.status(500).json({ error: 'Failed to create campaign', details: error.message });
    }
  });
});

app.get('/api/campaigns', (req, res) => {
  const db = readDb();
  res.json(db.campaigns);
});

// --- 4. PUBLISHER SITES ---
// --- BANNER CONTENT MODERATION ---
app.post('/api/validate-banner', async (req, res) => {
  const { bannerBase64 } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  console.log('--- Banner Validation Request ---');

  if (!bannerBase64) {
    return res.status(400).json({ valid: false, reason: 'No image provided' });
  }

  if (!apiKey || apiKey === 'your_openrouter_api_key_here' || apiKey.trim() === '') {
    console.warn('[WARN] No API key for banner validation, skipping AI moderation');
    return res.json({ valid: true, reason: 'Модерация пропущена (нет API ключа)' });
  }

  const moderationPrompt = `You are a strict content moderator for an advertising platform. Analyze this banner image and determine if it contains ANY prohibited content.

PROHIBITED CONTENT (must reject if ANY is found):
- Pornography, nudity, sexual content, overly suggestive imagery
- Gambling, casinos, betting, slot machines, poker
- Drugs, narcotics, drug paraphernalia, smoking promotion
- Weapons, firearms, knives, explosives
- Extreme violence, gore, blood, graphic injuries
- Hate speech symbols, extremist imagery, Nazi symbols
- Alcohol promotion targeting minors
- Counterfeit goods, fake luxury brands
- Deceptive/misleading health claims
- Cryptocurrency scams, pyramid schemes

You MUST return ONLY a valid JSON object (NO markdown wrappers, NO backticks):
{
  "allowed": true or false,
  "category": "safe" or the violation category (e.g. "gambling", "adult", "violence", "drugs", "weapons", "hate_speech", "scam"),
  "confidence": 0.0 to 1.0,
  "reason_ru": "Explanation in Russian why the banner was approved or rejected"
}
ONLY output JSON.`;

  // Vision-capable models on OpenRouter
  const visionModels = [
    "google/gemini-2.0-flash-001",
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-4-scout:free",
  ];

  for (const model of visionModels) {
    try {
      console.log(`[MODERATION] Trying vision model: ${model}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://anora.io",
          "X-Title": "Anora Campaign Studio"
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: "user",
            content: [
              { type: "text", text: moderationPrompt },
              { type: "image_url", image_url: { url: bannerBase64 } }
            ]
          }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[MODERATION] Model ${model} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '{}';
      content = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();

      try {
        const result = JSON.parse(content);
        console.log(`[MODERATION] Result from ${model}:`, result);

        if (typeof result.allowed === 'boolean') {
          return res.json({
            valid: result.allowed,
            category: result.category || 'unknown',
            confidence: result.confidence || 0,
            reason: result.reason_ru || (result.allowed ? 'Контент одобрен' : 'Контент отклонён')
          });
        }
      } catch (parseErr) {
        console.warn(`[MODERATION] Parse error from ${model}, trying next...`);
        continue;
      }
    } catch (err: any) {
      console.warn(`[MODERATION] Error with ${model}:`, err.message);
      continue;
    }
  }

  // If all models fail, allow but warn
  console.warn('[MODERATION] All vision models failed, allowing by default');
  res.json({ valid: true, reason: 'Автомодерация временно недоступна. Контент будет проверен вручную.' });
});

// --- 4. CAMPAIGN AI ANALYSIS ---
app.post('/api/analyze-campaign', async (req, res) => {
  const { campaignData, bannerBase64 } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  console.log('--- AI Analysis Request ---');
  console.log('Campaign:', campaignData.campaignName);
  console.log('Banner image included:', !!bannerBase64);

  if (!apiKey || apiKey === 'your_openrouter_api_key_here' || apiKey.trim() === '') {
    console.error('CRITICAL: OPENROUTER_API_KEY is missing or not set in .env');
    return res.status(500).json({ error: 'OpenRouter API key is not configured' });
  }

  const campaignPrompt = `Analyze this advertising campaign for a hackathon project called Anora. 
  Anora is an AI-driven ad network. 
  Provide expert recommendations to improve its effectiveness.
  
  Campaign Details:
  - Name: ${campaignData.campaignName}
  - Brand: ${campaignData.brandName}
  - Industry: ${campaignData.industry || 'Не указана'}
  - Landing URL: ${campaignData.landingUrl || 'Не указан'}
  - Audience Type: ${campaignData.audiences.join(', ')}
  - Age Range: ${campaignData.ageRange ? campaignData.ageRange.join('-') : '18-65'}
  - Gender: ${campaignData.gender || 'all'}
  - Interests: ${campaignData.interests || 'Не указаны'}
  - Goal: ${campaignData.objective}
  - Strategy: ${campaignData.strategy}
  - Geo Targeting: ${campaignData.geos?.length ? campaignData.geos.join(', ') : 'Не указано'}
  - Budget Type: ${campaignData.budgetType || 'daily'}
  - Daily Budget: $${campaignData.dailyBudget || 0}
  - Lifetime Budget: $${campaignData.lifetimeBudget || 0}
  - Frequency Cap: ${campaignData.frequencyCap || 3} показов/пользователь/день
  - Device Targeting: ${campaignData.deviceTargeting}
  - Start Date: ${campaignData.startDate || 'Не указана'}
  - End Date: ${campaignData.endDate || 'Не указана'}
  ${bannerBase64 ? '\n  A banner image is attached. Please also analyze the visual quality, design, text readability, color scheme, and overall ad effectiveness of the banner. If the banner has issues, add a card with id "bannerQuality".' : '\n  No banner image was provided.'}
  
  You MUST return ONLY a valid JSON object with this exact structure (NO markdown wrappers, NO backticks):
  {
    "Score": 85,
    "Summary": "Краткая общая оценка кампании...",
    "Cards": [
      {
        "id": "dailyBudget", // STRICTLY use one of: "dailyBudget", "lifetimeBudget", "geos", "audienceType", "strategy", "bannerQuality", "other"
        "title": "Увеличьте дневной бюджет",
        "status": "warning", 
        "explanation": "Подробное объяснение почему это нужно изменить (учитывая, что целевой рынок - СНГ).",
        "currentValue": "$20",
        "suggestion": "$60",
        "valueToApply": "60" // Just the raw string or number to apply to state (e.g. "60", "cpa", "broad", "Узбекистан, Казахстан")
      }
    ]
  }
  ${bannerBase64 ? 'Include a card with id "bannerQuality" analyzing the attached banner design quality, CTA visibility, color harmony, and text readability.' : ''}
  Respond in Russian. Keep it professional. Target market is CIS (СНГ region) - don't suggest USA/Europe. Return 3-5 cards analyzing different aspects. ONLY output JSON.`;

  // If banner is included, use vision-capable models first, then fallback to text-only
  const visionModels = [
    "google/gemini-2.0-flash-001",
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-4-scout:free",
  ];

  const textModels = [
    "google/gemma-4-31b-it:free",
    "openai/gpt-oss-120b:free",
    "openai/gpt-oss-20b:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "z-ai/glm-4.5-air:free",
    "qwen/qwen3-next-80b-a3b-instruct:free"
  ];

  // If we have a banner, try vision models first, then text models as fallback
  const modelsToTry = bannerBase64 
    ? [...visionModels, ...textModels] 
    : textModels;

  let success = false;
  let parsedContent = null;
  let lastError = '';
  let usedVisionModel = false;

  for (const model of modelsToTry) {
    try {
      const isVisionModel = visionModels.includes(model);
      console.log(`Trying OpenRouter model: ${model} (vision: ${isVisionModel})`);

      // Build message content: use multimodal format for vision models with banner
      let messageContent: any;
      if (isVisionModel && bannerBase64) {
        messageContent = [
          { type: "text", text: campaignPrompt },
          { type: "image_url", image_url: { url: bannerBase64 } }
        ];
      } else {
        messageContent = campaignPrompt;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://anora.io",
          "X-Title": "Anora Campaign Studio"
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: messageContent }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[WARN] Model ${model} failed with status ${response.status}`);
        lastError = errorText;
        continue;
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '{}';

      // Clean up markdown block if the model ignored the instruction
      content = content.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();

      try {
        parsedContent = JSON.parse(content);

        // Basic validation to ensure the LLM followed instructions
        if (parsedContent && typeof parsedContent === 'object' && Array.isArray(parsedContent.Cards)) {
          success = true;
          usedVisionModel = isVisionModel;
          console.log(`[SUCCESS] Valid response from model: ${model} (vision: ${isVisionModel})`);
          break; // Stop loop if successful
        } else {
          console.warn(`[WARN] Model ${model} returned JSON but without 'Cards' array. Trying next...`);
          lastError = 'Invalid JSON structure (missing Cards)';
          continue;
        }
      } catch (parseError) {
        console.warn(`[WARN] Model ${model} returned unparseable JSON. Trying next...`);
        lastError = 'JSON Parse Error';
        continue;
      }
    } catch (fetchError: any) {
      console.warn(`[WARN] Fetch error for model ${model}: ${fetchError.message}`);
      lastError = fetchError.message;
      continue;
    }
  }

  if (success && parsedContent) {
    // If banner was provided but we fell back to a text model, add an info card
    if (bannerBase64 && !usedVisionModel && Array.isArray(parsedContent.Cards)) {
      const hasBannerCard = parsedContent.Cards.some((c: any) => c.id === 'bannerQuality');
      if (!hasBannerCard) {
        parsedContent.Cards.push({
          id: 'bannerQuality',
          title: 'Визуальный анализ баннера',
          status: 'warning',
          explanation: 'ИИ-модели с поддержкой изображений были недоступны. Баннер не был проанализирован визуально. Рекомендуем повторить анализ позже для получения оценки дизайна.',
          currentValue: 'Не проанализирован',
          suggestion: 'Повторить анализ'
        });
      }
    }
    res.json(parsedContent);
  } else {
    console.error('[ERROR] All fallback models failed. Last error:', lastError);
    res.json({
      Score: 50,
      Summary: 'Не удалось сгенерировать ИИ-советы. Выбранные бесплатные модели перегружены или недоступны.',
      Cards: [
        {
          id: 'error-card',
          title: 'Серверные ограничения',
          status: 'warning',
          explanation: `Попытка использовать несколько разных моделей не удалась. ИИ-сеть временно перегружена.`,
          currentValue: 'Ошибка API',
          suggestion: 'Повторите анализ позже'
        }
      ]
    });
  }
});
app.post('/api/chat', async (req, res) => {
  const { cardId, userMessage, contextTitle, contextExplanation, previousMessages } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log(`[AI CHAT] Request for card: ${cardId}`);

  if (!apiKey || apiKey.trim() === '') {
    return res.status(500).json({ reply: 'OpenRouter API key NOT found in environment.' });
  }

  // Persist user message to DB (Optional on Vercel)
  try {
    const db = readDb();
    if (!db.ai_chats) db.ai_chats = [];
    db.ai_chats.push({
      id: uuidv4(),
      cardId,
      role: 'user',
      text: userMessage,
      created_at: new Date().toISOString()
    });
    writeDb(db);
  } catch (e) { console.warn("DB write failed (likely Vercel readonly FS)"); }

  const systemPrompt = `You are an AI assistant for Anora Campaign Studio.
  Context: ${contextTitle} - ${contextExplanation}.
  Respond in Russian. CRITICAL: 1-2 short sentences only. No lists.`;

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...previousMessages.slice(-4).map((m: any) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: userMessage }
  ];

  const modelsToTry = ["liquid/lfm-40b:free", "google/gemma-2-9b-it:free"];
  let replyText = 'ИИ временно недоступен. Попробуйте позже.';

  for (const model of modelsToTry) {
    console.log(`[AI CHAT] Trying model: ${model}`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://anora.io",
          "X-Title": "Anora Campaign Studio"
        },
        body: JSON.stringify({ model, messages: messagesPayload, max_tokens: 100 }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        replyText = data.choices?.[0]?.message?.content || replyText;
        console.log(`[AI CHAT] Success with ${model}`);
        break; 
      } else {
        console.warn(`[AI CHAT] Model ${model} returned ${response.status}`);
      }
    } catch (err) {
      console.error(`[AI CHAT] Model ${model} error or timeout`);
    }
  }

  try {
    const db = readDb();
    db.ai_chats.push({
      id: uuidv4(),
      cardId,
      role: 'ai',
      text: replyText,
      created_at: new Date().toISOString()
    });
    writeDb(db);
  } catch (e) {}

  res.json({ reply: replyText });
});

app.post('/api/publishers/sites', (req, res) => {
  const db = readDb();
  const site = {
    id: uuidv4(),
    ...req.body,
    status: 'pending_sdk',
    created_at: new Date().toISOString()
  };
  db.publisher_sites.push(site);
  writeDb(db);
  res.json(site);
});

app.get('/api/publishers/sites', (req, res) => {
  try {
    const db = readDb();
    res.json(db.publisher_sites || []);
  } catch (e: any) {
    res.status(500).json({ error: 'Failed to fetch sites', details: e.message });
  }
});

// SDK endpoint
app.post('/sdk/register', (req, res) => {
  const { site_id } = req.body;
  const db = readDb();
  const siteIndex = db.publisher_sites.findIndex((s: any) => s.id === site_id);
  if (siteIndex > -1) {
    db.publisher_sites[siteIndex].status = 'active';
    writeDb(db);
    res.json({ success: true, message: 'SDK verified and site is active' });
  } else {
    res.status(404).json({ error: 'Site not found' });
  }
});

// ads fetching for SDK
app.get('/api/ads', (req, res) => {
  const { siteId, format } = req.query;
  const db = readDb();

  // Find active campaigns that have a banner
  const activeCampaigns = db.campaigns.filter((c: any) => c.banner_url);

  if (activeCampaigns.length === 0) {
    return res.status(404).json({ error: 'No ads available' });
  }

  const randomAd = activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)];

  // Build absolute banner URL so external sites can load images
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3001';
  const baseUrl = API_URL || `${protocol}://${host}`;
  
  res.json({
    id: randomAd.id,
    bannerUrl: `${baseUrl}${randomAd.banner_url}`,
    link: randomAd.landing_url,
    format: format || '300x250'
  });
});

// GET site by id (polling)
app.get('/api/publishers/sites/:id', (req, res) => {
  try {
    const db = readDb();
    const site = (db.publisher_sites || []).find((s: any) => s.id === req.params.id);
    if (site) {
      res.json(site);
    } else {
      res.status(404).json({ error: 'Site not found' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// START
const PORT = process.env.PORT || 3001;
import { runNotificationJobs } from './notificationJobs.js';

// --- NOTIFICATIONS & JOBS ---
app.get('/api/notifications', (req, res) => {
  runNotificationJobs(); // Critical for Vercel: trigger logic on request
  const { user_id } = req.query;
  const db = readDb();
  const notes = (db.notifications || []).filter((n: any) => n.user_id === user_id).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(notes);
});

app.post('/api/notifications/read', (req, res) => {
  const { id } = req.body;
  const db = readDb();
  if (db.notifications) {
    const target = db.notifications.find((n: any) => n.id === id);
    if (target) {
      target.is_read = true;
      writeDb(db);
    }
  }
  res.json({ success: true });
});

// Sync metrics from Simulator back to DB so notification rules work
app.post('/api/campaigns/:id/metrics', (req, res) => {
  const { id } = req.params;
  const { impressions, clicks, spent } = req.body;
  const db = readDb();
  const c = db.campaigns.find((c: any) => c.id === id);
  if (c) {
    c.impressions = (c.impressions || 0) + (impressions || 0);
    c.clicks = (c.clicks || 0) + (clicks || 0);
    c.spent_total = (c.spent_total || 0) + (spent || 0);
    writeDb(db);
  }
  res.json({ success: true });
});

// Monitor layer is now triggered via GET /api/notifications for serverless compatibility


if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Anora API running on http://localhost:${PORT}`);
  });
}

// Required for Vercel serverless deployment
export default app;
