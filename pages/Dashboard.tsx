
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Calendar as CalendarIcon,
  X,
  ArrowRight,
  History
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { DB } from '../services/db';
import { DashboardStats, Sale } from '../types';
import StatCard from '../components/StatCard';
import DateRangePicker from '../components/DateRangePicker';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().setDate(new Date().getDate() - 30)), 
    end: new Date() 
  });
  const [stats, setStats] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = () => {
      const allSales = DB.getSales();
      const products = DB.getProducts();
      const installments = DB.getInstallments();

      const sales = allSales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate >= dateRange.start && saleDate <= dateRange.end;
      });

      const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
      const totalToReceive = installments
        .filter(i => i.status !== 'PAID')
        .reduce((acc, i) => acc + i.amount, 0);
      const lowStockItems = products.filter(p => p.stock <= p.minStock).length;

      const categories: Record<string, number> = {};
      products.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
      });
      const categoryDistribution = Object.entries(categories).map(([name, value]) => ({ name, value }));

      const daysCount = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
      const displayDays = Math.min(7, daysCount);
      
      const chartData = Array.from({ length: displayDays }).map((_, i) => {
        const d = new Date(dateRange.end);
        d.setDate(d.getDate() - (displayDays - 1 - i));
        const dateStr = d.toISOString().split('T')[0];
        const daySales = sales.filter(s => s.date.startsWith(dateStr));
        return { 
          date: dateStr, 
          value: daySales.length,
          revenue: daySales.reduce((acc, s) => acc + s.total, 0)
        };
      });

      setStats({
        totalSales: sales.length,
        totalRevenue,
        totalToReceive,
        lowStockItems,
        salesData: chartData,
        categoryDistribution,
        rawSales: sales,
        rawInstallments: installments,
        rawProducts: products
      });
    };

    loadData();
  }, [dateRange]);

  if (!stats) return null;

  const weeklySalesData = stats.salesData.filter((d: any) => d.value > 0);

  const getModalContent = () => {
    switch (activeModal) {
      case 'receita':
      case 'volume':
        return {
          title: activeModal === 'receita' ? 'Performance de Vendas' : 'Volume de Transações',
          items: stats.rawSales.slice(-5).reverse().map((s: Sale) => ({
            label: s.customerName,
            sub: new Date(s.date).toLocaleDateString(),
            value: `R$ ${s.total.toFixed(2)}`
          })),
          footerAction: () => navigate('/historico')
        };
      case 'receber':
        return {
          title: 'Parcelas Pendentes',
          items: stats.rawInstallments.filter((i: any) => i.status !== 'PAID').slice(0, 5).map((i: any) => ({
            label: `Parcela ${i.number} - Ref: ${i.saleId.slice(0, 6)}`,
            sub: `Vencimento: ${new Date(i.dueDate).toLocaleDateString()}`,
            value: `R$ ${i.amount.toFixed(2)}`
          })),
          footerAction: () => navigate('/receber')
        };
      case 'estoque':
        return {
          title: 'Alertas de Estoque',
          items: stats.rawProducts.filter((p: any) => p.stock <= p.minStock).map((p: any) => ({
            label: p.name,
            sub: `${p.brand} | ${p.category}`,
            value: `${p.stock} UN`
          })),
          footerAction: () => navigate('/produtos')
        };
      default: return null;
    }
  };

  const modalData = getModalContent();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Painel de Controle</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Monitoramento Operacional.</p>
        </div>
        <DateRangePicker onApply={setDateRange} initialRange={dateRange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Receita no Período" 
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          colorClass="bg-indigo-600"
          onClick={() => setActiveModal('receita')}
        />
        <StatCard 
          label="Contas a Receber" 
          value={`R$ ${stats.totalToReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={CalendarIcon} 
          onClick={() => setActiveModal('receber')}
          colorClass="bg-amber-500"
        />
        <StatCard 
          label="Ruptura de Estoque" 
          value={stats.lowStockItems} 
          icon={Package} 
          onClick={() => setActiveModal('estoque')}
          colorClass="bg-rose-600"
        />
        <StatCard 
          label="Volume de Vendas" 
          value={stats.totalSales} 
          icon={TrendingUp} 
          onClick={() => setActiveModal('volume')}
          colorClass="bg-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">Frequência de Vendas (Quantidade Diária)</h3>
          <div className="h-80 w-full">
            {weeklySalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySalesData} margin={{ top: 25, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => val.split('-')[2]} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: '4px', border: 'none', fontSize: '10px', fontWeight: 'bold' }}
                    formatter={(val) => [`${val} Vendas`]}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={45}>
                    <LabelList 
                      dataKey="value" 
                      position="center" 
                      formatter={(val: number) => `${val} VEND.`}
                      style={{ fill: '#ffffff', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 uppercase font-black text-[10px] tracking-widest italic">Nenhuma venda registrada no período selecionado.</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Mix de Categorias</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
              {stats.categoryDistribution.map((cat: any, i: number) => (
                <div key={cat.name} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-ellipsis overflow-hidden">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-slate-500 dark:text-slate-400 font-black uppercase truncate">{cat.name}</span>
                  </div>
                  <span className="font-black text-slate-900 dark:text-slate-200 ml-2">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeModal && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-900 rounded-md w-full max-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{modalData.title}</h4>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              {modalData.items.length > 0 ? modalData.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase truncate">{item.label}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{item.sub}</p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{item.value}</span>
                </div>
              )) : (
                <p className="text-center py-8 text-[10px] font-black text-slate-400 uppercase">Nenhum dado encontrado.</p>
              )}
              
              <div className="pt-2 flex flex-col gap-2">
                <button 
                  onClick={() => {
                    if(modalData.footerAction) modalData.footerAction();
                    setActiveModal(null);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <History size={14} />
                  Ver Detalhes Completos
                </button>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
