
import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Calendar, User, CreditCard, ShoppingBag } from 'lucide-react';
import { DB } from '../services/db.ts';
import { Sale, PaymentMethod } from '../types.ts';

const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    setSales(DB.getSales().reverse());
  }, []);

  const filteredSales = sales.filter(s => 
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH: return 'Dinheiro';
      case PaymentMethod.PIX: return 'PIX';
      case PaymentMethod.CREDIT_CARD: return 'Cartão de Crédito';
      case PaymentMethod.DEBIT_CARD: return 'Cartão de Débito';
      case PaymentMethod.INSTALLMENTS: return 'Parcelado';
      default: return method;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Histórico de Vendas</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Rastreabilidade completa de transações.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="PESQUISAR POR CLIENTE OU ID DA VENDA..." 
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-[11px] font-bold dark:text-white uppercase tracking-widest"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Data / ID</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pagamento</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Valor Total</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-indigo-900/10 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-tight">{new Date(s.date).toLocaleDateString()}</div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">ID: {s.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase">{s.customerName}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-black uppercase rounded-sm">
                      {getPaymentLabel(s.paymentMethod)} {s.installmentsCount > 1 ? `(${s.installmentsCount}x)` : ''}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-black text-slate-900 dark:text-white text-right">
                    R$ {s.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => setSelectedSale(s)}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-all active:scale-90"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest italic">
                    Nenhuma venda encontrada no histórico.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-md w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-indigo-600" />
                <h2 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Detalhes do Pedido #{selectedSale.id.slice(0, 8)}</h2>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-md border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase mb-1">
                    <User size={12} /> Cliente
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{selectedSale.customerName}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-md border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase mb-1">
                    <Calendar size={12} /> Data
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{new Date(selectedSale.date).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Itens do Pedido</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-md border border-slate-100 dark:border-slate-800/50">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase truncate">{item.productName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{item.quantity} UN x R$ {item.unitPrice.toFixed(2)}</p>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-indigo-400">R$ {item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase mb-0.5">
                    <CreditCard size={12} /> Pagamento
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase">
                    {getPaymentLabel(selectedSale.paymentMethod)} {selectedSale.installmentsCount > 1 ? `${selectedSale.installmentsCount}x` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Total Pago</p>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">R$ {selectedSale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSale(null)}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-md transition-all active:scale-[0.98] shadow-lg"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
