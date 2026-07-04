import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit2, Globe2, Type, Tag, HelpCircle, Sparkles, FileText } from 'lucide-react';
import { LinkItem } from '../types';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: LinkItem | null;
  onEdit: (id: string, title: string, url: string, category: string, note?: string) => void;
  categories: string[];
}

const CATEGORIES: { value: string; label: string; bg: string; text: string }[] = [
  { value: 'work', label: 'Work', bg: 'bg-indigo-500/10 hover:bg-indigo-500/15', text: 'text-indigo-400' },
  { value: 'social', label: 'Social', bg: 'bg-pink-500/10 hover:bg-pink-500/15', text: 'text-pink-400' },
  { value: 'tools', label: 'Tools', bg: 'bg-amber-500/10 hover:bg-amber-500/15', text: 'text-amber-400' },
  { value: 'entertainment', label: 'Entertainment', bg: 'bg-purple-500/10 hover:bg-purple-500/15', text: 'text-purple-400' },
  { value: 'other', label: 'Other', bg: 'bg-emerald-500/10 hover:bg-emerald-500/15', text: 'text-emerald-400' },
];

export default function EditLinkModal({ isOpen, onClose, link, onEdit, categories }: EditLinkModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('other');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync state with selected link when modal opens
  useEffect(() => {
    if (link) {
      setTitle(link.title);
      setUrl(link.url);
      setCategory(link.category);
      setNote(link.note || '');
      setError('');
    }
  }, [link, isOpen]);

  const normalizeUrl = (input: string) => {
    let normalized = input.trim();
    if (!normalized) return '';
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    return normalized;
  };

  const handleAutoTitle = async (targetUrl: string) => {
    if (!targetUrl.trim() || isGenerating) return;

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/auto-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      if (!response.ok) {
        throw new Error('Server error generating title');
      }

      const data = await response.json();
      if (data.success && data.title) {
        setTitle(data.title);
      }
    } catch (err) {
      console.error('Error generating auto title:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUrlBlur = () => {
    if (url.trim() && !title.trim()) {
      handleAutoTitle(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!link) return;

    if (!title.trim()) {
      setError('Please provide a descriptive title.');
      return;
    }

    if (!url.trim()) {
      setError('Please provide a target URL.');
      return;
    }

    const normalized = normalizeUrl(url);
    try {
      new URL(normalized);
    } catch {
      setError('Please provide a valid web address (URL).');
      return;
    }

    onEdit(link.id, title.trim(), normalized, category === 'all' ? 'other' : category, note.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && link && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#050508]/80 backdrop-blur-md z-45"
            id="edit-modal-backdrop"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
              }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              className="w-full max-w-lg bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden pointer-events-auto"
              id="edit-modal-content"
            >
              {/* Absorbent decorative blob backplate */}
              <div className="absolute top-[-25%] left-[-25%] w-[60%] h-[60%] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-25%] right-[-25%] w-[60%] h-[60%] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Header Title */}
              <div className="relative flex items-center justify-between mb-6 z-10">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <Edit2 size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Edit Link</h2>
                    <p className="text-xs text-slate-500">Modify title, URL address, or category tag</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
                  id="btn-close-edit-modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="relative space-y-5 z-10" id="edit-link-form">
                {/* Title Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between w-full">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Type size={13} className="text-slate-500" />
                      Link Title
                    </label>
                    {url.trim() && (
                      <button
                        type="button"
                        onClick={() => handleAutoTitle(url)}
                        disabled={isGenerating}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-350 disabled:text-slate-600 flex items-center gap-1 transition-all cursor-pointer bg-blue-500/10 hover:bg-blue-500/15 px-2.5 py-1 rounded-lg border border-blue-505/10"
                        title="Auto-detect clean title from URL"
                        id="btn-edit-auto-title"
                      >
                        {isGenerating ? (
                          <>
                            <span className="inline-block animate-spin w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full" />
                            Detecting...
                          </>
                        ) : (
                          <>
                            <Sparkles size={11} className="text-blue-400 animate-pulse" />
                            Auto-Detect Title
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Google Developers Blog"
                    maxLength={100}
                    className="w-full px-4 py-3 bg-[#050508]/60 border border-white/5 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition-all text-sm shadow-inner"
                    id="edit-input-link-title"
                  />
                </div>

                {/* URL Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Globe2 size={13} className="text-slate-500" />
                    Web Address (URL)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onBlur={handleUrlBlur}
                      placeholder="e.g. news.ycombinator.com"
                      className="w-full px-4 py-3 bg-[#050508]/60 border border-white/5 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition-all text-sm shadow-inner pr-10"
                      id="edit-input-link-url"
                    />
                    <HelpCircle size={15} className="absolute right-3.5 top-3.5 text-slate-600 pointer-events-none" />
                  </div>
                </div>

                {/* Category Picker */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Tag size={13} className="text-slate-500" />
                    Category Tag
                  </label>
                  <div className="flex flex-wrap gap-2" id="edit-category-picker">
                    {categories.filter((c) => c !== 'all').map((catValue) => {
                      const existing = CATEGORIES.find((c) => c.value === catValue);
                      const bg = existing ? existing.bg : 'bg-blue-500/10 hover:bg-blue-500/15';
                      const text = existing ? existing.text : 'text-blue-400';
                      const label = catValue.charAt(0).toUpperCase() + catValue.slice(1);
                      return (
                        <motion.button
                          key={catValue}
                          type="button"
                          onClick={() => setCategory(catValue)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all relative cursor-pointer ${
                            category === catValue
                              ? 'bg-indigo-600 border-transparent text-white shadow-lg shadow-indigo-900/20 font-bold'
                              : `${bg} border-white/5 ${text}`
                          }`}
                        >
                          {label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Short Note Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText size={13} className="text-slate-500" />
                    Short Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Requires VPN, credentials info, etc."
                    maxLength={140}
                    className="w-full px-4 py-3 bg-[#050508]/60 border border-white/5 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition-all text-sm shadow-inner"
                    id="edit-input-link-note"
                  />
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium"
                      id="edit-form-error-panel"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-transparent hover:bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                    id="btn-edit-cancel-modal"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-purple-500/10 select-none cursor-pointer"
                    id="btn-edit-submit-modal"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
