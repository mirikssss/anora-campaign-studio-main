// Time-series performance data
export interface PerformanceData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

// Publisher metrics
export interface PublisherData {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  matchScore: number;
}

// Creative performance
export interface CreativeData {
  id: string;
  name: string;
  format: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
}

// Geographic breakdown
export interface GeoData {
  region: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export const generatePerformanceData = (days: number): PerformanceData[] => {
  const data: PerformanceData[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      impressions: Math.floor(Math.random() * 5000) + 2000,
      clicks: Math.floor(Math.random() * 200) + 50,
      conversions: Math.floor(Math.random() * 20) + 5,
      spend: Math.random() * 100 + 20,
      revenue: Math.random() * 200 + 50,
    });
  }
  return data;
};

export const generatePublisherData = (): PublisherData[] => [
  { name: 'Kun.uz', impressions: 45000, clicks: 1200, conversions: 45, spend: 320, ctr: 0.026, matchScore: 94 },
  { name: 'Olmazor.uz', impressions: 12000, clicks: 450, conversions: 12, spend: 85, ctr: 0.037, matchScore: 88 },
  { name: 'Gazeta.uz', impressions: 28000, clicks: 620, conversions: 18, spend: 190, ctr: 0.022, matchScore: 91 },
  { name: 'Daryo.uz', impressions: 31000, clicks: 840, conversions: 22, spend: 210, ctr: 0.027, matchScore: 85 },
];

export const generateCreativeData = (): CreativeData[] => [
  { id: '1', name: 'Summer Promo v1', format: '300x250', impressions: 15000, clicks: 450, ctr: 0.03, conversions: 12 },
  { id: '2', name: 'Summer Promo v2 (AI)', format: '728x90', impressions: 22000, clicks: 880, ctr: 0.04, conversions: 28 },
  { id: '3', name: 'Retargeting Card', format: 'auto', impressions: 8000, clicks: 320, ctr: 0.04, conversions: 15 },
];

export const generateGeoData = (): GeoData[] => [
  { region: 'Ташкент', impressions: 55000, clicks: 1800, conversions: 65, spend: 450 },
  { region: 'Самарканд', impressions: 22000, clicks: 540, conversions: 18, spend: 180 },
  { region: 'Фергана', impressions: 18000, clicks: 420, conversions: 12, spend: 140 },
  { region: 'Бухара', impressions: 12000, clicks: 280, conversions: 8, spend: 95 },
];
