import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  X, 
  FolderOpen, 
  Trash2, 
  Check, 
  ExternalLink, 
  RotateCcw, 
  Link, 
  Heart, 
  Eye, 
  Layers, 
  Briefcase, 
  Globe2, 
  Cpu, 
  Tv, 
  Hash, 
  ShieldCheck,
  Settings,
  FileText,
  Clock
} from 'lucide-react';
import { LinkItem, CategoryType, VisitLog, NoteItem, NoteVisitLog, AttachmentItem } from './types';
import ParticleBackground from './components/ParticleBackground';
import LinkCard from './components/LinkCard';
import AddLinkForm from './components/AddLinkForm';
import EditLinkModal from './components/EditLinkModal';
import VisitsModal from './components/VisitsModal';
import NoteVisitsModal from './components/NoteVisitsModal';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import NoteCard from './components/NoteCard';
import AddNoteModal from './components/AddNoteModal';
import EditNoteModal from './components/EditNoteModal';
// @ts-ignore
import logoImage from './assets/images/obesra_logo_1783178634841.jpg';

const INITIAL_LINKS: LinkItem[] = [];

const sanitizeLinks = (items: LinkItem[]): LinkItem[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item || !item.id) return false;
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

const CATEGORY_ICONS: Record<CategoryType, React.ComponentType<{ size: number; className?: string }>> = {
  all: Layers,
  work: Briefcase,
  social: Globe2,
  tools: Cpu,
  entertainment: Tv,
  other: Hash,
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'danger';
}

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem('link_vault_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = sanitizeLinks(parsed);
          const demoIds = ['google-ai-studio', 'news-ycombinator', 'github', 'tailwindcss-docs', 'motion-react'];
          return sanitized.filter((item) => !demoIds.includes(item.id));
        }
      } catch {
        // Fall back to INITIAL_LINKS
      }
    }
    localStorage.setItem('link_vault_items', JSON.stringify(INITIAL_LINKS));
    return INITIAL_LINKS;
  });

  const [trashLinks, setTrashLinks] = useState<LinkItem[]>(() => {
    const activeIds = new Set<string>();
    const savedActive = localStorage.getItem('link_vault_items');
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item && item.id) activeIds.add(item.id);
          });
        }
      } catch {}
    } else {
      INITIAL_LINKS.forEach((item) => {
        if (item && item.id) activeIds.add(item.id);
      });
    }

    const saved = localStorage.getItem('link_vault_trash_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = sanitizeLinks(parsed);
          return sanitized.filter((item) => !activeIds.has(item.id));
        }
      } catch {}
    }
    return [];
  });

  const [activeSection, setActiveSection] = useState<'links' | 'notes'>('links');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('obesra_notes_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [trashNotes, setTrashNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('obesra_trash_notes_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [linkCategories, setLinkCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('link_vault_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((p) => typeof p === 'string')) {
          return parsed;
        }
      } catch {}
    }
    return ['all', 'work', 'social', 'tools', 'entertainment', 'other'];
  });

  const [noteCategories, setNoteCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('link_vault_note_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((p) => typeof p === 'string')) {
          return parsed;
        }
      } catch {}
    }
    return ['all', 'work', 'social', 'tools', 'entertainment', 'other'];
  });

  const categories = activeSection === 'links' ? linkCategories : noteCategories;

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('link_vault_theme') as 'light' | 'dark') || 'dark';
  });

  const [particleSpeed, setParticleSpeed] = useState<'none' | 'slow' | 'medium' | 'fast'>(() => {
    return (localStorage.getItem('link_vault_particle_speed') as 'none' | 'slow' | 'medium' | 'fast') || 'medium';
  });

  const [visitLogs, setVisitLogs] = useState<VisitLog[]>(() => {
    const saved = localStorage.getItem('link_vault_visit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [noteVisitLogs, setNoteVisitLogs] = useState<NoteVisitLog[]>(() => {
    const saved = localStorage.getItem('obesra_note_visit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [isVisitsModalOpen, setIsVisitsModalOpen] = useState(false);
  const [isNoteVisitsModalOpen, setIsNoteVisitsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('link_vault_current_user') || null;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('link_vault_items', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('link_vault_trash_items', JSON.stringify(trashLinks));
  }, [trashLinks]);

  useEffect(() => {
    localStorage.setItem('obesra_notes_items', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('obesra_trash_notes_items', JSON.stringify(trashNotes));
  }, [trashNotes]);

  useEffect(() => {
    localStorage.setItem('link_vault_categories', JSON.stringify(linkCategories));
  }, [linkCategories]);

  useEffect(() => {
    localStorage.setItem('link_vault_note_categories', JSON.stringify(noteCategories));
  }, [noteCategories]);

  useEffect(() => {
    localStorage.setItem('link_vault_visit_logs', JSON.stringify(visitLogs));
  }, [visitLogs]);

  useEffect(() => {
    localStorage.setItem('obesra_note_visit_logs', JSON.stringify(noteVisitLogs));
  }, [noteVisitLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('link_vault_current_user', currentUser);
    } else {
      localStorage.removeItem('link_vault_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('link_vault_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('link_vault_particle_speed', particleSpeed);
  }, [particleSpeed]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleAddLink = (title: string, url: string, category: string, note?: string) => {
    let newId = Math.random().toString(36).substring(2, 9);
    while (links.some((l) => l.id === newId) || trashLinks.some((l) => l.id === newId)) {
      newId = Math.random().toString(36).substring(2, 9);
    }
    const newLink: LinkItem = {
      id: newId,
      title,
      url,
      category,
      createdAt: Date.now(),
      clickCount: 0,
      isFavorite: false,
      note,
    };
    setLinks((prev) => [newLink, ...prev]);
    triggerToast(`Added "${title}" to your vault.`, 'success');
  };

  const handleEditLink = (id: string, title: string, url: string, category: string, note?: string) => {
    setLinks((prev) =>
      prev.map((link) => {
        if (link.id === id) {
          return { ...link, title, url, category, note };
        }
        return link;
      })
    );
    triggerToast(`Updated "${title}" in your vault.`, 'success');
  };

  const handleDeleteLink = (id: string) => {
    const linkToDelete = links.find((l) => l.id === id);
    if (linkToDelete) {
      setTrashLinks((trashPrev) => {
        if (trashPrev.some((l) => l.id === id)) {
          return trashPrev;
        }
        return [linkToDelete, ...trashPrev];
      });
      setLinks((prev) => prev.filter((l) => l.id !== id));
      triggerToast(`Moved "${linkToDelete.title}" to Trash.`, 'info');
    } else {
      triggerToast('Link already removed or not found.', 'danger');
    }
  };

  const handleRestoreLink = (id: string) => {
    const linkToRestore = trashLinks.find((l) => l.id === id);
    if (linkToRestore) {
      setLinks((prev) => {
        if (prev.some((l) => l.id === id)) {
          return prev;
        }
        return [linkToRestore, ...prev];
      });
      setTrashLinks((prev) => prev.filter((l) => l.id !== id));
      triggerToast(`Restored "${linkToRestore.title}" to Vault.`, 'success');
    }
  };

  const handlePermanentDelete = (id: string) => {
    const linkToDelete = trashLinks.find((l) => l.id === id);
    setTrashLinks((prev) => prev.filter((l) => l.id !== id));
    triggerToast(`Permanently deleted ${linkToDelete ? `"${linkToDelete.title}"` : 'link'}.`, 'danger');
  };

  const handleEmptyTrash = () => {
    if (trashLinks.length === 0) return;
    setTrashLinks([]);
    triggerToast('Trash cleared permanently.', 'danger');
  };

  const handleToggleFavorite = (id: string) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;
    const nextFav = !link.isFavorite;
    triggerToast(
      nextFav ? `Added "${link.title}" to favorites.` : `Removed "${link.title}" from favorites.`,
      'info'
    );
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFavorite: nextFav } : l))
    );
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => {
        triggerToast('Copied address to clipboard!', 'success');
      },
      () => {
        triggerToast('Failed to copy. Please manually select the URL.', 'danger');
      }
    );
  };

  const handleAddNote = (title: string, content: string, category: string, attachments?: AttachmentItem[]) => {
    let newId = Math.random().toString(36).substring(2, 9);
    while (notes.some((n) => n.id === newId) || trashNotes.some((n) => n.id === newId)) {
      newId = Math.random().toString(36).substring(2, 9);
    }
    const newNote: NoteItem = {
      id: newId,
      title,
      content,
      category,
      createdAt: Date.now(),
      isFavorite: false,
      attachments,
    };
    setNotes((prev) => [newNote, ...prev]);
    triggerToast(`Created note "${title}".`, 'success');
  };

  const handleEditNote = (id: string, title: string, content: string, category: string, attachments?: AttachmentItem[]) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === id) {
          return { ...note, title, content, category, attachments };
        }
        return note;
      })
    );
    triggerToast(`Updated note "${title}".`, 'success');
  };

  const handleDeleteNote = (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);
    if (noteToDelete) {
      setTrashNotes((trashPrev) => {
        if (trashPrev.some((n) => n.id === id)) {
          return trashPrev;
        }
        return [noteToDelete, ...trashPrev];
      });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      triggerToast(`Moved note "${noteToDelete.title}" to Trash.`, 'info');
    } else {
      triggerToast('Note already removed or not found.', 'danger');
    }
  };

  const handleRestoreNote = (id: string) => {
    const noteToRestore = trashNotes.find((n) => n.id === id);
    if (noteToRestore) {
      setNotes((prev) => {
        if (prev.some((n) => n.id === id)) {
          return prev;
        }
        return [noteToRestore, ...prev];
      });
      setTrashNotes((prev) => prev.filter((n) => n.id !== id));
      triggerToast(`Restored note "${noteToRestore.title}" to active workspace.`, 'success');
    }
  };

  const handlePermanentDeleteNote = (id: string) => {
    const noteToDelete = trashNotes.find((n) => n.id === id);
    setTrashNotes((prev) => prev.filter((n) => n.id !== id));
    triggerToast(`Permanently deleted ${noteToDelete ? `"${noteToDelete.title}"` : 'note'}.`, 'danger');
  };

  const handleEmptyTrashNotes = () => {
    if (trashNotes.length === 0) return;
    setTrashNotes([]);
    triggerToast('Notes trash cleared permanently.', 'danger');
  };

  const handleToggleNoteFavorite = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const nextFav = !note.isFavorite;
    triggerToast(
      nextFav ? `Added note "${note.title}" to favorites.` : `Removed note "${note.title}" from favorites.`,
      'info'
    );
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: nextFav } : n))
    );
  };

  const handleCopyNote = (content: string) => {
    navigator.clipboard.writeText(content).then(
      () => {
        triggerToast('Copied note text to clipboard!', 'success');
      },
      () => {
        triggerToast('Failed to copy note content.', 'danger');
      }
    );
  };

  const handleVisitLink = (id: string, url: string) => {
    const matchedLink = links.find((l) => l.id === id);
    const title = matchedLink ? matchedLink.title : url;

    const newLogItem: VisitLog = {
      id: Math.random().toString(36).substring(2, 9),
      linkId: id,
      title,
      url,
      timestamp: Date.now(),
    };

    setVisitLogs((prev) => [newLogItem, ...prev]);

    setLinks((prev) =>
      prev.map((link) => {
        if (link.id === id) {
          return { ...link, clickCount: link.clickCount + 1 };
        }
        return link;
      })
    );

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleClearAllVisits = () => {
    setVisitLogs([]);
    setLinks((prev) =>
      prev.map((link) => ({ ...link, clickCount: 0 }))
    );
    triggerToast('All link visit records cleared.', 'success');
  };

  const handleDeleteVisitLog = (id: string) => {
    setVisitLogs((prev) => prev.filter((log) => log.id !== id));
    triggerToast('Visit record deleted.', 'info');
  };

  const handleVisitNote = (id: string) => {
    const matchedNote = notes.find((n) => n.id === id);
    if (!matchedNote) return;

    const newLogItem: NoteVisitLog = {
      id: Math.random().toString(36).substring(2, 9),
      noteId: id,
      title: matchedNote.title,
      category: matchedNote.category,
      timestamp: Date.now(),
    };

    setNoteVisitLogs((prev) => [newLogItem, ...prev]);

    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === id) {
          return { ...note, visitCount: (note.visitCount || 0) + 1 };
        }
        return note;
      })
    );
  };

  const handleClearAllNoteVisits = () => {
    setNoteVisitLogs([]);
    setNotes((prev) =>
      prev.map((note) => ({ ...note, visitCount: 0 }))
    );
    triggerToast('All note visit records cleared.', 'success');
  };

  const handleDeleteNoteVisitLog = (id: string) => {
    setNoteVisitLogs((prev) => prev.filter((log) => log.id !== id));
    triggerToast('Note visit record deleted.', 'info');
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(links, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Obesra_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Backup exported successfully.', 'success');
  };

  const parseBackupJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        const validLinks = parsed.filter(
          (item) => typeof item.title === 'string' && typeof item.url === 'string'
        );
        if (validLinks.length > 0) {
          const usedIds = new Set<string>([
            ...links.map((l) => l.id),
            ...trashLinks.map((l) => l.id),
          ]);
          const normalized = validLinks.map((item) => {
            let itemId = item.id;
            if (!itemId || usedIds.has(itemId)) {
              itemId = Math.random().toString(36).substring(2, 9);
              while (usedIds.has(itemId)) {
                itemId = Math.random().toString(36).substring(2, 9);
              }
            }
            usedIds.add(itemId);
            return {
              id: itemId,
              title: item.title,
              url: item.url,
              category: item.category || 'other',
              createdAt: item.createdAt || Date.now(),
              clickCount: item.clickCount || 0,
              isFavorite: !!item.isFavorite,
            };
          });
          setLinks((prev) => {
            const merged = [...normalized, ...prev].reduce((acc: LinkItem[], curr) => {
              if (!acc.some((item) => item.url === curr.url)) {
                acc.push(curr);
              }
              return acc;
            }, []);
            return sanitizeLinks(merged);
          });
          triggerToast(`Successfully loaded ${normalized.length} records!`, 'success');
        } else {
          triggerToast('Backup contains no valid link records.', 'danger');
        }
      } else {
        triggerToast('Invalid backup file structure.', 'danger');
      }
    } catch {
      triggerToast('Unable to parse selected JSON backup file.', 'danger');
    }
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (catToDelete === 'all' || catToDelete === 'other') return;
    if (activeSection === 'links') {
      setLinkCategories((prev) => prev.filter((c) => c !== catToDelete));
      setLinks((prev) =>
        prev.map((l) => (l.category === catToDelete ? { ...l, category: 'other' } : l))
      );
      setTrashLinks((prev) =>
        prev.map((l) => (l.category === catToDelete ? { ...l, category: 'other' } : l))
      );
    } else {
      setNoteCategories((prev) => prev.filter((c) => c !== catToDelete));
      setNotes((prev) =>
        prev.map((n) => (n.category === catToDelete ? { ...n, category: 'other' } : n))
      );
      setTrashNotes((prev) =>
        prev.map((n) => (n.category === catToDelete ? { ...n, category: 'other' } : n))
      );
    }
    if (selectedCategory === catToDelete) {
      setSelectedCategory('all');
    }
    triggerToast(`Deleted category "${catToDelete}". Items moved to "other".`, 'info');
  };

  const handleAddCategory = (cat: string) => {
    const trimmed = cat.trim().toLowerCase();
    if (!trimmed) return;
    const currentCategories = activeSection === 'links' ? linkCategories : noteCategories;
    if (currentCategories.includes(trimmed)) {
      triggerToast(`Category "${trimmed}" already exists.`, 'danger');
      return;
    }
    if (activeSection === 'links') {
      setLinkCategories((prev) => [...prev, trimmed]);
    } else {
      setNoteCategories((prev) => [...prev, trimmed]);
    }
    triggerToast(`Category "${trimmed}" created!`, 'success');
  };

  const handleResetClicks = () => {
    setLinks((prev) => prev.map((l) => ({ ...l, clickCount: 0 })));
    triggerToast('All link redirections reset to 0.', 'success');
  };

  const handleMasterReset = () => {
    setLinks([]);
    setTrashLinks([]);
    setNotes([]);
    setTrashNotes([]);
    setVisitLogs([]);
    setNoteVisitLogs([]);
    setLinkCategories(['all', 'work', 'social', 'tools', 'entertainment', 'other']);
    setNoteCategories(['all', 'work', 'social', 'tools', 'entertainment', 'other']);
    setSelectedCategory('all');
    triggerToast('Secure Sandbox Vault has been factory-reset.', 'success');
  };

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchesSearch =
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || link.category === selectedCategory;
      const matchesFavorites = !showOnlyFavorites || link.isFavorite;
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [links, searchQuery, selectedCategory, showOnlyFavorites]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || note.category === selectedCategory;
      const matchesFavorites = !showOnlyFavorites || note.isFavorite;
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [notes, searchQuery, selectedCategory, showOnlyFavorites]);

  const stats = useMemo(() => {
    if (activeSection === 'links') {
      const total = links.length;
      const favorites = links.filter((l) => l.isFavorite).length;
      const totalClicks = links.reduce((acc, curr) => acc + curr.clickCount, 0);
      return { total, favorites, totalClicks };
    } else {
      const total = notes.length;
      const favorites = notes.filter((n) => n.isFavorite).length;
      const totalClicks = noteVisitLogs.length;
      return { total, favorites, totalClicks };
    }
  }, [links, notes, activeSection, noteVisitLogs]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (activeSection === 'links') {
      counts['all'] = links.length;
      links.forEach((l) => {
        counts[l.category] = (counts[l.category] || 0) + 1;
      });
    } else {
      counts['all'] = notes.length;
      notes.forEach((n) => {
        counts[n.category] = (counts[n.category] || 0) + 1;
      });
    }
    return counts;
  }, [links, notes, activeSection]);

  return (
    <div className={`relative min-h-screen font-sans selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-500 ${
      theme === 'light' ? 'text-slate-800' : 'text-slate-100'
    }`} id="link-vault-app">
      <ParticleBackground theme={theme} particleSpeed={particleSpeed} />

      {currentUser ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 relative z-10" id="main-content-wrapper">
          <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6" id="app-header">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex items-center gap-3.5 group cursor-pointer"
                id="header-brand-group"
              >
                <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-blue-500/10 border border-white/10 bg-[#07070d]/80 transition-transform duration-300 group-hover:rotate-6">
                  <img src={logoImage} alt="Obesra Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold tracking-tight transition-all duration-300 group-hover:text-blue-400 ${
                    theme === 'light' 
                      ? 'bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-650' 
                      : 'bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400'
                  }`}>
                    Obesra
                  </h1>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors group-hover:text-slate-400">
                    Vault Space
                    {currentUser && (
                      <span className={`inline-flex items-center gap-1 text-[10px] lowercase font-medium px-2 py-0.5 rounded-md ${
                        theme === 'light' 
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                          : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      }`}>
                        <ShieldCheck size={10} />
                        {currentUser}
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-3 shrink-0 mr-1" id="header-action-panel">
              {/* Single multi-tab settings action trigger */}
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className={`p-2.5 border rounded-xl flex items-center justify-center transition-all select-none cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
                    : 'bg-slate-900/40 hover:bg-slate-800 hover:text-white border-white/5 text-slate-300'
                }`}
                title="Settings & Tools"
                id="btn-open-settings"
              >
                <Settings size={18} />
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (activeSection === 'links') {
                    setIsAddModalOpen(true);
                  } else {
                    setIsAddNoteModalOpen(true);
                  }
                }}
                className={`px-5 py-2.5 bg-gradient-to-r text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2 select-none cursor-pointer ${
                  activeSection === 'links'
                    ? 'from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-blue-900/25'
                    : 'from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-purple-900/25'
                }`}
                id="btn-open-add-modal"
              >
                <Plus size={16} className="stroke-[2.5]" />
                <span>{activeSection === 'links' ? 'New Link' : 'New Note'}</span>
              </motion.button>
            </div>
          </header>

          {/* Modern Workspace / Workspace Switcher Tabs */}
          <div className="flex justify-center mb-8" id="workspace-section-switcher">
            <div className={`p-1.5 rounded-2xl flex items-center gap-1.5 border backdrop-blur-md ${
              theme === 'light' ? 'bg-slate-100/80 border-slate-200 shadow-sm' : 'bg-slate-900/60 border-white/5'
            }`}>
              <button
                onClick={() => {
                  setActiveSection('links');
                  setSearchQuery('');
                  setShowOnlyFavorites(false);
                  setSelectedCategory('all');
                }}
                className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 select-none cursor-pointer relative ${
                  activeSection === 'links'
                    ? 'text-white font-bold'
                    : theme === 'light'
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                }`}
                id="btn-switch-links"
              >
                {activeSection === 'links' && (
                  <motion.div
                    layoutId="activeWorkspaceBubble"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Link size={16} />
                  Links Workspace
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-mono ${
                    activeSection === 'links' ? 'bg-white/20 text-white' : theme === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-white/5 text-slate-400'
                  }`}>
                    {links.length}
                  </span>
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('notes');
                  setSearchQuery('');
                  setShowOnlyFavorites(false);
                  setSelectedCategory('all');
                }}
                className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 select-none cursor-pointer relative ${
                  activeSection === 'notes'
                    ? 'text-white font-bold'
                    : theme === 'light'
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                }`}
                id="btn-switch-notes"
              >
                {activeSection === 'notes' && (
                  <motion.div
                    layoutId="activeWorkspaceBubble"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <FileText size={16} />
                  Notes Workspace
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-mono ${
                    activeSection === 'notes' ? 'bg-white/20 text-white' : theme === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-white/5 text-slate-400'
                  }`}>
                    {notes.length}
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Quick Stats Cards panel */}
          <section className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6" id="stats-dashboard">
            {[
              {
                id: 'saved',
                label: activeSection === 'links' ? 'Saved Vault Links' : 'Saved Sandbox Notes',
                value: stats.total,
                icon: activeSection === 'links' ? Link : FileText,
                color: activeSection === 'links'
                  ? (theme === 'light' ? 'text-indigo-600' : 'text-indigo-400 group-hover:text-indigo-300')
                  : (theme === 'light' ? 'text-purple-600' : 'text-purple-400 group-hover:text-purple-300'),
                borderColor: activeSection === 'links' ? 'group-hover:border-indigo-500/30' : 'group-hover:border-purple-500/30',
                activeBg: activeSection === 'links'
                  ? (theme === 'light' ? 'bg-blue-50/70 border-blue-200/90 shadow-sm text-blue-700 font-semibold' : 'bg-indigo-500/10 border-indigo-500/40 shadow-indigo-950/20 text-indigo-300')
                  : (theme === 'light' ? 'bg-purple-50/70 border-purple-200/90 shadow-sm text-purple-700 font-semibold' : 'bg-purple-500/10 border-purple-500/40 shadow-purple-950/20 text-purple-300'),
                isActive: !showOnlyFavorites,
                onClick: () => setShowOnlyFavorites(false),
              },
              {
                id: 'favorites',
                label: activeSection === 'links' ? 'Favorites Space' : 'Favorite Notes',
                value: stats.favorites,
                icon: Heart,
                color: theme === 'light' ? 'text-rose-600' : 'text-rose-450 group-hover:text-rose-400',
                borderColor: 'group-hover:border-rose-500/30',
                activeBg: theme === 'light' 
                  ? 'bg-rose-50/70 border-rose-200/90 shadow-sm text-rose-700 font-semibold' 
                  : 'bg-rose-500/10 border-rose-500/40 shadow-rose-950/20 text-rose-300',
                isActive: showOnlyFavorites,
                onClick: () => setShowOnlyFavorites(true),
              },
              {
                id: 'clicks',
                label: activeSection === 'links' ? 'Total Link Visits' : 'Total Notes Visit',
                value: stats.totalClicks,
                icon: activeSection === 'links' ? Eye : Clock,
                color: activeSection === 'links'
                  ? (theme === 'light' ? 'text-cyan-600' : 'text-cyan-400 group-hover:text-cyan-300')
                  : (theme === 'light' ? 'text-indigo-600' : 'text-indigo-400 group-hover:text-indigo-300'),
                borderColor: activeSection === 'links' ? 'group-hover:border-cyan-500/30' : 'group-hover:border-indigo-500/30',
                activeBg: activeSection === 'links'
                  ? (theme === 'light' ? 'bg-cyan-50/70 border-cyan-200/90 shadow-sm text-cyan-700 font-semibold' : 'bg-cyan-500/10 border-cyan-500/40 shadow-cyan-950/20 text-cyan-300')
                  : (theme === 'light' ? 'bg-indigo-50/70 border-indigo-200/90 shadow-sm text-indigo-700 font-semibold' : 'bg-indigo-500/10 border-indigo-500/40 shadow-indigo-950/20 text-indigo-300'),
                isActive: activeSection === 'links' ? isVisitsModalOpen : isNoteVisitsModalOpen,
                onClick: activeSection === 'links'
                  ? () => setIsVisitsModalOpen(true)
                  : () => setIsNoteVisitsModalOpen(true),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -3, scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={item.onClick}
                  className={`group p-6 backdrop-blur-xl border rounded-[22px] flex items-center justify-between shadow-sm relative overflow-hidden transition-all duration-300 cursor-pointer select-none ${
                    item.isActive 
                      ? `${item.activeBg}` 
                      : theme === 'light'
                        ? `bg-white border-slate-200/80 shadow-slate-100 hover:bg-slate-50/80 hover:border-slate-300 ${item.borderColor}`
                        : `bg-slate-900/40 border-white/5 hover:bg-slate-800/40 ${item.borderColor}`
                  }`}
                  id={`stats-card-${item.id}`}
                >
                  <div className="relative z-10 flex flex-col justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      item.isActive
                        ? theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                        : theme === 'light' ? 'text-slate-500' : 'text-slate-500 group-hover:text-slate-400'
                    }`}>
                      {item.label}
                    </span>
                    <span className={`text-3xl font-extrabold tracking-tight mt-1 transition-all ${
                      item.isActive 
                        ? theme === 'light' ? 'text-slate-900' : 'text-white' 
                        : theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                    }`}>
                      {item.value}
                    </span>
                  </div>
                  <div className={`p-4 rounded-[14px] relative z-10 transition-colors ${
                    item.isActive 
                      ? theme === 'light' ? 'bg-slate-100/50' : 'bg-white/5' 
                      : theme === 'light' ? 'bg-slate-50' : 'bg-slate-950/30'
                  }`}>
                    <Icon size={24} className={`${item.color} stroke-[2]`} />
                  </div>
                </motion.div>
              );
            })}
          </section>

          {/* Search Stage and Navigation Grid */}
          <section className="mb-12 space-y-6" id="filters-section">
            <div className="relative group max-w-2xl mx-auto" id="search-container">
              <span className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors z-10">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or keyword..."
                className={`w-full backdrop-blur-md rounded-2xl py-4 pl-14 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-xl border ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:shadow-blue-50/50 shadow-slate-100'
                    : 'bg-slate-900/50 border-slate-700/50 text-slate-200 placeholder-slate-500'
                }`}
                id="search-input-field"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-14 flex items-center text-slate-500 hover:text-slate-200 transition-colors z-10"
                  id="btn-clear-search"
                >
                  <X size={16} />
                </button>
              )}
              <div className="absolute right-3 top-3.5 flex items-center pointer-events-none" id="liquid-glass-indicator">
                <div className="w-2 h-2 rounded-full bg-blue-500/85 animate-ping mx-2" />
              </div>
            </div>

            <div className="flex justify-center items-center" id="category-selector-wrapper">
              <nav className={`flex items-center gap-1.5 p-1.5 backdrop-blur-md rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth border ${
                theme === 'light'
                  ? 'bg-white/80 border-slate-200 text-slate-800'
                  : 'bg-slate-900/40 border-white/5'
              }`} id="category-tabs">
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Hash;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`relative px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-full capitalize select-none cursor-pointer transition-all duration-200 group shrink-0 ${
                        isActive 
                          ? 'text-white font-bold' 
                          : theme === 'light' 
                            ? 'text-slate-600 hover:text-slate-900' 
                            : 'text-slate-400 hover:text-slate-200'
                      }`}
                      id={`tab-cat-${category}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeCategoryBubble"
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20 rounded-full"
                          style={{ originY: '0px' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        />
                      )}
                      <div className="flex items-center gap-2 relative z-10">
                        <IconComponent size={14} className={isActive ? 'text-white' : theme === 'light' ? 'text-slate-500 group-hover:text-slate-700 transition-colors' : 'text-slate-500 group-hover:text-slate-300 transition-colors'} />
                        <span className="relative z-10">{category}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-all border ${
                          isActive 
                            ? 'bg-white/20 text-white font-bold border-white/10' 
                            : theme === 'light'
                              ? 'bg-slate-100 text-slate-500 border-slate-200 font-medium group-hover:text-slate-800'
                              : 'bg-slate-950/50 text-slate-500 border-white/5 font-medium group-hover:text-slate-400 group-hover:border-slate-800'
                        }`}>
                          {categoryCounts[category] || 0}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {isAddingCategory ? (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full shrink-0 ml-1.5 ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-white/10'
                  }`}>
                    <input
                      type="text"
                      autoFocus
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="New category..."
                      className={`bg-transparent text-xs placeholder-slate-500 focus:outline-none w-24 border-none p-0 ${
                        theme === 'light' ? 'text-slate-800' : 'text-white'
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = newCatName.trim().toLowerCase();
                          if (val) {
                            if (categories.includes(val)) {
                              triggerToast(`Category "${val}" already exists.`, 'info');
                            } else {
                              if (activeSection === 'links') {
                                setLinkCategories((prev) => [...prev, val]);
                              } else {
                                setNoteCategories((prev) => [...prev, val]);
                              }
                              setSelectedCategory(val);
                              triggerToast(`Category "${val}" added successfully.`, 'success');
                            }
                          }
                          setNewCatName('');
                          setIsAddingCategory(false);
                        } else if (e.key === 'Escape') {
                          setNewCatName('');
                          setIsAddingCategory(false);
                        }
                      }}
                      onBlur={() => {
                        const val = newCatName.trim().toLowerCase();
                        if (val) {
                          if (categories.includes(val)) {
                            triggerToast(`Category "${val}" already exists.`, 'info');
                          } else {
                            if (activeSection === 'links') {
                              setLinkCategories((prev) => [...prev, val]);
                            } else {
                              setNoteCategories((prev) => [...prev, val]);
                            }
                            setSelectedCategory(val);
                            triggerToast(`Category "${val}" added successfully.`, 'success');
                          }
                        }
                        setNewCatName('');
                        setIsAddingCategory(false);
                      }}
                    />
                    <button
                      onClick={() => {
                        setNewCatName('');
                        setIsAddingCategory(false);
                      }}
                      className="text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingCategory(true)}
                    className={`p-1.5 rounded-full transition-all shrink-0 ml-1 cursor-pointer border border-dashed flex items-center justify-center mr-1 ${
                      theme === 'light'
                        ? 'text-slate-400 hover:text-slate-700 border-slate-300 hover:bg-slate-50'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border-white/10'
                    }`}
                    title="Add Custom Category Tag"
                    id="btn-add-category-tag"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </nav>
            </div>
          </section>

          {/* Grid view of active cards */}
          <main id="cards-grid-display">
            <AnimatePresence mode="popLayout">
              {activeSection === 'links' ? (
                filteredLinks.length > 0 ? (
                  <motion.div
                    key="links-grid"
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    id="link-cards-grid"
                  >
                    {filteredLinks.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        theme={theme}
                        onCopy={handleCopyLink}
                        onDelete={handleDeleteLink}
                        onToggleFavorite={handleToggleFavorite}
                        onVisit={handleVisitLink}
                        onEdit={(clickedLink) => {
                          setEditingLink(clickedLink);
                          setIsEditModalOpen(true);
                        }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="links-empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-20 flex flex-col items-center text-center max-w-md mx-auto"
                    id="empty-links-state"
                  >
                    <div className={`p-4 border rounded-full mb-4 text-slate-500 animate-bounce ${
                      theme === 'light' ? 'bg-white border-slate-200 text-slate-400' : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}>
                      <FolderOpen size={40} className="stroke-[1.5]" />
                    </div>
                    <h3 className={`text-lg font-bold mb-1 ${
                      theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                    }`}>No custom links found</h3>
                    <p className={`text-xs mb-6 px-4 ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {searchQuery 
                        ? 'Your current search parameters did not match any stored records.' 
                        : 'Your secure link vault space is currently empty. Tap the store link button below to begin.'}
                    </p>
                    {(searchQuery || selectedCategory !== 'all' || showOnlyFavorites) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setShowOnlyFavorites(false);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                          theme === 'light'
                            ? 'bg-white hover:bg-slate-55 text-slate-700 hover:text-slate-900 border-slate-200 shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-slate-100'
                        }`}
                        id="btn-clear-filters"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </motion.div>
                )
              ) : (
                filteredNotes.length > 0 ? (
                  <motion.div
                    key="notes-grid"
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    id="notes-cards-grid"
                  >
                    {filteredNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        theme={theme}
                        onCopy={handleCopyNote}
                        onDelete={handleDeleteNote}
                        onToggleFavorite={handleToggleNoteFavorite}
                        onVisit={handleVisitNote}
                        onEdit={(clickedNote) => {
                          setEditingNote(clickedNote);
                          setIsEditNoteModalOpen(true);
                        }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="notes-empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-20 flex flex-col items-center text-center max-w-md mx-auto"
                    id="empty-notes-state"
                  >
                    <div className={`p-4 border rounded-full mb-4 text-slate-500 animate-bounce ${
                      theme === 'light' ? 'bg-white border-slate-200 text-slate-400' : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}>
                      <FileText size={40} className="stroke-[1.5]" />
                    </div>
                    <h3 className={`text-lg font-bold mb-1 ${
                      theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                    }`}>No secure notes found</h3>
                    <p className={`text-xs mb-6 px-4 ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {searchQuery 
                        ? 'Your current search parameters did not match any stored records.' 
                        : 'Your secure notes sandbox space is currently empty. Tap the create note button above to begin.'}
                    </p>
                    {(searchQuery || selectedCategory !== 'all' || showOnlyFavorites) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setShowOnlyFavorites(false);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                          theme === 'light'
                            ? 'bg-white hover:bg-slate-55 text-slate-700 hover:text-slate-900 border-slate-200 shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-slate-100'
                        }`}
                        id="btn-clear-filters-notes"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </main>
        </div>
      ) : (
        <AuthModal
          onSuccess={(usr) => {
            setCurrentUser(usr);
            triggerToast(`Successfully decrypted secure vault: ${usr}.`, 'success');
          }}
        />
      )}

      {/* Add New Link Modal */}
      <AddLinkForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddLink}
        categories={linkCategories}
      />

      {/* Edit Link Modal */}
      <EditLinkModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLink(null);
        }}
        link={editingLink}
        onEdit={handleEditLink}
        categories={linkCategories}
      />

      {/* Add New Note Modal */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onAdd={handleAddNote}
        categories={noteCategories}
      />

      {/* Edit Note Modal */}
      <EditNoteModal
        isOpen={isEditNoteModalOpen}
        onClose={() => {
          setIsEditNoteModalOpen(false);
          setEditingNote(null);
        }}
        note={editingNote}
        onEdit={handleEditNote}
        categories={noteCategories}
      />

      {/* Settings Modal (Central hub for backup, theme, trash, profile and maintenance) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        onThemeChange={(newTheme) => {
          setTheme(newTheme);
          triggerToast(`Switched to ${newTheme} mode.`, 'success');
        }}
        currentUser={currentUser}
        onSignOut={() => {
          setCurrentUser(null);
          setIsSettingsModalOpen(false);
          triggerToast('Signed out of vault session successfully.', 'info');
        }}
        particleSpeed={particleSpeed}
        onParticleSpeedChange={(newSpeed) => {
          setParticleSpeed(newSpeed);
          triggerToast(`Adjusted particle speed to "${newSpeed}".`, 'success');
        }}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        trashLinks={trashLinks}
        onRestoreLink={handleRestoreLink}
        onPermanentDelete={handlePermanentDelete}
        onEmptyTrash={handleEmptyTrash}
        trashNotes={trashNotes}
        onRestoreNote={handleRestoreNote}
        onPermanentDeleteNote={handlePermanentDeleteNote}
        onEmptyTrashNotes={handleEmptyTrashNotes}
        onExportBackup={handleExportBackup}
        onImportBackup={parseBackupJson}
        onClearVisits={handleClearAllVisits}
        onResetClicks={handleResetClicks}
        onMasterReset={handleMasterReset}
      />

      {/* Date-wise Visits History modal */}
      <VisitsModal
        isOpen={isVisitsModalOpen}
        onClose={() => setIsVisitsModalOpen(false)}
        visitLogs={visitLogs}
        onClearAll={handleClearAllVisits}
        onDeleteVisit={handleDeleteVisitLog}
      />

      {/* Date-wise Note Visits History modal */}
      <NoteVisitsModal
        isOpen={isNoteVisitsModalOpen}
        onClose={() => setIsNoteVisitsModalOpen(false)}
        visitLogs={noteVisitLogs}
        onClearAll={handleClearAllNoteVisits}
        onDeleteVisit={handleDeleteNoteVisitLog}
        theme={theme}
      />

      {/* Self-clearing toasted prompts layer */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none" id="toasts-list">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`p-3.5 rounded-xl border text-xs font-bold leading-normal shadow-2xl flex items-center gap-2.5 backdrop-blur-md pointer-events-auto ${
                toast.type === 'danger'
                  ? 'bg-rose-950/80 border-rose-800 text-rose-250 shadow-rose-950/10'
                  : toast.type === 'info'
                    ? 'bg-slate-900/95 border-sky-800 text-sky-200 shadow-slate-950/10'
                    : 'bg-emerald-950/80 border-emerald-800 text-emerald-200 shadow-emerald-950/10'
              }`}
              id={`toast-item-${toast.id}`}
            >
              <Check size={14} className={toast.type === 'danger' ? 'text-rose-400 shrink-0' : toast.type === 'info' ? 'text-sky-400 shrink-0' : 'text-emerald-400 shrink-0'} />
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Liquid gooey morph visual shader filter */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
