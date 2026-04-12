import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, MousePointer2, Eye, Target, Zap, AlertCircle } from "lucide-react";
import { generatePerformanceData, generatePublisherData, generateGeoData, generateCreativeData } from "@/lib/mock-data";
import { motion } from "framer-motion";

export default function AnalyticsTab() {
  const perfData = generatePerformanceData(14);
  const pubData = generatePublisherData();
  const geoData = generateGeoData();
  const creativeData = generateCreativeData();

  const kpis = [
    { label: 'Показы', value: '124,500', change: '+12%', icon: Eye, trend: 'up' },
    { label: 'Клики', value: '3,840', change: '+8%', icon: MousePointer2, trend: 'up' },
    { label: 'CTR', value: '3.08%', change: '-0.2%', icon: Target, trend: 'down' },
    { label: 'Конверсии', value: '156', change: '+24%', icon: Zap, trend: 'up' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm bg-card transition-hover hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <kpi.icon size={20} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${kpi.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {kpi.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {kpi.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                  <h3 className="text-2xl font-bold mt-1 font-display tracking-tight">{kpi.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Performance Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              Динамика перформанса
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perfData}>
                  <defs>
                    <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorImp)" strokeWidth={2} />
                  <Area type="monotone" dataKey="clicks" stroke="#10b981" fillOpacity={0} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Card */}
        <Card className="border-none shadow-sm bg-primary/5 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
              <Zap size={18} /> AI Insight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-background border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Оптимизация</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Кампания <span className="text-primary font-bold">Summer Promo v2</span> показывает CTR на 40% выше прогнозируемого в регионе Ташкент. Рекомендуем перераспределить 15% бюджета из Ферганы.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-background border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-warning font-bold">
                <AlertCircle size={14} />
                <span className="text-xs uppercase tracking-wider">Внимание</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Частота показов (Frequency) достигла <span className="font-bold">3.2</span>. Пользователи начинают игнорировать баннеры. Обновите креативы до пятницы.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geo Breakdown */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">География (Показы)</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={geoData} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                   <XAxis type="number" hide />
                   <YAxis dataKey="region" type="category" axisLine={false} tickLine={false} width={80} style={{fontSize: '12px', fontWeight: '500'}} />
                   <Tooltip />
                   <Bar dataKey="impressions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>

        {/* Publisher Performance Table */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Топ Площадок</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Площадка</th>
                  <th className="px-6 py-3 text-right">Match</th>
                  <th className="px-6 py-3 text-right">CTR</th>
                  <th className="px-6 py-3 text-right">Конв.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pubData.map((pub) => (
                  <tr key={pub.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold">{pub.name}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-bold">
                        {pub.matchScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{(pub.ctr * 100).toFixed(2)}%</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">{pub.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
