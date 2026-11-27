import {
  AcademicTask,
  BookHighlight,
  BookItem,
  FocusSessionLog,
  GameScores,
  HandwritingArtifact,
  StudyNote,
  UserPreferences,
} from '../types';

export const INITIAL_PREFERENCES: UserPreferences = {
  studentName: 'Alex Vance',
  handle: '@alex_scholar',
  institution: "Stanford '26",
  major: 'Cognitive Science & Neurobiology',
  termLabel: 'W26',
  termWeek: 9,
  termTotalWeeks: 14,
  dailyGoalHours: 5.0,
  defaultFocusMinutes: 25,
  defaultBreakMinutes: 5,
  readingGoalBooks: 24,
  autoSyncOcr: true,
  weeklyDigest: true,
  publicDossier: true,
};

export const INITIAL_TASKS: AcademicTask[] = [
  {
    id: 'task-1',
    title: 'Synthesis Paper Draft: Executive Function',
    subject: 'Cognitive Psych',
    dueDate: '2026-11-25',
    dueLabel: 'In 2 days · 16:00',
    priority: 'high',
    status: 'in-progress',
    estimatedBlocks: 3,
    completedBlocks: 2,
    notes: '2,500 words — finalize prefrontal cortex citations and conclusion.',
  },
  {
    id: 'task-2',
    title: 'Midterm Exam Prep: Reaction Mechanisms',
    subject: 'Organic Chemistry',
    dueDate: '2026-11-28',
    dueLabel: 'Next Monday · Hall 304',
    priority: 'high',
    status: 'todo',
    estimatedBlocks: 4,
    completedBlocks: 1,
    notes: 'Review Aldol condensations, Diels-Alder stereochemistry, and Grignard pathways.',
  },
  {
    id: 'task-3',
    title: 'Problem Set #4: Eigenvalues & Eigenvectors',
    subject: 'Linear Algebra',
    dueDate: '2026-11-29',
    dueLabel: 'In 6 days · Portal',
    priority: 'medium',
    status: 'todo',
    estimatedBlocks: 2,
    completedBlocks: 0,
    notes: 'Focus on diagonalization proofs and spectral theorem exercises.',
  },
  {
    id: 'task-4',
    title: 'Submit Organic Chem Pre-Lab Notes',
    subject: 'Organic Chemistry',
    dueDate: '2026-11-23',
    dueLabel: 'Today · 17:00',
    priority: 'high',
    status: 'todo',
    estimatedBlocks: 1,
    completedBlocks: 0,
    notes: 'Drop box in Hall 304 before evening lab.',
  },
  {
    id: 'task-5',
    title: 'Spaced Repetition Flashcards Review',
    subject: 'Neurobiology',
    dueDate: '2026-11-23',
    dueLabel: 'Today · 21:30',
    priority: 'low',
    status: 'todo',
    estimatedBlocks: 1,
    completedBlocks: 0,
    notes: '15-minute evening deck on synaptic vesicle fusion & SNARE proteins.',
  },
  {
    id: 'task-6',
    title: 'Aliphatic Reaction Mechanisms Summary',
    subject: 'Organic Chemistry',
    dueDate: '2026-11-23',
    dueLabel: 'Completed 10:00',
    priority: 'medium',
    status: 'done',
    estimatedBlocks: 2,
    completedBlocks: 2,
  },
  {
    id: 'task-7',
    title: 'Cournot Duopoly Equilibrium Graphing',
    subject: 'Microeconomics',
    dueDate: '2026-11-23',
    dueLabel: 'Completed 11:30',
    priority: 'medium',
    status: 'done',
    estimatedBlocks: 1,
    completedBlocks: 1,
  },
];

export const INITIAL_BOOKS: BookItem[] = [
  {
    id: 'book-1',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Cognitive Science',
    shelf: 'reading',
    currentPage: 324,
    totalPages: 499,
    activeChapterPages: 50,
    coverVariant: 'kahneman',
    ribbonColor: 'crimson',
    bookmarkedPages: [287, 324],
    rating: 5,
    lastRead: 'Today, 08:40',
  },
  {
    id: 'book-2',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'Computer Science',
    shelf: 'reading',
    currentPage: 180,
    totalPages: 616,
    activeChapterPages: 45,
    coverVariant: 'kleppmann',
    ribbonColor: 'gold',
    bookmarkedPages: [154, 180],
    rating: 5,
    lastRead: 'Yesterday',
  },
  {
    id: 'book-3',
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'Productivity',
    shelf: 'reading',
    currentPage: 210,
    totalPages: 296,
    activeChapterPages: 32,
    coverVariant: 'newport',
    ribbonColor: 'emerald',
    bookmarkedPages: [78, 210],
    rating: 4,
    lastRead: '2 days ago',
  },
  {
    id: 'book-4',
    title: 'Principles of Neural Science',
    author: 'Eric R. Kandel',
    category: 'Neurobiology',
    shelf: 'textbook',
    currentPage: 412,
    totalPages: 1180,
    activeChapterPages: 64,
    coverVariant: 'neuro',
    ribbonColor: 'plum',
    bookmarkedPages: [412],
    lastRead: '3 days ago',
  },
  {
    id: 'book-5',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Cormen, Leiserson, Rivest, Stein',
    category: 'Algorithms',
    shelf: 'textbook',
    currentPage: 310,
    totalPages: 1292,
    activeChapterPages: 48,
    coverVariant: 'algorithms',
    ribbonColor: 'royal',
    bookmarkedPages: [310],
    lastRead: 'Last week',
  },
  {
    id: 'book-6',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    category: 'Cognitive Design',
    shelf: 'finished',
    currentPage: 368,
    totalPages: 368,
    activeChapterPages: 0,
    coverVariant: 'design',
    ribbonColor: 'gold',
    bookmarkedPages: [368],
    rating: 5,
    lastRead: 'Nov 12',
  },
  {
    id: 'book-7',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Behavioral Psych',
    shelf: 'finished',
    currentPage: 320,
    totalPages: 320,
    activeChapterPages: 0,
    coverVariant: 'atomic',
    ribbonColor: 'crimson',
    bookmarkedPages: [320],
    rating: 5,
    lastRead: 'Oct 28',
  },
  {
    id: 'book-8',
    title: 'Macroeconomics: Theory & Policy',
    author: 'N. Gregory Mankiw',
    category: 'Economics',
    shelf: 'want',
    currentPage: 1,
    totalPages: 580,
    activeChapterPages: 30,
    coverVariant: 'macro',
    ribbonColor: 'emerald',
    lastRead: 'Queued',
  },
];

export const INITIAL_HIGHLIGHTS: BookHighlight[] = [
  {
    id: 'hl-1',
    bookTitle: 'Thinking, Fast and Slow',
    page: 287,
    quote: 'Nothing in life is as important as you think it is, while you are thinking about it.',
    note: 'Focusing illusion — directly connects to Psych 204 seminar.',
    createdAt: 'Today',
  },
  {
    id: 'hl-2',
    bookTitle: 'Designing Data-Intensive Applications',
    page: 154,
    quote: 'Reliability means continuing to work correctly, even when adversity arises.',
    note: 'Core distinction between faults and failures.',
    createdAt: 'Yesterday',
  },
  {
    id: 'hl-3',
    bookTitle: 'Deep Work',
    page: 78,
    quote: "If you don't produce, you won't thrive—no matter how skilled or talented you are.",
    createdAt: '3 days ago',
  },
];

export const INITIAL_NOTES: StudyNote[] = [
  {
    id: 'note-1',
    title: 'Organic Chemistry II Reaction Mechanisms',
    subtitle: 'Aldol condensations, Diels-Alder stereochemistry, and Grignard pathways.',
    field: 'STEM',
    format: 'Cornell Format',
    pages: 34,
    author: 'Elena V.',
    institution: 'Stanford',
    rating: 4.9,
    ratingCount: 1240,
    downloads: 4820,
    upvotes: 1214,
    saved: true,
    collection: 'Biochem Midterm II',
    updatedAt: 'Updated 2d ago',
    previewVariant: 'chem',
    content: `# Organic Chemistry II: Carbonyl & Pericyclic Mechanisms
Course: CHEM-131 | Verified Peer Guide

1. Aldol Condensation
- Enolate nucleophile attacks electrophilic carbonyl carbon.
- Forms beta-hydroxy aldehyde/ketone; heat drives E1cb dehydration to alpha,beta-unsaturated carbonyl.
- Key rule: kinetic enolate forms with LDA at -78°C; thermodynamic enolate forms with NaOEt at 25°C.

2. Diels-Alder [4+2] Cycloaddition
- Concerted pericyclic reaction between conjugated diene (s-cis) and dienophile.
- Electron-donating groups (EDG) activate diene; electron-withdrawing groups (EWG) activate dienophile.
- Endo rule: secondary orbital overlap favors the endo transition state kinetically.

3. Grignard Reagents (R-MgBr)
- Strongly basic & nucleophilic; strictly anhydrous ether/THF required.
- Reacts with aldehydes -> 2° alcohol, ketones -> 3° alcohol, esters -> 3° alcohol (2 equiv).`,
  },
  {
    id: 'note-2',
    title: 'Algorithms & Time Complexity (Big-O)',
    subtitle: 'Space-time matrix for dynamic programming, sorting, and binary heaps.',
    field: 'CS & AI',
    format: 'Quick Ref',
    pages: 4,
    author: 'Marcus C.',
    institution: 'UC Berkeley',
    rating: 5.0,
    ratingCount: 2410,
    downloads: 9140,
    upvotes: 2408,
    saved: true,
    collection: 'Algorithm Interviews',
    updatedAt: 'Updated 12m ago',
    previewVariant: 'algo',
    content: `# Algorithms & Asymptotic Complexity Reference
Course: CS-161 | Quick Reference Sheet

1. Master Theorem: T(n) = aT(n/b) + f(n)
- Compare f(n) against n^(log_b a).
- Case 1 (Leaf heavy): T(n) = Theta(n^(log_b a)).
- Case 2 (Balanced): T(n) = Theta(n^(log_b a) * log n).
- Case 3 (Root heavy): T(n) = Theta(f(n)).

2. Graph Traversal & Shortest Paths
- BFS / DFS: O(V + E) time, O(V) space.
- Dijkstra (Binary Heap): O((V + E) log V) — non-negative weights only.
- Bellman-Ford: O(VE) — detects negative cycles.

3. Dynamic Programming Checklist
- Identify optimal substructure and overlapping subproblems.
- Define state table explicitly, confirm base cases, and verify transition order.`,
  },
  {
    id: 'note-3',
    title: 'Cellular Respiration & Krebs Cycle',
    subtitle: 'Visual schematic of mitochondrial proton gradient and electron transport.',
    field: 'Medicine & Bio',
    format: 'Mind Map',
    pages: 12,
    author: 'Amina M.',
    institution: 'Johns Hopkins',
    rating: 4.8,
    ratingCount: 890,
    downloads: 3120,
    upvotes: 892,
    saved: true,
    collection: 'Biochem Midterm II',
    updatedAt: 'Updated 5h ago',
    previewVariant: 'bio',
    content: `# Cellular Respiration & Oxidative Phosphorylation
Course: BIO-204 | Metabolic Pathway Summary

1. Glycolysis (Cytosol)
- Glucose (6C) -> 2 Pyruvate (3C) + 2 Net ATP + 2 NADH.
- Rate-limiting enzyme: Phosphofructokinase-1 (PFK-1), inhibited by ATP & citrate, activated by AMP & F-2,6-BP.

2. Citric Acid / Krebs Cycle (Mitochondrial Matrix)
- Per glucose (2 Acetyl-CoA): 6 NADH, 2 FADH2, 2 GTP, 4 CO2.
- Key regulated steps: Citrate synthase, Isocitrate dehydrogenase, alpha-Ketoglutarate dehydrogenase.

3. Electron Transport Chain (Inner Membrane)
- Complexes I, III, IV pump H+ into intermembrane space, building electrochemical gradient.
- ATP Synthase (Complex V) harnesses proton motive force -> ~30-32 ATP total per glucose.`,
  },
  {
    id: 'note-4',
    title: 'Macroeconomics Formulas & Graph Analysis',
    subtitle: 'IS-LM curve shifts, Taylor Rule derivation, and fiscal multiplier equations.',
    field: 'Economics',
    format: 'Lecture Synthesis',
    pages: 18,
    author: 'Julian R.',
    institution: 'Columbia',
    rating: 4.9,
    ratingCount: 640,
    downloads: 2430,
    upvotes: 645,
    saved: false,
    updatedAt: 'Updated 1d ago',
    previewVariant: 'econ',
    content: `# Macroeconomics: IS-LM & Monetary Policy Rules
Course: ECON-102 | Exam Formula Digest

1. National Income Identity
- Y = C(Y - T) + I(r) + G + NX(e)
- Spending Multiplier: k = 1 / (1 - MPC)
- Tax Multiplier: k_T = -MPC / (1 - MPC)

2. IS-LM Equilibrium
- IS Curve (Goods Market): Downward sloping in (Y, r); shifts right with expansionary fiscal policy (increase G or cut T).
- LM Curve (Money Market): Real money supply M/P = L(r, Y); central bank expansion shifts LM right, lowering r.

3. The Taylor Rule
- i = r* + pi + 0.5(pi - pi*) + 0.5(Y - Y*)`,
  },
  {
    id: 'note-5',
    title: 'Neurobiology 301: Action Potentials & Synapses',
    subtitle: 'Resting membrane potential, GHK equation, and saltatory conduction notes.',
    field: 'Medicine & Bio',
    format: 'Cornell Format',
    pages: 9,
    author: 'Alex Vance',
    institution: 'Stanford',
    rating: 4.9,
    ratingCount: 420,
    downloads: 842,
    upvotes: 420,
    saved: true,
    collection: 'Biochem Midterm II',
    updatedAt: 'Updated 2d ago',
    previewVariant: 'neuro',
    content: `# Neurobiology 301: Action Potentials
Date: Nov 21 | Prof: Dr. Vance Thorne

1. Resting Membrane Potential (RMP)
- Typical mammalian neuron maintains -70 mV across axolemma.
- Established by Na+/K+-ATPase pump (3 Na+ out, 2 K+ in) and leaky K+ channels.

2. Threshold & Depolarization (-55 mV)
- Voltage-gated Na+ channels rapidly open once membrane crosses -55 mV.
- Regenerative inward Na+ influx spikes voltage to +30 mV (all-or-none).

3. Refractory States & Conduction
- Ball-and-chain inactivation of Na+ channels enforces unidirectional propagation.
- Myelin sheath + Nodes of Ranvier enable rapid saltatory conduction.`,
  },
  {
    id: 'note-6',
    title: 'Linear Algebra: Eigenvalues & Spectral Theorem',
    subtitle: 'Characteristic polynomials, orthogonal diagonalization, and SVD intuition.',
    field: 'STEM',
    format: 'Quick Ref',
    pages: 11,
    author: 'Clara Oswald',
    institution: 'Oxford',
    rating: 4.9,
    ratingCount: 730,
    downloads: 3490,
    upvotes: 980,
    saved: false,
    collection: 'Algorithm Interviews',
    updatedAt: 'Updated 4d ago',
    previewVariant: 'calc',
    content: `# Linear Algebra: Eigenvalues & Diagonalization
Course: MATH-51 | Core Proofs & Theorems

1. Eigenvalue Equation
- A v = lambda v, where v != 0.
- Solve det(A - lambda I) = 0 for characteristic polynomial roots.
- Trace(A) = sum of eigenvalues; Det(A) = product of eigenvalues.

2. Diagonalization (A = P D P^-1)
- Possible iff A has n linearly independent eigenvectors.
- Symmetric matrices (A = A^T) always have real eigenvalues and orthogonal eigenvectors (Spectral Theorem).

3. Singular Value Decomposition (SVD)
- Any m x n matrix factors into A = U Sigma V^T.`,
  },
];

export const INITIAL_FOCUS_LOGS: FocusSessionLog[] = [
  { id: 'f-1', subject: 'Organic Chemistry', durationMinutes: 50, completedAt: 'Mon · 10:20', dayShort: 'Mon' },
  { id: 'f-2', subject: 'Linear Algebra', durationMinutes: 75, completedAt: 'Mon · 15:40', dayShort: 'Mon' },
  { id: 'f-3', subject: 'Cognitive Psych', durationMinutes: 165, completedAt: 'Mon · 19:10', dayShort: 'Mon' },
  { id: 'f-4', subject: 'Organic Chemistry', durationMinutes: 180, completedAt: 'Tue · 14:00', dayShort: 'Tue' },
  { id: 'f-5', subject: 'Algorithms', durationMinutes: 150, completedAt: 'Tue · 18:30', dayShort: 'Tue' },
  { id: 'f-6', subject: 'Cognitive Psych', durationMinutes: 190, completedAt: 'Wed · 11:45', dayShort: 'Wed' },
  { id: 'f-7', subject: 'Neurobiology', durationMinutes: 180, completedAt: 'Wed · 17:20', dayShort: 'Wed' },
  { id: 'f-8', subject: 'Organic Chemistry', durationMinutes: 100, completedAt: 'Thu · 09:30', dayShort: 'Thu' },
  { id: 'f-9', subject: 'Cognitive Psych', durationMinutes: 128, completedAt: 'Thu · 13:45', dayShort: 'Thu' },
];

export const DEFAULT_HANDWRITING_TEXT = `# Neurobiology 301: Action Potentials
Date: Nov 23, 2026 | Prof: Dr. Vance Thorne

1. Resting Membrane Potential (RMP)
- Typical mammalian neuron maintains -70 mV across the axolemma.
- Established by Na+/K+-ATPase pump (3 Na+ pushed out, 2 K+ brought in).
- Constant K+ efflux through leaky channels stabilizes negative charge.

2. Depolarization Phase (Threshold = -55 mV)
- Stimulus crosses threshold at -55 mV -> all-or-none event!
- Voltage-gated Na+ channels flick open, sparking regenerative influx to +30 mV.
- Goldman-Hodgkin-Katz: Vm = 61.5 * log10[(PK[K+]o + PNa[Na+]o) / (PK[K+]i + PNa[Na+]i)]

3. Refractory States & Unidirectionality
- Absolute Refractory: Na+ channels inactivate via ball-and-chain motif.
- Enforces strictly forward saltatory conduction across Nodes of Ranvier.

* Next quiz covers synaptic vesicle fusion (SNARE proteins)!`;

export const INITIAL_ARTIFACTS: HandwritingArtifact[] = [
  {
    id: 'art-1',
    title: 'Neurobiology 301: Action Potentials',
    subject: 'Neurobiology',
    updatedAt: 'Today · 2h ago',
    pages: 2,
    text: DEFAULT_HANDWRITING_TEXT,
    font: 'caveat',
    paper: 'ruled',
    ink: 'royal',
  },
  {
    id: 'art-2',
    title: 'Stereochemistry & Enantiomers',
    subject: 'Organic Chemistry',
    updatedAt: 'Yesterday',
    pages: 3,
    text: `# Organic Chemistry: Stereochemistry
Lecture 11 | Chiral Centers & Optical Activity

1. Cahn-Ingold-Prelog (R/S) Rules
- Prioritize 4 substituents by atomic number (highest = 1).
- Place lowest priority (#4) pointing away (dashed bond).
- 1 -> 2 -> 3 clockwise = (R), counterclockwise = (S).

2. Enantiomers vs Diastereomers
- Enantiomers: non-superimposable mirror images; equal magnitude, opposite sign optical rotation.
- Diastereomers: stereoisomers that are NOT mirror images; distinct melting/boiling points.
- Meso compounds contain chiral centers yet possess an internal plane of symmetry (achiral).`,
    font: 'patrick',
    paper: 'grid',
    ink: 'forest',
  },
  {
    id: 'art-3',
    title: 'Nash Equilibrium & Cournot Duopoly',
    subject: 'Microeconomics',
    updatedAt: '3 days ago',
    pages: 1,
    text: `# Microeconomics: Strategic Games
Seminar 6 | Game Theory Foundations

1. Nash Equilibrium Definition
- Strategy profile (s1*, s2*) where no player gains by unilaterally deviating.
- Every finite game has at least one mixed-strategy Nash Equilibrium.

2. Cournot Quantity Competition
- Firms choose quantities q1, q2 simultaneously.
- Best response curves slope downward: q1*(q2) = (a - c - b*q2) / 2b.
- Symmetric equilibrium output exceeds monopoly but remains below perfect competition.`,
    font: 'architect',
    paper: 'parchment',
    ink: 'charcoal',
  },
];

export const INITIAL_GAME_SCORES: GameScores = {
  math24: 480,
  math24Streak: 3,
  stroopBestMs: 390,
  stroopHigh: 14,
  memoryBestLevel: 6,
  logicSolved: 12,
  totalPulse: 1480,
};

export const WEEKLY_TREND_DATA = [
  { day: 'Nov 10', hours: 3.4, efficiency: 78 },
  { day: 'Nov 11', hours: 4.2, efficiency: 82 },
  { day: 'Nov 12', hours: 4.8, efficiency: 86 },
  { day: 'Nov 13', hours: 3.9, efficiency: 80 },
  { day: 'Nov 14', hours: 5.1, efficiency: 89 },
  { day: 'Nov 15', hours: 2.8, efficiency: 74 },
  { day: 'Nov 16', hours: 3.6, efficiency: 81 },
  { day: 'Nov 17', hours: 4.8, efficiency: 88 },
  { day: 'Nov 18', hours: 5.5, efficiency: 91 },
  { day: 'Nov 19', hours: 6.2, efficiency: 94 },
  { day: 'Nov 20', hours: 4.9, efficiency: 89 },
  { day: 'Nov 21', hours: 5.3, efficiency: 92 },
  { day: 'Nov 22', hours: 4.4, efficiency: 87 },
  { day: 'Nov 23', hours: 3.8, efficiency: 90 },
];

export const CONSISTENCY_HEATMAP = [
  { date: 'Oct 27', hours: 2.5 },
  { date: 'Oct 28', hours: 4.1 },
  { date: 'Oct 29', hours: 3.8 },
  { date: 'Oct 30', hours: 5.2 },
  { date: 'Oct 31', hours: 1.8 },
  { date: 'Nov 01', hours: 0.9 },
  { date: 'Nov 02', hours: 3.2 },
  { date: 'Nov 03', hours: 4.6 },
  { date: 'Nov 04', hours: 5.4 },
  { date: 'Nov 05', hours: 4.9 },
  { date: 'Nov 06', hours: 3.5 },
  { date: 'Nov 07', hours: 4.2 },
  { date: 'Nov 08', hours: 2.1 },
  { date: 'Nov 09', hours: 3.0 },
  { date: 'Nov 10', hours: 3.4 },
  { date: 'Nov 11', hours: 4.2 },
  { date: 'Nov 12', hours: 4.8 },
  { date: 'Nov 13', hours: 3.9 },
  { date: 'Nov 14', hours: 5.1 },
  { date: 'Nov 15', hours: 2.8 },
  { date: 'Nov 16', hours: 3.6 },
  { date: 'Nov 17', hours: 4.8 },
  { date: 'Nov 18', hours: 5.5 },
  { date: 'Nov 19', hours: 6.2 },
  { date: 'Nov 20', hours: 4.9 },
  { date: 'Nov 21', hours: 5.3 },
  { date: 'Nov 22', hours: 4.4 },
  { date: 'Nov 23', hours: 3.8 },
];

export interface Puzzle24Deck {
  digits: [number, number, number, number];
  hint: string;
}

export const PUZZLE_24_DECKS: Puzzle24Deck[] = [
  { digits: [8, 3, 4, 1], hint: 'Try 4 × (8 - 3 + 1) = 24' },
  { digits: [6, 6, 2, 3], hint: 'Try 6 × (3 + 2) - 6 = 24' },
  { digits: [7, 5, 3, 1], hint: 'Try (7 + 5) × (3 - 1) = 24' },
  { digits: [9, 3, 2, 2], hint: 'Try (9 + 3) × 2 × (2 ÷ 2)? Better: 9 × 2 + 3 × 2 = 24' },
  { digits: [8, 6, 2, 1], hint: 'Try 6 × (8 ÷ 2) × 1 = 24' },
  { digits: [9, 4, 3, 1], hint: 'Try 4 × (9 - 3) × 1 = 24' },
  { digits: [5, 5, 5, 1], hint: 'Try 5 × (5 - 1 ÷ 5) = 24' },
  { digits: [4, 4, 7, 7], hint: 'Try (4 - 4 ÷ 7) × 7 = 24' },
];

export interface LogicPuzzle {
  id: string;
  title: string;
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const LOGIC_PUZZLES: LogicPuzzle[] = [
  {
    id: 'logic-1',
    title: 'The Library Gatekeepers',
    scenario:
      'On the Island of Knights (always tell the truth) and Knaves (always lie), you meet Maya and Leo. Maya says: "At least one of us is a Knave." Leo says nothing.',
    question: 'What are Maya and Leo?',
    options: [
      'Maya is a Knight, Leo is a Knave',
      'Maya is a Knave, Leo is a Knight',
      'Both Maya and Leo are Knights',
      'Both Maya and Leo are Knaves',
    ],
    correctIndex: 0,
    explanation:
      'If Maya were a Knave, her statement ("at least one is a Knave") would be true — a contradiction. So Maya must be a Knight, making her statement true, which forces Leo to be a Knave.',
  },
  {
    id: 'logic-2',
    title: 'The Three Study Rooms',
    scenario:
      'Room A says: "The quietest desk is in Room B." Room B says: "The quietest desk is NOT here." Room C says: "The quietest desk is not in Room A." Only ONE sign tells the truth.',
    question: 'Which room has the quietest desk?',
    options: ['Room A', 'Room B', 'Room C', 'Cannot be determined'],
    correctIndex: 0,
    explanation:
      'If the desk is in Room A, then A is false, C is false, and B ("not in B") is true — giving exactly one true sign. Placing it in B makes A and C both true; placing it in C makes B and C both true.',
  },
  {
    id: 'logic-3',
    title: 'The Twin Archivists',
    scenario:
      'Two archivists, Nora and Felix, stand by the rare books vault. Nora says: "We are both Knaves." Felix remains silent.',
    question: 'What are Nora and Felix?',
    options: [
      'Nora is a Knave, Felix is a Knight',
      'Nora is a Knight, Felix is a Knave',
      'Both are Knaves',
      'Both are Knights',
    ],
    correctIndex: 0,
    explanation:
      'No Knight can claim to be a Knave, so Nora must be a Knave. Because a Knave always lies, "we are both Knaves" must be false — which forces Felix to be a Knight.',
  },
  {
    id: 'logic-4',
    title: 'The Timed Proof Podium',
    scenario:
      'Three scholars—Priya, Sam, and Owen—finished a proof sprint in 1st, 2nd, and 3rd place (no ties). Priya says: "I was not 1st." Sam says: "I was 3rd." Owen says: "I was not 3rd." Exactly ONE scholar lied.',
    question: 'Who finished in 1st place?',
    options: ['Priya', 'Sam', 'Owen', 'Not enough information'],
    correctIndex: 0,
    explanation:
      'If Priya lied, then Priya finished 1st, Sam tells the truth (3rd), and Owen tells the truth (2nd, not 3rd) — exactly one liar. If Sam lied, Owen cannot be 3rd either, forcing Priya to be 3rd, which makes both Sam and Owen conflict.',
  },
  {
    id: 'logic-5',
    title: 'The Exam Key Box',
    scenario:
      'Two locked boxes sit on a desk, and exactly ONE box contains the exam key. Gold Box says: "The key is in the Silver Box." Silver Box says: "Exactly one of these two labels is true."',
    question: 'Which box contains the key?',
    options: [
      'The Gold Box',
      'The Silver Box',
      'Both boxes contain a key',
      'Cannot be determined',
    ],
    correctIndex: 0,
    explanation:
      'Case 1: Silver is TRUE → exactly one label is true, so Gold must be FALSE → key is not in Silver → key is in the Gold Box. Case 2: Silver is FALSE → either 0 or 2 labels are true; since Silver is false, Gold must also be FALSE → key is not in Silver → key is in the Gold Box. Both cases uniquely place the key in the Gold Box.',
  },
  {
    id: 'logic-6',
    title: 'The Honest Witness',
    scenario:
      'Three students — Kai, Tess, and Omar — are Knights or Knaves. Kai says: "Tess is a Knave." Tess says: "Kai and Omar are of the same type."',
    question: 'What is Omar?',
    options: [
      'Omar is definitely a Knave',
      'Omar is definitely a Knight',
      'Omar is the same type as Kai',
      'Cannot be determined',
    ],
    correctIndex: 0,
    explanation:
      'Case 1: Kai is a Knight → Tess is a Knave → Tess lies, so Kai & Omar are DIFFERENT → Omar is a Knave. Case 2: Kai is a Knave → Tess is a Knight → Tess tells the truth, so Kai & Omar are the SAME → Omar is a Knave. In every valid case, Omar is a Knave!',
  },
];

export interface SyllogismPuzzle {
  id: string;
  topic: string;
  premise1: string;
  premise2: string;
  conclusion: string;
  verdict: 'valid' | 'invalid' | 'undetermined';
  proof: string;
}

export const SYLLOGISM_PUZZLES: SyllogismPuzzle[] = [
  {
    id: 'syl-1',
    topic: 'Categorical Transitivity',
    premise1: 'All honors fellows attend the Friday research colloquium.',
    premise2: 'No one who attends the Friday research colloquium skips the lab briefing.',
    conclusion: 'Therefore, no honors fellow skips the lab briefing.',
    verdict: 'valid',
    proof:
      'Honors Fellows ⊆ Colloquium Attendees, and Colloquium Attendees ∩ Briefing Skippers = ∅. Thus Honors Fellows ∩ Briefing Skippers = ∅ (strictly valid Celarent syllogism).',
  },
  {
    id: 'syl-2',
    topic: 'Undistributed Middle Fallacy',
    premise1: 'All quantum mechanics textbooks require multivariable calculus.',
    premise2: 'All fluid dynamics textbooks require multivariable calculus.',
    conclusion: 'Therefore, some quantum mechanics textbooks are fluid dynamics textbooks.',
    verdict: 'invalid',
    proof:
      'Sharing a superset (requiring calculus) never forces two subsets to overlap. This is the classic Fallacy of the Undistributed Middle.',
  },
  {
    id: 'syl-3',
    topic: 'Existential Quantifier Scope',
    premise1: 'Some cognitive science majors play competitive chess.',
    premise2: 'All competitive chess players train pattern recognition weekly.',
    conclusion: 'Therefore, some cognitive science majors train pattern recognition weekly.',
    verdict: 'valid',
    proof:
      'At least one cognitive science major belongs to the set of chess players, and every member of that set trains pattern recognition weekly (valid Darii syllogism).',
  },
  {
    id: 'syl-4',
    topic: 'Affirming the Consequent',
    premise1: 'If a proof uses induction, it establishes a base case.',
    premise2: 'Elena’s proof establishes a base case.',
    conclusion: 'Therefore, Elena’s proof uses induction.',
    verdict: 'invalid',
    proof:
      'From P → Q and Q, you cannot infer P. Other proof techniques (like recursive definitions or well-ordering checks) can also establish a base case.',
  },
  {
    id: 'syl-5',
    topic: 'Modus Tollens Contrapositive',
    premise1: 'If an algorithm runs in O(1) space, it cannot allocate an N-element auxiliary array.',
    premise2: 'Merge Sort allocates an N-element auxiliary array.',
    conclusion: 'Therefore, Merge Sort does not run in O(1) space.',
    verdict: 'valid',
    proof:
      'From P → ¬Q and Q, Modus Tollens rigorously deduces ¬P. Standard top-down Merge Sort uses O(N) auxiliary space.',
  },
  {
    id: 'syl-6',
    topic: 'Partial Overlap Ambiguity',
    premise1: 'Some graduate seminars are held in the East Wing.',
    premise2: 'Some rooms in the East Wing have chalkboard walls.',
    conclusion: 'Therefore, at least one graduate seminar is held in a room with chalkboard walls.',
    verdict: 'undetermined',
    proof:
      'The seminars in the East Wing could occupy rooms WITHOUT chalkboard walls while other East Wing rooms have chalkboards. The premises neither guarantee nor rule out overlap.',
  },
  {
    id: 'syl-7',
    topic: 'Universal Negative Conversion',
    premise1: 'No prime number greater than 2 is even.',
    premise2: 'Every multiple of 6 is even.',
    conclusion: 'Therefore, no multiple of 6 is a prime number greater than 2.',
    verdict: 'valid',
    proof:
      'Multiples of 6 ⊆ Even numbers, and Even numbers are disjoint from Primes > 2. Thus Multiples of 6 and Primes > 2 are completely disjoint (valid Camestres syllogism).',
  },
  {
    id: 'syl-8',
    topic: 'Denying the Antecedent',
    premise1: 'All students who finish the mock exam early review their error log.',
    premise2: 'Marcus did not finish the mock exam early.',
    conclusion: 'Therefore, Marcus did not review his error log.',
    verdict: 'invalid',
    proof:
      'Finishing early is sufficient to review the error log, not necessary. Marcus could still review his error log afterward — this is Denying the Antecedent.',
  },
];

