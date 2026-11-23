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
}

export interface BookHighlight {
  id: string;
  bookTitle: string;
  page: number;
  quote: string;
  note?: string;
  createdAt: string;
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
  stroopBestMs: number;
  stroopHigh: number;
  memoryBestLevel: number;
  logicSolved: number;
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
