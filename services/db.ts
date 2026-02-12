
import { Customer, Product, Sale, Installment, PaymentStatus, PaymentMethod } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'ef_customers',
  PRODUCTS: 'ef_products',
  SALES: 'ef_sales',
  INSTALLMENTS: 'ef_installments',
  INITIALIZED: 'ef_initialized'
};

const get = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const set = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Função para gerar datas relativas
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const DB = {
  getCustomers: () => get<Customer[]>(STORAGE_KEYS.CUSTOMERS, []),
  saveCustomers: (data: Customer[]) => set(STORAGE_KEYS.CUSTOMERS, data),
  
  getProducts: () => get<Product[]>(STORAGE_KEYS.PRODUCTS, []),
  saveProducts: (data: Product[]) => set(STORAGE_KEYS.PRODUCTS, data),
  
  getSales: () => get<Sale[]>(STORAGE_KEYS.SALES, []),
  saveSales: (data: Sale[]) => set(STORAGE_KEYS.SALES, data),
  
  getInstallments: () => get<Installment[]>(STORAGE_KEYS.INSTALLMENTS, []),
  saveInstallments: (data: Installment[]) => set(STORAGE_KEYS.INSTALLMENTS, data),

  addSale: (sale: Sale, installments: Installment[]) => {
    const sales = DB.getSales();
    const insts = DB.getInstallments();
    const products = DB.getProducts();

    // Update stock
    const updatedProducts = products.map(p => {
      const item = sale.items.find(i => i.productId === p.id);
      if (item) {
        return { ...p, stock: p.stock - item.quantity };
      }
      return p;
    });

    DB.saveSales([...sales, sale]);
    DB.saveInstallments([...insts, ...installments]);
    DB.saveProducts(updatedProducts);
  },

  payInstallment: (installmentId: string) => {
    const insts = DB.getInstallments();
    const updated = insts.map(i => 
      i.id === installmentId 
        ? { ...i, status: PaymentStatus.PAID, paidAt: new Date().toISOString() } 
        : i
    );
    DB.saveInstallments(updated);
  },

  seed: () => {
    if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) return;

    const sampleProducts: Product[] = [
      { id: 'p1', name: 'Eternity Blue', brand: 'Calvin Klein', category: 'Cítrico', ml: 100, price: 450, cost: 210, stock: 15, minStock: 5, description: '' },
      { id: 'p2', name: 'Sauvage Elixir', brand: 'Dior', category: 'Amadeirado', ml: 60, price: 890, cost: 420, stock: 3, minStock: 5, description: '' },
      { id: 'p3', name: 'Good Girl', brand: 'Carolina Herrera', category: 'Floral', ml: 80, price: 620, cost: 310, stock: 12, minStock: 4, description: '' },
      { id: 'p4', name: 'Bleu de Chanel', brand: 'Chanel', category: 'Amadeirado', ml: 100, price: 750, cost: 380, stock: 8, minStock: 3, description: '' },
      { id: 'p5', name: 'La Vie Est Belle', brand: 'Lancôme', category: 'Oriental', ml: 75, price: 580, cost: 270, stock: 2, minStock: 5, description: '' },
    ];

    const sampleCustomers: Customer[] = [
      { id: 'c1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 98888-7777', cpf: '123.456.789-00', address: 'Rua das Flores, 123', createdAt: daysAgo(60) },
      { id: 'c2', name: 'Maria Oliveira', email: 'maria@email.com', phone: '(11) 97777-6666', cpf: '987.654.321-11', address: 'Av. Paulista, 1500', createdAt: daysAgo(45) },
      { id: 'c3', name: 'Carlos Souza', email: 'carlos@email.com', phone: '(21) 96666-5555', cpf: '456.789.123-22', address: 'Rua Copacabana, 45', createdAt: daysAgo(30) },
      { id: 'c4', name: 'Ana Santos', email: 'ana@email.com', phone: '(31) 95555-4444', cpf: '321.654.987-33', address: 'Praça da Liberdade, 10', createdAt: daysAgo(10) },
    ];

    const sampleSales: Sale[] = [
      {
        id: 's1',
        customerId: 'c1',
        customerName: 'João Silva',
        date: daysAgo(35), // Mais de 28 dias (para aparecer no Acompanhamento)
        paymentMethod: PaymentMethod.CASH,
        installmentsCount: 1,
        total: 450,
        items: [{ productId: 'p1', productName: 'Eternity Blue', quantity: 1, unitPrice: 450, total: 450 }]
      },
      {
        id: 's2',
        customerId: 'c2',
        customerName: 'Maria Oliveira',
        date: daysAgo(15),
        paymentMethod: PaymentMethod.INSTALLMENTS,
        installmentsCount: 3,
        total: 1240,
        items: [
          { productId: 'p3', productName: 'Good Girl', quantity: 2, unitPrice: 620, total: 1240 }
        ]
      },
      {
        id: 's3',
        customerId: 'c3',
        customerName: 'Carlos Souza',
        date: daysAgo(5),
        paymentMethod: PaymentMethod.PIX,
        installmentsCount: 1,
        total: 890,
        items: [{ productId: 'p2', productName: 'Sauvage Elixir', quantity: 1, unitPrice: 890, total: 890 }]
      },
      {
        id: 's4',
        customerId: 'c4',
        customerName: 'Ana Santos',
        date: daysAgo(1),
        paymentMethod: PaymentMethod.CREDIT_CARD,
        installmentsCount: 1,
        total: 750,
        items: [{ productId: 'p4', productName: 'Bleu de Chanel', quantity: 1, unitPrice: 750, total: 750 }]
      }
    ];

    const sampleInstallments: Installment[] = [
      { id: 'i1', saleId: 's2', number: 1, amount: 413.33, dueDate: daysAgo(-15), status: PaymentStatus.PAID, paidAt: daysAgo(10) },
      { id: 'i2', saleId: 's2', number: 2, amount: 413.33, dueDate: daysAgo(-45), status: PaymentStatus.PENDING },
      { id: 'i3', saleId: 's2', number: 3, amount: 413.34, dueDate: daysAgo(-75), status: PaymentStatus.PENDING },
    ];

    DB.saveProducts(sampleProducts);
    DB.saveCustomers(sampleCustomers);
    DB.saveSales(sampleSales);
    DB.saveInstallments(sampleInstallments);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};
