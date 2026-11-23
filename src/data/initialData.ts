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
    rating: 5,
    lastRead: 'Oct 28',
  },
  {
    id: 'book-8',
    title: 'Macroeconomics: Theory & Policy',
    author: 'N. Gregory Mankiw',
    category: 'Economics',
    shelf: 'want',
    currentPage: 0,
    totalPages: 580,
    activeChapterPages: 30,
    coverVariant: 'macro',
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
      'If Maya were a Knave, her statement ("at least one is a Knave") would be true — a contradiction! So Maya must be a Knight, making her statement true, which forces Leo to be a Knave.',
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
      'If the desk is in Room A, then A is false, C is false, and B ("not in B") is true — giving exactly one true sign! Putting it in B makes A & C true (2 true); putting it in C makes B & C true (2 true).',
  },
  {
    id: 'logic-3',
    title: 'The Seminar Syllogism',
    scenario:
      'Premise 1: All honors fellows attend the Friday colloquium. Premise 2: No one who attends the Friday colloquium skips the lab briefing. Premise 3: Jordan skipped the lab briefing.',
    question: 'Which conclusion is strictly valid?',
    options: [
      'Jordan is definitely not an honors fellow',
      'Jordan attended the Friday colloquium late',
      'Some honors fellows skip the lab briefing',
      'Jordan is an honors fellow in another department',
    ],
    correctIndex: 0,
    explanation:
      'By contrapositive: Skipping the lab briefing implies Jordan did not attend the Friday colloquium. Not attending the colloquium implies Jordan cannot be an honors fellow.',
  },
  {
    id: 'logic-4',
    title: 'The Two Envelopes Paradox Variant',
    scenario:
      'Three scholars—Priya, Sam, and Owen—finished a timed proof in 1st, 2nd, and 3rd place (no ties). Priya says: "I was not 1st." Sam says: "I was 3rd." Owen says: "I was not 3rd." Exactly ONE scholar lied.',
    question: 'Who finished in 1st place?',
    options: ['Priya', 'Sam', 'Owen', 'Not enough information'],
    correctIndex: 0,
    explanation:
      'If Sam lied (not 3rd), then Priya (not 1st) and Owen (not 3rd) both tell the truth, forcing Priya to be 3rd, so Owen & Sam are 1st/2nd — wait: let’s check if Priya lied! If Priya lied, Priya is 1st, Sam is 3rd (truth), Owen is 2nd (truth, not 3rd). That uniquely forces Priya = 1st!',
  },
];
