import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  CornerDownLeft,
  Delete,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Shuffle,
  SkipForward,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
  Zap,
} from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { LOGIC_PUZZLES, PUZZLE_24_DECKS, SYLLOGISM_PUZZLES } from '../data/initialData';
import { GameScores } from '../types';
import { ScholarAvatar } from './BookCoverArt';
import { BrainGameId, GameLogo, playGameTone } from './GameLogos';
import {
  FLOW_EASE,
  FLOW_SPRING,
  flowItem,
  SegmentedControl,
  staggerContainer,
} from './MotionPrimitives';

interface BrainGamesSectionProps {
  scores: GameScores;
  onUpdateScores: (updater: (prev: GameScores) => GameScores) => void;
  onNotify: (msg: string) => void;
}

type GameCategory = 'all' | 'math' | 'logic' | 'memory' | 'spatial';
type SprintOp = '+' | '−' | '×' | '÷';
type SprintMix = 'mixed' | 'addsub' | 'muldiv';
type SprintDiff = 'Warm-up' | 'Standard' | 'Pro';

interface SprintQuestion {
  a: number;
  b: number;
  op: SprintOp;
  answer: number;
  key: string;
}

interface OpBreakdown {
  solved: number;
  attempts: number;
}

const EMPTY_OP_STATS = (): Record<SprintOp, OpBreakdown> => ({
  '+': { solved: 0, attempts: 0 },
  '−': { solved: 0, attempts: 0 },
  '×': { solved: 0, attempts: 0 },
  '÷': { solved: 0, attempts: 0 },
});

const SPRINT_DURATION_MS = 60_000;
const STROOP_DURATION_MS = 30_000;

const STROOP_COLORS = [
  { name: 'RED', keyHint: '1 / R', hex: '#DC2626' },
  { name: 'BLUE', keyHint: '2 / B', hex: '#2563EB' },
  { name: 'GREEN', keyHint: '3 / G', hex: '#059669' },
  { name: 'AMBER', keyHint: '4 / A', hex: '#D97706' },
];

const GAME_META: Array<{
  id: BrainGameId;
  shortLabel: string;
  title: string;
  category: Exclude<GameCategory, 'all'>;
  subtitle: string;
  accentText: string;
}> = [
  {
    id: 'mathSprint',
    shortLabel: '60s Math Sprint',
    title: '60s Mixed Math Sprint',
    category: 'math',
    subtitle: 'Mixed + − × ÷',
    accentText: 'text-[#006948] dark:text-[#6EE7B7]',
  },
  {
    id: 'math24',
    shortLabel: '24-Math Blitz',
    title: '24-Math Blitz',
    category: 'math',
    subtitle: 'Target Expression',
    accentText: 'text-[#A3265B] dark:text-[#FFB1C6]',
  },
  {
    id: 'knights',
    shortLabel: 'Knights & Knaves',
    title: 'Knights & Knaves',
    category: 'logic',
    subtitle: 'Truth-Table Deduction',
    accentText: 'text-[#1D4ED8] dark:text-[#93C5FD]',
  },
  {
    id: 'syllogism',
    shortLabel: 'Syllogism Verifier',
    title: 'Syllogism Verifier',
    category: 'logic',
    subtitle: 'Premise Validity',
    accentText: 'text-[#6D28D9] dark:text-[#C4B5FD]',
  },
  {
    id: 'stroop',
    shortLabel: 'Stroop Reflex',
    title: 'Stroop Color Reflex',
    category: 'memory',
    subtitle: '30s Attention Test',
    accentText: 'text-[#DC2626] dark:text-[#FCA5A5]',
  },
  {
    id: 'memory',
    shortLabel: 'Pattern Matrix',
    title: 'Pattern Matrix Recall',
    category: 'spatial',
    subtitle: '4×4 Spatial Sequence',
    accentText: 'text-[#0F766E] dark:text-[#5EEAD4]',
  },
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSprintQuestion(
  mix: SprintMix,
  diff: SprintDiff,
  prevKey?: string
): SprintQuestion {
  const pool: SprintOp[] =
    mix === 'addsub'
      ? ['+', '−']
      : mix === 'muldiv'
        ? ['×', '÷']
        : ['+', '−', '×', '÷'];

  for (let attempt = 0; attempt < 12; attempt++) {
    const op = pool[Math.floor(Math.random() * pool.length)];
    let a = 0;
    let b = 0;
    let answer = 0;

    if (op === '+') {
      if (diff === 'Warm-up') {
        a = randInt(2, 25);
        b = randInt(2, 25);
      } else if (diff === 'Standard') {
        a = randInt(9, 68);
        b = randInt(7, 58);
      } else {
        a = randInt(24, 175);
        b = randInt(19, 145);
      }
      answer = a + b;
    } else if (op === '−') {
      if (diff === 'Warm-up') {
        b = randInt(2, 20);
        answer = randInt(2, 22);
      } else if (diff === 'Standard') {
        b = randInt(8, 55);
        answer = randInt(4, 65);
      } else {
        b = randInt(19, 125);
        answer = randInt(11, 145);
      }
      a = b + answer;
    } else if (op === '×') {
      if (diff === 'Warm-up') {
        a = randInt(2, 9);
        b = randInt(2, 9);
      } else if (diff === 'Standard') {
        a = randInt(3, 12);
        b = randInt(3, 12);
      } else {
        a = randInt(4, 16);
        b = randInt(3, 14);
      }
      answer = a * b;
    } else {
      // Exact clean integer division: dividend = divisor * quotient
      if (diff === 'Warm-up') {
        b = randInt(2, 9);
        answer = randInt(2, 9);
      } else if (diff === 'Standard') {
        b = randInt(2, 12);
        answer = randInt(3, 12);
      } else {
        b = randInt(3, 15);
        answer = randInt(4, 18);
      }
      a = b * answer;
    }

    const key = `${a}${op}${b}`;
    if (key !== prevKey) {
      return { a, b, op, answer, key };
    }
  }

  return { a: 12, b: 8, op: '+', answer: 20, key: '12+8' };
}

function safeEvaluateMath(tokens: string[]): number | null {
  const expr = tokens
    .join('')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');
  if (!expr.trim() || !/^[0-9+\-*/().\s]+$/.test(expr)) return null;
  try {
    const fn = new Function(`"use strict"; return (${expr});`);
    const result = fn();
    return typeof result === 'number' && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

function pickNextTile(prevTile: number | null): number {
  let next = Math.floor(Math.random() * 16);
  if (prevTile !== null && next === prevTile) {
    next = (next + 1 + Math.floor(Math.random() * 15)) % 16;
  }
  return next;
}

export const BrainGamesSection: React.FC<BrainGamesSectionProps> = ({
  scores,
  onUpdateScores,
  onNotify,
}) => {
  const [activeGame, setActiveGame] = useState<BrainGameId>('mathSprint');
  const [categoryFilter, setCategoryFilter] = useState<GameCategory>('all');
  const [muted, setMuted] = useState(false);

  const arenaRef = useRef<HTMLElement | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const onUpdateScoresRef = useRef(onUpdateScores);
  onUpdateScoresRef.current = onUpdateScores;
  const onNotifyRef = useRef(onNotify);
  onNotifyRef.current = onNotify;

  // =========================================================================
  // GAME 1: 60s MIXED MATH SPRINT (+ − × ÷)
  // =========================================================================
  const [sprintPhase, setSprintPhase] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [sprintMix, setSprintMix] = useState<SprintMix>('mixed');
  const [sprintDiff, setSprintDiff] = useState<SprintDiff>('Standard');
  const [sprintAutoCheck, setSprintAutoCheck] = useState(true);
  const [sprintMsLeft, setSprintMsLeft] = useState(SPRINT_DURATION_MS);
  const [sprintQuestion, setSprintQuestion] = useState<SprintQuestion>(() =>
    generateSprintQuestion('mixed', 'Standard')
  );
  const [sprintInput, setSprintInput] = useState('');
  const [sprintScore, setSprintScore] = useState(0);
  const [sprintSolved, setSprintSolved] = useState(0);
  const [sprintAttempts, setSprintAttempts] = useState(0);
  const [sprintStreak, setSprintStreak] = useState(0);
  const [sprintBestStreak, setSprintBestStreak] = useState(0);
  const [sprintOpStats, setSprintOpStats] = useState<Record<SprintOp, OpBreakdown>>(EMPTY_OP_STATS);
  const [sprintFlash, setSprintFlash] = useState<'none' | 'correct' | 'wrong'>('none');
  const [sprintNewRecord, setSprintNewRecord] = useState(false);

  const sprintEndAtRef = useRef<number>(0);
  const sprintInputRef = useRef<HTMLInputElement | null>(null);
  const sprintSummaryRef = useRef({ score: 0, solved: 0, attempts: 0, bestStreak: 0 });
  sprintSummaryRef.current = {
    score: sprintScore,
    solved: sprintSolved,
    attempts: sprintAttempts,
    bestStreak: sprintBestStreak,
  };

  // Independent 60s timer — depends ONLY on sprintPhase so fast answers never reset/freeze timer
  useEffect(() => {
    if (sprintPhase !== 'playing') return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, sprintEndAtRef.current - Date.now());
      setSprintMsLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        setSprintPhase('finished');
        playGameTone('finish', mutedRef.current);

        const { score, solved } = sprintSummaryRef.current;
        onUpdateScoresRef.current((prev) => {
          const prevBest = prev.mathSprintBest ?? 0;
          const prevQpm = prev.mathSprintHighQpm ?? 0;
          if (score > prevBest && score > 0) {
            setSprintNewRecord(true);
          }
          return {
            ...prev,
            mathSprintBest: Math.max(prevBest, score),
            mathSprintHighQpm: Math.max(prevQpm, solved),
            totalPulse: prev.totalPulse + Math.round(score * 0.5),
          };
        });
        onNotifyRef.current(
          `60s Math Sprint complete! ${solved} solved · ${score} pts.`
        );
      }
    }, 80);

    return () => window.clearInterval(id);
  }, [sprintPhase]);

  const startMathSprint = useCallback(
    (overrideMix?: SprintMix, overrideDiff?: SprintDiff) => {
      const mix = overrideMix ?? sprintMix;
      const diff = overrideDiff ?? sprintDiff;
      setSprintScore(0);
      setSprintSolved(0);
      setSprintAttempts(0);
      setSprintStreak(0);
      setSprintBestStreak(0);
      setSprintOpStats(EMPTY_OP_STATS());
      setSprintInput('');
      setSprintFlash('none');
      setSprintNewRecord(false);
      setSprintQuestion(generateSprintQuestion(mix, diff));
      sprintEndAtRef.current = Date.now() + SPRINT_DURATION_MS;
      setSprintMsLeft(SPRINT_DURATION_MS);
      setSprintPhase('playing');
      window.setTimeout(() => sprintInputRef.current?.focus(), 30);
    },
    [sprintMix, sprintDiff]
  );

  const triggerSprintFlash = useCallback((kind: 'correct' | 'wrong') => {
    setSprintFlash(kind);
    window.setTimeout(() => setSprintFlash('none'), 220);
  }, []);

  const scoreSprintCorrect = useCallback(
    (q: SprintQuestion) => {
      const nextStreak = sprintStreak + 1;
      const mult = nextStreak >= 15 ? 4 : nextStreak >= 10 ? 3 : nextStreak >= 5 ? 2 : 1;
      const diffBonus = sprintDiff === 'Pro' ? 15 : sprintDiff === 'Standard' ? 10 : 8;
      const gained = diffBonus * mult;

      setSprintScore((s) => s + gained);
      setSprintSolved((n) => n + 1);
      setSprintAttempts((a) => a + 1);
      setSprintStreak(nextStreak);
      setSprintBestStreak((b) => Math.max(b, nextStreak));
      setSprintOpStats((prev) => ({
        ...prev,
        [q.op]: {
          solved: prev[q.op].solved + 1,
          attempts: prev[q.op].attempts + 1,
        },
      }));
      setSprintInput('');
      setSprintQuestion(generateSprintQuestion(sprintMix, sprintDiff, q.key));
      triggerSprintFlash('correct');
      playGameTone('correct', mutedRef.current);
    },
    [sprintStreak, sprintDiff, sprintMix, triggerSprintFlash]
  );

  const handleSprintInputChange = useCallback(
    (raw: string) => {
      if (sprintPhase !== 'playing') return;
      const cleaned = raw.replace(/[^0-9-]/g, '').slice(0, 6);
      setSprintInput(cleaned);

      if (sprintAutoCheck && cleaned !== '' && cleaned !== '-') {
        const parsed = Number.parseInt(cleaned, 10);
        if (!Number.isNaN(parsed) && parsed === sprintQuestion.answer) {
          scoreSprintCorrect(sprintQuestion);
        }
      }
    },
    [sprintPhase, sprintAutoCheck, sprintQuestion, scoreSprintCorrect]
  );

  const handleSprintSubmit = useCallback(() => {
    if (sprintPhase !== 'playing') return;
    if (sprintInput === '' || sprintInput === '-') return;
    const parsed = Number.parseInt(sprintInput, 10);
    if (!Number.isNaN(parsed) && parsed === sprintQuestion.answer) {
      scoreSprintCorrect(sprintQuestion);
    } else {
      setSprintAttempts((a) => a + 1);
      setSprintStreak(0);
      setSprintOpStats((prev) => ({
        ...prev,
        [sprintQuestion.op]: {
          ...prev[sprintQuestion.op],
          attempts: prev[sprintQuestion.op].attempts + 1,
        },
      }));
      setSprintInput('');
      triggerSprintFlash('wrong');
      playGameTone('wrong', mutedRef.current);
    }
  }, [sprintPhase, sprintInput, sprintQuestion, scoreSprintCorrect, triggerSprintFlash]);

  const handleSprintSkip = useCallback(() => {
    if (sprintPhase !== 'playing') return;
    setSprintAttempts((a) => a + 1);
    setSprintStreak(0);
    setSprintOpStats((prev) => ({
      ...prev,
      [sprintQuestion.op]: {
        ...prev[sprintQuestion.op],
        attempts: prev[sprintQuestion.op].attempts + 1,
      },
    }));
    setSprintInput('');
    setSprintQuestion(generateSprintQuestion(sprintMix, sprintDiff, sprintQuestion.key));
    playGameTone('wrong', mutedRef.current);
    sprintInputRef.current?.focus();
  }, [sprintPhase, sprintQuestion, sprintMix, sprintDiff]);

  const handleSprintNumpad = (key: string) => {
    if (sprintPhase !== 'playing') return;
    if (key === 'CLEAR') {
      setSprintInput('');
    } else if (key === 'BACK') {
      setSprintInput((prev) => prev.slice(0, -1));
    } else if (key === 'SUBMIT') {
      handleSprintSubmit();
    } else {
      handleSprintInputChange(sprintInput + key);
    }
    sprintInputRef.current?.focus();
  };

  // Global keyboard support during active Math Sprint (when focus isn't already inside an input)
  useEffect(() => {
    if (activeGame !== 'mathSprint' || sprintPhase !== 'playing') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === sprintInputRef.current) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSprintSubmit();
        }
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleSprintInputChange(sprintInput + e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setSprintInput((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSprintSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSprintInput('');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeGame, sprintPhase, sprintInput, handleSprintInputChange, handleSprintSubmit]);

  // =========================================================================
  // GAME 2: 24-MATH BLITZ (FIXED: no digit concatenation + independent timer)
  // =========================================================================
  const [deckIndex, setDeckIndex] = useState(0);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [formulaTokens, setFormulaTokens] = useState<Array<{ token: string; digitIdx?: number }>>([]);
  const [difficulty24, setDifficulty24] = useState<'Zen' | 'Standard' | 'Master'>('Standard');
  const [mathTimeLeft, setMathTimeLeft] = useState(45);
  const [mathTimerActive, setMathTimerActive] = useState(false);
  const [mathExpired, setMathExpired] = useState(false);
  const [mathFeedback, setMathFeedback] = useState<string>(
    'Combine all 4 digits using +, −, ×, ÷ to equal 24.'
  );
  const [mathFeedbackTone, setMathFeedbackTone] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [showHint, setShowHint] = useState(false);

  const currentDeck = PUZZLE_24_DECKS[deckIndex];
  const liveEval = safeEvaluateMath(formulaTokens.map((t) => t.token));

  // Independent 24-Math countdown — depends ONLY on mathTimerActive
  useEffect(() => {
    if (!mathTimerActive) return;
    const id = window.setInterval(() => {
      setMathTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setMathTimerActive(false);
          setMathExpired(true);
          setMathFeedback('Time expired! Retry this deck or deal a fresh 4-digit set.');
          setMathFeedbackTone('error');
          playGameTone('wrong', mutedRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [mathTimerActive]);

  const durationFor24Mode = (mode: 'Zen' | 'Standard' | 'Master') =>
    mode === 'Zen' ? 60 : mode === 'Standard' ? 45 : 30;

  const setMathDifficulty = (mode: 'Zen' | 'Standard' | 'Master') => {
    setDifficulty24(mode);
    setMathTimeLeft(durationFor24Mode(mode));
    setMathTimerActive(false);
    setMathExpired(false);
    setFormulaTokens([]);
    setUsedIndices([]);
    setMathFeedback('Combine all 4 digits using +, −, ×, ÷ to equal 24.');
    setMathFeedbackTone('neutral');
  };

  const handlePressDigit = useCallback(
    (digit: number, idx: number) => {
      if (mathExpired || usedIndices.includes(idx)) return;
      const last = formulaTokens[formulaTokens.length - 1];
      if (last && (typeof last.digitIdx === 'number' || last.token === ')')) {
        setMathFeedback('Pick an operator (+, −, ×, ÷) before adding another digit.');
        setMathFeedbackTone('error');
        playGameTone('wrong', mutedRef.current);
        return;
      }
      if (!mathTimerActive && mathTimeLeft > 0) setMathTimerActive(true);
      setUsedIndices((prev) => [...prev, idx]);
      setFormulaTokens((prev) => [...prev, { token: String(digit), digitIdx: idx }]);
      setMathFeedbackTone('neutral');
    },
    [mathExpired, usedIndices, formulaTokens, mathTimerActive, mathTimeLeft]
  );

  const handlePressOperator = useCallback(
    (op: string) => {
      if (mathExpired) return;
      const last = formulaTokens[formulaTokens.length - 1];
      const isBinaryOp = ['+', '−', '×', '÷'].includes(op);

      if (isBinaryOp) {
        if (!last || ['+', '−', '×', '÷', '('].includes(last.token)) {
          setMathFeedback('Place a digit or closing parenthesis before an operator.');
          setMathFeedbackTone('error');
          return;
        }
      } else if (op === '(') {
        if (last && (typeof last.digitIdx === 'number' || last.token === ')')) {
          setMathFeedback('Add an operator before opening a new parenthesis.');
          setMathFeedbackTone('error');
          return;
        }
      } else if (op === ')') {
        const openCount = formulaTokens.filter((t) => t.token === '(').length;
        const closeCount = formulaTokens.filter((t) => t.token === ')').length;
        if (openCount <= closeCount || !last || ['+', '−', '×', '÷', '('].includes(last.token)) {
          setMathFeedback('Close parenthesis only after a digit with a matching "(".');
          setMathFeedbackTone('error');
          return;
        }
      }

      if (!mathTimerActive && mathTimeLeft > 0) setMathTimerActive(true);
      setFormulaTokens((prev) => [...prev, { token: op }]);
      setMathFeedbackTone('neutral');
    },
    [mathExpired, formulaTokens, mathTimerActive, mathTimeLeft]
  );

  const handleBackspace = useCallback(() => {
    if (mathExpired || formulaTokens.length === 0) return;
    const last = formulaTokens[formulaTokens.length - 1];
    setFormulaTokens((prev) => prev.slice(0, -1));
    if (typeof last.digitIdx === 'number') {
      setUsedIndices((prev) => prev.filter((i) => i !== last.digitIdx));
    }
  }, [mathExpired, formulaTokens]);

  const handleResetMath = () => {
    setFormulaTokens([]);
    setUsedIndices([]);
    setShowHint(false);
    if (mathExpired) {
      setMathExpired(false);
      setMathTimeLeft(durationFor24Mode(difficulty24));
      setMathTimerActive(false);
    }
    setMathFeedback('Expression cleared — build an equation equal to 24.');
    setMathFeedbackTone('neutral');
  };

  const handleDealNewMath = useCallback(
    (customMsg?: string) => {
      const nextIdx = (deckIndex + 1) % PUZZLE_24_DECKS.length;
      setDeckIndex(nextIdx);
      setFormulaTokens([]);
      setUsedIndices([]);
      setShowHint(false);
      setMathTimeLeft(durationFor24Mode(difficulty24));
      setMathTimerActive(false);
      setMathExpired(false);
      setMathFeedback(customMsg ?? 'Fresh deck dealt — use all 4 digits to make 24.');
      setMathFeedbackTone(customMsg ? 'success' : 'neutral');
    },
    [deckIndex, difficulty24]
  );

  const handleSubmitMath = useCallback(() => {
    if (mathExpired) return;
    if (usedIndices.length !== 4) {
      setMathFeedback(`Use all 4 digits (${usedIndices.length}/4 placed) before submitting.`);
      setMathFeedbackTone('error');
      playGameTone('wrong', mutedRef.current);
      return;
    }
    const result = safeEvaluateMath(formulaTokens.map((t) => t.token));
    if (result === null) {
      setMathFeedback('Expression syntax is incomplete — check your parentheses.');
      setMathFeedbackTone('error');
      playGameTone('wrong', mutedRef.current);
      return;
    }
    if (Math.abs(result - 24) < 0.0001) {
      const mult = difficulty24 === 'Master' ? 3 : difficulty24 === 'Standard' ? 2 : 1;
      const pts = 60 * mult;
      playGameTone('correct', mutedRef.current);
      onUpdateScoresRef.current((prev) => ({
        ...prev,
        math24: prev.math24 + pts,
        math24Streak: prev.math24Streak + 1,
        totalPulse: prev.totalPulse + pts,
      }));
      onNotifyRef.current(`Exact 24! +${pts} FocusX Cognitive points.`);
      handleDealNewMath(`Solved for +${pts} pts! New 4-digit deck ready.`);
    } else {
      setMathFeedback(
        `Evaluated to ${Number(result.toFixed(2))} — tweak operations to hit exactly 24.`
      );
      setMathFeedbackTone('error');
      playGameTone('wrong', mutedRef.current);
    }
  }, [mathExpired, usedIndices, formulaTokens, difficulty24, handleDealNewMath]);

  // Keyboard shortcuts for 24-Math Blitz
  useEffect(() => {
    if (activeGame !== 'math24' || mathExpired) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) {
        const val = Number(e.key);
        const matchIdx = currentDeck.digits.findIndex(
          (d, idx) => d === val && !usedIndices.includes(idx)
        );
        if (matchIdx !== -1) {
          e.preventDefault();
          handlePressDigit(val, matchIdx);
        }
      } else if (e.key === '+') {
        e.preventDefault();
        handlePressOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handlePressOperator('−');
      } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handlePressOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handlePressOperator('÷');
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        handlePressOperator(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitMath();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeGame,
    mathExpired,
    currentDeck.digits,
    usedIndices,
    handlePressDigit,
    handlePressOperator,
    handleBackspace,
    handleSubmitMath,
  ]);

  // =========================================================================
  // GAME 3: KNIGHTS & KNAVES LOGIC DEDUCTION
  // =========================================================================
  const [logicIdx, setLogicIdx] = useState(0);
  const [logicSelected, setLogicSelected] = useState<number | null>(null);
  const [logicSessionCorrect, setLogicSessionCorrect] = useState(0);
  const [logicSessionAnswered, setLogicSessionAnswered] = useState(0);
  const currentLogic = LOGIC_PUZZLES[logicIdx];

  const handleLogicChoice = (optIdx: number) => {
    if (logicSelected !== null) return;
    setLogicSelected(optIdx);
    setLogicSessionAnswered((n) => n + 1);
    if (optIdx === currentLogic.correctIndex) {
      setLogicSessionCorrect((n) => n + 1);
      playGameTone('correct', mutedRef.current);
      onUpdateScoresRef.current((prev) => ({
        ...prev,
        logicSolved: prev.logicSolved + 1,
        totalPulse: prev.totalPulse + 75,
      }));
      onNotifyRef.current('Correct deduction! +75 FocusX Cognitive points.');
    } else {
      playGameTone('wrong', mutedRef.current);
    }
  };

  // =========================================================================
  // GAME 4: SYLLOGISM VERIFIER (BRAND NEW REAL GAME)
  // =========================================================================
  const [sylIdx, setSylIdx] = useState(0);
  const [sylSelected, setSylSelected] = useState<'valid' | 'invalid' | 'undetermined' | null>(null);
  const [sylSessionCorrect, setSylSessionCorrect] = useState(0);
  const [sylSessionAnswered, setSylSessionAnswered] = useState(0);
  const [sylStreak, setSylStreak] = useState(0);
  const currentSyl = SYLLOGISM_PUZZLES[sylIdx];

  const handleSylChoice = useCallback(
    (choice: 'valid' | 'invalid' | 'undetermined') => {
      if (sylSelected !== null) return;
      setSylSelected(choice);
      setSylSessionAnswered((n) => n + 1);
      if (choice === currentSyl.verdict) {
        setSylSessionCorrect((n) => n + 1);
        setSylStreak((s) => s + 1);
        playGameTone('correct', mutedRef.current);
        onUpdateScoresRef.current((prev) => ({
          ...prev,
          syllogismSolved: (prev.syllogismSolved ?? 0) + 1,
          totalPulse: prev.totalPulse + 65,
        }));
        onNotifyRef.current('Syllogism verified! +65 FocusX Cognitive points.');
      } else {
        setSylStreak(0);
        playGameTone('wrong', mutedRef.current);
      }
    },
    [sylSelected, currentSyl.verdict]
  );

  // =========================================================================
  // GAME 5: STROOP COLOR REFLEX (FIXED: independent timer + summary + keys)
  // =========================================================================
  const [stroopPhase, setStroopPhase] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [stroopMsLeft, setStroopMsLeft] = useState(STROOP_DURATION_MS);
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopCorrect, setStroopCorrect] = useState(0);
  const [stroopAttempts, setStroopAttempts] = useState(0);
  const [stroopStreak, setStroopStreak] = useState(0);
  const [stroopWordIdx, setStroopWordIdx] = useState(0);
  const [stroopInkIdx, setStroopInkIdx] = useState(1);
  const [stroopRound, setStroopRound] = useState(0);
  const [stroopLastMs, setStroopLastMs] = useState<number | null>(null);
  const [stroopSessionBestMs, setStroopSessionBestMs] = useState<number | null>(null);
  const [stroopFlash, setStroopFlash] = useState<'none' | 'correct' | 'wrong'>('none');

  const stroopEndAtRef = useRef<number>(0);
  const stroopStampRef = useRef<number>(Date.now());
  const stroopStatsRef = useRef({ score: 0, correct: 0, attempts: 0 });
  stroopStatsRef.current = { score: stroopScore, correct: stroopCorrect, attempts: stroopAttempts };

  // Independent 30s countdown — depends ONLY on stroopPhase (fixes timer freeze!)
  useEffect(() => {
    if (stroopPhase !== 'playing') return;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, stroopEndAtRef.current - Date.now());
      setStroopMsLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        setStroopPhase('finished');
        playGameTone('finish', mutedRef.current);
        const { score } = stroopStatsRef.current;
        onUpdateScoresRef.current((prev) => ({
          ...prev,
          stroopHigh: Math.max(prev.stroopHigh, score),
          totalPulse: prev.totalPulse + score * 10,
        }));
        onNotifyRef.current(`Stroop 30s sprint finished! Final score: ${score}`);
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [stroopPhase]);

  const nextStroopPrompt = useCallback((prevInk?: number) => {
    const w = Math.floor(Math.random() * STROOP_COLORS.length);
    let ink = Math.floor(Math.random() * STROOP_COLORS.length);
    if (ink === w) ink = (ink + 1) % STROOP_COLORS.length;
    if (prevInk !== undefined && ink === prevInk) {
      ink = (ink + 1) % STROOP_COLORS.length;
      if (ink === w) ink = (ink + 1) % STROOP_COLORS.length;
    }
    setStroopWordIdx(w);
    setStroopInkIdx(ink);
    setStroopRound((r) => r + 1);
    stroopStampRef.current = Date.now();
  }, []);

  const startStroop = () => {
    setStroopScore(0);
    setStroopCorrect(0);
    setStroopAttempts(0);
    setStroopStreak(0);
    setStroopLastMs(null);
    setStroopSessionBestMs(null);
    setStroopFlash('none');
    stroopEndAtRef.current = Date.now() + STROOP_DURATION_MS;
    setStroopMsLeft(STROOP_DURATION_MS);
    setStroopPhase('playing');
    nextStroopPrompt();
  };

  const handleStroopAnswer = useCallback(
    (idx: number) => {
      if (stroopPhase !== 'playing') return;
      const elapsed = Math.max(80, Date.now() - stroopStampRef.current);
      setStroopAttempts((a) => a + 1);

      if (idx === stroopInkIdx) {
        setStroopScore((s) => s + 1);
        setStroopCorrect((c) => c + 1);
        setStroopStreak((st) => st + 1);
        setStroopLastMs(elapsed);
        setStroopSessionBestMs((prev) => (prev === null ? elapsed : Math.min(prev, elapsed)));
        setStroopFlash('correct');
        playGameTone('correct', mutedRef.current);
        onUpdateScoresRef.current((prev) => ({
          ...prev,
          stroopBestMs: Math.min(prev.stroopBestMs, elapsed),
        }));
      } else {
        setStroopScore((s) => Math.max(0, s - 1));
        setStroopStreak(0);
        setStroopFlash('wrong');
        playGameTone('wrong', mutedRef.current);
      }
      window.setTimeout(() => setStroopFlash('none'), 180);
      nextStroopPrompt(stroopInkIdx);
    },
    [stroopPhase, stroopInkIdx, nextStroopPrompt]
  );

  // Keyboard shortcuts for Stroop (1-4 or R/B/G/A)
  useEffect(() => {
    if (activeGame !== 'stroop' || stroopPhase !== 'playing') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === '1' || k === 'r') handleStroopAnswer(0);
      else if (k === '2' || k === 'b') handleStroopAnswer(1);
      else if (k === '3' || k === 'g') handleStroopAnswer(2);
      else if (k === '4' || k === 'a') handleStroopAnswer(3);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeGame, stroopPhase, handleStroopAnswer]);

  // =========================================================================
  // GAME 6: PATTERN MATRIX RECALL (FIXED: timer cleanup + no duplicate repeats)
  // =========================================================================
  const [memLevel, setMemLevel] = useState(1);
  const [memPhase, setMemPhase] = useState<'idle' | 'showing' | 'input' | 'levelup' | 'wrong'>('idle');
  const [memSequence, setMemSequence] = useState<number[]>([]);
  const [memLitTile, setMemLitTile] = useState<number | null>(null);
  const [memExpectedTile, setMemExpectedTile] = useState<number | null>(null);
  const [memWrongTile, setMemWrongTile] = useState<number | null>(null);
  const [memUserStep, setMemUserStep] = useState(0);
  const memTimersRef = useRef<number[]>([]);

  const clearMemTimers = useCallback(() => {
    memTimersRef.current.forEach((id) => window.clearTimeout(id));
    memTimersRef.current = [];
  }, []);

  const scheduleMemTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    memTimersRef.current.push(id);
  }, []);

  useEffect(() => {
    return () => clearMemTimers();
  }, [clearMemTimers]);

  const playSequence = useCallback(
    (seq: number[]) => {
      clearMemTimers();
      setMemPhase('showing');
      setMemUserStep(0);
      setMemExpectedTile(null);
      setMemWrongTile(null);
      setMemLitTile(null);

      seq.forEach((tile, i) => {
        scheduleMemTimer(() => {
          setMemLitTile(tile);
          playGameTone('tile', mutedRef.current, tile);
        }, i * 620 + 280);
        scheduleMemTimer(() => {
          setMemLitTile(null);
        }, i * 620 + 680);
      });

      scheduleMemTimer(() => {
        setMemLitTile(null);
        setMemPhase('input');
      }, seq.length * 620 + 360);
    },
    [clearMemTimers, scheduleMemTimer]
  );

  const startMemoryGame = () => {
    clearMemTimers();
    const t1 = pickNextTile(null);
    const t2 = pickNextTile(t1);
    const t3 = pickNextTile(t2);
    const firstSeq = [t1, t2, t3];
    setMemLevel(1);
    setMemSequence(firstSeq);
    playSequence(firstSeq);
  };

  const handleMemoryTileClick = (tileIdx: number) => {
    if (memPhase !== 'input') return;
    setMemLitTile(tileIdx);
    scheduleMemTimer(() => setMemLitTile(null), 190);

    if (tileIdx === memSequence[memUserStep]) {
      playGameTone('tile', mutedRef.current, tileIdx);
      const nextStep = memUserStep + 1;
      if (nextStep === memSequence.length) {
        const nextLvl = memLevel + 1;
        setMemLevel(nextLvl);
        setMemPhase('levelup');
        playGameTone('correct', mutedRef.current);
        onUpdateScoresRef.current((prev) => ({
          ...prev,
          memoryBestLevel: Math.max(prev.memoryBestLevel, nextLvl),
          totalPulse: prev.totalPulse + 45,
        }));
        const nextSeq = [...memSequence, pickNextTile(memSequence[memSequence.length - 1])];
        setMemSequence(nextSeq);
        scheduleMemTimer(() => playSequence(nextSeq), 620);
      } else {
        setMemUserStep(nextStep);
      }
    } else {
      clearMemTimers();
      setMemWrongTile(tileIdx);
      setMemExpectedTile(memSequence[memUserStep]);
      setMemPhase('wrong');
      playGameTone('wrong', mutedRef.current);
    }
  };

  // Switch active game cleanly (pauses running timers / cleans up Pattern Matrix timeouts)
  const selectGame = (gameId: BrainGameId, shouldScroll = false) => {
    if (gameId !== activeGame) {
      if (sprintPhase === 'playing') {
        setSprintPhase('idle');
        setSprintMsLeft(SPRINT_DURATION_MS);
      }
      if (stroopPhase === 'playing') {
        setStroopPhase('idle');
        setStroopMsLeft(STROOP_DURATION_MS);
      }
      if (mathTimerActive) {
        setMathTimerActive(false);
      }
      if (memPhase === 'showing' || memPhase === 'levelup') {
        clearMemTimers();
        setMemLitTile(null);
        setMemPhase('idle');
      }
      setActiveGame(gameId);
    }
    if (shouldScroll) {
      arenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Derived metrics for Cognitive Vitals Radar & Catalog Cards
  const sprintBest = scores.mathSprintBest ?? 0;
  const sprintHighQpm = scores.mathSprintHighQpm ?? 0;
  const sylSolved = scores.syllogismSolved ?? 0;

  const radarData = [
    {
      metric: 'Speed',
      score: Math.min(
        99,
        Math.round(
          68 +
            (1000 - Math.min(900, scores.stroopBestMs)) / 30 +
            Math.min(18, sprintHighQpm * 0.7)
        )
      ),
    },
    { metric: 'Memory', score: Math.min(99, 64 + scores.memoryBestLevel * 5) },
    { metric: 'Logic', score: Math.min(99, 70 + (scores.logicSolved + sylSolved) * 2) },
    {
      metric: 'Math',
      score: Math.min(99, 72 + Math.round((scores.math24 + sprintBest) / 35)),
    },
  ];

  const getCatalogStat = (id: BrainGameId): string => {
    switch (id) {
      case 'mathSprint':
        return sprintBest > 0 ? `Best: ${sprintBest} pts · ${sprintHighQpm}/min` : '60s Mixed + − × ÷';
      case 'math24':
        return `${scores.math24} pts · ${scores.math24Streak}x streak`;
      case 'knights':
        return `${scores.logicSolved} proofs solved`;
      case 'syllogism':
        return `${sylSolved} verified · ${SYLLOGISM_PUZZLES.length} cases`;
      case 'stroop':
        return `Best: ${scores.stroopBestMs}ms · High ${scores.stroopHigh}`;
      case 'memory':
        return `Best Level ${scores.memoryBestLevel}`;
    }
  };

  const visibleCatalog = GAME_META.filter(
    (g) => categoryFilter === 'all' || g.category === categoryFilter
  );

  const sprintSecsDisplay = (sprintMsLeft / 1000).toFixed(sprintMsLeft < 10000 ? 1 : 0);
  const sprintPct = Math.max(0, Math.min(100, (sprintMsLeft / SPRINT_DURATION_MS) * 100));
  const sprintAccuracy =
    sprintAttempts > 0 ? Math.round((sprintSolved / sprintAttempts) * 100) : 100;
  const sprintMultiplier =
    sprintStreak >= 15 ? 4 : sprintStreak >= 10 ? 3 : sprintStreak >= 5 ? 2 : 1;

  const stroopSecsDisplay = (stroopMsLeft / 1000).toFixed(stroopMsLeft < 10000 ? 1 : 0);
  const stroopPct = Math.max(0, Math.min(100, (stroopMsLeft / STROOP_DURATION_MS) * 100));
  const stroopAccuracy =
    stroopAttempts > 0 ? Math.round((stroopCorrect / stroopAttempts) * 100) : 100;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header & Top Vitals */}
      <motion.div variants={flowItem} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
            Mind & Logic Games
          </h1>
          <p className="text-sm text-[#574146] dark:text-[#B5A8B2] mt-1">
            Six focused cognitive drills with live timers, instant feedback, and unique arena emblems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono tabular-nums">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute game sounds' : 'Mute game sounds'}
            title={muted ? 'Unmute game sounds' : 'Mute game sounds'}
            className="fx-card px-3 py-2 rounded-xl flex items-center gap-1.5 text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-[#F5EFF3] cursor-pointer whitespace-nowrap"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#006948] dark:text-[#6EE7B7]" />}
            <span className="font-sans font-semibold">{muted ? 'Muted' : 'Sound On'}</span>
          </button>

          <div className="fx-card px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap">
            <Flame className="w-4 h-4 text-[#A3265B] dark:text-[#FFB1C6]" />
            <span className="font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              {Math.max(scores.math24Streak, sprintBestStreak)}x combo
            </span>
          </div>

          <div className="fx-card px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap">
            <Trophy className="w-4 h-4 text-[#006948] dark:text-[#6EE7B7]" />
            <span className="font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              {scores.totalPulse.toLocaleString()} pts
            </span>
          </div>
        </div>
      </motion.div>

      {/* 6-Game Arena Switcher with Unique Bespoke Logo per Game */}
      <motion.div variants={flowItem}>
        <div
          role="tablist"
          aria-label="Select cognitive game"
          className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#F3E7EE]/85 dark:bg-[#221D2A]/90 border border-[#EAE0E5] dark:border-[#322C3C]"
        >
          {GAME_META.map((game) => {
            const active = activeGame === game.id;
            return (
              <button
                key={game.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectGame(game.id)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'text-[#1F1A1E] dark:text-[#F5EFF3]'
                    : 'text-[#574146] dark:text-[#B5A8B2] hover:text-[#1F1A1E] dark:hover:text-[#F5EFF3]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="games-arena-active-tab"
                    transition={FLOW_SPRING}
                    className="absolute inset-0 rounded-xl bg-white dark:bg-[#312A3D] shadow-xs border border-[#EAE0E5] dark:border-[#433A52]"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <GameLogo gameId={game.id} size="xs" />
                  <span>{game.shortLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* FEATURED INTERACTIVE GAME ARENA */}
      <motion.section
        ref={arenaRef}
        variants={flowItem}
        className="fx-surface-tinted rounded-3xl p-5 sm:p-6 lg:p-8 overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {/* ==============================================================
              1. 60s MIXED MATH SPRINT (+ − × ÷)
             ============================================================== */}
          {activeGame === 'mathSprint' && (
            <motion.div
              key="arena-mathSprint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: FLOW_EASE }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch"
            >
              {/* Left Control & Stats Column */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <GameLogo gameId="mathSprint" size="lg" />
                  <div>
                    <span className="text-xs font-semibold text-[#006948] dark:text-[#6EE7B7]">
                      1-Minute Arithmetic Sprint
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-0.5 leading-tight">
                      60s Math Sprint
                    </h2>
                    <p className="text-xs text-[#574146] dark:text-[#B5A8B2] mt-1 leading-relaxed">
                      Solve mixed addition, subtraction, multiplication, and exact integer division in 60 seconds.
                    </p>
                  </div>
                </div>

                {/* Operation Mix Selector */}
                <div className="bg-white dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] p-3.5 rounded-2xl flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8A7177] font-medium">Operations</span>
                      <span className="font-mono font-semibold text-[#006948] dark:text-[#6EE7B7]">
                        {sprintMix === 'mixed' ? '+ − × ÷' : sprintMix === 'addsub' ? '+ & −' : '× & ÷'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'mixed', label: '+ − × ÷' },
                          { id: 'addsub', label: '+ & −' },
                          { id: 'muldiv', label: '× & ÷' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSprintMix(opt.id);
                            if (sprintPhase === 'playing') {
                              startMathSprint(opt.id, sprintDiff);
                            } else {
                              setSprintQuestion(generateSprintQuestion(opt.id, sprintDiff));
                            }
                          }}
                          className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                            sprintMix === opt.id
                              ? 'bg-[#006948] text-white dark:bg-[#58CD9B] dark:text-[#072116]'
                              : 'bg-[#FCF1F6] dark:bg-[#1B1722] text-[#574146] dark:text-[#B5A8B2] hover:text-[#1F1A1E]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8A7177] font-medium">Difficulty</span>
                      <span className="font-semibold text-[#A3265B] dark:text-[#FFB1C6]">
                        {sprintDiff}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Warm-up', 'Standard', 'Pro'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            setSprintDiff(lvl);
                            if (sprintPhase === 'playing') {
                              startMathSprint(sprintMix, lvl);
                            } else {
                              setSprintQuestion(generateSprintQuestion(sprintMix, lvl));
                            }
                          }}
                          className={`py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                            sprintDiff === lvl
                              ? 'bg-[#A3265B] text-white dark:bg-[#F56498] dark:text-[#1A0814]'
                              : 'bg-[#FCF1F6] dark:bg-[#1B1722] text-[#574146] dark:text-[#B5A8B2] hover:text-[#1F1A1E]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center justify-between gap-2 pt-1 border-t border-[#EAE0E5] dark:border-[#342D3E] text-xs cursor-pointer select-none">
                    <span className="text-[#574146] dark:text-[#C4B7C1] font-medium">
                      Instant auto-check
                    </span>
                    <input
                      type="checkbox"
                      checked={sprintAutoCheck}
                      onChange={(e) => setSprintAutoCheck(e.target.checked)}
                      className="accent-[#006948] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Live Operation Counter Breakdown */}
                <div className="grid grid-cols-4 gap-2 font-mono tabular-nums">
                  {(['+', '−', '×', '÷'] as const).map((op) => (
                    <div
                      key={op}
                      className="bg-white dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl py-2 px-2.5 text-center"
                    >
                      <div className="text-sm font-bold text-[#006948] dark:text-[#6EE7B7]">{op}</div>
                      <div className="text-xs font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                        {sprintOpStats[op].solved}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Interactive Arena */}
              <div className="lg:col-span-8 bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-xs">
                {/* Top HUD + Depleting 60s Bar */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 font-mono tabular-nums">
                    <div className="flex items-center gap-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 font-bold ${
                          sprintMsLeft <= 10000 && sprintPhase === 'playing'
                            ? 'text-[#DC2626] dark:text-[#FCA5A5]'
                            : 'text-[#1F1A1E] dark:text-[#F5EFF3]'
                        }`}
                      >
                        <Timer className="w-4 h-4" />
                        {sprintSecsDisplay}s
                      </span>
                      <span className="text-[#574146] dark:text-[#B5A8B2]">
                        Score:{' '}
                        <strong className="text-[#006948] dark:text-[#6EE7B7]">{sprintScore}</strong>
                      </span>
                      <span className="text-[#574146] dark:text-[#B5A8B2]">
                        Solved:{' '}
                        <strong className="text-[#1F1A1E] dark:text-[#F5EFF3]">{sprintSolved}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 font-bold text-[#A3265B] dark:text-[#FFB1C6]">
                        <Zap className="w-3.5 h-3.5" />
                        {sprintStreak} streak · {sprintMultiplier}×
                      </span>
                      {sprintPhase === 'playing' && (
                        <button
                          type="button"
                          onClick={() => startMathSprint()}
                          className="inline-flex items-center gap-1 font-sans font-semibold text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] cursor-pointer whitespace-nowrap"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restart
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#F3E7EE] dark:bg-[#17131E] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-100 ${
                        sprintMsLeft <= 10000
                          ? 'bg-[#DC2626]'
                          : 'bg-gradient-to-r from-[#059669] to-[#10B981]'
                      }`}
                      style={{ width: `${sprintPct}%` }}
                    />
                  </div>
                </div>

                {/* Idle / Playing / Finished Center Stage */}
                {sprintPhase === 'idle' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-5">
                    <div className="flex items-center gap-3 font-mono text-2xl sm:text-3xl font-bold text-[#574146] dark:text-[#C4B7C1] select-none">
                      <span className="px-3.5 py-2 rounded-xl bg-[#ECFDF5] dark:bg-[#133A2E] text-[#059669] dark:text-[#6EE7B7]">+</span>
                      <span className="px-3.5 py-2 rounded-xl bg-[#FEF3C7] dark:bg-[#3F2E14] text-[#D97706] dark:text-[#FDE68A]">−</span>
                      <span className="px-3.5 py-2 rounded-xl bg-[#FCE7F3] dark:bg-[#3F1930] text-[#BE185D] dark:text-[#F9A8D4]">×</span>
                      <span className="px-3.5 py-2 rounded-xl bg-[#EDE9FE] dark:bg-[#2A204A] text-[#6D28D9] dark:text-[#C4B5FD]">÷</span>
                    </div>
                    <div className="max-w-md">
                      <h3 className="font-display text-xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                        Ready for a 1-Minute Mental Math Sprint?
                      </h3>
                      <p className="text-xs text-[#574146] dark:text-[#B5A8B2] mt-1.5 leading-relaxed">
                        Type answers with your keyboard or tap the keypad. Build streaks of 5, 10, and 15 for up to <strong>4×</strong> combo points.
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => startMathSprint()}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#006948] hover:bg-[#00553A] text-white dark:bg-[#58CD9B] dark:hover:bg-[#49BA8B] dark:text-[#072116] text-sm font-bold cursor-pointer shadow-sm whitespace-nowrap"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start 1-Minute Sprint
                    </motion.button>
                  </div>
                )}

                {sprintPhase === 'playing' && (
                  <div className="flex flex-col gap-5">
                    {/* Problem Equation Stage */}
                    <div
                      className={`rounded-2xl border px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-150 ${
                        sprintFlash === 'correct'
                          ? 'bg-[#D1FAE5]/60 dark:bg-[#133A2E]/70 border-[#059669]'
                          : sprintFlash === 'wrong'
                            ? 'bg-[#FFDAD6]/60 dark:bg-[#4A1C22]/70 border-[#DC2626]'
                            : 'bg-[#FCF1F6] dark:bg-[#18141E] border-[#EAE0E5] dark:border-[#312B3A]'
                      }`}
                    >
                      <motion.div
                        key={sprintQuestion.key}
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.14, ease: FLOW_EASE }}
                        className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums select-none flex items-center gap-3"
                      >
                        <span>{sprintQuestion.a}</span>
                        <span className="text-[#006948] dark:text-[#6EE7B7]">{sprintQuestion.op}</span>
                        <span>{sprintQuestion.b}</span>
                        <span className="text-[#8A7177]">=</span>
                      </motion.div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                        <input
                          ref={sprintInputRef}
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={sprintInput}
                          onChange={(e) => handleSprintInputChange(e.target.value)}
                          placeholder="?"
                          aria-label="Enter your answer"
                          className="w-32 sm:w-36 h-14 rounded-xl bg-white dark:bg-[#231E2B] border-2 border-[#006948]/40 focus:border-[#006948] dark:border-[#58CD9B]/40 dark:focus:border-[#58CD9B] outline-none text-center font-mono text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={handleSprintSkip}
                          title="Skip question"
                          className="h-14 px-3.5 rounded-xl bg-white dark:bg-[#2B2534] border border-[#EAE0E5] dark:border-[#3A3346] text-xs font-semibold text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <SkipForward className="w-4 h-4" />
                          Skip
                        </button>
                      </div>
                    </div>

                    {/* Tactile On-Screen Keypad */}
                    <div className="grid grid-cols-4 gap-2">
                      {['7', '8', '9', 'BACK', '4', '5', '6', 'CLEAR', '1', '2', '3', 'SUBMIT'].map(
                        (btn) => {
                          if (btn === 'BACK') {
                            return (
                              <button
                                key={btn}
                                type="button"
                                onClick={() => handleSprintNumpad('BACK')}
                                className="h-12 rounded-xl bg-[#F3E7EE] hover:bg-[#EAE0E5] dark:bg-[#2B2534] dark:hover:bg-[#383145] text-[#1F1A1E] dark:text-[#F5EFF3] font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Delete className="w-4 h-4" />
                                Del
                              </button>
                            );
                          }
                          if (btn === 'CLEAR') {
                            return (
                              <button
                                key={btn}
                                type="button"
                                onClick={() => handleSprintNumpad('CLEAR')}
                                className="h-12 rounded-xl bg-[#F3E7EE] hover:bg-[#EAE0E5] dark:bg-[#2B2534] dark:hover:bg-[#383145] text-[#574146] dark:text-[#C4B7C1] font-semibold text-xs cursor-pointer"
                              >
                                Clear
                              </button>
                            );
                          }
                          if (btn === 'SUBMIT') {
                            return (
                              <button
                                key={btn}
                                type="button"
                                onClick={() => handleSprintNumpad('SUBMIT')}
                                className="h-12 rounded-xl bg-[#006948] hover:bg-[#00553A] text-white dark:bg-[#58CD9B] dark:text-[#072116] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <CornerDownLeft className="w-3.5 h-3.5" />
                                Enter
                              </button>
                            );
                          }
                          return (
                            <motion.button
                              key={btn}
                              type="button"
                              whileTap={{ scale: 0.94 }}
                              onClick={() => handleSprintNumpad(btn)}
                              className="h-12 rounded-xl bg-[#FCF1F6] hover:bg-[#F3E7EE] dark:bg-[#2B2534] dark:hover:bg-[#383145] border border-[#EAE0E5] dark:border-[#3A3346] font-mono text-xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] cursor-pointer"
                            >
                              {btn}
                            </motion.button>
                          );
                        }
                      )}
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSprintNumpad('0')}
                        className="col-span-3 h-11 rounded-xl bg-[#FCF1F6] hover:bg-[#F3E7EE] dark:bg-[#2B2534] dark:hover:bg-[#383145] border border-[#EAE0E5] dark:border-[#3A3346] font-mono text-xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] cursor-pointer"
                      >
                        0
                      </motion.button>
                      <div className="h-11 rounded-xl bg-[#FCF1F6] dark:bg-[#1B1722] border border-[#EAE0E5] dark:border-[#342D3E] flex items-center justify-center text-[11px] font-mono text-[#8A7177] tabular-nums">
                        {sprintAccuracy}% acc
                      </div>
                    </div>
                  </div>
                )}

                {sprintPhase === 'finished' && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-4 gap-5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#006948] dark:text-[#6EE7B7]">
                        {sprintNewRecord ? 'New Personal Best!' : '1-Minute Sprint Complete'}
                      </span>
                      <h3 className="font-display text-3xl sm:text-4xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-1 tabular-nums">
                        {sprintScore} pts
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full max-w-md font-mono tabular-nums">
                      <div className="bg-[#FCF1F6] dark:bg-[#1A1622] border border-[#EAE0E5] dark:border-[#322C3C] rounded-xl p-3">
                        <div className="text-[11px] font-sans text-[#8A7177]">Speed</div>
                        <div className="text-xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                          {sprintSolved}/min
                        </div>
                      </div>
                      <div className="bg-[#FCF1F6] dark:bg-[#1A1622] border border-[#EAE0E5] dark:border-[#322C3C] rounded-xl p-3">
                        <div className="text-[11px] font-sans text-[#8A7177]">Accuracy</div>
                        <div className="text-xl font-bold text-[#006948] dark:text-[#6EE7B7]">
                          {sprintAccuracy}%
                        </div>
                      </div>
                      <div className="bg-[#FCF1F6] dark:bg-[#1A1622] border border-[#EAE0E5] dark:border-[#322C3C] rounded-xl p-3">
                        <div className="text-[11px] font-sans text-[#8A7177]">Best Streak</div>
                        <div className="text-xl font-bold text-[#A3265B] dark:text-[#FFB1C6]">
                          {sprintBestStreak}×
                        </div>
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => startMathSprint()}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#006948] hover:bg-[#00553A] text-white dark:bg-[#58CD9B] dark:text-[#072116] text-sm font-bold cursor-pointer shadow-sm whitespace-nowrap"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Play Again (60s)
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ==============================================================
              2. 24-MATH BLITZ (FIXED)
             ============================================================== */}
          {activeGame === 'math24' && (
            <motion.div
              key="arena-math24"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: FLOW_EASE }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-4 flex flex-col gap-5">
                <div className="flex items-start gap-3.5">
                  <GameLogo gameId="math24" size="lg" />
                  <div>
                    <span className="text-xs font-semibold text-[#A3265B] dark:text-[#FFB1C6]">
                      Target Expression Challenge
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-0.5">
                      24-Math Blitz
                    </h2>
                    <p
                      className={`text-xs mt-1.5 leading-relaxed font-medium ${
                        mathFeedbackTone === 'error'
                          ? 'text-[#BA1A1A] dark:text-[#FCA5A5]'
                          : mathFeedbackTone === 'success'
                            ? 'text-[#006948] dark:text-[#6EE7B7]'
                            : 'text-[#574146] dark:text-[#B5A8B2]'
                      }`}
                    >
                      {mathFeedback}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] p-3.5 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8A7177] font-medium">Mode</span>
                    <span className="font-semibold text-[#A3265B] dark:text-[#FFB1C6]">{difficulty24}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Zen', 'Standard', 'Master'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMathDifficulty(m)}
                        className={`relative py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                          difficulty24 === m
                            ? 'text-white dark:text-[#072116]'
                            : 'bg-[#FCF1F6] dark:bg-[#1B1722] text-[#574146] dark:text-[#B5A8B2]'
                        }`}
                      >
                        {difficulty24 === m && (
                          <motion.span
                            layoutId="math-difficulty-pill"
                            transition={FLOW_SPRING}
                            className="absolute inset-0 rounded-lg bg-[#006948] dark:bg-[#58CD9B]"
                          />
                        )}
                        <span className="relative z-10">{m}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono tabular-nums">
                  <div className="bg-white dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] p-3.5 rounded-xl">
                    <span className="text-[11px] font-sans text-[#8A7177] block">Time Left</span>
                    <span
                      className={`text-2xl font-bold ${
                        mathExpired
                          ? 'text-[#DC2626] dark:text-[#FCA5A5]'
                          : 'text-[#1F1A1E] dark:text-[#F5EFF3]'
                      }`}
                    >
                      {mathTimeLeft}s
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] p-3.5 rounded-xl">
                    <span className="text-[11px] font-sans text-[#8A7177] block">Score</span>
                    <span className="text-2xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                      {scores.math24}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl p-5 sm:p-6 flex flex-col gap-5 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <GameLogo gameId="math24" size="md" />
                    <div>
                      <div className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                        Target Value: 24
                      </div>
                      <div className="text-xs text-[#8A7177] dark:text-[#9D8F99]">
                        Use each digit once · keyboard &amp; click supported
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setShowHint((h) => !h)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FCF1F6] dark:bg-[#2B2534] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] cursor-pointer whitespace-nowrap"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Hint
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ rotate: -25 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleResetMath}
                      aria-label="Clear expression"
                      className="w-9 h-9 rounded-lg bg-[#FCF1F6] dark:bg-[#2B2534] text-[#574146] dark:text-[#C4B7C1] flex items-center justify-center cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-[#006948] dark:text-[#6EE7B7] bg-[#D1FAE5]/40 dark:bg-[#133A2E]/60 px-3.5 py-2 rounded-xl font-medium"
                    >
                      Hint: {currentDeck.hint}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expression Display */}
                <div className="bg-[#FCF1F6] dark:bg-[#18141E] border border-[#EAE0E5] dark:border-[#312B3A] rounded-xl px-5 py-4 min-h-[68px] flex items-center justify-between gap-3">
                  <div className="font-mono text-2xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] flex flex-wrap items-center gap-1.5">
                    {formulaTokens.length === 0 ? (
                      <span className="text-sm font-sans font-normal italic text-[#8A7177]">
                        {mathExpired
                          ? 'Round expired — retry this deck or deal a new one.'
                          : 'Tap digits and operators below...'}
                      </span>
                    ) : (
                      formulaTokens.map((t, i) => (
                        <motion.span
                          key={`${i}-${t.token}`}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={FLOW_SPRING}
                          className={
                            typeof t.digitIdx === 'number'
                              ? 'bg-white dark:bg-[#2B2534] px-2.5 py-0.5 rounded-md shadow-2xs'
                              : 'text-[#A3265B] dark:text-[#FFB1C6] px-1'
                          }
                        >
                          {t.token}
                        </motion.span>
                      ))
                    )}
                  </div>
                  {liveEval !== null && (
                    <span
                      className={`font-mono text-lg font-bold tabular-nums shrink-0 ${
                        Math.abs(liveEval - 24) < 0.0001
                          ? 'text-[#006948] dark:text-[#6EE7B7]'
                          : 'text-[#006782] dark:text-[#7DD3FC]'
                      }`}
                    >
                      = {Number(liveEval.toFixed(2))}
                    </span>
                  )}
                </div>

                {/* Digits & Operators */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#8A7177]">
                      Digits ({usedIndices.length}/4 used)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDealNewMath()}
                      className="inline-flex items-center gap-1 font-semibold text-[#A3265B] dark:text-[#FFB1C6] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      Deal New Deck
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {currentDeck.digits.map((digit, idx) => {
                      const used = usedIndices.includes(idx);
                      const disabled = used || mathExpired;
                      return (
                        <motion.button
                          key={`${deckIndex}-${idx}`}
                          type="button"
                          disabled={disabled}
                          whileHover={disabled ? undefined : { y: -2 }}
                          whileTap={disabled ? undefined : { scale: 0.92 }}
                          transition={FLOW_SPRING}
                          onClick={() => handlePressDigit(digit, idx)}
                          className={`h-14 rounded-xl font-display text-2xl font-bold transition-colors ${
                            disabled
                              ? 'bg-[#F0E5EB] dark:bg-[#2A2433] text-[#8A7177] opacity-40 cursor-not-allowed'
                              : 'bg-[#FCF1F6] hover:bg-[#F3E7EE] dark:bg-[#2B2534] dark:hover:bg-[#362F42] text-[#1F1A1E] dark:text-[#F5EFF3] border border-[#EAE0E5] dark:border-[#3A3346] cursor-pointer'
                          }`}
                        >
                          {digit}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {['+', '−', '×', '÷', '(', ')'].map((op) => (
                      <motion.button
                        key={op}
                        type="button"
                        disabled={mathExpired}
                        whileHover={mathExpired ? undefined : { y: -1 }}
                        whileTap={mathExpired ? undefined : { scale: 0.92 }}
                        transition={FLOW_SPRING}
                        onClick={() => handlePressOperator(op)}
                        className="h-11 rounded-xl bg-[#F3E7EE] hover:bg-[#EAE0E5] dark:bg-[#2B2534] dark:hover:bg-[#383145] text-[#1F1A1E] dark:text-[#F5EFF3] font-mono text-xl font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {op}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                  {mathExpired ? (
                    <>
                      <button
                        type="button"
                        onClick={handleResetMath}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F3E7EE] dark:bg-[#2B2534] text-[#1F1A1E] dark:text-[#F5EFF3] cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retry Deck
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDealNewMath()}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] cursor-pointer whitespace-nowrap"
                      >
                        <Shuffle className="w-4 h-4" />
                        Deal New Deck
                      </button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBackspace}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F3E7EE] dark:bg-[#2B2534] text-[#1F1A1E] dark:text-[#F5EFF3] cursor-pointer whitespace-nowrap"
                      >
                        <Delete className="w-4 h-4" />
                        Delete
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmitMath}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Submit Answer
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ==============================================================
              3. KNIGHTS & KNAVES LOGIC DEDUCTION
             ============================================================== */}
          {activeGame === 'knights' && (
            <motion.div
              key="arena-knights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: FLOW_EASE }}
              className="max-w-2xl mx-auto flex flex-col gap-5 py-1"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <GameLogo gameId="knights" size="md" />
                  <div>
                    <span className="text-xs font-semibold text-[#1D4ED8] dark:text-[#93C5FD]">
                      Knights &amp; Knaves · Case {logicIdx + 1} of {LOGIC_PUZZLES.length}
                    </span>
                    <h2 className="font-display text-2xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-0.5">
                      {currentLogic.title}
                    </h2>
                  </div>
                </div>
                <div className="text-xs font-mono font-semibold text-[#006948] dark:text-[#6EE7B7] tabular-nums">
                  {logicSessionAnswered > 0
                    ? `Session ${logicSessionCorrect}/${logicSessionAnswered}`
                    : `${scores.logicSolved} solved`}
                </div>
              </div>

              <div className="bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
                <p className="text-sm text-[#1F1A1E] dark:text-[#F5EFF3] leading-relaxed">
                  {currentLogic.scenario}
                </p>
                <p className="text-sm font-semibold text-[#1D4ED8] dark:text-[#93C5FD]">
                  {currentLogic.question}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentLogic.options.map((opt, i) => {
                  const picked = logicSelected === i;
                  const isCorrect = i === currentLogic.correctIndex;
                  let style =
                    'bg-white dark:bg-[#221D2A] border-[#EAE0E5] dark:border-[#322C3C] text-[#1F1A1E] dark:text-[#F5EFF3] hover:border-[#1D4ED8] dark:hover:border-[#93C5FD]';
                  if (logicSelected !== null) {
                    if (isCorrect) {
                      style =
                        'bg-[#D1FAE5] dark:bg-[#133A2E] border-[#006948] text-[#065F46] dark:text-[#6EE7B7] font-semibold';
                    } else if (picked) {
                      style =
                        'bg-[#FFDAD6] dark:bg-[#4A1C22] border-[#BA1A1A] text-[#93000A] dark:text-[#FCA5A5]';
                    } else {
                      style =
                        'bg-white/60 dark:bg-[#221D2A]/60 border-[#EAE0E5] dark:border-[#322C3C] text-[#8A7177] opacity-70';
                    }
                  }
                  return (
                    <motion.button
                      key={opt}
                      type="button"
                      disabled={logicSelected !== null}
                      whileHover={logicSelected === null ? { y: -2 } : undefined}
                      whileTap={logicSelected === null ? { scale: 0.97 } : undefined}
                      onClick={() => handleLogicChoice(i)}
                      className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-colors cursor-pointer disabled:cursor-default ${style}`}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {logicSelected !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: FLOW_EASE }}
                    className="bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <p className="text-xs text-[#574146] dark:text-[#C4B7C1] leading-relaxed">
                      <strong>Proof:</strong> {currentLogic.explanation}
                    </p>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setLogicIdx((i) => (i + 1) % LOGIC_PUZZLES.length);
                        setLogicSelected(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      {logicIdx + 1 === LOGIC_PUZZLES.length ? 'Restart Proofs →' : 'Next Puzzle →'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ==============================================================
              4. SYLLOGISM VERIFIER (BRAND NEW REAL GAME)
             ============================================================== */}
          {activeGame === 'syllogism' && (
            <motion.div
              key="arena-syllogism"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: FLOW_EASE }}
              className="max-w-2xl mx-auto flex flex-col gap-5 py-1"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <GameLogo gameId="syllogism" size="md" />
                  <div>
                    <span className="text-xs font-semibold text-[#6D28D9] dark:text-[#C4B5FD]">
                      Syllogism Verifier · Case {sylIdx + 1} of {SYLLOGISM_PUZZLES.length}
                    </span>
                    <h2 className="font-display text-2xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-0.5">
                      {currentSyl.topic}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                  <span className="font-semibold text-[#6D28D9] dark:text-[#C4B5FD]">
                    {sylStreak}× streak
                  </span>
                  <span className="font-semibold text-[#006948] dark:text-[#6EE7B7]">
                    {sylSessionAnswered > 0
                      ? `${sylSessionCorrect}/${sylSessionAnswered} correct`
                      : `${sylSolved} verified`}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl p-5 flex flex-col gap-3.5 shadow-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A7177]">
                    Premise 1
                  </span>
                  <p className="text-sm text-[#1F1A1E] dark:text-[#F5EFF3] leading-relaxed">
                    {currentSyl.premise1}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A7177]">
                    Premise 2
                  </span>
                  <p className="text-sm text-[#1F1A1E] dark:text-[#F5EFF3] leading-relaxed">
                    {currentSyl.premise2}
                  </p>
                </div>
                <div className="pt-3 border-t border-dashed border-[#EAE0E5] dark:border-[#3A3346] flex flex-col gap-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#6D28D9] dark:text-[#C4B5FD]">
                    Proposed Conclusion
                  </span>
                  <p className="text-sm font-semibold text-[#1F1A1E] dark:text-[#F5EFF3] leading-relaxed">
                    {currentSyl.conclusion}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    { id: 'valid', label: 'Strictly Valid', icon: CheckCircle2 },
                    { id: 'invalid', label: 'Logically Invalid', icon: XCircle },
                    { id: 'undetermined', label: 'Undetermined', icon: HelpCircle },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon;
                  const picked = sylSelected === opt.id;
                  const isCorrect = opt.id === currentSyl.verdict;
                  let style =
                    'bg-white dark:bg-[#221D2A] border-[#EAE0E5] dark:border-[#322C3C] text-[#1F1A1E] dark:text-[#F5EFF3] hover:border-[#6D28D9] dark:hover:border-[#C4B5FD]';
                  if (sylSelected !== null) {
                    if (isCorrect) {
                      style =
                        'bg-[#D1FAE5] dark:bg-[#133A2E] border-[#006948] text-[#065F46] dark:text-[#6EE7B7] font-bold';
                    } else if (picked) {
                      style =
                        'bg-[#FFDAD6] dark:bg-[#4A1C22] border-[#BA1A1A] text-[#93000A] dark:text-[#FCA5A5]';
                    } else {
                      style =
                        'bg-white/60 dark:bg-[#221D2A]/60 border-[#EAE0E5] dark:border-[#322C3C] text-[#8A7177] opacity-65';
                    }
                  }
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      disabled={sylSelected !== null}
                      whileHover={sylSelected === null ? { y: -2 } : undefined}
                      whileTap={sylSelected === null ? { scale: 0.97 } : undefined}
                      onClick={() => handleSylChoice(opt.id)}
                      className={`px-4 py-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-default whitespace-nowrap ${style}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {sylSelected !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: FLOW_EASE }}
                    className="bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <p className="text-xs text-[#574146] dark:text-[#C4B7C1] leading-relaxed">
                      <strong>Logical Analysis:</strong> {currentSyl.proof}
                    </p>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setSylIdx((i) => (i + 1) % SYLLOGISM_PUZZLES.length);
                        setSylSelected(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6D28D9] hover:bg-[#5B21B6] text-white shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      {sylIdx + 1 === SYLLOGISM_PUZZLES.length ? 'Restart Deck →' : 'Next Case →'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ==============================================================
              5. STROOP COLOR REFLEX (FIXED TIMER + SUMMARY + KEYBOARD)
             ============================================================== */}
          {activeGame === 'stroop' && (
            <motion.div
              key="arena-stroop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: FLOW_EASE }}
              className="max-w-xl mx-auto flex flex-col items-center text-center gap-5 py-2"
            >
              <div className="flex flex-col items-center gap-2">
                <GameLogo gameId="stroop" size="lg" />
                <span className="text-xs font-semibold text-[#DC2626] dark:text-[#FCA5A5]">
                  Selective Attention Sprint
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                  Stroop Color Reflex
                </h2>
                <p className="text-xs text-[#574146] dark:text-[#B5A8B2]">
                  Pick the <strong>INK COLOR</strong> of the word — ignore what the text spells! Keys{' '}
                  <span className="font-mono font-semibold">1–4</span> or{' '}
                  <span className="font-mono font-semibold">R / B / G / A</span>.
                </p>
              </div>

              <div className="w-full flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-center gap-5 font-mono text-sm tabular-nums">
                  <span
                    className={
                      stroopMsLeft <= 7000 && stroopPhase === 'playing'
                        ? 'text-[#DC2626] font-bold'
                        : ''
                    }
                  >
                    Time: <strong>{stroopSecsDisplay}s</strong>
                  </span>
                  <span>
                    Score:{' '}
                    <strong className="text-[#006948] dark:text-[#6EE7B7]">{stroopScore}</strong>
                  </span>
                  <span>
                    Streak: <strong className="text-[#A3265B] dark:text-[#FFB1C6]">{stroopStreak}×</strong>
                  </span>
                  <span>
                    Last: <strong>{stroopLastMs ? `${stroopLastMs}ms` : '—'}</strong>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F3E7EE] dark:bg-[#17131E] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-100 ${
                      stroopMsLeft <= 7000 ? 'bg-[#DC2626]' : 'bg-[#A3265B] dark:bg-[#F56498]'
                    }`}
                    style={{ width: `${stroopPct}%` }}
                  />
                </div>
              </div>

              <div
                className={`w-full rounded-2xl border py-9 px-6 flex items-center justify-center min-h-[164px] shadow-xs transition-colors duration-150 ${
                  stroopFlash === 'correct'
                    ? 'bg-[#D1FAE5]/50 dark:bg-[#133A2E]/60 border-[#059669]'
                    : stroopFlash === 'wrong'
                      ? 'bg-[#FFDAD6]/60 dark:bg-[#4A1C22]/70 border-[#DC2626]'
                      : 'bg-white dark:bg-[#221D2A] border-[#EAE0E5] dark:border-[#322C3C]'
                }`}
              >
                {stroopPhase === 'playing' && (
                  <motion.span
                    key={stroopRound}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={FLOW_SPRING}
                    className="font-display text-5xl sm:text-6xl font-bold tracking-wider select-none"
                    style={{ color: STROOP_COLORS[stroopInkIdx].hex }}
                  >
                    {STROOP_COLORS[stroopWordIdx].name}
                  </motion.span>
                )}

                {stroopPhase === 'idle' && (
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={startStroop}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] text-sm font-bold cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start 30s Stroop Sprint
                  </motion.button>
                )}

                {stroopPhase === 'finished' && (
                  <div className="flex flex-col items-center gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#006948] dark:text-[#6EE7B7]">
                        30s Reflex Summary
                      </span>
                      <div className="font-display text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-0.5 tabular-nums">
                        {stroopScore} pts · {stroopAccuracy}% acc
                      </div>
                      <p className="text-xs font-mono text-[#574146] dark:text-[#B5A8B2] mt-1 tabular-nums">
                        {stroopCorrect}/{stroopAttempts} hits · Fastest:{' '}
                        {stroopSessionBestMs ? `${stroopSessionBestMs}ms` : '—'}
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={startStroop}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] text-xs font-bold cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Play Again
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {STROOP_COLORS.map((c, i) => (
                  <motion.button
                    key={c.name}
                    type="button"
                    disabled={stroopPhase !== 'playing'}
                    whileHover={stroopPhase === 'playing' ? { y: -2 } : undefined}
                    whileTap={stroopPhase === 'playing' ? { scale: 0.93 } : undefined}
                    onClick={() => handleStroopAnswer(i)}
                    className="py-3 rounded-xl font-bold text-xs text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex flex-col items-center gap-0.5"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] font-mono opacity-80">{c.keyHint}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ==============================================================
              6. PATTERN MATRIX RECALL (FIXED TIMERS + NO CONSECUTIVE DUPES)
             ============================================================== */}
          {activeGame === 'memory' && (
            <motion.div
              key="arena-memory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: FLOW_EASE }}
              className="max-w-lg mx-auto flex flex-col items-center text-center gap-5 py-2"
            >
              <div className="flex flex-col items-center gap-1.5">
                <GameLogo gameId="memory" size="lg" />
                <span className="text-xs font-semibold text-[#0F766E] dark:text-[#5EEAD4]">
                  Spatial Working Memory
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                  Pattern Matrix Recall
                </h2>
                <p className="text-xs text-[#574146] dark:text-[#B5A8B2]">
                  {memPhase === 'idle' &&
                    'Watch the illuminated tile sequence, then repeat it in exact order.'}
                  {memPhase === 'showing' && 'Watch carefully... memorizing sequence'}
                  {memPhase === 'input' &&
                    `Your turn! Tap step ${memUserStep + 1} of ${memSequence.length}`}
                  {memPhase === 'levelup' && `Level ${memLevel - 1} cleared! Preparing longer sequence...`}
                  {memPhase === 'wrong' &&
                    `Missed on Level ${memLevel} (green highlights the expected tile). Ready to retry?`}
                </p>
              </div>

              <div className="flex items-center gap-5 text-xs font-mono tabular-nums">
                <span>
                  Level: <strong>{memLevel}</strong>
                </span>
                <span>
                  Sequence: <strong>{memSequence.length || 3} tiles</strong>
                </span>
                <span>
                  Best Level:{' '}
                  <strong className="text-[#006948] dark:text-[#6EE7B7]">
                    {scores.memoryBestLevel}
                  </strong>
                </span>
              </div>

              {/* Step Progress Dots */}
              {memSequence.length > 0 && (
                <div className="flex items-center gap-1.5" aria-label="Sequence progress">
                  {memSequence.map((_, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        i < memUserStep || memPhase === 'levelup'
                          ? 'bg-[#006948] dark:bg-[#58CD9B]'
                          : i === memUserStep && memPhase === 'input'
                            ? 'bg-[#F56498] scale-125'
                            : 'bg-[#EAE0E5] dark:bg-[#3A3346]'
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-4 gap-3 w-64 sm:w-72">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const lit = memLitTile === idx;
                  const isExpected = memPhase === 'wrong' && memExpectedTile === idx;
                  const isWrong = memPhase === 'wrong' && memWrongTile === idx;
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      disabled={memPhase !== 'input'}
                      animate={lit ? { scale: 0.94 } : { scale: 1 }}
                      whileTap={memPhase === 'input' ? { scale: 0.9 } : undefined}
                      transition={FLOW_SPRING}
                      onClick={() => handleMemoryTileClick(idx)}
                      aria-label={`Grid tile ${idx + 1}`}
                      className={`aspect-square rounded-xl border-2 transition-colors duration-150 ${
                        memPhase === 'input' ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        lit
                          ? 'bg-[#F56498] border-[#A3265B] shadow-[0_0_20px_rgba(245,100,152,0.55)]'
                          : isExpected
                            ? 'bg-[#10B981] border-[#059669] shadow-[0_0_16px_rgba(16,185,129,0.45)]'
                            : isWrong
                              ? 'bg-[#DC2626] border-[#991B1B]'
                              : 'bg-white dark:bg-[#231E2B] border-[#EAE0E5] dark:border-[#342D3E] hover:border-[#0F766E]/60'
                      }`}
                    />
                  );
                })}
              </div>

              {(memPhase === 'idle' || memPhase === 'wrong') && (
                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={startMemoryGame}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white dark:bg-[#5EEAD4] dark:text-[#082F2C] text-xs font-bold cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {memPhase === 'wrong' ? 'Play Again' : 'Start Sequence'}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Bottom Split: 6-Game Catalog with Unique Logos (8 cols) + Cognitive Vitals Radar & Leaderboard (4 cols) */}
      <motion.div variants={flowItem} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              Exercise Catalog
            </h2>
            <SegmentedControl
              layoutId="games-catalog-filter"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { id: 'all', label: 'All (6)' },
                { id: 'math', label: 'Math' },
                { id: 'logic', label: 'Logic' },
                { id: 'memory', label: 'Memory' },
                { id: 'spatial', label: 'Spatial' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {visibleCatalog.map((item) => {
              const isCurrent = activeGame === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={FLOW_SPRING}
                  onClick={() => selectGame(item.id, true)}
                  className={`group text-left fx-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[168px] transition-colors cursor-pointer ${
                    isCurrent
                      ? 'border-[#A3265B] dark:border-[#F56498] ring-1 ring-[#A3265B]/25 dark:ring-[#F56498]/30'
                      : 'hover:border-[#A3265B]/50 dark:hover:border-[#F56498]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <GameLogo gameId={item.id} size="md" />
                    <span className="text-[11px] font-medium text-[#8A7177] dark:text-[#9D8F99] capitalize text-right">
                      {item.category} · {item.subtitle}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3] group-hover:text-[#A3265B] dark:group-hover:text-[#FFB1C6] transition-colors">
                      {item.title}
                    </h3>
                    <div className="text-xs font-mono tabular-nums text-[#006948] dark:text-[#6EE7B7] font-medium mt-1">
                      {getCatalogStat(item.id)}
                    </div>
                  </div>

                  <div className={`text-xs font-semibold mt-3 ${item.accentText}`}>
                    {isCurrent ? 'Playing now ●' : 'Launch exercise →'}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Cognitive Vitals Radar & Leaderboard */}
        <aside className="xl:col-span-4 flex flex-col gap-5">
          <section className="fx-card rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Cognitive Vitals
              </h3>
              <span className="text-xs font-semibold text-[#006948] dark:text-[#6EE7B7]">
                Live Profile
              </span>
            </div>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(138,113,119,0.28)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#8A7177' }} />
                  <Radar
                    dataKey="score"
                    stroke="#A3265B"
                    fill="#F56498"
                    fillOpacity={0.32}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="fx-card rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Term Leaderboard
              </h3>
              <span className="text-xs font-mono text-[#8A7177]">W26</span>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { rank: 1, name: 'Elena V.', score: 2140, tone: 'emerald' as const },
                { rank: 2, name: 'Julian K.', score: 1980, tone: 'sky' as const },
                {
                  rank: 3,
                  name: 'Alex (You)',
                  score: scores.totalPulse,
                  tone: 'rose' as const,
                  highlight: true,
                },
                { rank: 4, name: 'Mira S.', score: 1390, tone: 'amber' as const },
              ]
                .sort((a, b) => b.score - a.score)
                .map((row, idx) => (
                  <div
                    key={row.name}
                    className={`p-2.5 rounded-xl flex items-center justify-between ${
                      row.highlight
                        ? 'bg-[#FFB9F9]/40 dark:bg-[#F56498]/20 font-semibold'
                        : 'bg-[#FCF1F6] dark:bg-[#231E2B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-[#8A7177] w-4">{idx + 1}</span>
                      <ScholarAvatar name={row.name} size="sm" tone={row.tone} />
                      <span className="text-[#1F1A1E] dark:text-[#F5EFF3]">{row.name}</span>
                    </div>
                    <span className="font-mono font-bold text-[#1F1A1E] dark:text-[#F5EFF3] tabular-nums">
                      {row.score.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        </aside>
      </motion.div>
    </motion.div>
  );
};
