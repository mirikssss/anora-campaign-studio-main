import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { DollarSign, Wallet, TrendingUp, BarChart3, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCampaignStore } from "@/store/campaignStore";

export default function MonetizationTab() {
  const { role } = useCampaignStore();
  const isPublisher = role === 'publisher';

  const revenueData = isPublisher ? [
    { name: 'Мой доход (Net)', value: 4200, color: 'hsl(var(--primary))' },
    { name: 'В процессе', value: 340, color: '#10b981' },
    { name: 'Удержано/Fees', value: 80, color: '#f59e0b' },
  ] : [
    { name: 'Выплата Publisher', value: 3450, color: 'hsl(var(--primary))' },
    { name: 'Комиссия Anora', value: 850, color: '#10b981' },
    { name: 'Налоги/Эквайринг', value: 240, color: '#f59e0b' },
  ];

  const efficiencyData = [
    { name: 'Main site', cost: isPublisher ? 1500 : 120, roas: isPublisher ? 0 : 4.2 },
    { name: 'Blog', cost: isPublisher ? 800 : 450, roas: isPublisher ? 0 : 5.8 },
    { name: 'Mobile App', cost: isPublisher ? 4200 : 890, roas: isPublisher ? 0 : 3.1 },
  ];

  const budget = {
    total: isPublisher ? 15000 : 10000,
    spent: isPublisher ? 6450 : 4200,
    dailyAvg: isPublisher ? 215 : 140,
    projected: isPublisher ? 18000 : 8500,
  };

  const spentPercent = (budget.spent / budget.total) * 100;

  return (
    <div className="space-y-8 pb-20">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet size={120} className="text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{isPublisher ? 'Доход за месяц' : 'Общий Расход'}</CardTitle>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold font-display">${budget.spent.toLocaleString()}</h2>
              <span className="text-sm font-bold text-success flex items-center gap-0.5">
                <ArrowUpRight size={14} /> +12.4%
              </span>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-muted-foreground">Использование бюджета</span>
                <span className="text-foreground">{spentPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${spentPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-primary"
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground pt-1">
                <span>$0</span>
                <span>Лимит: ${budget.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-2xl bg-muted/30">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Средний CPC</p>
                <p className="text-xl font-bold font-display">$0.24</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Прогноз на месяц</p>
                <p className="text-xl font-bold font-display">${budget.projected.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Split */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Распределение</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {revenueData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold">${item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Analysis */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">ROI Анализ по кампаниям</CardTitle>
          <div className="px-2 py-1 rounded bg-success/10 text-success text-[10px] font-bold flex items-center gap-1">
             <TrendingUp size={12} /> ROAS 4.2x
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="cost" fill="hsl(var(--primary)/0.2)" radius={[4, 4, 0, 0]} name="Затраты ($)" />
                <Bar yAxisId="right" dataKey="roas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="ROAS (Value/Spend)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
