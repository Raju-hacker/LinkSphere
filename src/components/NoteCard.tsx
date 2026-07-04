import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Copy, 
  Check, 
  Trash2, 
  Heart, 
  Briefcase, 
  Hash, 
  Cpu, 
  Tv, 
  Globe2,
  Calendar,
  FileText,
  Edit2,
  Paperclip,
  Image,
  FileVideo,
  Music,
  Download,
  Eye,
  X
} from 'lucide-react';
import { NoteItem, AttachmentItem } from '../types';
import LiquidIconButton from './LiquidIconButton';

interface NoteCardProps {
  key?: React.Key | string | number;
  note: NoteItem;
  theme?: 'light' | 'dark';
  onCopy: (content: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit?: (note: NoteItem) => void;
  onVisit?: (id: string) => void;
}

// Map categories to modern liquid colors and distinct icons
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

export default function NoteCard({
  note,
  theme = 'dark',
  onCopy,
  onDelete,
  onToggleFavorite,
  onEdit,
  onVisit,
}: NoteCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [previewFile, setPreviewFile] = useState<AttachmentItem | null>(null);

  const handleDownload = (e: React.MouseEvent, file: AttachmentItem) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (e: React.MouseEvent, file: AttachmentItem) => {
    e.stopPropagation();
    setPreviewFile(file);
  };

  const isLight = theme === 'light';
  const config = categoryConfigs[note.category] || categoryConfigs.other;
  const CategoryIcon = config.icon;

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(note.content);
    setCopied(true);
    if (onVisit) onVisit(note.id);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => {
        if (onVisit) onVisit(note.id);
        if (onEdit) onEdit(note);
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative flex flex-col justify-between p-6 rounded-3xl group h-full overflow-hidden transition-all duration-300 cursor-pointer border ${
        isLight
          ? 'bg-white border-slate-200/80 shadow-sm shadow-slate-100 hover:shadow-md hover:border-blue-500/30 text-slate-900 hover:bg-slate-50/20'
          : 'bg-slate-900/45 backdrop-blur-xl border-white/10 hover:border-blue-500/40 hover:shadow-blue-950/20 hover:bg-slate-850/30 text-slate-100'
      }`}
      id={`note-card-${note.id}`}
    >
      {/* Immersive subtle liquid-morphing background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-3xl">
        <motion.div
          animate={isHovered ? {
            scale: [1, 1.35, 1.15, 1.25, 1],
            rotate: [0, 90, 180, 270, 360],
            borderRadius: [
              "38% 62% 65% 35% / 40% 45% 55% 60%",
              "65% 35% 50% 50% / 55% 42% 58% 45%",
              "35% 65% 45% 55% / 48% 58% 42% 52%",
              "55% 45% 60% 40% / 42% 50% 50% 58%",
              "38% 62% 65% 35% / 40% 45% 55% 60%"
            ],
            x: [0, 12, -8, 6, 0],
            y: [0, -8, 12, -6, 0],
          } : {
            scale: 1,
            rotate: 0,
            borderRadius: "38% 62% 65% 35% / 40% 45% 55% 60%",
            x: 0,
            y: 0,
          }}
          transition={isHovered ? {
            duration: 7,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          } : {
            duration: 0.4,
            ease: "easeOut"
          }}
          className={`absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br ${config.gradient} opacity-5 blur-xl group-hover:opacity-20 transition-all duration-500`}
        />
        <motion.div
          animate={isHovered ? {
            scale: [1, 1.25, 1.1, 1.2, 1],
            rotate: [360, 270, 180, 90, 0],
            borderRadius: [
              "45% 55% 35% 65% / 52% 48% 52% 48%",
              "35% 65% 62% 38% / 40% 55% 45% 60%",
              "62% 38% 45% 55% / 55% 42% 58% 45%",
              "45% 55% 50% 50% / 42% 50% 50% 58%",
              "45% 55% 35% 65% / 52% 48% 52% 48%"
            ],
            x: [0, -10, 8, -4, 0],
            y: [0, 6, -10, 8, 0],
          } : {
            scale: 1,
            rotate: 0,
            borderRadius: "45% 55% 35% 65% / 52% 48% 52% 48%",
            x: 0,
            y: 0,
          }}
          transition={isHovered ? {
            duration: 8,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          } : {
            duration: 0.4,
            ease: "easeOut"
          }}
          className={`absolute -bottom-6 -left-6 w-28 h-28 bg-gradient-to-tl ${config.gradient} opacity-[0.02] blur-xl group-hover:opacity-12 transition-all duration-500`}
        />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full w-full">
        <div>
          {/* Header containing Category Tag + Copy/Favorite/Delete */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wider uppercase border ${
              isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : `border-white/5 ${config.bg} ${config.text}`
            }`}>
              <CategoryIcon size={12} className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              {note.category}
            </span>

            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              {/* Copy Option */}
              <LiquidIconButton
                onClick={handleCopyClick}
                title="Copy Note Text"
                variant="secondary"
                theme={theme}
                id={`btn-copy-note-${note.id}`}
              >
                {copied ? (
                  <Check size={14} className="text-emerald-400 animate-pulse" />
                ) : (
                  <Copy size={14} className={isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'} />
                )}
              </LiquidIconButton>

              {/* Edit Option */}
              {onEdit && (
                <LiquidIconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(note);
                  }}
                  title="Edit Note"
                  variant="secondary"
                  theme={theme}
                  id={`btn-edit-note-${note.id}`}
                >
                  <Edit2 size={14} className={isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'} />
                </LiquidIconButton>
              )}

              {/* Delete Option */}
              <LiquidIconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                title="Move to Trash"
                variant="danger"
                theme={theme}
                id={`btn-delete-note-${note.id}`}
              >
                <Trash2 size={14} />
              </LiquidIconButton>
            </div>
          </div>

          {/* Title Area */}
          <div className="mb-2">
            <h3 className="text-lg font-bold tracking-tight line-clamp-2 pr-4 transition-colors group-hover:text-blue-400 flex items-center gap-1.5">
              <FileText size={16} className="text-slate-400" />
              {note.title}
            </h3>
          </div>

          {/* Content Area */}
          <p className={`text-xs leading-relaxed line-clamp-5 break-words mb-5 ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>
            {note.content}
          </p>

          {/* Attachments Section */}
          {note.attachments && note.attachments.length > 0 && (
            <div className="mt-2 mb-4 space-y-1.5" id={`note-attachments-section-${note.id}`}>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block text-left">
                Attachments ({note.attachments.length})
              </span>
              <div className="flex flex-wrap gap-1.5" id={`note-attachments-container-${note.id}`}>
                {note.attachments.map((file) => {
                  let FileIcon = Paperclip;
                  if (file.type === 'image') FileIcon = Image;
                  else if (file.type === 'video') FileIcon = FileVideo;
                  else if (file.type === 'audio') FileIcon = Music;
                  else if (file.type === 'pdf') FileIcon = FileText;

                  return (
                    <div
                      key={file.id}
                      onClick={(e) => e.stopPropagation()}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all border group/file max-w-[150px] relative overflow-hidden ${
                        isLight
                          ? 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                          : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                      id={`attachment-badge-${file.id}`}
                    >
                      {file.type === 'image' ? (
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 object-cover rounded shrink-0 border border-white/10"
                        />
                      ) : (
                        <FileIcon size={12} className="text-slate-400 shrink-0" />
                      )}
                      <span className="truncate flex-1 text-left text-[10px] font-medium">
                        {file.name}
                      </span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={(e) => handlePreview(e, file)}
                          className="p-1 hover:bg-white/20 hover:text-indigo-400 rounded-lg text-slate-400 transition-colors cursor-pointer"
                          title="Preview File"
                          id={`btn-preview-file-${file.id}`}
                        >
                          <Eye size={10} />
                        </button>
                        <button
                          onClick={(e) => handleDownload(e, file)}
                          className="p-1 hover:bg-white/20 hover:text-emerald-400 rounded-lg text-slate-400 transition-colors cursor-pointer"
                          title="Download File"
                          id={`btn-download-file-${file.id}`}
                        >
                          <Download size={10} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info (Timestamp + Favorite option) */}
        <div className="flex items-center justify-between border-t border-dashed border-slate-700/20 pt-3">
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <Calendar size={10} />
            {formattedDate}
          </span>

          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note.id);
            }}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              note.isFavorite
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/5'
            }`}
            title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            id={`btn-fav-note-${note.id}`}
          >
            <Heart size={14} className={note.isFavorite ? 'fill-current' : ''} />
          </motion.button>
        </div>
      </div>

      {/* Preview Lightbox Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[999] pointer-events-none" onClick={(e) => e.stopPropagation()}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-md pointer-events-auto"
              id="lightbox-backdrop"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col pointer-events-auto"
              id="lightbox-content"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1.5 bg-white/5 rounded-lg text-slate-400">
                    <Paperclip size={14} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{previewFile.name}</h4>
                    <p className="text-[10px] text-slate-500">{(previewFile.size / 1024).toFixed(1)} KB • {previewFile.type.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDownload(e, previewFile)}
                    className="p-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Download"
                    id="lightbox-download"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
                    id="lightbox-close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Dynamic preview content */}
              <div className="flex-1 flex items-center justify-center overflow-auto min-h-0 bg-black/40 rounded-2xl p-4">
                {previewFile.type === 'image' && (
                  <img
                    src={previewFile.dataUrl}
                    alt={previewFile.name}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                  />
                )}
                {previewFile.type === 'video' && (
                  <video
                    src={previewFile.dataUrl}
                    controls
                    autoPlay
                    className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
                  />
                )}
                {previewFile.type === 'audio' && (
                  <div className="w-full max-w-md p-6 bg-slate-900 border border-white/5 rounded-2xl flex flex-col items-center gap-4">
                    <Music size={48} className="text-indigo-400 animate-pulse" />
                    <audio src={previewFile.dataUrl} controls autoPlay className="w-full" />
                  </div>
                )}
                {previewFile.type === 'pdf' && (
                  <iframe
                    src={previewFile.dataUrl}
                    className="w-full h-[60vh] rounded-xl bg-white border-0"
                    title={previewFile.name}
                  />
                )}
                {previewFile.type === 'other' && (
                  <div className="text-center p-8 space-y-3">
                    <Paperclip size={48} className="text-slate-500 mx-auto" />
                    <p className="text-sm text-slate-300">Preview is not available for this file type.</p>
                    <p className="text-xs text-slate-500">Please use the Download button above to view this file locally.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
