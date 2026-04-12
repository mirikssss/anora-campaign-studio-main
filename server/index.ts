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
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}
function writeDb(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
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
app.post('/api/campaigns', upload.single('banner'), (req, res) => {
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
      status: 'active', // Demo optimization: set instantly to active instead of pending_review
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
      // Save path of the file
      banner_url: req.file ? `/uploads/${req.file.filename}` : null
    };

    db.campaigns.push(campaign);
    writeDb(db);
    res.json(campaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

app.get('/api/campaigns', (req, res) => {
  const db = readDb();
  res.json(db.campaigns);
});

// --- 4. PUBLISHER SITES ---
app.post('/api/analyze-campaign', async (req, res) => {
  const { campaignData } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  console.log('--- AI Analysis Request ---');
  console.log('Campaign:', campaignData.campaignName);

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
  - Audience: ${campaignData.audiences.join(', ')}
  - Goal: ${campaignData.objective}
  - Strategy: ${campaignData.strategy}
  - Daily Budget: $${campaignData.dailyBudget}
  - Lifetime Budget: $${campaignData.lifetimeBudget}
  - Device Targeting: ${campaignData.deviceTargeting}
  
  You MUST return ONLY a valid JSON object with this exact structure (NO markdown wrappers, NO backticks):
  {
    "Score": 85,
    "Summary": "Краткая общая оценка кампании...",
    "Cards": [
      {
        "id": "dailyBudget", // STRICTLY use one of: "dailyBudget", "lifetimeBudget", "geos", "audienceType", "strategy", "other"
        "title": "Увеличьте дневной бюджет",
        "status": "warning", 
        "explanation": "Подробное объяснение почему это нужно изменить (учитывая, что целевой рынок - СНГ).",
        "currentValue": "$20",
        "suggestion": "$60",
        "valueToApply": "60" // Just the raw string or number to apply to state (e.g. "60", "cpa", "broad", "Узбекистан, Казахстан")
      }
    ]
  }
  Respond in Russian. Keep it professional. Target market is CIS (СНГ region) - don't suggest USA/Europe. Return 3-5 cards analyzing different aspects. ONLY output JSON.`;

  const modelsToTry = [
    "google/gemma-4-31b-it:free",
    "openai/gpt-oss-120b:free",
    "openai/gpt-oss-20b:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "z-ai/glm-4.5-air:free",
    "qwen/qwen3-next-80b-a3b-instruct:free"
  ];

  let success = false;
  let parsedContent = null;
  let lastError = '';

  for (const model of modelsToTry) {
    try {
      console.log(`Trying OpenRouter model: ${model}`);
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
          messages: [{ role: "user", content: campaignPrompt }]
        })
      });

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
          console.log(`[SUCCESS] Valid response from model: ${model}`);
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
    res.json(parsedContent);
  } else {
    console.error('[ERROR] All fallback models failed. Last error:', lastError);
    // If all fail, return a fallback UI card instead of a 500 error so the UI still works gracefully
    res.json({
      Score: 50,
      Summary: 'Не удалось сгенерировать ИИ-советы. Выбранные бесплатные модели перегружены или недоступны.',
      Cards: [
        {
          id: 'error-card',
          title: 'Серверные ограничения',
          status: 'warning',
          explanation: `Попытка использовать 6 разных бесплатных моделей не удалась. ИИ-сеть временно перегружена.`,
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

  if (!apiKey || apiKey.trim() === '') {
    return res.status(500).json({ reply: 'OpenRouter API key is not configured.' });
  }

  // Persist user message to DB
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

  // Format messages for LLM
  const systemPrompt = `You are an AI assistant for Anora Campaign Studio. A user is discussing an optimization recommendation.
  Recommendation Title: ${contextTitle}
  Recommendation Explanation: ${contextExplanation}
  Respond in Russian. CRITICAL: Keep your response EXTREMELY short and concise (maximum 2-3 short sentences). Do not use long paragraphs or lists. Get straight to the point.`;

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...previousMessages.map((m: any) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: userMessage }
  ];

  const modelsToTry = [
    "google/gemma-4-31b-it:free",
    "openai/gpt-oss-120b:free",
    "google/gemma-2-9b-it:free"
  ];

  let replyText = 'Не удалось получить ответ ИИ (превышены лимиты API).';

  for (const model of modelsToTry) {
    try {
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
          messages: messagesPayload,
          max_tokens: 300
        })
      });

      if (response.ok) {
        const data = await response.json();
        replyText = data.choices?.[0]?.message?.content || replyText;
        break; // Stop parsing if success
      }
    } catch (e) {
      continue;
    }
  }

  // Persist AI message to DB
  db.ai_chats.push({
    id: uuidv4(),
    cardId,
    role: 'ai',
    text: replyText,
    created_at: new Date().toISOString()
  });
  writeDb(db);

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
  const db = readDb();
  res.json(db.publisher_sites || []);
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

  // Optional: check if siteId exists and matches format, but for now just return random ad
  const randomAd = activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)];

  res.json({
    id: randomAd.id,
    bannerUrl: `http://localhost:3001${randomAd.banner_url}`,
    link: randomAd.landing_url,
    format: format || '300x250'
  });
});

// GET site by id (polling)
app.get('/api/publishers/sites/:id', (req, res) => {
  const db = readDb();
  const site = db.publisher_sites.find((s: any) => s.id === req.params.id);
  if (site) {
    res.json(site);
  } else {
    res.status(404).json({ error: 'Site not found' });
  }
});

// START
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Anora API running on http://localhost:${PORT}`);
});
