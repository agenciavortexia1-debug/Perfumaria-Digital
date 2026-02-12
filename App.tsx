
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  ShoppingBag,
  Clock, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Box,
  MessageSquare,
  BarChart3,
  History
} from 'lucide-react';

import Dashboard from './pages/Dashboard.tsx';
import Customers from './pages/Customers.tsx';
import Inventory from './pages/Inventory.tsx';
import Sales from './pages/Sales.tsx';
import Receivables from './pages/Receivables.tsx';
import FollowUp from './pages/FollowUp.tsx';
import KPI from './pages/KPI.tsx';
import SalesHistory from './pages/SalesHistory.tsx';

const NavItem: React.FC<{ 
  to: string; 
  icon: any; 
  label: string; 
  active: boolean; 
  collapsed: boolean;
  onClick?: () => void 
}> = ({ to, icon: Icon, label, active, collapsed, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-600'
    }`}
    title={collapsed ? label : ''}
  >
    <Icon size={20} className="flex-shrink-0" />
    {!collapsed && <span className="font-black text-[10px] uppercase tracking-[0.15em] whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
  </Link>
);

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ef_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ef_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ef_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navigation = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/kpi', icon: BarChart3, label: 'Desempenho' },
    // Fix: Using ShoppingBag icon which is now imported
    { to: '/vendas', icon: ShoppingBag, label: 'PDV' },
    { to: '/historico', icon: History, label: 'Histórico' },
    { to: '/produtos', icon: Package, label: 'Estoque' },
    { to: '/clientes', icon: Users, label: 'Clientes' },
    { to: '/acompanhamento', icon: MessageSquare, label: 'Feedbacks' },
    { to: '/receber', icon: Clock, label: 'Contas' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Header Mobile */}
      <header className="md:hidden bg-[#0f172a] border-b border-slate-800 px-5 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Box className="text-indigo-500" size={24} />
          <span className="font-black text-lg tracking-tighter text-white uppercase italic">Perfumaria Digital</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-white transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={toggleMenu} className="p-2 text-slate-400 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-all duration-400
        md:relative md:translate-x-0
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        ${isMenuOpen ? 'translate-x-0 w-[280px] shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className={`p-5 border-b border-slate-800 flex items-center bg-[#0f172a] text-white transition-all ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
           <div className="flex items-center gap-2">
            <Box className="text-indigo-500 flex-shrink-0" size={24} />
            {!isCollapsed && <span className="font-black text-lg uppercase italic tracking-tighter">Perfumaria Digital</span>}
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-white">
            <X size={22}/>
          </button>
        </div>
        
        <nav className="px-4 space-y-2 mt-6">
          {navigation.map((item) => (
            <NavItem 
              key={item.to} 
              to={item.to}
              icon={item.icon}
              label={item.label}
              collapsed={isCollapsed}
              active={location.pathname === item.to}
              onClick={() => setIsMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-4 space-y-2">
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-widest">{isDarkMode ? 'Modo Dia' : 'Modo Noite'}</span>}
          </button>
          <button 
            onClick={toggleSidebar}
            className={`hidden md:flex w-full items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /><span className="font-black text-[10px] uppercase tracking-widest">Recolher</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-screen-ios">
        <div className="max-w-7xl mx-auto p-4 md:p-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendas" element={<Sales />} />
            <Route path="/historico" element={<SalesHistory />} />
            <Route path="/produtos" element={<Inventory />} />
            <Route path="/clientes" element={<Customers />} />
            <Route path="/receber" element={<Receivables />} />
            <Route path="/acompanhamento" element={<FollowUp />} />
            <Route path="/kpi" element={<KPI />} />
          </Routes>
        </div>
      </main>

      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default () => (
  <Router>
    <App />
  </Router>
);
