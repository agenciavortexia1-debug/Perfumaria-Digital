
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  INSTALLMENTS = 'INSTALLMENTS'
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string; // Amadeirado, Floral, etc.
  ml: number;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  description: string;
}

export interface Installment {
  id: string;
  saleId: string;
  number: number;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidAt?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  installmentsCount: number;
  date: string;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalToReceive: number;
  lowStockItems: number;
  salesData: { date: string; value: number }[];
  categoryDistribution: { name: string; value: number }[];
}
