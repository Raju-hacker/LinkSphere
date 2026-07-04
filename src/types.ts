export interface LinkItem {
  id: string;
  title: string;
  url: string;
  category: string;
  createdAt: number;
  clickCount: number;
  isFavorite?: boolean;
  note?: string;
}

export type CategoryType = string;

export interface VisitLog {
  id: string;
  linkId: string;
  title: string;
  url: string;
  timestamp: number;
}

export interface AttachmentItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'audio' | 'other';
  size: number;
  dataUrl: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  isFavorite?: boolean;
  visitCount?: number;
  attachments?: AttachmentItem[];
}

export interface NoteVisitLog {
  id: string;
  noteId: string;
  title: string;
  category: string;
  timestamp: number;
}

