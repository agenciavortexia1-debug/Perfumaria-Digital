
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, User, X, Mail, Phone, Hash } from 'lucide-react';
import { DB } from '../services/db';
import { Customer } from '../types';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(DB.getCustomers());
  }, []);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const customerData: Customer = {
      id: editingCustomer?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      cpf: formData.get('cpf') as string,
      address: formData.get('address') as string,
      createdAt: editingCustomer?.createdAt || new Date().toISOString()
    };

    let updated;
    if (editingCustomer) {
      updated = customers.map(c => c.id === editingCustomer.id ? customerData : c);
    } else {
      updated = [...customers, customerData];
    }

    setCustomers(updated);
    DB.saveCustomers(updated);
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir registro de cliente?')) {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      DB.saveCustomers(updated);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Base de dados e relacionamento.</p>
        </div>
        <button 
          onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
        >
          <Plus size={18} />
          Cadastrar Cliente
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="PESQUISAR POR NOME OU CPF..." 
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-[11px] font-black dark:text-white uppercase tracking-widest shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 hover:shadow-lg transition-all relative group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <User size={24} />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-[11px] uppercase tracking-tighter truncate leading-tight">{c.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                   <Mail size={10} />
                   <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">{c.email}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2.5 mb-6">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Hash size={12} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Documento</span>
                </div>
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">{c.cpf}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Telefone</span>
                </div>
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">{c.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditingCustomer(c); setIsModalOpen(true); }} className="flex-1 py-2 text-[9px] font-black uppercase tracking-widest text-white bg-indigo-600 rounded hover:bg-indigo-700 shadow-md">Editar</button>
              <button onClick={() => handleDelete(c.id)} className="p-2 text-rose-600 bg-rose-50 dark:bg-rose-900/20 rounded hover:bg-rose-100 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em]">{editingCustomer ? 'Editar Ficha' : 'Novo Cliente'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nome Completo</label>
                <input required name="name" defaultValue={editingCustomer?.name} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs font-black dark:text-white outline-none uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">CPF / Documento</label>
                  <input required name="cpf" defaultValue={editingCustomer?.cpf} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-black dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Telefone</label>
                  <input required name="phone" defaultValue={editingCustomer?.phone} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-black dark:text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">E-mail</label>
                <input required type="email" name="email" defaultValue={editingCustomer?.email} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-black dark:text-white outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Endereço Completo</label>
                <textarea name="address" defaultValue={editingCustomer?.address} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-black dark:text-white outline-none h-24" />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 border dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
