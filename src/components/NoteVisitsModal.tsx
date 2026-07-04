import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Calendar, FileText, Sparkles, Clock, Briefcase, Globe2, Cpu, Tv, Hash } from 'lucide-react';
import { NoteVisitLog } from '../types';

interface NoteVisitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitLogs: NoteVisitLog[];
  onClearAll: () => void;
  onDeleteVisit: (id: string) => void;
  theme?: 'light' | 'dark';
}

const categoryConfigs: Record<string, { gradient: string; text: string; bg: string; icon: any }> = {
  work: { 
    gradient: 'from-blue-400 to-cyan-500', 
    text: 'text-sky-400', 
    bg: 'bg-sky-500/10',
    icon: Briefcase 
  },
  social: { 
    gradient: 'from-pink-400 to-rose-500', 
    text: 'text-rose-400', 
    bg: 'bg-rose-500/10',
    icon: Globe2 
  },
  tools: { 
    gradient: 'from-amber-400 to-orange-500', 
    text: 'text-amber-400', 
    bg: 'bg-amber-500/10',
    icon: Cpu 
  },
  entertainment: { 
    gradient: 'from-purple-400 to-indigo-500', 
    text: 'text-purple-400', 
    bg: 'bg-purple-500/10',
    icon: Tv 
  },
  other: { 
    gradient: 'from-emerald-400 to-teal-500', 
    text: 'text-emerald-400', 
    bg: 'bg-emerald-500/10',
    icon: Hash 
  },
};

export default function NoteVisitsModal({
  isOpen,
  onClose,
  visitLogs,
  onClearAll,
  onDeleteVisit,
  theme = 'dark'
}: NoteVisitsModalProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const isLight = theme === 'light';

  // Filter logs if user types in search
  const filteredLogs = useMemo(() => {
    if (!filterQuery.trim()) return visitLogs;
    const query = filterQuery.toLowerCase();
    return visitLogs.filter(
      (log) =>
        log.title.toLowerCase().includes(query) ||
        log.category.toLowerCase().includes(query)
    );
  }, [visitLogs, filterQuery]);

  // Group filtered results date-wise
  const groupedVisits = useMemo(() => {
    const groups: Record<string, NoteVisitLog[]> = {};
    const todayStr = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    filteredLogs.forEach((log) => {
      const date = new Date(log.timestamp);
      const day = date.toDateString();
      
      let key = '';
      if (day === todayStr) {
        key = 'Today';
      } else if (day === yesterdayStr) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(log);
    });

    return Object.entries(groups).sort((a, b) => {
      const getTimestamp = (keyStr: string) => {
        if (keyStr === 'Today') return Date.now();
        if (keyStr === 'Yesterday') return Date.now() - 24 * 60 * 60 * 1000;
        return new Date(keyStr).getTime() || 0;
      };
      return getTimestamp(b[0]) - getTimestamp(a[0]);
    });
  }, [filteredLogs]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onClose();
              setConfirmClear(false);
            }}
            className="fixed inset-0 bg-[#020205]/75 backdrop-blur-md z-[60] cursor-pointer"
            id="note-visits-modal-backdrop"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[65] pointer-events-none">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              className={`w-full max-w-2xl backdrop-blur-2xl border rounded-3xl p-6 shadow-2xl relative overflow-hidden pointer-events-auto flex flex-col max-h-[85vh] ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0c0c14]/95 border-white/5 text-white'
              }`}
              id="note-visits-modal-content"
            >
              {/* Absorbent decorative blob backplate */}
              <div className="absolute top-[-25%] left-[-25%] w-[60%] h-[60%] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-25%] right-[-25%] w-[60%] h-[60%] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Header Title */}
              <div className="relative flex items-center justify-between mb-6 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <Clock size={18} />
                  </span>
                  <div>
                    <h2 className={`text-lg font-bold tracking-tight text-left ${isLight ? 'text-slate-850' : 'text-white'}`}>Notes Visit Journal</h2>
                    <p className={`text-xs text-left ${isLight ? 'text-slate-500' : 'text-slate-405'}`}>Chronological history of secure note reads, details, and copies</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setConfirmClear(false);
                  }}
                  className={`p-1.5 rounded-full transition-colors border cursor-pointer ${
                    isLight ? 'hover:bg-slate-105 border-slate-200 text-slate-500 hover:text-slate-800' : 'hover:bg-white/10 border-white/5 text-slate-400 hover:text-white'
                  }`}
                  id="btn-close-note-visits-modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Interactive Search and Clear Controls */}
              <div className="relative mb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 shrink-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Search note title or category..."
                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none transition-all ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500/40 focus:bg-white' 
                        : 'bg-slate-950/40 border-white/5 text-white placeholder-slate-500 focus:border-purple-500/30'
                    }`}
                    id="note-visits-search-input"
                  />
                  {filterQuery && (
                    <button
                      onClick={() => setFilterQuery('')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer px-1.5 py-0.5 rounded ${
                        isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-600' : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {visitLogs.length > 0 && (
                  <div className="flex shrink-0">
                    {confirmClear ? (
                      <div className={`flex items-center gap-2 border rounded-xl p-0.5 ${
                        isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-500/10 border-rose-550/30'
                      }`}>
                        <span className="text-[11px] font-semibold text-rose-500 px-2 leading-none">Wipe everything?</span>
                        <button
                          onClick={() => {
                            onClearAll();
                            setConfirmClear(false);
                          }}
                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer leading-none"
                          id="btn-confirm-clear-notes"
                        >
                          Wipe
                        </button>
                        <button
                          onClick={() => setConfirmClear(false)}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer leading-none ${
                            isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmClear(true)}
                        className={`px-4 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isLight 
                            ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600' 
                            : 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-550/20 hover:border-rose-500/40 text-rose-300 hover:text-rose-205'
                        }`}
                        id="btn-clear-note-visits"
                        title="Clear all recorded note visits"
                      >
                        <Trash2 size={13} />
                        Clear All Logs
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Scrollable journal space */}
              <div
                className="relative flex-1 overflow-y-auto pr-1 space-y-6 z-10 custom-scrollbar-thin max-h-[50vh]"
                id="note-visits-journal-scroll"
              >
                {groupedVisits.length > 0 ? (
                  groupedVisits.map(([dateGroupName, logs]) => (
                    <div key={dateGroupName} className="space-y-2.5 text-left">
                      {/* Date Header Tag */}
                      <h3 className={`text-xs font-semibold flex items-center gap-2 sticky top-0 py-1.5 z-10 ${
                        isLight ? 'bg-white text-slate-600' : 'bg-[#0c0c14] text-slate-400'
                      }`}>
                        <Calendar size={12} className="text-purple-400" />
                        <span>{dateGroupName}</span>
                        <span className={`h-px flex-1 ml-2 ${isLight ? 'bg-slate-200' : 'bg-white/5'}`} />
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900/60 border-white/5 text-slate-400'
                        }`}>
                          {logs.length}
                        </span>
                      </h3>

                      {/* Log Rows */}
                      <div className="space-y-2">
                        {logs.map((log) => {
                          const formattedTime = new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          });
                          const config = categoryConfigs[log.category] || categoryConfigs.other;
                          const CategoryIcon = config.icon;

                          return (
                            <div
                              key={log.id}
                              className={`group/item flex items-center justify-between p-3.5 border rounded-2xl transition-all duration-200 ${
                                isLight 
                                  ? 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-200/80 hover:border-slate-300' 
                                  : 'bg-slate-950/20 hover:bg-slate-950/40 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                {/* Time marker */}
                                <span className={`text-[10px] font-mono shrink-0 flex items-center gap-1 border px-2 py-0.5 rounded-lg ${
                                  isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900/30 border-white/5 text-slate-400'
                                }`}>
                                  <Clock size={10} className="text-slate-500" />
                                  {formattedTime}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <h4 className={`text-xs font-semibold truncate transition-colors flex items-center gap-1.5 ${
                                    isLight ? 'text-slate-805 group-hover/item:text-slate-950' : 'text-slate-200 group-hover/item:text-white'
                                  }`}>
                                    {log.title}
                                  </h4>
                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border mt-1 ${
                                    isLight ? 'border-slate-200 bg-slate-100 text-slate-600' : `border-white/5 ${config.bg} ${config.text}`
                                  }`}>
                                    <CategoryIcon size={10} />
                                    {log.category}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-4">
                                <button
                                  onClick={() => onDeleteVisit(log.id)}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                    isLight ? 'hover:bg-rose-50 text-slate-400 hover:text-rose-600' : 'hover:bg-rose-500/10 text-slate-500 hover:text-rose-450'
                                  }`}
                                  title="Remove Log Item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`py-14 flex flex-col items-center justify-center text-center border border-dashed rounded-3xl ${
                    isLight ? 'border-slate-200 bg-slate-50/50 text-slate-400' : 'border-slate-900 bg-slate-950/10 text-slate-550'
                  }`}>
                    <Clock size={36} className="text-slate-500 animate-pulse mb-3" />
                    <p className="text-sm font-semibold">Zero journal entries found</p>
                    <p className="text-xs mt-1 max-w-xs text-slate-400">
                      {filterQuery ? 'No elements fit the query details.' : 'Interacting with notes (editing or copying) creates chronology logs here.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Footer Info Panel */}
              <div className={`relative mt-5 pt-4 border-t flex items-center justify-between text-[10px] z-10 shrink-0 ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-white/5 text-slate-500'
              }`}>
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-indigo-500" />
                  Showing {filteredLogs.length} of {visitLogs.length} logged note reads
                </span>
                <span>Active Sandbox Sync</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
