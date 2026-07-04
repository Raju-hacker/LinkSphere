import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Palette, 
  Hash, 
  Trash2, 
  FolderSync, 
  LogOut, 
  Sliders, 
  Plus, 
  Download, 
  UploadCloud, 
  User, 
  RefreshCw, 
  AlertTriangle,
  FileDown,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  Zap
} from 'lucide-react';
import { LinkItem, NoteItem } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Theme & Profile settings
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  currentUser: string | null;
  onSignOut: () => void;
  particleSpeed: 'none' | 'slow' | 'medium' | 'fast';
  onParticleSpeedChange: (speed: 'none' | 'slow' | 'medium' | 'fast') => void;

  // Categories
  categories: string[];
  onAddCategory: (cat: string) => void;
  onDeleteCategory: (cat: string) => void;

  // Trash
  trashLinks: LinkItem[];
  onRestoreLink: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
  trashNotes?: NoteItem[];
  onRestoreNote?: (id: string) => void;
  onPermanentDeleteNote?: (id: string) => void;
  onEmptyTrashNotes?: () => void;

  // Backups
  onExportBackup: () => void;
  onImportBackup: (jsonString: string) => void;

  // More Settings
  onClearVisits: () => void;
  onResetClicks: () => void;
  onMasterReset: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  currentUser,
  onSignOut,
  particleSpeed,
  onParticleSpeedChange,
  categories,
  onAddCategory,
  onDeleteCategory,
  trashLinks,
  onRestoreLink,
  onPermanentDelete,
  onEmptyTrash,
  trashNotes = [],
  onRestoreNote,
  onPermanentDeleteNote,
  onEmptyTrashNotes,
  onExportBackup,
  onImportBackup,
  onClearVisits,
  onResetClicks,
  onMasterReset
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'trash' | 'backups' | 'maintenance'>('general');
  const [newCatName, setNewCatName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [confirmMasterReset, setConfirmMasterReset] = useState(false);
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);
  const [trashQuery, setTrashQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLight = theme === 'light';

  // Drag and drop mechanics for backups inside Settings
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImportBackup(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImportBackup(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAddCategoryClick = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCatName.trim().toLowerCase();
    if (val) {
      onAddCategory(val);
      setNewCatName('');
    }
  };

  const trashItems = [
    ...trashLinks.map((l) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      type: 'link' as const,
      subtitle: l.url,
    })),
    ...trashNotes.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      type: 'note' as const,
      subtitle: n.content,
    })),
  ];

  const filteredTrash = trashItems.filter(
    (item) =>
      item.title.toLowerCase().includes(trashQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(trashQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 z-50 cursor-pointer ${
              isLight ? 'bg-slate-900/40 backdrop-blur-sm' : 'bg-[#020205]/80 backdrop-blur-md'
            }`}
            id="settings-modal-backdrop"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-55 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className={`w-full max-w-3xl rounded-3xl p-0 shadow-2xl relative overflow-hidden pointer-events-auto flex flex-col md:flex-row h-[85vh] md:h-[680px] border ${
                isLight 
                  ? 'bg-white border-slate-200 text-slate-800' 
                  : 'bg-[#0a0a10]/95 backdrop-blur-2xl border-white/5 text-slate-100'
              }`}
              id="settings-modal-content"
            >
              {/* Background gradient decorative glow blobs for dark mode */}
              {!isLight && (
                <>
                  <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                </>
              )}

              {/* Sidebar Navigation */}
              <div className={`w-full md:w-64 flex flex-col shrink-0 border-b md:border-b-0 md:border-r ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/20 border-white/5'
              }`}>
                {/* Brand and settings title */}
                <div className="p-5 flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl flex items-center justify-center ${
                    isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/5 text-cyan-400 border border-white/5'
                  }`}>
                    <Settings size={18} className="animate-[spin_4s_linear_infinite]" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-bold tracking-tight">Settings</h2>
                    <p className="text-[10px] text-slate-500">Customize secure vault environment</p>
                  </div>
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
                  {[
                    { id: 'general', label: 'Appearance & Profile', icon: Palette },
                    { id: 'categories', label: 'Manage Categories', icon: Hash },
                    { id: 'trash', label: 'Trash Repository', icon: Trash2, badge: trashLinks.length },
                    { id: 'backups', label: 'Backups & Portability', icon: FolderSync },
                    { id: 'maintenance', label: 'Maintenance & Reset', icon: Sliders },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs select-none cursor-pointer transition-all duration-150 ${
                          isActive
                            ? isLight
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                              : 'bg-white/5 text-white border border-white/10 shadow-lg'
                            : isLight
                              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                        id={`settings-tab-${tab.id}`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon size={14} className={isActive ? 'text-current' : isLight ? 'text-slate-400' : 'text-slate-500'} />
                          <span>{tab.label}</span>
                        </span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive 
                              ? isLight ? 'bg-white text-blue-600' : 'bg-cyan-500/20 text-cyan-300'
                              : isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-900 text-slate-400 border border-white/5'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Bottom Profile details & Logout */}
                {currentUser && (
                  <div className={`p-4 border-t flex items-center justify-between gap-2.5 ${
                    isLight ? 'border-slate-200/80 bg-slate-50' : 'border-white/5 bg-slate-950/20'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-400'
                      }`}>
                        <User size={12} />
                      </span>
                      <div className="text-left min-w-0">
                        <p className="text-[11px] font-bold truncate">{currentUser}</p>
                        <p className="text-[9px] text-slate-500 font-mono">sandbox user</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onSignOut();
                        onClose();
                      }}
                      className={`p-1.5 rounded-lg border hover:scale-105 transition-all cursor-pointer ${
                        isLight 
                          ? 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600' 
                          : 'border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-350'
                      }`}
                      title="Log Out of Vault"
                      id="settings-logout-btn"
                    >
                      <LogOut size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Setting details content pane */}
              <div className="flex-1 flex flex-col min-w-0 relative h-full">
                {/* Header Close button */}
                <div className="absolute right-5 top-5 z-20">
                  <button
                    onClick={onClose}
                    className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                      isLight 
                        ? 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800' 
                        : 'border-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left relative z-10 custom-scrollbar-thin">
                  
                  {/* TAB 1: GENERAL & APPEARANCE */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-bold tracking-tight">Appearance & Profile</h3>
                        <p className="text-xs text-slate-500 mt-1">Configure interface skin styles and animation particle performance settings</p>
                      </div>

                      {/* Select Theme */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Interface Theme</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: 'dark', label: 'Cosmic Dark', desc: 'Futuristic interstellar glow controls', icon: Palette, activeBg: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300' },
                            { id: 'light', label: 'Sleek Light', desc: 'Minimal clean daylight slate look', icon: Palette, activeBg: 'border-blue-500 bg-blue-50 text-blue-600' }
                          ].map((t) => {
                            const isSel = theme === t.id;
                            return (
                              <button
                                key={t.id}
                                onClick={() => onThemeChange(t.id as any)}
                                className={`p-4 border rounded-2xl flex flex-col items-start gap-1 select-none cursor-pointer text-left transition-all duration-200 ${
                                  isSel
                                    ? t.activeBg
                                    : isLight
                                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                                      : 'bg-slate-950/20 hover:bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <span className="flex items-center gap-2 text-xs font-bold">
                                  <t.icon size={14} className={isSel ? 'text-current animate-[spin_8s_linear_infinite]' : 'text-slate-500'} />
                                  <span>{t.label}</span>
                                </span>
                                <span className="text-[10px] text-slate-500">{t.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Background Particle Dynamics */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Particle Floating Energy</h4>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-slate-400 border border-white/5'
                          }`}>
                            Active mode: {particleSpeed}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Fine-tune the mathematical drift and link-threading velocity of the background canvas particles</p>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'none', label: 'None', desc: 'Freeze background' },
                            { id: 'slow', label: 'Eco', desc: 'Gentle drift' },
                            { id: 'medium', label: 'Balanced', desc: 'Float connection' },
                            { id: 'fast', label: 'Cosmic', desc: 'Hyper network' }
                          ].map((opt) => {
                            const isSel = particleSpeed === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => onParticleSpeedChange(opt.id as any)}
                                className={`p-2.5 border rounded-xl flex flex-col items-center justify-center text-center select-none cursor-pointer transition-all ${
                                  isSel
                                    ? isLight
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                      : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/40'
                                    : isLight
                                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                      : 'bg-slate-950/25 hover:bg-slate-900 border-white/5 text-slate-500 hover:text-slate-400'
                                }`}
                              >
                                <span className="text-[11px] font-bold capitalize">{opt.label}</span>
                                <span className="text-[8px] text-slate-500 mt-0.5 mt-auto">{opt.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: MANAGE CATEGORIES */}
                  {activeTab === 'categories' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-bold tracking-tight">Vault Tag Categories</h3>
                        <p className="text-xs text-slate-500 mt-1">Add custom tags or delete unused classifications to keep your dashboard clean</p>
                      </div>

                      {/* Add new category form */}
                      <form onSubmit={handleAddCategoryClick} className="flex gap-2">
                        <input
                          type="text"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="Create category (e.g. documentation, entertainment)"
                          className={`flex-1 px-4 py-2.5 border rounded-xl text-xs focus:outline-none transition-all ${
                            isLight
                              ? 'bg-slate-50 hover:bg-slate-100 focus:bg-white border-slate-200 focus:border-blue-500 text-slate-900 placeholder-slate-400'
                              : 'bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border-white/5 focus:border-cyan-500/30 text-white placeholder-slate-600'
                          }`}
                        />
                        <button
                          type="submit"
                          className={`px-4 bg-gradient-to-r text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-all ${
                            isLight ? 'from-blue-600 to-indigo-600 shadow-sm' : 'from-cyan-500 to-blue-600'
                          }`}
                        >
                          <Plus size={14} />
                          <span>Add Category</span>
                        </button>
                      </form>

                      {/* Categories list */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Saved Classifications</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {categories.map((cat) => {
                            const isSystemDefault = ['all', 'work', 'social', 'tools', 'entertainment', 'other'].includes(cat);
                            return (
                              <div
                                key={cat}
                                className={`flex items-center justify-between p-3 rounded-xl border ${
                                  isLight 
                                    ? 'bg-slate-50 border-slate-200' 
                                    : 'bg-slate-950/20 border-white/5 hover:border-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`text-xs font-mono font-semibold truncate capitalize ${
                                    isLight ? 'text-slate-800' : 'text-slate-200'
                                  }`}>
                                    {cat}
                                  </span>
                                  {isSystemDefault && (
                                    <span className="text-[8px] uppercase tracking-wider font-bold bg-slate-500/10 text-slate-500 border border-slate-500/15 px-1 py-0.2 rounded shrink-0">
                                      Default
                                    </span>
                                  )}
                                </div>
                                
                                {cat !== 'all' && (
                                  <button
                                    onClick={() => onDeleteCategory(cat)}
                                    className={`p-1.5 rounded-lg border hover:scale-105 transition-all cursor-pointer ${
                                      isLight
                                        ? 'border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                                        : 'border-white/5 hover:border-rose-500/20 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400'
                                    }`}
                                    title={`Delete category tag "${cat}"`}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: TRASH REPOSITORY */}
                  {activeTab === 'trash' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold tracking-tight text-left">Trash Repository</h3>
                          <p className="text-xs text-slate-500 mt-1">Review previously deleted items. They can be restored with metrics intact</p>
                        </div>

                        {trashItems.length > 0 && (
                          <div>
                            {confirmEmptyTrash ? (
                              <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-xl">
                                <span className="text-[10px] text-rose-300 font-semibold px-2">Wipe permanently?</span>
                                <button
                                  onClick={() => {
                                    onEmptyTrash();
                                    if (onEmptyTrashNotes) onEmptyTrashNotes();
                                    setConfirmEmptyTrash(false);
                                  }}
                                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-550 text-white rounded-lg text-[10px] font-extrabold cursor-pointer transition-all"
                                >
                                  Wipe
                                </button>
                                <button
                                  onClick={() => setConfirmEmptyTrash(false)}
                                  className="px-2.5 py-1.5 hover:bg-white/10 text-slate-400 text-[10px] font-bold rounded-lg cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmEmptyTrash(true)}
                                className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                                  isLight 
                                    ? 'border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-600' 
                                    : 'border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/15 text-rose-300'
                                }`}
                                id="settings-clear-trash-btn"
                              >
                                <Trash2 size={13} />
                                Empty Trash
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {trashItems.length > 0 && (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            <Search size={13} />
                          </span>
                          <input
                            type="text"
                            value={trashQuery}
                            onChange={(e) => setTrashQuery(e.target.value)}
                            placeholder="Filter trash items..."
                            className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none transition-all ${
                              isLight
                                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
                                : 'bg-slate-950/50 border-white/5 text-white placeholder-slate-600 focus:bg-slate-950 focus:border-cyan-500/30'
                            }`}
                          />
                        </div>
                      )}

                      {/* Trash list results */}
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar-thin text-left">
                        {filteredTrash.length > 0 ? (
                          filteredTrash.map((item) => (
                            <div
                              key={item.id}
                              className={`p-3.5 border rounded-xl flex items-center justify-between gap-4 transition-all ${
                                isLight 
                                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' 
                                  : 'bg-slate-950/30 hover:bg-slate-950/60 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold truncate">{item.title}</h4>
                                  <span className={`text-[9px] uppercase font-mono px-1 py-0.2 rounded border ${
                                    isLight ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-slate-900 border-white/5 text-slate-400'
                                  }`}>
                                    {item.category}
                                  </span>
                                  <span className={`text-[9px] font-bold px-1 rounded border ${
                                    item.type === 'link'
                                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                      : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                  }`}>
                                    {item.type}
                                  </span>
                                </div>
                                <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => {
                                    if (item.type === 'link') {
                                      onRestoreLink(item.id);
                                    } else {
                                      onRestoreNote?.(item.id);
                                    }
                                  }}
                                  className={`px-3 py-1.5 border rounded-lg text-[10px] font-extrabold cursor-pointer hover:scale-105 transition-all flex items-center gap-1 ${
                                    isLight 
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                                  }`}
                                  title={`Restore ${item.type} item`}
                                >
                                  <RotateCcw size={10} />
                                  <span>Restore</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (item.type === 'link') {
                                      onPermanentDelete(item.id);
                                    } else {
                                      onPermanentDeleteNote?.(item.id);
                                    }
                                  }}
                                  className={`p-1.5 border rounded-lg hover:scale-105 transition-all cursor-pointer ${
                                    isLight 
                                      ? 'border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 hover:border-rose-200' 
                                      : 'border-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 hover:border-rose-500/20'
                                  }`}
                                  title={`Delete ${item.type} permanently`}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={`py-12 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center ${
                            isLight ? 'border-slate-200 text-slate-500' : 'border-slate-900 text-slate-600'
                          }`}>
                            <Trash2 size={28} className="text-slate-500 animate-pulse mb-2" />
                            <p className="text-xs font-semibold">Trash repository empty</p>
                            <p className="text-[10px] mt-0.5">Deleted database entries appear here for staging before recovery</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: BACKUPS & PORTABILITY */}
                  {activeTab === 'backups' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-bold tracking-tight">Database Portability Manager</h3>
                        <p className="text-xs text-slate-500 mt-1">Export your bookmarks data as a secure JSON snapshot, or restore backups from other machines</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Export Container */}
                        <div className={`p-5 border rounded-2xl flex flex-col justify-between ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/20 border-white/5'
                        }`}>
                          <div>
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl mb-3 ${
                              isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/5 text-slate-400 border border-white/5'
                            }`}>
                              <FileDown size={14} />
                            </span>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Export Backups</h4>
                            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                              Saves all current links list, clicked redirect tallies, and favorites configuration into a portable encrypted JSON sandbox snapshot file.
                            </p>
                          </div>
                          
                          <button
                            onClick={onExportBackup}
                            className={`w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-center text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              isLight ? 'bg-slate-900 hover:bg-slate-800 border-none' : ''
                            }`}
                          >
                            <Download size={13} />
                            Download Backup File
                          </button>
                        </div>

                        {/* Import Container Dropzone */}
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                            dragActive
                              ? 'border-cyan-400 bg-cyan-950/10'
                              : isLight
                                ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-500/60'
                                : 'border-white/5 bg-slate-950/20 hover:border-cyan-500/20 hover:bg-slate-950/40'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <UploadCloud size={28} className={`mb-2.5 transition-transform ${dragActive ? 'scale-115 text-cyan-400' : isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                          <p className="text-xs font-bold">Import bookmarks file</p>
                          <p className="text-[10px] text-slate-500 max-w-[180px] mt-1 mx-auto">
                            Drag and drop an Obesra JSON backup here or browse local folders.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: MAINTENANCE & RESET */}
                  {activeTab === 'maintenance' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-bold tracking-tight">Database Maintenance</h3>
                        <p className="text-xs text-slate-500 mt-1">Execute systemic utility resets to keep link spheres running smoothly</p>
                      </div>

                      {/* More settings section */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Clean Adjustments</h4>
                        
                        <div className="space-y-2.5">
                          {/* Clear Visits Log only */}
                          <div className={`p-4 border rounded-xl flex items-center justify-between gap-4 ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/20 border-white/5'
                          }`}>
                            <div className="text-left">
                              <h5 className="text-xs font-bold">Wipe visits redirection journal</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5">Erases the chronological history of visitor clicks without removing actual saved bookmarks</p>
                            </div>
                            <button
                              onClick={onClearVisits}
                              className={`px-3.5 py-2 border rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                isLight 
                                  ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                                  : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-300'
                              }`}
                            >
                              Wipe Logs
                            </button>
                          </div>

                          {/* Zero-out click clicks metrics */}
                          <div className={`p-4 border rounded-xl flex items-center justify-between gap-4 ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/20 border-white/5'
                          }`}>
                            <div className="text-left">
                              <h5 className="text-xs font-bold">Reset redirection aggregates to zero</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5">Resets click tallies back to 0 across all active bookmark links</p>
                            </div>
                            <button
                              onClick={onResetClicks}
                              className={`px-3.5 py-2 border rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                isLight 
                                  ? 'border-slate-200 hover:bg-slate-100 text-slate-700' 
                                  : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-300'
                              }`}
                            >
                              Reset Click Tallies
                            </button>
                          </div>

                          {/* Full App Factory Reset */}
                          <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-3 text-left">
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle size={15} className="mt-0.5 text-rose-400 shrink-0" />
                              <div>
                                <h5 className="text-xs font-bold text-rose-300">Vault Sandbox Factory Reset</h5>
                                <p className="text-[10px] text-rose-400/80 mt-0.5">
                                  WARNING: This permanently wipes all saved links, trash records, custom category tags, and visit logs instantly. The current user session remains active.
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              {confirmMasterReset ? (
                                <div className="inline-flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/30 p-1.5 rounded-xl">
                                  <span className="text-[10px] text-rose-200 font-semibold px-2">Proceed with full wipe?</span>
                                  <button
                                    onClick={() => {
                                      onMasterReset();
                                      setConfirmMasterReset(false);
                                      onClose();
                                    }}
                                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-550 text-white rounded-lg text-[10px] font-extrabold cursor-pointer transition-all"
                                  >
                                    Yes, Wipe Everything
                                  </button>
                                  <button
                                    onClick={() => setConfirmMasterReset(false)}
                                    className="px-2.5 py-1.5 hover:bg-white/10 text-slate-400 text-[10px] font-bold rounded-lg cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmMasterReset(true)}
                                  className="px-3.5 py-2 bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-extrabold rounded-lg transition-all cursor-pointer"
                                  id="btn-settings-factory-reset"
                                >
                                  Wipe Sandbox Instance
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Section info */}
                <div className={`p-4 border-t text-center text-[10px] text-slate-500 flex items-center justify-between px-6 shrink-0 ${
                  isLight ? 'border-indigo-100 bg-indigo-50/20' : 'border-white/5 bg-slate-950/20'
                }`}>
                  <span className="flex items-center gap-1">
                    <Sparkles size={10} className="text-cyan-500 animate-pulse" />
                    Secure Local Cryptography Active
                  </span>
                  <span>v1.2.0</span>
                </div>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
