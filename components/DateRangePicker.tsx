
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  onApply: (range: DateRange) => void;
  initialRange?: DateRange;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onApply, initialRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(initialRange?.start || new Date(new Date().setDate(new Date().getDate() - 30)));
  const [tempEnd, setTempEnd] = useState(initialRange?.end || new Date());
  const [viewDate, setViewDate] = useState(new Date());
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 0, 0);
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(selectedDate);
      setTempEnd(undefined as any);
    } else if (selectedDate < tempStart) {
      setTempStart(selectedDate);
    } else {
      const endWithTime = new Date(selectedDate);
      endWithTime.setHours(23, 59, 59);
      setTempEnd(endWithTime);
    }
  };

  const isSelected = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (tempStart && d.getTime() === new Date(tempStart.getFullYear(), tempStart.getMonth(), tempStart.getDate()).getTime()) return true;
    if (tempEnd && d.getTime() === new Date(tempEnd.getFullYear(), tempEnd.getMonth(), tempEnd.getDate()).getTime()) return true;
    return false;
  };

  const isInRange = (day: number) => {
    if (!tempStart || !tempEnd) return false;
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return d > tempStart && d < tempEnd;
  };

  const renderCalendar = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const selected = isSelected(i);
      const inRange = isInRange(i);
      days.push(
        <button
          key={i}
          type="button"
          onClick={() => handleDateClick(i)}
          className={`h-9 w-full text-[10px] font-black transition-all rounded-sm flex items-center justify-center
            ${selected ? 'bg-indigo-600 text-white shadow-lg z-10' : 
              inRange ? 'bg-indigo-500/20 text-indigo-400' : 
              'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm hover:border-indigo-500 transition-all group"
      >
        <Calendar size={16} className="text-indigo-500" />
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
          <span>{formatDate(tempStart)}</span>
          <ChevronRight size={12} className="text-slate-400" />
          <span>{formatDate(tempEnd || tempStart)}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="text-slate-400 hover:text-slate-600">
              <ChevronLeft size={18} />
            </button>
            <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em]">
              {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </h4>
            <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="text-slate-400 hover:text-slate-600">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D','S','T','Q','Q','S','S'].map(d => (
                <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>

          <div className="p-4 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  <Clock size={10} /> Início
                </label>
                <input 
                  type="time" 
                  className="w-full bg-white dark:bg-slate-950 border dark:border-slate-800 rounded px-2 py-1.5 text-xs font-black dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" 
                  value={`${tempStart.getHours().toString().padStart(2,'0')}:${tempStart.getMinutes().toString().padStart(2,'0')}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':');
                    const d = new Date(tempStart);
                    d.setHours(parseInt(h), parseInt(m));
                    setTempStart(d);
                  }}
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  <Clock size={10} /> Fim
                </label>
                <input 
                  type="time" 
                  className="w-full bg-white dark:bg-slate-950 border dark:border-slate-800 rounded px-2 py-1.5 text-xs font-black dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" 
                  value={`${tempEnd?.getHours().toString().padStart(2,'0')}:${tempEnd?.getMinutes().toString().padStart(2,'0')}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':');
                    const d = new Date(tempEnd || tempStart);
                    d.setHours(parseInt(h), parseInt(m));
                    setTempEnd(d);
                  }}
                />
              </div>
            </div>

            <button 
              type="button"
              onClick={() => {
                onApply({ start: tempStart, end: tempEnd || tempStart });
                setIsOpen(false);
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Check size={14} />
              Aplicar Período
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
