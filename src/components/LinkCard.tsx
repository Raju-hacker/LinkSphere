import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ExternalLink, 
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
  Eye,
  QrCode,
  Edit2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LinkItem } from '../types';
import LiquidIconButton from './LiquidIconButton';

interface LinkCardProps {
  key?: React.Key | string | number;
  link: LinkItem;
  theme?: 'light' | 'dark';
  onCopy: (url: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onVisit: (id: string, url: string) => void;
  onEdit?: (link: LinkItem) => void;
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

export default function LinkCard({
  link,
  theme = 'dark',
  onCopy,
  onDelete,
  onToggleFavorite,
  onVisit,
  onEdit,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isLight = theme === 'light';
  const config = categoryConfigs[link.category] || categoryConfigs.other;
  const CategoryIcon = config.icon;

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHostname = (urlString?: string) => {
    if (!urlString || typeof urlString !== 'string') return '';
    try {
      const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
      return url.hostname;
    } catch {
      return urlString;
    }
  };

  const formattedDate = new Date(link.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
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
      id={`link-card-${link.id}`}
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

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          {/* Header containing Category Tag + Copy/Favorite/Delete */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wider uppercase border ${
              isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : `border-white/5 ${config.bg} ${config.text}`
            }`}>
              <CategoryIcon size={12} className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              {link.category}
            </span>

            <div className="flex items-center gap-2">
              {/* Quick Copy Link Option */}
              <LiquidIconButton
                onClick={handleCopyClick}
                title={copied ? 'Copied Link!' : 'Copy to Clipboard'}
                variant={copied ? 'success' : 'secondary'}
                theme={theme}
                id={`btn-copy-${link.id}`}
              >
                {copied ? (
                  <Check size={16} className="text-emerald-400 stroke-[2.5]" />
                ) : (
                  <Copy size={16} className={isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'} />
                )}
              </LiquidIconButton>

              {/* Edit Option */}
              {onEdit && (
                <LiquidIconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(link);
                  }}
                  title="Edit Link & Category"
                  variant="secondary"
                  theme={theme}
                  id={`btn-edit-${link.id}`}
                >
                  <Edit2 size={16} className={isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'} />
                </LiquidIconButton>
              )}

              {/* QR Code Option */}
              <LiquidIconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQr(true);
                }}
                title="Generate QR Code"
                variant="secondary"
                theme={theme}
                id={`btn-qr-${link.id}`}
              >
                <QrCode size={16} className={isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'} />
              </LiquidIconButton>

              {/* Favorite Indicator / Toggle */}
              <LiquidIconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(link.id);
                }}
                title={link.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                variant={link.isFavorite ? 'primary' : 'secondary'}
                theme={theme}
                id={`btn-fav-${link.id}`}
              >
                <Heart
                  size={16}
                  className={
                    link.isFavorite
                      ? isLight ? 'fill-white text-white stroke-[2]' : 'fill-current text-sky-950 stroke-[2]'
                      : isLight ? 'text-slate-500 group-hover:text-rose-500' : 'text-slate-400 group-hover:text-pink-400'
                  }
                />
              </LiquidIconButton>

              {/* Delete Option */}
              <LiquidIconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(link.id);
                }}
                title="Delete Link"
                variant="danger"
                theme={theme}
                id={`btn-del-${link.id}`}
              >
                <Trash2 size={16} className="text-white" />
              </LiquidIconButton>
            </div>
          </div>

          {/* Link Title and URL with Automatic Logo */}
          <div className="mb-4 cursor-pointer flex gap-4 items-start" onClick={() => onVisit(link.id, link.url)}>
            {!logoError ? (
              <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg ${
                isLight 
                  ? 'bg-slate-50 border-slate-200/60 shadow-sm' 
                  : 'bg-white/5 border-white/5 shadow-sm'
              }`} id={`link-card-logo-container-${link.id}`}>
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${getHostname(link.url)}&sz=128`}
                  alt={`${getHostname(link.url)} logo`}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain rounded-lg"
                  onError={() => setLogoError(true)}
                  id={`link-card-logo-img-${link.id}`}
                />
              </div>
            ) : (
              <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 ${
                isLight 
                  ? 'bg-slate-50 border-slate-200/60 text-slate-400' 
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`} id={`link-card-logo-fallback-${link.id}`}>
                <Globe2 size={20} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold group-hover:${config.text} line-clamp-2 leading-snug tracking-tight transition-colors mb-1.5 flex items-start gap-1 ${
                isLight ? 'text-slate-900' : 'text-slate-100'
              }`}>
                {link.title}
                <ExternalLink size={14} className="text-slate-400 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </h3>
              <p className="text-slate-500 text-sm mb-4 truncate break-all">
                {link.url}
              </p>
              {link.note && (
                <p className={`text-xs px-3 py-2 rounded-xl italic border text-left mt-2 ${
                  isLight 
                    ? 'bg-slate-50/80 border-slate-200/40 text-slate-600 shadow-sm' 
                    : 'bg-white/5 border-white/5 text-slate-400'
                }`} id={`link-card-note-${link.id}`}>
                  Note: {link.note}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer statistics (Created Date, Clicks) */}
        <div className={`flex items-center justify-between pt-3 mt-auto border-t text-xs font-medium pt-4 ${
          isLight ? 'border-slate-100 text-slate-500' : 'border-white/5 text-slate-500'
        }`}>
          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-slate-500" />
            {formattedDate}
          </span>
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-mono text-[11px] ${
            isLight 
              ? 'bg-slate-100 border-slate-200 text-slate-700' 
              : 'bg-slate-950/60 border-white/5 text-cyan-300'
          }`}>
            <Eye size={12} className="text-slate-400" />
            <span>{link.clickCount} {link.clickCount === 1 ? 'click' : 'clicks'}</span>
          </span>
        </div>
      </div>

      {/* QR Code Overlay */}
      <AnimatePresence>
        {showQr && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-5 rounded-3xl ${
              isLight ? 'bg-white/95 border border-slate-200 shadow-xl' : 'bg-slate-950/95 backdrop-blur-md'
            }`}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4">
              <LiquidIconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQr(false);
                }}
                title="Close QR Code"
                variant="secondary"
                theme={theme}
                id={`btn-close-qr-${link.id}`}
              >
                <span className={isLight ? 'text-xs font-bold text-slate-600' : 'text-xs font-bold text-slate-300'}>✕</span>
              </LiquidIconButton>
            </div>

            {/* High-visibility QR Container (White background for scanning reliability) */}
            <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center mb-4 transition-all duration-300 hover:scale-105 border border-slate-100">
              <QRCodeSVG
                value={link.url}
                size={135}
                level="M"
                includeMargin={false}
              />
            </div>

            <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-500 mb-1">
              Mobile Scan Link
            </span>
            <p className={`text-xs font-semibold truncate max-w-full px-4 text-center ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {link.title}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-full px-4 text-center">
              {getHostname(link.url)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
