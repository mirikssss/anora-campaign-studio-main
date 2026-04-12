import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

function readDb() {
  try {
    if (!fs.existsSync(dbPath)) return { campaigns: [], brands: [], notification_log: [], notifications: [] };
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { campaigns: [], brands: [], notification_log: [], notifications: [] };
  }
}
function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn('[JOBS DB WRITE ERROR] Filesystem might be read-only.');
  }
}

function initDb(db: any) {
  if (!db.notification_log) db.notification_log = [];
  if (!db.notifications) db.notifications = [];
  return db;
}

// Adds notification log and generated message
function triggerNotification(db: any, user_id: string, campaign_id: string | null, rule_code: string, severity: 'info' | 'warning' | 'critical', channel: string, message: string, title: string, cooldownHours: number = 0) {
  const now = new Date();
  
  // Check cooldown
  const lastLog = db.notification_log
    .filter((n: any) => n.user_id === user_id && n.rule_code === rule_code && n.campaign_id === campaign_id)
    .sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0];

  if (lastLog && lastLog.cooldown_until) {
    if (new Date(lastLog.cooldown_until) > now) {
      return false; // Still in cooldown
    }
  }

  // Record log
  const cooldownEnd = new Date(now.getTime() + cooldownHours * 60 * 60 * 1000);
  db.notification_log.push({
    id: uuidv4(),
    user_id,
    campaign_id,
    rule_code,
    channel,
    sent_at: now.toISOString(),
    cooldown_until: cooldownHours > 0 ? cooldownEnd.toISOString() : null
  });

  // Create actual notification for frontend
  db.notifications.push({
    id: uuidv4(),
    user_id,
    campaign_id,
    type: rule_code,
    severity,
    title,
    message,
    created_at: now.toISOString(),
    is_read: false
  });

  // Delivery layer: If channel === email or telegram, execute external API here (Mocked via console for now)
  if (channel === 'email' || channel === 'telegram') {
    console.log(`[DELIVERY LAYER] Sending ${channel} to User=${user_id}: [${title}] ${message}`);
  }

  return true;
}

export function runNotificationJobs() {
  try {
    const db = initDb(readDb());
    let dbChanged = false;
    const now = new Date();

    // 1. ADVERTISER RULES
    for (const cmp of db.campaigns) {
      if (cmp.status !== 'active') continue;

      const user_id = db.brands.find((b: any) => b.id === cmp.brand_id)?.user_id || cmp.user_id; // Default fallback fallback
      if (!user_id) continue;

      const impressions = cmp.impressions || 0;
      const clicks = cmp.clicks || 0;
      const spent = cmp.spent_total || 0;
      const budget = parseFloat(cmp.budget_lifetime || '0');
      const predictedCtr = cmp.score_payload?.predicted_ctr || 0;
      const actualCtr = impressions > 0 ? clicks / impressions : 0;
      const hoursActive = (now.getTime() - new Date(cmp.created_at).getTime()) / (1000 * 60 * 60);

      // Rule: ZERO_IMPRESSIONS (6 hours no impressions)
      if (impressions === 0 && hoursActive > 6) {
        if (triggerNotification(db, user_id, cmp.id, 'ZERO_IMPRESSIONS', 'critical', 'in_app', 
          'Кампания активна, но не получает показов. Возможные причины: очень узкое гео, нет паблишеров в выбранном регионе, минимальный бюджет ниже рыночного CPM. Рекомендуем расширить гео или поднять ставку.', 
          `Нет показов: ${cmp.name}`, 6)) dbChanged = true;
      }

      // Rule: LOW_CTR (< 40% of predicted after 2000 imps)
      if (impressions > 2000 && actualCtr < (predictedCtr * 0.4)) {
        if (triggerNotification(db, user_id, cmp.id, 'LOW_CTR', 'warning', 'email', 
          'Ваш баннер получает мало кликов. Возможные причины: баннер не выделяется на фоне контента, CTA неочевидный, аудитория не совпадает с форматом. Рекомендуем: загрузить новый креатив или сузить аудиторию до более целевого сегмента.', 
          `Низкий CTR: ${cmp.name}`, 24)) dbChanged = true;
      }

      // Rule: BUDGET_50 and BUDGET_80
      if (budget > 0) {
        const spentPercent = spent / budget;
        if (spentPercent >= 0.8) {
          if (triggerNotification(db, user_id, cmp.id, 'BUDGET_80', 'warning', 'email', 
            `Потрачено 80% бюджета кампании (${spent}$ из ${budget}$). Будьте готовы к завершению показов.`, 
            `Бюджет исчерпывается: ${cmp.name}`, 9999)) dbChanged = true; // Infinity cooldown practically
        } else if (spentPercent >= 0.5) {
          if (triggerNotification(db, user_id, cmp.id, 'BUDGET_50', 'info', 'in_app', 
            `Потрачена половина бюджета кампании (${spent}$ из ${budget}$). Показатели в норме.`, 
            `Половина бюджета пройдена: ${cmp.name}`, 9999)) dbChanged = true;
        }
      }

      // Rule: PERFORMANCE_GOOD (CTR > 140% of predicted after 1000 imps)
      if (impressions > 1000 && actualCtr > (predictedCtr * 1.4)) {
        if (triggerNotification(db, user_id, cmp.id, 'PERFORMANCE_GOOD', 'info', 'in_app', 
          `CTR кампании (${(actualCtr*100).toFixed(2)}%) значительно выше прогноза! Это отличный креатив, рекомендуем увеличить дневной лимит чтобы охватить больше аудитории.`, 
          `Отличный результат: ${cmp.name}`, 48)) dbChanged = true;
      }
      
      // Rule: NO_CONVERSION_CPA
      const conversions = cmp.conversions || 0;
      if (cmp.strategy === 'cpa' && clicks > 100 && conversions === 0) {
        if (triggerNotification(db, user_id, cmp.id, 'NO_CONVERSION_CPA', 'critical', 'email', 
          'Пользователи кликают, но не конвертируются. Проблема скорее всего на лендинге, а не в рекламе. Проверьте: скорость загрузки страницы, соответствие оффера в баннере и на лендинге, работу формы/кнопки.', 
          `Критично 0 конверсий: ${cmp.name}`, 24)) dbChanged = true;
      }
    }

    if (dbChanged) writeDb(db);
  } catch (err) {
    console.error('Notification jobs failed:', err);
  }
}
