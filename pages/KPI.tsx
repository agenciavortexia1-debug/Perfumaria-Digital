
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  BarChart3,
  Award,
  Wallet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList,
  PieChart,
  Pie
} from 'recharts';
import { DB } from '../services/db.ts';
import { PaymentMethod } from '../types.ts';
import DateRangePicker from '../components/DateRangePicker.tsx';

const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill={fill} 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-[8px] md:text-[9px] font-black uppercase tracking-tighter italic"
    >
      {`${name}: ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const KPI: React.FC = () => {
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().setDate(new Date().getDate() - 30)), 
    end: new Date() 
  });
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const allSales = DB.getSales();
    const products = DB.getProducts();

    const sales = allSales.filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= dateRange.start && saleDate <= dateRange.end;
    });

    let totalRevenue = 0;
    let totalCost = 0;
    
    sales.forEach(sale => {
      totalRevenue += sale.total;
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          totalCost += (product.cost * item.quantity);
        }
      });
    });

    const netProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const categoryStats: Record<string, { revenue: number, units: number, salesCount: number }> = {};
    sales.forEach(sale => {
      const saleCategoriesInThisSale = new Set();
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (!categoryStats[product.category]) {
            categoryStats[product.category] = { revenue: 0, units: 0, salesCount: 0 };
          }
          categoryStats[product.category].revenue += item.total;
          categoryStats[product.category].units += item.quantity;
          saleCategoriesInThisSale.add(product.category);
        }
      });
      saleCategoriesInThisSale.forEach(cat => {
        categoryStats[cat as string].salesCount += 1;
      });
    });

    const categoryData = Object.entries(categoryStats).map(([name, stats]) => ({
      name,
      ...stats
    })).sort((a, b) => b.revenue - a.revenue);

    const paymentStats: Record<string, { revenue: number, count: number }> = {
      [PaymentMethod.CASH]: { revenue: 0, count: 0 },
      [PaymentMethod.PIX]: { revenue: 0, count: 0 },
      [PaymentMethod.CREDIT_CARD]: { revenue: 0, count: 0 },
      [PaymentMethod.INSTALLMENTS]: { revenue: 0, count: 0 },
      [PaymentMethod.DEBIT_CARD]: { revenue: 0, count: 0 },
    };

    sales.forEach(sale => {
      if(paymentStats[sale.paymentMethod]) {
        paymentStats[sale.paymentMethod].revenue += sale.total;
        paymentStats[sale.paymentMethod].count += 1;
      }
    });

    const paymentData = Object.entries(paymentStats)
      .filter(([_, stats]) => stats.count > 0)
      .map(([method, stats]) => ({
        name: method === PaymentMethod.CASH ? 'Dinheiro' : 
              method === PaymentMethod.PIX ? 'PIX' : 
              method === PaymentMethod.CREDIT_CARD ? 'Cartão de Crédito' : 
              method === PaymentMethod.INSTALLMENTS ? 'Parcelado' : 'Cartão de Débito',
        revenue: stats.revenue,
        count: stats.count
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const productStats: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        productStats[item.productName] = (productStats[item.productName] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productStats)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

    const diffDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const historyData = Array.from({ length: diffDays || 1 }).map((_, i) => {
      const d = new Date(dateRange.start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const daySales = sales.filter(s => s.date.startsWith(dateStr));
      
      const revenue = daySales.reduce((acc, s) => acc + s.total, 0);
      let cost = 0;
      daySales.forEach(s => {
        s.items.forEach(item => {
          const p = products.find(prod => prod.id === item.productId);
          if (p) cost += (p.cost * item.quantity);
        });
      });

      return {
        date: dateStr.split('-')[2] + '/' + dateStr.split('-')[1],
        receita: revenue,
        lucro: revenue - cost
      };
    });

    setData({
      totalRevenue,
      netProfit,
      profitMargin,
      averageTicket,
      categoryData,
      paymentData,
      topProducts,
      history: historyData
    });
  }, [dateRange]);

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Desempenho de Negócio</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Indicadores Estratégicos.</p>
        </div>
        <DateRangePicker onApply={setDateRange} initialRange={dateRange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Faturamento Bruto" value={`R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} trend="+14.2%" positive />
        <KPICard title="Lucro Líquido" value={`R$ ${data.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={TrendingUp} trend="+8.5%" positive />
        <KPICard title="Ticket Médio" value={`R$ ${data.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={Target} trend="-2.1%" positive={false} />
        <KPICard title="Eficiência" value={`${data.profitMargin.toFixed(1)}%`} icon={Award} trend="+5%" positive />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
          <BarChart3 size={16} className="text-indigo-500" />
          Evolução do Período: Receita vs Lucro
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '11px', color: '#fff' }} />
              <Area type="monotone" dataKey="receita" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" />
              <Area type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLucro)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <PieIcon size={16} className="text-amber-500" />
            Vendas por Família Olfativa
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.categoryData} margin={{ left: 20, right: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: '#64748b' }} width={80} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }} 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} 
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.categoryData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList dataKey="revenue" position="right" formatter={(val: number) => `R$ ${val.toFixed(0)}`} style={{ fill: '#64748b', fontSize: '10px', fontWeight: '900' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <Wallet size={16} className="text-indigo-500" />
            Métodos de Pagamento
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.paymentData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={55} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="revenue" 
                  nameKey="name"
                  label={renderCustomizedLabel}
                  labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                >
                  {data.paymentData.map((_: any, index: number) => (
                    <Cell key={`cell-payment-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {data.paymentData.map((item: any, i: number) => (
              <div key={item.name} className="flex flex-col p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase truncate">{item.name}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-black text-slate-900 dark:text-white">R$ {item.revenue.toLocaleString()}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase">{item.count} TRANS.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-500" />
          Top 5 Fragrâncias (Unidades Vendidas)
        </h3>
        <div className="space-y-4">
          {data.topProducts.map((p: any, i: number) => (
            <div key={p.name} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-[10px] font-black rounded-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">{i+1}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{p.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${(p.quantity / data.topProducts[0].quantity) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">{p.quantity} UN</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, trend, positive }: any) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
        <Icon size={18} className="text-slate-600 dark:text-slate-400" />
      </div>
      <div className={`flex items-center gap-0.5 text-[10px] font-black ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </div>
    </div>
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
  </div>
);

export default KPI;
