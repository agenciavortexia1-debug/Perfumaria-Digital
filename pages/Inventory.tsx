
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, X } from 'lucide-react';
import { DB } from '../services/db.ts';
import { Product } from '../types.ts';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(DB.getProducts());
  }, []);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      category: formData.get('category') as string,
      ml: Number(formData.get('ml')),
      price: Number(formData.get('price')),
      cost: Number(formData.get('cost')),
      stock: Number(formData.get('stock')),
      minStock: Number(formData.get('minStock')),
      description: formData.get('description') as string,
    };

    let updated;
    if (editingProduct) {
      updated = products.map(p => p.id === editingProduct.id ? productData : p);
    } else {
      updated = [...products, productData];
    }

    setProducts(updated);
    DB.saveProducts(updated);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este produto?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      DB.saveProducts(updated);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Estoque</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Controle de SKUs e Disponibilidade.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
        >
          <Plus size={16} />
          Novo Registro
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="PESQUISAR PRODUTO OU MARCA..." 
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-[11px] font-black dark:text-white uppercase tracking-widest shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Fragrância</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Marca / Família</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Preço</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Qtd</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-900 dark:text-slate-100 text-[11px] uppercase tracking-tighter">{p.name}</div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase">{p.ml}ML</div>
                  </td>
                  <td className="px-6 py-5 text-[10px] text-slate-600 dark:text-slate-400">
                    <div className="font-black uppercase tracking-tighter">{p.brand}</div>
                    <div className="text-[9px] opacity-70 italic font-bold">{p.category}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-black ${p.stock <= p.minStock ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {p.stock}
                      {p.stock <= p.minStock && <AlertCircle size={10} />}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em]">{editingProduct ? 'Editar SKU' : 'Novo Registro'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nome da Fragrância</label>
                <input required name="name" defaultValue={editingProduct?.name} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs font-black dark:text-white outline-none uppercase" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Marca</label>
                <input required name="brand" defaultValue={editingProduct?.brand} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs font-black dark:text-white outline-none uppercase" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Família Olfativa</label>
                <select name="category" defaultValue={editingProduct?.category} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs font-black dark:text-white outline-none uppercase">
                  <option>Amadeirado</option>
                  <option>Floral</option>
                  <option>Cítrico</option>
                  <option>Oriental</option>
                  <option>Fougère</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6 md:col-span-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Volume (ml)</label>
                  <input required type="number" name="ml" defaultValue={editingProduct?.ml} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-black dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Estoque Inicial</label>
                  <input required type="number" name="stock" defaultValue={editingProduct?.stock} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-black dark:text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Preço Custo (R$)</label>
                <input required type="number" step="0.01" name="cost" defaultValue={editingProduct?.cost} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs font-black dark:text-white outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Preço Venda (R$)</label>
                <input required type="number" step="0.01" name="price" defaultValue={editingProduct?.price} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-1 focus:ring-indigo-500 text-xs font-black dark:text-white outline-none" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-8 mt-4 border-t dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                <button type="submit" className="px-10 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md hover:bg-indigo-700 transition-all shadow-xl active:scale-95">Salvar SKU</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
