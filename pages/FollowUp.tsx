
import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, Search, ExternalLink, Calendar, Heart } from 'lucide-react';
import { DB } from '../services/db';
import { Customer, Sale, Product } from '../types';

interface FollowUpItem {
  customer: Customer;
  lastSaleDate: string;
  daysSince: number;
  aromaticProfile: string[];
  lastProducts: string[];
}

const FollowUp: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const customers = DB.getCustomers();
    const sales = DB.getSales();
    const products = DB.getProducts();
    const now = new Date();

    const data: FollowUpItem[] = customers.map(customer => {
      const customerSales = sales
        .filter(s => s.customerId === customer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (customerSales.length === 0) return null;

      const lastSale = customerSales[0];
      const lastSaleDate = new Date(lastSale.date);
      const diffTime = Math.abs(now.getTime() - lastSaleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Só mostrar clientes que compraram há mais de 28 dias
      if (diffDays < 28) return null;

      // Análise de Gosto (Categorias mais compradas)
      const categories: Record<string, number> = {};
      const purchasedProducts: string[] = [];

      customerSales.forEach(sale => {
        sale.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            categories[product.category] = (categories[product.category] || 0) + 1;
            if (!purchasedProducts.includes(product.name)) {
              purchasedProducts.push(product.name);
            }
          }
        });
      });

      const profile = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([name]) => name);

      return {
        customer,
        lastSaleDate: lastSale.date,
        daysSince: diffDays,
        aromaticProfile: profile,
        lastProducts: purchasedProducts.slice(0, 3)
      };
    }).filter(Boolean) as FollowUpItem[];

    setFollowUps(data.sort((a, b) => b.daysSince - a.daysSince));
  }, []);

  const filtered = followUps.filter(f => 
    f.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Acompanhamento</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Clientes sem compras há mais de 28 dias.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar por cliente..." 
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:ring-1 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-md flex flex-col shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase truncate">{item.customer.name}</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold uppercase mt-0.5">
                  <Clock size={12} />
                  {item.daysSince} dias sem comprar
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded text-[9px] font-black uppercase text-slate-500 dark:text-slate-400">
                <Calendar size={10} />
                {new Date(item.lastSaleDate).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Perfil Aromático</label>
                <div className="flex flex-wrap gap-1">
                  {item.aromaticProfile.map(cat => (
                    <span key={cat} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase rounded-sm border border-indigo-100 dark:border-indigo-800/50">
                      {cat}
                    </span>
                  ))}
                  {item.aromaticProfile.length === 0 && <span className="text-[10px] italic text-slate-400">Sem dados</span>}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Últimas Compras</label>
                <div className="space-y-1">
                  {item.lastProducts.map((p, i) => (
                    <div key={i} className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Heart size={8} className="text-rose-400" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t dark:border-slate-800">
              <button 
                onClick={() => {
                  const msg = `Olá ${item.customer.name.split(' ')[0]}, tudo bem? Notei que sua última fragrância conosco foi há algum tempo. Como está sendo sua experiência com o ${item.lastProducts[0] || 'nosso perfume'}? Temos novidades na linha ${item.aromaticProfile[0] || 'floral'} que você vai adorar!`;
                  const url = `https://wa.me/${item.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
                  window.open(url, '_blank');
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
              >
                <MessageCircle size={14} />
                Enviar Mensagem
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
            <div className="mb-2 flex justify-center text-slate-300 dark:text-slate-700">
              <MessageCircle size={48} />
            </div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-widest">Nenhum cliente precisa de acompanhamento hoje</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUp;
