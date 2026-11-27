export type SectionId =
  | 'overview'
  | 'focus'
  | 'analytics'
  | 'tasks'
  | 'reading'
  | 'notes'
  | 'handwriting'
  | 'games'
  | 'profile';

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface AcademicTask {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  dueLabel: string;
  priority: Priority;
  status: TaskStatus;
  estimatedBlocks: number;
  completedBlocks: number;
  notes?: string;
}

export type BookShelf = 'reading' | 'want' | 'finished' | 'textbook';

export type RibbonColorId = 'crimson' | 'emerald' | 'gold' | 'royal' | 'plum';

export interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  shelf: BookShelf;
  currentPage: number;
  totalPages: number;
  activeChapterPages: number;
  coverVariant: 'kahneman' | 'kleppmann' | 'newport' | 'neuro' | 'algorithms' | 'macro' | 'atomic' | 'design';
  rating?: number;
  lastRead: string;
  sourceType?: 'builtin' | 'pdf' | 'text' | 'markdown';
  fileName?: string;
  coverImageUrl?: string;
  ribbonColor?: RibbonColorId;
  bookmarkedPages?: number[];
}

export interface BookHighlight {
  id: string;
  bookTitle: string;
  page: number;
  quote: string;
  note?: string;
  createdAt: string;
}

export type ReaderTool =
  | 'flip'
  | 'highlighter'
  | 'pen'
  | 'pencil'
  | 'shape'
  | 'sticker'
  | 'eraser';

export type ShapeKind = 'rect' | 'ellipse' | 'arrow' | 'line' | 'star' | 'callout';

export type StickerKind =
  | 'star'
  | 'aha'
  | 'exam'
  | 'heart'
  | 'flag'
  | 'question'
  | 'brain'
  | 'fire'
  | 'check'
  | 'coffee'
  | 'note';

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  tool: 'highlighter' | 'pen' | 'pencil';
  color: string;
  width: number;
  opacity: number;
  points: NormalizedPoint[];
}

export interface ReaderShape {
  id: string;
  kind: ShapeKind;
  color: string;
  strokeWidth: number;
  filled: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ReaderSticker {
  id: string;
  kind: StickerKind;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  text?: string;
}

export interface TextHighlightRect {
  id: string;
  x: number; // 0..1 normalized
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

export interface PdfTextLineBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageBookmarkMeta {
  page: number;
  label: string;
  color: RibbonColorId;
  createdAt: string;
}

export interface PageAnnotationData {
  strokes: DrawingStroke[];
  highlights?: TextHighlightRect[];
  shapes: ReaderShape[];
  stickers: ReaderSticker[];
}

export interface BookAnnotationStore {
  pages: Record<number, PageAnnotationData>;
  bookmarks: Record<number, PageBookmarkMeta>;
}

export interface BookContentPage {
  pageNumber: number;
  chapter?: string;
  heading?: string;
  paragraphs: string[];
  calloutQuote?: string;
}

export type NoteField = 'STEM' | 'Medicine & Bio' | 'CS & AI' | 'Humanities' | 'Economics';
export type NoteFormat = 'Cornell Format' | 'Quick Ref' | 'Mind Map' | 'Lecture Synthesis';

export interface StudyNote {
  id: string;
  title: string;
  subtitle: string;
  field: NoteField;
  format: NoteFormat;
  pages: number;
  author: string;
  institution: string;
  rating: number;
  ratingCount: number;
  downloads: number;
  upvotes: number;
  upvoted?: boolean;
  saved?: boolean;
  collection?: string;
  updatedAt: string;
  previewVariant: 'chem' | 'algo' | 'bio' | 'econ' | 'neuro' | 'calc';
  content: string;
}

export interface FocusSessionLog {
  id: string;
  subject: string;
  durationMinutes: number;
  completedAt: string;
  dayShort: string;
  taskTitle?: string;
}

export type HandwritingFontId = 'caveat' | 'patrick' | 'architect' | 'kalam';
export type PaperStyleId = 'ruled' | 'grid' | 'dotted' | 'parchment' | 'blank';
export type InkColorId = 'royal' | 'charcoal' | 'forest' | 'plum' | 'crimson';

export interface HandwritingArtifact {
  id: string;
  title: string;
  subject: string;
  updatedAt: string;
  pages: number;
  text: string;
  font: HandwritingFontId;
  paper: PaperStyleId;
  ink: InkColorId;
}

export interface GameScores {
  math24: number;
  math24Streak: number;
  mathSprintBest?: number;
  mathSprintHighQpm?: number;
  stroopBestMs: number;
  stroopHigh: number;
  memoryBestLevel: number;
  logicSolved: number;
  syllogismSolved?: number;
  totalPulse: number;
}

export interface UserPreferences {
  studentName: string;
  handle: string;
  institution: string;
  major: string;
  termLabel: string;
  termWeek: number;
  termTotalWeeks: number;
  dailyGoalHours: number;
  defaultFocusMinutes: number;
  defaultBreakMinutes: number;
  readingGoalBooks: number;
  autoSyncOcr: boolean;
  weeklyDigest: boolean;
  publicDossier: boolean;
}

export type SoundscapeId = 'rain' | 'brown' | 'binaural' | 'cafe' | 'muted';
