import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, FileText, Type, Tag, HelpCircle, Sparkles, Upload, Paperclip, Image, FileVideo, Music, Trash2 } from 'lucide-react';
import { AttachmentItem } from '../types';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, content: string, category: string, attachments?: AttachmentItem[]) => void;
  categories: string[];
}

const CATEGORIES: { value: string; label: string; bg: string; text: string }[] = [
  { value: 'work', label: 'Work', bg: 'bg-indigo-500/10 hover:bg-indigo-500/15', text: 'text-indigo-400' },
  { value: 'social', label: 'Social', bg: 'bg-pink-500/10 hover:bg-pink-500/15', text: 'text-pink-400' },
  { value: 'tools', label: 'Tools', bg: 'bg-amber-500/10 hover:bg-amber-500/15', text: 'text-amber-400' },
  { value: 'entertainment', label: 'Entertainment', bg: 'bg-purple-500/10 hover:bg-purple-500/15', text: 'text-purple-400' },
  { value: 'other', label: 'Other', bg: 'bg-emerald-500/10 hover:bg-emerald-500/15', text: 'text-emerald-400' },
];

export default function AddNoteModal({ isOpen, onClose, onAdd, categories }: AddNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>(() => {
    return categories.filter(c => c !== 'all')[0] || 'work';
  });
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        let type: 'image' | 'video' | 'pdf' | 'audio' | 'other' = 'other';
        const fileType = file.type || '';
        if (fileType.startsWith('image/')) type = 'image';
        else if (fileType.startsWith('video/')) type = 'video';
        else if (fileType.startsWith('audio/')) type = 'audio';
        else if (fileType === 'application/pdf') type = 'pdf';

        const newAttachment: AttachmentItem = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          type,
          size: file.size,
          dataUrl,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a descriptive title for this note.');
      return;
    }

    if (!content.trim()) {
      setError('Please provide some content/details for your note.');
      return;
    }

    onAdd(
      title.trim(),
      content.trim(),
      category === 'all' ? 'other' : category,
      attachments.length > 0 ? attachments : undefined
    );
    
    // Reset form states
    setTitle('');
    setContent('');
    setAttachments([]);
    setCategory(categories.filter(c => c !== 'all')[0] || 'work');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#050508]/80 backdrop-blur-md z-45"
            id="add-note-backdrop"
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
              id="add-note-modal-content"
            >
              {/* Absorbent decorative blob backplate */}
              <div className="absolute top-[-25%] left-[-25%] w-[60%] h-[60%] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-25%] right-[-25%] w-[60%] h-[60%] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Header Title */}
              <div className="relative flex items-center justify-between mb-6 z-10">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <Plus size={18} className="stroke-[2.5]" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Create Secure Note</h2>
                    <p className="text-xs text-slate-500">Add an encrypted or personal sandbox note</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
                  id="btn-close-add-note"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="relative space-y-5 z-10" id="add-note-form">
                {/* Title Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Type size={13} className="text-slate-500" />
                    Note Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Server Maintenance Credentials"
                    maxLength={100}
                    className="w-full px-4 py-3 bg-[#050508]/60 border border-white/5 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition-all text-sm shadow-inner"
                    id="add-note-input-title"
                  />
                </div>

                {/* Content Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText size={13} className="text-slate-500" />
                    Note Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your note body, steps, commands, ideas, or reminders here..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#050508]/60 border border-white/5 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition-all text-sm shadow-inner resize-none"
                    id="add-note-input-content"
                  />
                </div>

                {/* Media Attachments Section */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Paperclip size={13} className="text-slate-500" />
                    Media Attachments (Photos, Videos, PDFs, Audio)
                  </label>
                  
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-slate-400'
                    }`}
                    onClick={() => document.getElementById('note-file-upload')?.click()}
                    id="drag-drop-zone"
                  >
                    <input
                      type="file"
                      id="note-file-upload"
                      multiple
                      accept="image/*,video/*,audio/*,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Upload size={24} className="text-slate-500" />
                    <div className="text-xs">
                      <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Supports Photos, Videos, PDFs, Audio
                    </div>
                  </div>

                  {/* Attachment List */}
                  {attachments.length > 0 && (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1" id="add-note-attachments-list">
                      {attachments.map((file) => {
                        let FileIcon = Paperclip;
                        if (file.type === 'image') FileIcon = Image;
                        else if (file.type === 'video') FileIcon = FileVideo;
                        else if (file.type === 'audio') FileIcon = Music;
                        else if (file.type === 'pdf') FileIcon = FileText;

                        return (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2.5 bg-[#050508]/60 border border-white/5 rounded-xl text-xs text-slate-300"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileIcon size={14} className="text-slate-400 shrink-0" />
                              <span className="truncate flex-1 text-left">{file.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAttachment(file.id);
                                }}
                                className="p-1 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-slate-500 transition-colors cursor-pointer"
                                title="Remove File"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Category Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Tag size={13} className="text-slate-500" />
                    Category Tag
                  </label>
                  <div className="flex flex-wrap gap-2" id="add-note-category-picker">
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

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium"
                      id="add-note-error-panel"
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
                    id="btn-add-note-cancel"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-purple-500/10 select-none cursor-pointer"
                    id="btn-add-note-submit"
                  >
                    Create Note
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
