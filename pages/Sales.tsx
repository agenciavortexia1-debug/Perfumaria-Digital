
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  UserPlus, 
  Search, 
  Minus, 
  Plus,
  CheckCircle2,
  X,
  Package,
  Sparkles
} from 'lucide-react';
import { DB } from '../services/db.ts';
import { Product, Customer, Sale, PaymentMethod, PaymentStatus, Installment, SaleItem } from '../types.ts';

const Sales: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [installments, setInstallments] = useState(1);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setProducts(DB.getProducts());
    setCustomers(DB.getCustomers());
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return alert('Estoque insuficiente');
      setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i));
    } else {
      if (product.stock <= 0) return alert('Estoque insuficiente');
      setCart([...cart, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price, total: product.price }]);
    }
    setSearchProduct('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.productId === productId) {
        const product = products.find(p => p.id === productId);
        const newQty = Math.max(0, i.quantity + delta);
        if (product && newQty > product.stock) return i;
        return newQty === 0 ? null : { ...i, quantity: newQty, total: newQty * i.unitPrice };
      }
      return i;
    }).filter(Boolean) as SaleItem[]);
  };

  const total = cart.reduce((acc, i) => acc + i.total, 0);

  const handleCheckout = () => {
    if (!selectedCustomer) return alert('Selecione um cliente');
    if (cart.length === 0) return alert('Carrinho vazio');

    const saleId = Math.random().toString(36).substr(2, 9);
    const sale: Sale = {
      id: saleId,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: cart,
      total: total,
      paymentMethod: paymentMethod,
      installmentsCount: installments,
      date: new Date().toISOString()
    };

    const newInstallments: Installment[] = [];
    if (paymentMethod === PaymentMethod.INSTALLMENTS) {
      const amountPerInst = total / installments;
      for (let i = 1; i <= installments; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        newInstallments.push({
          id: Math.random().toString(36).substr(2, 9),
          saleId,
          number: i,
          amount: amountPerInst,
          dueDate: dueDate.toISOString(),
          status: PaymentStatus.PENDING
        });
      }
    }

    DB.addSale(sale, newInstallments);
    setIsSuccess(true);
    setCart([]);
    setSelectedCustomer(null);
    setPaymentMethod(PaymentMethod.CASH);
    setInstallments(1);
    setProducts(DB.getProducts());
  };

  const filteredProducts = searchProduct.length > 0 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchProduct.toLowerCase())
      )
    : [];

  const filteredCustomers = searchCustomer.length > 0 
    ? customers.filter(c => 
        c.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        c.cpf.includes(searchCustomer)
      )
    : [];

  const isIdle = searchProduct.length === 0 && searchCustomer.length === 0 && !selectedCustomer;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
      <div className="lg:col-span-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="w-full pl-9 pr-4 py-3 border dark:border-slate-800 dark:bg-slate-900 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all focus:ring-1 focus:ring-indigo-500 bg-white"
              placeholder="Buscar fragrância ou marca..." 
              value={searchProduct}
              onChange={e => setSearchProduct(e.target.value)}
            />
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="w-full pl-9 pr-4 py-3 border dark:border-slate-800 dark:bg-slate-900 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all focus:ring-1 focus:ring-indigo-500 bg-white"
              placeholder="Localizar cliente pelo nome..." 
              value={searchCustomer}
              onChange={e => setSearchCustomer(e.target.value)}
            />
          </div>
        </div>

        <div className="min-h-[400px] flex flex-col">
          {isIdle ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-md p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-700">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">PDV Pronto para Venda</h3>
              <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed uppercase">Utilize os campos acima para pesquisar produtos ou identificar o cliente e iniciar o atendimento.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(filteredCustomers.length > 0 || selectedCustomer) && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Cliente Selecionado / Encontrado</label>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-md border dark:border-slate-800 flex flex-wrap gap-2 shadow-sm">
                    {selectedCustomer ? (
                      <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg animate-in zoom-in-95 duration-200">
                        <UserPlus size={14} />
                        {selectedCustomer.name}
                        <button onClick={() => {setSelectedCustomer(null); setSearchCustomer('');}} className="ml-2 hover:text-rose-200"><X size={14} /></button>
                      </div>
                    ) : (
                      filteredCustomers.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => {setSelectedCustomer(c); setSearchCustomer('');}}
                          className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500 hover:text-white text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          {c.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {searchProduct.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Resultados da Busca de Produtos</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredProducts.map(p => (
                      <button 
                        key={p.id} 
                        disabled={p.stock <= 0}
                        onClick={() => addToCart(p)}
                        className={`group p-4 rounded-md border dark:border-slate-800 bg-white dark:bg-slate-900 text-left transition-all hover:border-indigo-500 ${p.stock <= 0 ? 'opacity-40 grayscale' : 'shadow-md hover:shadow-lg active:scale-95'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-slate-800 dark:text-slate-100 text-xs truncate uppercase tracking-tight">{p.name}</h4>
                          <span className="text-indigo-600 dark:text-indigo-400 font-black text-xs">R$ {p.price.toFixed(0)}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mb-4 uppercase font-bold tracking-widest">{p.brand} | {p.ml}ML</p>
                        <div className="flex items-center justify-between mt-auto">
                           <span className={`text-[9px] px-2 py-0.5 font-black uppercase rounded-sm ${p.stock <= p.minStock ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
                            Estoque: {p.stock}
                          </span>
                          <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-1 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Plus size={14} />
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-md border border-dashed">
                        <Package size={24} className="mx-auto mb-2 opacity-30" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma fragrância encontrada para "{searchProduct}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col h-[calc(100vh-140px)] sticky top-6">
        <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] flex items-center gap-2">
            <ShoppingCart size={16} />
            PDV / Carrinho
          </h2>
          <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-sm text-[10px] font-black">{cart.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.productId} className="flex gap-3 items-center border-b dark:border-slate-800 pb-4 last:border-0 animate-in slide-in-from-right-4 duration-200">
              <div className="flex-1 min-w-0">
                <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight">{item.productName}</h5>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 rounded px-1.5 py-0.5">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:text-indigo-600 transition-colors"><Minus size={12} /></button>
                    <span className="text-[11px] font-black w-4 text-center dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:text-indigo-600 transition-colors"><Plus size={12} /></button>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">R$ {item.unitPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-slate-900 dark:text-white">R$ {item.total.toFixed(2)}</div>
                <button onClick={() => updateQuantity(item.productId, -item.quantity)} className="text-rose-500 hover:text-rose-600 text-[9px] uppercase font-black tracking-widest mt-1">Excluir</button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-200 dark:text-slate-800 space-y-3 py-20">
              <ShoppingCart size={48} strokeWidth={1} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Carrinho Vazio</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t dark:border-slate-800 space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Método de Pagamento</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: PaymentMethod.CASH, label: 'Dinheiro' },
                { id: PaymentMethod.PIX, label: 'PIX' },
                { id: PaymentMethod.CREDIT_CARD, label: 'Cartão' },
                { id: PaymentMethod.INSTALLMENTS, label: 'Parcelado' },
              ].map(method => (
                <button 
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`py-2.5 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${paymentMethod === method.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-indigo-500'}`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === PaymentMethod.INSTALLMENTS && (
            <div className="space-y-1.5 animate-in slide-in-from-bottom-2 duration-200">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Plano de Parcelamento</label>
              <select 
                value={installments} 
                onChange={e => setInstallments(Number(e.target.value))}
                className="w-full p-2.5 rounded-md border dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-black uppercase tracking-widest dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {[2,3,4,5,6,10,12].map(n => <option key={n} value={n}>{n}x de R$ {(total/n).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between py-3 border-t border-dashed dark:border-slate-700">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Total Geral</span>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          <button 
            disabled={cart.length === 0 || !selectedCustomer}
            onClick={handleCheckout}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale text-white rounded-md text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Finalizar Venda
            <CheckCircle2 size={16} />
          </button>
        </div>
      </div>

      {isSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="text-center text-white p-8 max-w-sm">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Pedido Concluído</h2>
            <p className="text-slate-400 mb-10 text-[10px] font-black uppercase tracking-widest leading-loose">A transação foi registrada com sucesso e o estoque foi atualizado automaticamente.</p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="w-full bg-white text-indigo-950 px-8 py-3 rounded-md font-black uppercase text-[10px] tracking-[0.3em] hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
            >
              Próxima Venda
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
