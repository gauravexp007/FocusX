import { BookContentPage, BookItem } from '../types';

interface CuratedSection {
  chapter: string;
  heading: string;
  paragraphs: string[];
  calloutQuote?: string;
}

const BOOK_CURATED_CONTENT: Record<string, CuratedSection[]> = {
  kahneman: [
    {
      chapter: 'Part IV · Choices & Prospect Theory',
      heading: 'The Experiencing Self and the Remembering Self',
      paragraphs: [
        'Human cognition runs on two parallel narratives whenever we evaluate an experience: the moment-by-moment stream of consciousness lived by the experiencing self, and the retrospective scorekeeper controlled by the remembering self.',
        'Experiments on cold-pressor endurance and clinical procedures reveal a startling asymmetry called duration neglect. When people recall an episode, its total length carries almost zero weight compared to the peak emotional intensity and how the episode ended.',
        'Because our choices for the future are authored exclusively by the remembering self, we frequently optimize for stories rather than for lived well-being. Recognizing this gap is the first discipline of calibrated decision-making.',
      ],
      calloutQuote:
        'Nothing in life is as important as you think it is, while you are thinking about it.',
    },
    {
      chapter: 'Part IV · Choices & Prospect Theory',
      heading: 'Loss Aversion and Reference Points',
      paragraphs: [
        'Expected utility theory assumed that rational agents evaluate outcomes purely in terms of final states of wealth. In laboratory and real-world studies alike, however, carriers of value are changes relative to a neutral reference point.',
        'The response curve is concave for gains and convex for losses, yet significantly steeper on the loss side. Empirically, the psychological pain of losing a given amount is roughly twice as intense as the pleasure of gaining the exact same amount.',
        'When framing academic or strategic problems, simply shifting the reference point transforms risk-averse hesitation into bold risk-seeking behavior—even when the underlying probabilities remain mathematically identical.',
      ],
    },
    {
      chapter: 'Part V · Two Selves',
      heading: 'WYSIATI and Cognitive Ease',
      paragraphs: [
        'System 1 excels at constructing the most coherent story possible out of whatever fragments happen to be activated in working memory. Kahneman summarizes this reflex as WYSIATI: What You See Is All There Is.',
        'Fluency and repetition create cognitive ease, a sensation that silently masquerades as truth. A clear font, a rhythmic aphorism, or a familiar premise lowers the vigilance of System 2 and accelerates premature confidence.',
        'Counteracting intuitive overconfidence requires slowing down at key checkpoints: ask what base rate governs the problem, list evidence that would falsify your hypothesis, and conduct a pre-mortem before committing.',
      ],
      calloutQuote:
        'Intelligence is not only the ability to reason; it is also the ability to find relevant material in memory and deploy attention when needed.',
    },
    {
      chapter: 'Part III · Overconfidence',
      heading: 'The Outside View and Planning Fallacy',
      paragraphs: [
        'Left to our own devices, we forecast project timelines by building an inside-view narrative—imagining every step unfolding cleanly without friction, illness, or ambiguous requirements.',
        'Reference class forecasting forces the outside view: gather completion statistics for comparable past projects first, anchor your baseline estimate to that distribution, and only then make disciplined adjustments for unique details.',
        'Students who estimate study blocks using their actual past logs rather than best-case intentions reduce deadline crunches by nearly half across a fourteen-week semester.',
      ],
    },
  ],
  kleppmann: [
    {
      chapter: 'Chapter 5 · Replication',
      heading: 'Leaders, Followers, and Replication Lag',
      paragraphs: [
        'Keeping a copy of the same data on multiple machines connected via a network serves three distinct goals: reducing latency for geographically distributed users, maintaining availability despite node failures, and scaling out read throughput.',
        'In leader-based replication, every write flows through a single designated replica that appends changes to a local log before streaming updates to followers. Synchronous followers guarantee up-to-date copies at the cost of blocking writes whenever one replica stalls.',
        'Most production clusters therefore run asynchronously—introducing replication lag. Reading from a stale follower right after writing produces eerie anomalies unless the application guarantees read-after-write consistency.',
      ],
      calloutQuote:
        'Reliability means continuing to work correctly, even when adversity arises.',
    },
    {
      chapter: 'Chapter 5 · Replication',
      heading: 'Monotonic Reads and Causal Ordering',
      paragraphs: [
        'Imagine refreshing a discussion thread and watching a newly posted comment appear, vanish on the next reload, and reappear seconds later. This time-travel anomaly occurs when consecutive requests hit followers with differing replication lags.',
        'Monotonic reads prevent backward jumps by routing each user consistently to the same replica, typically hashed from the user identifier. If that replica fails, the session reroutes cleanly to an equal-or-ahead sibling.',
        'Even subtler is consistent prefix reads: in partitioned databases, an observer may see an answer before the question that triggered it unless causally related writes share a partition or carry explicit logical timestamps.',
      ],
    },
    {
      chapter: 'Chapter 7 · Transactions',
      heading: 'Snapshot Isolation and Write Skew',
      paragraphs: [
        'Multi-Version Concurrency Control (MVCC) allows long-running analytical queries to read a consistent point-in-time snapshot without blocking concurrent writers. Readers never block writers, and writers never block readers.',
        'Yet snapshot isolation does not eliminate every race condition. Write skew arises when two concurrent transactions read the same overlapping premise, make mutually exclusive decisions, and update disjoint rows—violating an invariant neither noticed breaking.',
        'Preventing write skew requires either explicit row locks via SELECT FOR UPDATE, materializing conflict rows, or stepping up to true serializable isolation such as Serializable Snapshot Isolation (SSI).',
      ],
      calloutQuote:
        'A distributed system is one in which the failure of a computer you did not even know existed can render your own computer unusable.',
    },
    {
      chapter: 'Chapter 9 · Consistency and Consensus',
      heading: 'Linearizability Versus Serializability',
      paragraphs: [
        'Although the terms sound deceptively similar, linearizability and serializability describe fundamentally different guarantees. Serializability governs multi-object transactions so their combined effect matches some sequential execution order.',
        'Linearizability is a recency guarantee on a single register: once any read returns a newly written value, all subsequent reads—regardless of which client or replica executes them—must also observe that value or a later one.',
        'Combining both yields strict serializability, the gold standard for leader election, distributed locks, and uniqueness constraints across fault-prone networks.',
      ],
    },
  ],
  newport: [
    {
      chapter: 'Part II · The Rules',
      heading: 'Work Deeply and Ritualize Attention',
      paragraphs: [
        'Willpower is a finite daily reserve. Relying on spontaneous inspiration to begin demanding cognitive work almost always loses to the low-friction pull of inbox refreshes and shallow administrative busywork.',
        'The solution is building deliberate routines and rituals that remove ambiguity before a session begins: define where you will work, how long the uninterrupted block lasts, what single artifact defines completion, and which distractions remain physically unreachable.',
        'Over months of consistent practice, intense concentration ceases to feel like friction and becomes an automatic neurological groove—strengthening myelin sheaths along the exact circuits your craft demands.',
      ],
      calloutQuote:
        'If you do not produce, you will not thrive—no matter how skilled or talented you are.',
    },
    {
      chapter: 'Part II · The Rules',
      heading: 'Embrace Boredom and Attention Residue',
      paragraphs: [
        'Every time you glance at a notification for even ten seconds in the middle of a difficult derivation, a measurable fraction of your attention remains stuck on the previous context—a phenomenon researcher Sophie Leroy named attention residue.',
        'Switching back and forth between high-focus study and low-stimulus breaks rewires the brain to crave novelty at the slightest hint of cognitive difficulty. Instead of taking breaks from distraction, schedule deliberate windows for distraction and protect every other hour.',
        'Productive meditation—walking without screens while holding a single well-defined problem in mind—trains working memory to resist wandering and dramatically sharpens analytical stamina.',
      ],
    },
    {
      chapter: 'Part II · The Rules',
      heading: 'Drain the Shallows and Shutdown Ritual',
      paragraphs: [
        'Shallow work—logistical tasks performed while distracted—expands effortlessly to consume whatever calendar space remains unguarded. Cap shallow obligations explicitly and budget your day in fixed time blocks.',
        'Equally vital is a crisp evening shutdown ritual: review unfinished notes, verify tomorrow’s schedule, close every study tab, and speak a closing phrase that signals the mind that work is complete.',
        'Protected downtime does not compete with elite academic output; it restores directed attention and allows unconscious incubation to connect complex ideas overnight.',
      ],
    },
  ],
  neuro: [
    {
      chapter: 'Section II · Cell and Molecular Biology of the Neuron',
      heading: 'Ionic Basis of the Resting Membrane Potential',
      paragraphs: [
        'Every electrical signal in the nervous system begins with an electrochemical imbalance maintained across the lipid bilayer of the neuronal membrane. At rest, the interior of a typical mammalian neuron sits near -70 millivolts relative to extracellular fluid.',
        'Two forces govern each ion species: a chemical concentration gradient driving diffusion from high to low density, and an electrical gradient pulling charged ions toward opposite polarity. Where these forces cancel defines the Nernst equilibrium potential.',
        'Because resting membranes contain abundant non-gated potassium leak channels alongside the energy-consuming Na+/K+-ATPase pump (exporting 3 Na+ for every 2 K+ imported), resting voltage settles close to E_K while remaining primed for rapid depolarization.',
      ],
      calloutQuote:
        'The brain is not a passive receiver of sensory impressions; it is an active prediction engine sculpted by synaptic plasticity.',
    },
    {
      chapter: 'Section II · Action Potentials',
      heading: 'Voltage-Gated Channels and Saltatory Conduction',
      paragraphs: [
        'Once graded synaptic potentials depolarize the axon hillock past threshold (-55 mV), voltage-gated sodium channels undergo a rapid conformational shift, unleashing a regenerative inward sodium current that drives the membrane briefly to +30 mV.',
        'Within a millisecond, an intracellular inactivation gate plugs the sodium pore while delayed-rectifier potassium channels open, repolarizing the membrane and creating an absolute refractory window that guarantees unidirectional signal propagation.',
        'In myelinated axons, action potentials regenerate exclusively at discrete Nodes of Ranvier—boosting conduction velocity over fiftyfold while conserving metabolic ATP.',
      ],
    },
  ],
  algorithms: [
    {
      chapter: 'Chapter 4 · Divide-and-Conquer',
      heading: 'The Master Method for Recurrences',
      paragraphs: [
        'Divide-and-conquer algorithms partition an input of size n into a subproblems each of size n/b, solve them recursively, and combine partial answers in f(n) work—yielding the recurrence T(n) = aT(n/b) + f(n).',
        'Intuitively, the Master Theorem compares the driving function f(n) against the watershed polynomial n^(log_b a), which represents the number of leaves in the recursion tree.',
        'When leaf work dominates (Case 1), complexity scales with the watershed; when root and leaf costs balance across levels (Case 2), an extra logarithmic factor emerges; when root combine cost dominates (Case 3), f(n) dictates asymptotic runtime.',
      ],
      calloutQuote:
        'Choosing the right data structure turns an intractable exponential search into a clean logarithmic reflex.',
    },
    {
      chapter: 'Chapter 15 · Dynamic Programming',
      heading: 'Optimal Substructure and Overlapping Subproblems',
      paragraphs: [
        'Dynamic programming transforms redundant recursive trees into polynomial-time algorithms whenever two structural hallmarks hold: optimal solutions can be assembled from optimal subsolutions, and the same subproblems recur repeatedly.',
        'Top-down memoization retains the natural recursive structure while caching computed states in a lookup table. Bottom-up tabulation evaluates subproblems in strict topological order, often allowing space compression down to a single rolling row.',
        'Always verify your state transitions on minimal base cases before proving correctness by induction.',
      ],
    },
  ],
  design: [
    {
      chapter: 'Chapter 1 · The Psychopathology of Everyday Things',
      heading: 'Affordances, Signifiers, and Conceptual Models',
      paragraphs: [
        'Good design communicates silently. When a door requires a printed sign reading "PUSH" next to a vertical pull handle, the failure belongs not to the human user but to conflicting physical signifiers.',
        'An affordance is a relationship between the physical properties of an object and the capabilities of the person interacting with it. A signifier makes the intended action discoverable at a glance without training or guesswork.',
        'Pair clear signifiers with immediate, unmistakable feedback so users continuously confirm their mental model of the system.',
      ],
      calloutQuote:
        'Good design is actually a lot harder to notice than poor design, in part because good designs fit our needs so well that the design is invisible.',
    },
  ],
  atomic: [
    {
      chapter: 'Chapter 1 · The Surprising Power of Atomic Habits',
      heading: 'The Aggregation of Marginal Gains',
      paragraphs: [
        'Improving by just one percent each day seems imperceptible in any single afternoon, yet compounded over a full year it yields a thirty-seven-fold leap in capability. Conversely, tiny unexamined slips compound quietly in the opposite direction.',
        'Outcomes are a lagging measure of your habits. Instead of obsessing solely over distant semester grades, redesign the daily environment so the right study cues are obvious, attractive, low-friction, and immediately satisfying.',
      ],
      calloutQuote:
        'You do not rise to the level of your goals. You fall to the level of your systems.',
    },
  ],
  macro: [
    {
      chapter: 'Chapter 11 · Aggregate Demand I',
      heading: 'Building the IS-LM Equilibrium Framework',
      paragraphs: [
        'Short-run macroeconomic fluctuations emerge from the interplay between the market for goods and services (the IS curve) and the market for real money balances (the LM curve).',
        'Higher real interest rates raise borrowing costs and dampen planned investment, causing the IS curve to slope downward in output-interest space. Expansionary fiscal policy shifts IS rightward, lifting output and interest rates together unless accommodated by monetary easing.',
      ],
      calloutQuote:
        'Models are maps, not territories—their clarity comes from what they deliberately hold constant.',
    },
  ],
};

/**
 * Resolve rich readable BookContentPage for any page number of any built-in or manual book.
 * Guarantees opening a book at page 324 (or any page 1..totalPages) shows cohesive, grounded academic prose.
 */
export function getBuiltinBookPage(book: BookItem, pageNumber: number): BookContentPage {
  const safePage = Math.max(1, Math.min(book.totalPages, pageNumber));
  const curatedList = BOOK_CURATED_CONTENT[book.coverVariant] || BOOK_CURATED_CONTENT.kahneman;

  if (safePage === 1) {
    return {
      pageNumber: 1,
      chapter: book.category,
      heading: book.title,
      paragraphs: [
        `By ${book.author} · FocusX Scholar Edition (${book.totalPages} pages).`,
        `Welcome to your interactive reading desk. Hold and drag any page edge—or peel the lower corners—to turn sheets naturally. Use the studio dock below to highlight key passages, sketch diagrams with pen or graphite pencil, drop study stickers, draw shapes, or pin silk ribbon bookmarks.`,
        `Your reading progress and every margin annotation are saved automatically so pulling the hanging bookmark on the bookshelf always returns you directly to the last page read.`,
      ],
      calloutQuote: curatedList[0]?.calloutQuote,
    };
  }

  const sectionIndex = Math.floor((safePage - 1) / 2) % curatedList.length;
  const isOddContinuation = safePage % 2 === 1;
  const base = curatedList[sectionIndex];
  const chapterNum = Math.max(1, Math.ceil((safePage / Math.max(1, book.totalPages)) * 12));

  if (!isOddContinuation) {
    return {
      pageNumber: safePage,
      chapter: `${base.chapter} · Section ${chapterNum}`,
      heading: base.heading,
      paragraphs: base.paragraphs,
      calloutQuote: base.calloutQuote,
    };
  }

  const nextSection = curatedList[(sectionIndex + 1) % curatedList.length];
  return {
    pageNumber: safePage,
    chapter: `${nextSection.chapter} · Folio ${safePage}`,
    heading: `${base.heading} — Applied Synthesis`,
    paragraphs: [
      nextSection.paragraphs[0],
      `Applied study checkpoint (p. ${safePage}): Summarize the central mechanism from "${base.heading}" in two sentences of your own words, then test whether an edge case in ${book.category} violates its assumptions.`,
      nextSection.paragraphs[1] || base.paragraphs[base.paragraphs.length - 1],
    ],
    calloutQuote: nextSection.calloutQuote,
  };
}
