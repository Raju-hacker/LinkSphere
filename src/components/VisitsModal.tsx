import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Calendar, Link2, ExternalLink, Clock, Sparkles } from 'lucide-react';
import { VisitLog } from '../types';

interface VisitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitLogs: VisitLog[];
  onClearAll: () => void;
  onDeleteVisit: (id: string) => void;
}

export default function VisitsModal({
  isOpen,
  onClose,
  visitLogs,
  onClearAll,
  onDeleteVisit
}: VisitsModalProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter logs if user types in search
  const filteredLogs = useMemo(() => {
    if (!filterQuery.trim()) return visitLogs;
    const query = filterQuery.toLowerCase();
    return visitLogs.filter(
      (log) =>
        log.title.toLowerCase().includes(query) ||
        log.url.toLowerCase().includes(query)
    );
  }, [visitLogs, filterQuery]);

  // Group filtered results date-wise
  const groupedVisits = useMemo(() => {
    const groups: Record<string, VisitLog[]> = {};
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
            id="visits-modal-backdrop"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[65] pointer-events-none">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              className="w-full max-w-2xl bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]"
              id="visits-modal-content"
            >
              {/* Absorbent decorative blob backplate */}
              <div className="absolute top-[-25%] left-[-25%] w-[60%] h-[60%] bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-25%] right-[-25%] w-[60%] h-[60%] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Header Title */}
              <div className="relative flex items-center justify-between mb-6 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <Clock size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight text-left">Visits Journal</h2>
                    <p className="text-xs text-slate-500 text-left">Chronological history of link clicks and redirections</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setConfirmClear(false);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
                  id="btn-close-visits-modal"
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
                    placeholder="Search visited title or URL..."
                    className="w-full px-4 py-2 bg-slate-950/40 border border-white/5 focus:border-cyan-500/30 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all placeholder:text-slate-500"
                    id="visits-search-input"
                  />
                  {filterQuery && (
                    <button
                      onClick={() => setFilterQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer px-1 bg-slate-950 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {visitLogs.length > 0 && (
                  <div className="flex shrink-0">
                    {confirmClear ? (
                      <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-550/30 rounded-xl p-0.5">
                        <span className="text-[11px] font-semibold text-rose-300 px-2 leading-none">Wipe everything?</span>
                        <button
                          onClick={() => {
                            onClearAll();
                            setConfirmClear(false);
                          }}
                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer leading-none"
                          id="btn-confirm-clear"
                        >
                          Wipe
                        </button>
                        <button
                          onClick={() => setConfirmClear(false)}
                          className="px-2.5 py-1.5 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer leading-none"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmClear(true)}
                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-550/20 hover:border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        id="btn-clear-visits"
                        title="Clear all recorded visits"
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
                id="visits-journal-scroll"
              >
                {groupedVisits.length > 0 ? (
                  groupedVisits.map(([dateGroupName, logs]) => (
                    <div key={dateGroupName} className="space-y-2.5 text-left">
                      {/* Date Header Tag */}
                      <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-2 sticky top-0 bg-[#0c0c14] py-1.5 z-10">
                        <Calendar size={12} className="text-cyan-400" />
                        <span>{dateGroupName}</span>
                        <span className="h-px bg-white/5 flex-1 ml-2" />
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded border border-white/5">
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
                          return (
                            <div
                              key={log.id}
                              className="group/item flex items-center justify-between p-3.5 bg-slate-950/20 hover:bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-200"
                            >
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                {/* Time marker */}
                                <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1 bg-slate-900/30 border border-white/5 px-2 py-0.5 rounded-lg">
                                  <Clock size={10} className="text-slate-500" />
                                  {formattedTime}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-semibold text-slate-200 truncate group-hover/item:text-white transition-colors flex items-center gap-1.5">
                                    {log.title}
                                  </h4>
                                  <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                    <Link2 size={8} className="text-slate-600 shrink-0" />
                                    {log.url}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-4">
                                <a
                                  href={log.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-cyan-405 transition-all cursor-pointer"
                                  title="Open Link"
                                >
                                  <ExternalLink size={13} />
                                </a>
                                <button
                                  onClick={() => onDeleteVisit(log.id)}
                                  className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-450 transition-all cursor-pointer"
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
                  <div className="py-14 flex flex-col items-center justify-center text-center text-slate-500 border border-dashed border-slate-900 rounded-3xl bg-slate-950/10">
                    <Clock size={36} className="text-slate-700 animate-pulse mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Zero journal entries found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      {filterQuery ? 'No elements fit the query details.' : 'Clicking your registered vault links increases stats and constructs chronological history records logs here.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Footer Info Panel */}
              <div className="relative mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 z-10 shrink-0">
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-cyan-500" />
                  Showing {filteredLogs.length} of {visitLogs.length} logged redirects
                </span>
                <span>Active Vault Sync</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
