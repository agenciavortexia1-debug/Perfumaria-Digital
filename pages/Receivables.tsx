
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';
import { DB } from '../services/db';
import { Installment, PaymentStatus, Sale } from '../types';

const Receivables: React.FC = () => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setInstallments(DB.getInstallments());
    setSales(DB.getSales());
  }, []);

  const handlePay = (id: string) => {
    if (confirm('Confirmar recebimento de parcela?')) {
      DB.payInstallment(id);
      setInstallments(DB.getInstallments());
    }
  };

  const filtered = installments.filter(inst => {
    const sale = sales.find(s => s.id === inst.saleId);
    if (!sale) return false;
    return sale.customerName.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getStatusBadge = (status: PaymentStatus, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== PaymentStatus.PAID;
    
    if (status === PaymentStatus.PAID) {
      return <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest"><CheckCircle size={10}/> Recebido</span>;
    }
    if (isOverdue) {
      return <span className="flex items-center gap-1 text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest"><AlertCircle size={10}/> Atrasado</span>;
    }
    return <span className="flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest"><Clock size={10}/> Aberto</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Conciliação Financeira</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Controle de recebíveis e parcelas em aberto.</p>
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

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Titular / Pedido</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Parcela</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vencimento</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Valor</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(inst => {
                const sale = sales.find(s => s.id === inst.saleId);
                return (
                  <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase">{sale?.customerName}</div>
                      <div className="text-[9px] text-slate-400 font-medium">REF: {inst.saleId.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-400 font-bold text-center">
                      {inst.number}ª
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-400">
                      {new Date(inst.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white text-xs">
                      R$ {inst.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(inst.status, inst.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inst.status !== PaymentStatus.PAID && (
                        <button 
                          onClick={() => handlePay(inst.id)}
                          className="bg-indigo-600 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition-colors"
                        >
                          Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Sem lançamentos pendentes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Receivables;
