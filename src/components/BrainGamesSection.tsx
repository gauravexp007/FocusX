import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Brain,
  CheckCircle2,
  Delete,
  Flame,
  Grid2x2,
  HelpCircle,
  Lightbulb,
  Palette,
  Play,
  RotateCcw,
  Shuffle,
  Trophy,
} from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { LOGIC_PUZZLES, PUZZLE_24_DECKS } from '../data/initialData';
import { GameScores } from '../types';
import { ScholarAvatar } from './BookCoverArt';
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

type ActiveGameId = 'math24' | 'stroop' | 'memory' | 'logic';
type GameCategory = 'all' | 'math' | 'logic' | 'memory' | 'spatial';

const STROOP_COLORS = [
  { name: 'RED', hex: '#DC2626' },
  { name: 'BLUE', hex: '#2563EB' },
  { name: 'GREEN', hex: '#059669' },
  { name: 'AMBER', hex: '#D97706' },
];

const CATALOG_GAMES: Array<{
  id: string;
  title: string;
  category: Exclude<GameCategory, 'all'>;
  meta: string;
  stat: string;
  target: ActiveGameId;
}> = [
  { id: 'c1', title: '24-Math Blitz', category: 'math', meta: 'Arithmetic Sprint', stat: 'Featured Arena', target: 'math24' },
  { id: 'c2', title: 'Mental Fractions', category: 'math', meta: 'Speed Calculation', stat: '94% Accuracy', target: 'math24' },
  { id: 'c3', title: 'Knights & Knaves', category: 'logic', meta: 'Formal Deduction', stat: '4 Curated Proofs', target: 'logic' },
  { id: 'c4', title: 'Syllogism Verifier', category: 'logic', meta: 'Premise Analysis', stat: 'Zen Mode', target: 'logic' },
  { id: 'c5', title: 'Stroop Color Reflex', category: 'memory', meta: 'Selective Attention', stat: '30s Speed Test', target: 'stroop' },
  { id: 'c6', title: 'Pattern Matrix Recall', category: 'spatial', meta: '4×4 Spatial Memory', stat: 'Progressive Levels', target: 'memory' },
];

function safeEvaluateMath(tokens: string[]): number | null {
  const expr = tokens
    .join('')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) return null;
  try {
    const fn = new Function(`"use strict"; return (${expr});`);
    const result = fn();
    return typeof result === 'number' && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

export const BrainGamesSection: React.FC<BrainGamesSectionProps> = ({
  scores,
  onUpdateScores,
  onNotify,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGameId>('math24');
  const [categoryFilter, setCategoryFilter] = useState<GameCategory>('all');

  // --- GAME 1: 24-MATH BLITZ ---
  const [deckIndex, setDeckIndex] = useState(0);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [formulaTokens, setFormulaTokens] = useState<Array<{ token: string; digitIdx?: number }>>([]);
  const [difficulty, setDifficulty] = useState<'Zen' | 'Standard' | 'Master'>('Standard');
  const [mathTimeLeft, setMathTimeLeft] = useState(45);
  const [mathTimerActive, setMathTimerActive] = useState(false);
  const [mathFeedback, setMathFeedback] = useState<string>('Combine all 4 digits using +, −, ×, ÷ to equal 24.');
  const [showHint, setShowHint] = useState(false);

  const currentDeck = PUZZLE_24_DECKS[deckIndex];
  const liveEval = safeEvaluateMath(formulaTokens.map((t) => t.token));

  useEffect(() => {
    if (!mathTimerActive) return;
    if (mathTimeLeft <= 0) {
      setMathTimerActive(false);
      setMathFeedback('Time expired! Deal a fresh deck or try again.');
      return;
    }
    const id = window.setInterval(() => setMathTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [mathTimerActive, mathTimeLeft]);

  const setMathDifficulty = (mode: 'Zen' | 'Standard' | 'Master') => {
    setDifficulty(mode);
    const secs = mode === 'Zen' ? 60 : mode === 'Standard' ? 45 : 30;
    setMathTimeLeft(secs);
    setMathTimerActive(false);
  };

  const handlePressDigit = (digit: number, idx: number) => {
    if (usedIndices.includes(idx)) return;
    if (!mathTimerActive && mathTimeLeft > 0) setMathTimerActive(true);
    setUsedIndices((prev) => [...prev, idx]);
    setFormulaTokens((prev) => [...prev, { token: String(digit), digitIdx: idx }]);
  };

  const handlePressOperator = (op: string) => {
    if (formulaTokens.length === 0 && op !== '(') return;
    if (!mathTimerActive && mathTimeLeft > 0) setMathTimerActive(true);
    setFormulaTokens((prev) => [...prev, { token: op }]);
  };

  const handleBackspace = () => {
    if (formulaTokens.length === 0) return;
    const last = formulaTokens[formulaTokens.length - 1];
    setFormulaTokens((prev) => prev.slice(0, -1));
    if (typeof last.digitIdx === 'number') {
      setUsedIndices((prev) => prev.filter((i) => i !== last.digitIdx));
    }
  };

  const handleResetMath = () => {
    setFormulaTokens([]);
    setUsedIndices([]);
    setShowHint(false);
  };

  const handleDealNewMath = () => {
    const nextIdx = (deckIndex + 1) % PUZZLE_24_DECKS.length;
    setDeckIndex(nextIdx);
    setFormulaTokens([]);
    setUsedIndices([]);
    setShowHint(false);
    setMathTimeLeft(difficulty === 'Zen' ? 60 : difficulty === 'Standard' ? 45 : 30);
    setMathTimerActive(false);
    setMathFeedback('Fresh deck dealt — use all 4 digits to make 24.');
  };

  const handleSubmitMath = () => {
    if (usedIndices.length !== 4) {
      setMathFeedback('Use all 4 digits in your expression before submitting.');
      return;
    }
    const result = safeEvaluateMath(formulaTokens.map((t) => t.token));
    if (result === null) {
      setMathFeedback('Expression syntax is incomplete — check parentheses.');
      return;
    }
    if (Math.abs(result - 24) < 0.0001) {
      const mult = difficulty === 'Master' ? 3 : difficulty === 'Standard' ? 2 : 1;
      const pts = 60 * mult;
      onUpdateScores((prev) => ({
        ...prev,
        math24: prev.math24 + pts,
        math24Streak: prev.math24Streak + 1,
        totalPulse: prev.totalPulse + pts,
      }));
      onNotify(`Exact 24! +${pts} FocusX Cognitive points.`);
      handleDealNewMath();
    } else {
      setMathFeedback(`Evaluated to ${Number(result.toFixed(2))} — adjust operations to hit exactly 24.`);
    }
  };

  // --- GAME 2: STROOP COLOR REFLEX ---
  const [stroopActive, setStroopActive] = useState(false);
  const [stroopTime, setStroopTime] = useState(30);
  const [stroopScore, setStroopScore] = useState(0);
  const [stroopWordIdx, setStroopWordIdx] = useState(0);
  const [stroopInkIdx, setStroopInkIdx] = useState(1);
  const [stroopRound, setStroopRound] = useState(0);
  const [stroopLastMs, setStroopLastMs] = useState<number | null>(null);
  const stroopStampRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!stroopActive) return;
    if (stroopTime <= 0) {
      setStroopActive(false);
      onUpdateScores((prev) => ({
        ...prev,
        stroopHigh: Math.max(prev.stroopHigh, stroopScore),
        totalPulse: prev.totalPulse + stroopScore * 10,
      }));
      onNotify(`Stroop sprint finished! Score: ${stroopScore}`);
      return;
    }
    const id = window.setInterval(() => setStroopTime((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [stroopActive, stroopTime, stroopScore, onUpdateScores, onNotify]);

  const nextStroopPrompt = () => {
    const w = Math.floor(Math.random() * STROOP_COLORS.length);
    let ink = Math.floor(Math.random() * STROOP_COLORS.length);
    if (ink === w) ink = (ink + 1) % STROOP_COLORS.length;
    setStroopWordIdx(w);
    setStroopInkIdx(ink);
    setStroopRound((r) => r + 1);
    stroopStampRef.current = Date.now();
  };

  const startStroop = () => {
    setStroopScore(0);
    setStroopTime(30);
    setStroopActive(true);
    setStroopLastMs(null);
    nextStroopPrompt();
  };

  const handleStroopAnswer = (idx: number) => {
    if (!stroopActive) return;
    const elapsed = Date.now() - stroopStampRef.current;
    if (idx === stroopInkIdx) {
      setStroopScore((s) => s + 1);
      setStroopLastMs(elapsed);
      onUpdateScores((prev) => ({
        ...prev,
        stroopBestMs: Math.min(prev.stroopBestMs, elapsed),
      }));
    } else {
      setStroopScore((s) => Math.max(0, s - 1));
    }
    nextStroopPrompt();
  };

  // --- GAME 3: PATTERN MATRIX MEMORY ---
  const [memLevel, setMemLevel] = useState(1);
  const [memPhase, setMemPhase] = useState<'idle' | 'showing' | 'input' | 'wrong'>('idle');
  const [memSequence, setMemSequence] = useState<number[]>([]);
  const [memLitTile, setMemLitTile] = useState<number | null>(null);
  const [memUserStep, setMemUserStep] = useState(0);

  const playSequence = (seq: number[]) => {
    setMemPhase('showing');
    setMemUserStep(0);
    seq.forEach((tile, i) => {
      window.setTimeout(() => setMemLitTile(tile), i * 650 + 250);
      window.setTimeout(() => setMemLitTile(null), i * 650 + 600);
    });
    window.setTimeout(() => {
      setMemPhase('input');
    }, seq.length * 650 + 300);
  };

  const startMemoryGame = () => {
    const firstSeq = [Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), Math.floor(Math.random() * 16)];
    setMemLevel(1);
    setMemSequence(firstSeq);
    playSequence(firstSeq);
  };

  const handleMemoryTileClick = (tileIdx: number) => {
    if (memPhase !== 'input') return;
    setMemLitTile(tileIdx);
    window.setTimeout(() => setMemLitTile(null), 180);

    if (tileIdx === memSequence[memUserStep]) {
      const nextStep = memUserStep + 1;
      if (nextStep === memSequence.length) {
        const nextLvl = memLevel + 1;
        setMemLevel(nextLvl);
        onUpdateScores((prev) => ({
          ...prev,
          memoryBestLevel: Math.max(prev.memoryBestLevel, nextLvl),
          totalPulse: prev.totalPulse + 45,
        }));
        const nextSeq = [...memSequence, Math.floor(Math.random() * 16)];
        setMemSequence(nextSeq);
        window.setTimeout(() => playSequence(nextSeq), 450);
      } else {
        setMemUserStep(nextStep);
      }
    } else {
      setMemPhase('wrong');
    }
  };

  // --- GAME 4: KNIGHTS & KNAVES LOGIC DEDUCTION ---
  const [logicIdx, setLogicIdx] = useState(0);
  const [logicSelected, setLogicSelected] = useState<number | null>(null);
  const currentLogic = LOGIC_PUZZLES[logicIdx];

  const handleLogicChoice = (optIdx: number) => {
    if (logicSelected !== null) return;
    setLogicSelected(optIdx);
    if (optIdx === currentLogic.correctIndex) {
      onUpdateScores((prev) => ({
        ...prev,
        logicSolved: prev.logicSolved + 1,
        totalPulse: prev.totalPulse + 75,
      }));
      onNotify('Correct deduction! +75 FocusX Cognitive points.');
    }
  };

  const radarData = [
    { metric: 'Speed', score: Math.min(99, Math.round(70 + (1000 - Math.min(900, scores.stroopBestMs)) / 25)) },
    { metric: 'Memory', score: Math.min(99, 65 + scores.memoryBestLevel * 5) },
    { metric: 'Logic', score: Math.min(99, 72 + scores.logicSolved * 2) },
    { metric: 'Math', score: Math.min(99, 74 + Math.round(scores.math24 / 30)) },
  ];

  const visibleCatalog = CATALOG_GAMES.filter(
    (g) => categoryFilter === 'all' || g.category === categoryFilter
  );

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
            Short cognitive warm-ups between study blocks to sharpen arithmetic, attention, memory, and deduction.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
          <div className="fx-card px-3.5 py-2 rounded-xl flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#A3265B] dark:text-[#FFB1C6]" />
            <span className="font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">{scores.math24Streak}x combo</span>
          </div>
          <div className="fx-card px-3.5 py-2 rounded-xl flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#006948] dark:text-[#6EE7B7]" />
            <span className="font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
              {scores.totalPulse.toLocaleString()} pts
            </span>
          </div>
        </div>
      </motion.div>

      {/* Arena Game Switcher Tabs with shared layoutId */}
      <motion.div variants={flowItem}>
        <SegmentedControl
          layoutId="games-arena-tabs"
          variant="rose"
          size="md"
          value={activeGame}
          onChange={setActiveGame}
          options={[
            { id: 'math24', label: '24-Math Blitz', icon: <Brain className="w-4 h-4" /> },
            { id: 'stroop', label: 'Stroop Color Reflex', icon: <Palette className="w-4 h-4" /> },
            { id: 'memory', label: 'Pattern Matrix Memory', icon: <Grid2x2 className="w-4 h-4" /> },
            { id: 'logic', label: 'Logic Deduction', icon: <Lightbulb className="w-4 h-4" /> },
          ]}
        />
      </motion.div>

      {/* FEATURED INTERACTIVE GAME ARENA */}
      <motion.section variants={flowItem} className="fx-surface-tinted rounded-3xl p-6 lg:p-8 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {/* 1. 24-MATH BLITZ */}
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
                <div>
                  <span className="text-xs font-semibold text-[#A3265B] dark:text-[#FFB1C6]">
                    Daily Arithmetic Sprint
                  </span>
                  <h2 className="font-display text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-1">
                    24-Math Blitz
                  </h2>
                  <p className="text-xs text-[#574146] dark:text-[#B5A8B2] mt-1.5 leading-relaxed">
                    {mathFeedback}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] p-3.5 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8A7177] font-medium">Mode</span>
                    <span className="font-semibold text-[#A3265B] dark:text-[#FFB1C6]">{difficulty}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Zen', 'Standard', 'Master'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMathDifficulty(m)}
                        className={`relative py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          difficulty === m
                            ? 'text-white dark:text-[#072116]'
                            : 'bg-[#FCF1F6] dark:bg-[#1B1722] text-[#574146] dark:text-[#B5A8B2]'
                        }`}
                      >
                        {difficulty === m && (
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
                    <span className="text-2xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
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

              <div className="lg:col-span-8 bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl p-6 flex flex-col gap-5 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] font-display text-3xl font-bold flex items-center justify-center shadow-xs">
                      24
                    </div>
                    <div>
                      <div className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                        Target Value
                      </div>
                      <div className="text-xs text-[#8A7177] dark:text-[#9D8F99]">
                        Use each digit exactly once
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setShowHint((h) => !h)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FCF1F6] dark:bg-[#2B2534] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] cursor-pointer"
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
                        Tap digits and operators below...
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

                {/* Digits */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#8A7177]">Digits</span>
                    <button
                      type="button"
                      onClick={handleDealNewMath}
                      className="inline-flex items-center gap-1 font-semibold text-[#A3265B] dark:text-[#FFB1C6] hover:underline cursor-pointer"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      Deal New Deck
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {currentDeck.digits.map((digit, idx) => {
                      const used = usedIndices.includes(idx);
                      return (
                        <motion.button
                          key={`${deckIndex}-${idx}`}
                          type="button"
                          disabled={used}
                          whileHover={used ? undefined : { y: -2 }}
                          whileTap={used ? undefined : { scale: 0.92 }}
                          transition={FLOW_SPRING}
                          onClick={() => handlePressDigit(digit, idx)}
                          className={`h-14 rounded-xl font-display text-2xl font-bold transition-colors cursor-pointer ${
                            used
                              ? 'bg-[#F0E5EB] dark:bg-[#2A2433] text-[#8A7177] opacity-40 cursor-not-allowed'
                              : 'bg-[#FCF1F6] hover:bg-[#F3E7EE] dark:bg-[#2B2534] dark:hover:bg-[#362F42] text-[#1F1A1E] dark:text-[#F5EFF3] border border-[#EAE0E5] dark:border-[#3A3346]'
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
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.92 }}
                        transition={FLOW_SPRING}
                        onClick={() => handlePressOperator(op)}
                        className="h-11 rounded-xl bg-[#F3E7EE] hover:bg-[#EAE0E5] dark:bg-[#2B2534] dark:hover:bg-[#383145] text-[#1F1A1E] dark:text-[#F5EFF3] font-mono text-xl font-bold transition-colors cursor-pointer"
                      >
                        {op}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackspace}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F3E7EE] dark:bg-[#2B2534] text-[#1F1A1E] dark:text-[#F5EFF3] cursor-pointer"
                  >
                    <Delete className="w-4 h-4" />
                    Delete
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitMath}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] transition-colors cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Answer
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. STROOP COLOR REFLEX */}
          {activeGame === 'stroop' && (
            <motion.div
              key="arena-stroop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: FLOW_EASE }}
              className="max-w-xl mx-auto flex flex-col items-center text-center gap-6 py-4"
            >
              <div>
                <span className="text-xs font-semibold text-[#A3265B] dark:text-[#FFB1C6]">
                  Selective Attention Sprint
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-1">
                  Stroop Color Reflex
                </h2>
                <p className="text-xs text-[#574146] dark:text-[#B5A8B2] mt-1">
                  Click the button matching the <strong>INK COLOR</strong> of the word — ignore what the text spells!
                </p>
              </div>

              <div className="flex items-center gap-6 font-mono text-sm tabular-nums">
                <span>Time: <strong>{stroopTime}s</strong></span>
                <span>Score: <strong className="text-[#006948] dark:text-[#6EE7B7]">{stroopScore}</strong></span>
                <span>Last: <strong>{stroopLastMs ? `${stroopLastMs}ms` : '—'}</strong></span>
              </div>

              <div className="w-full bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl py-10 px-6 flex items-center justify-center min-h-[150px] shadow-xs">
                {stroopActive ? (
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
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={startStroop}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] text-sm font-semibold cursor-pointer shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start 30s Stroop Sprint
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {STROOP_COLORS.map((c, i) => (
                  <motion.button
                    key={c.name}
                    type="button"
                    disabled={!stroopActive}
                    whileHover={stroopActive ? { y: -2 } : undefined}
                    whileTap={stroopActive ? { scale: 0.93 } : undefined}
                    onClick={() => handleStroopAnswer(i)}
                    className="py-3 rounded-xl font-semibold text-xs text-white cursor-pointer disabled:opacity-40 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  >
                    {c.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 3. PATTERN MATRIX MEMORY */}
          {activeGame === 'memory' && (
            <motion.div
              key="arena-memory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: FLOW_EASE }}
              className="max-w-lg mx-auto flex flex-col items-center text-center gap-5 py-2"
            >
              <div>
                <span className="text-xs font-semibold text-[#006948] dark:text-[#6EE7B7]">
                  Spatial Working Memory
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-1">
                  Pattern Matrix Recall
                </h2>
                <p className="text-xs text-[#574146] dark:text-[#B5A8B2] mt-1">
                  {memPhase === 'idle' && 'Watch the illuminated tile sequence, then repeat it in exact order.'}
                  {memPhase === 'showing' && 'Watch carefully... memorizing sequence'}
                  {memPhase === 'input' && `Your turn! Step ${memUserStep + 1} of ${memSequence.length}`}
                  {memPhase === 'wrong' && `Missed tile on Level ${memLevel}! Ready to try again?`}
                </p>
              </div>

              <div className="flex items-center gap-5 text-xs font-mono tabular-nums">
                <span>Level: <strong>{memLevel}</strong></span>
                <span>Best Level: <strong className="text-[#006948] dark:text-[#6EE7B7]">{scores.memoryBestLevel}</strong></span>
              </div>

              <div className="grid grid-cols-4 gap-3 w-64 sm:w-72">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const lit = memLitTile === idx;
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
                      className={`aspect-square rounded-xl border transition-colors duration-150 cursor-pointer ${
                        lit
                          ? 'bg-[#F56498] border-[#A3265B] shadow-[0_0_20px_rgba(245,100,152,0.55)]'
                          : 'bg-white dark:bg-[#231E2B] border-[#EAE0E5] dark:border-[#342D3E] hover:border-[#A3265B]/50'
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
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {memPhase === 'wrong' ? 'Play Again' : 'Start Sequence'}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* 4. KNIGHTS & KNAVES LOGIC DEDUCTION */}
          {activeGame === 'logic' && (
            <motion.div
              key="arena-logic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: FLOW_EASE }}
              className="max-w-2xl mx-auto flex flex-col gap-5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-[#006782] dark:text-[#7DD3FC]">
                    Formal Logic Teaser {logicIdx + 1} of {LOGIC_PUZZLES.length}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3] mt-0.5">
                    {currentLogic.title}
                  </h2>
                </div>
                <span className="text-xs font-mono font-semibold text-[#006948] dark:text-[#6EE7B7] tabular-nums">
                  {scores.logicSolved} solved
                </span>
              </div>

              <div className="bg-white dark:bg-[#221D2A] border border-[#EAE0E5] dark:border-[#322C3C] rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
                <p className="text-sm text-[#1F1A1E] dark:text-[#F5EFF3] leading-relaxed">
                  {currentLogic.scenario}
                </p>
                <p className="text-sm font-semibold text-[#A3265B] dark:text-[#FFB1C6]">
                  {currentLogic.question}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentLogic.options.map((opt, i) => {
                  const picked = logicSelected === i;
                  const isCorrect = i === currentLogic.correctIndex;
                  let style =
                    'bg-white dark:bg-[#221D2A] border-[#EAE0E5] dark:border-[#322C3C] text-[#1F1A1E] dark:text-[#F5EFF3] hover:border-[#A3265B]';
                  if (logicSelected !== null) {
                    if (isCorrect) {
                      style = 'bg-[#D1FAE5] dark:bg-[#133A2E] border-[#006948] text-[#065F46] dark:text-[#6EE7B7] font-semibold';
                    } else if (picked) {
                      style = 'bg-[#FFDAD6] dark:bg-[#4A1C22] border-[#BA1A1A] text-[#93000A] dark:text-[#FCA5A5]';
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
                      className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-colors cursor-pointer ${style}`}
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
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] shrink-0 cursor-pointer"
                    >
                      Next Puzzle →
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Bottom Split: Game Catalog (8 cols) + Cognitive Vitals Radar & Leaderboard (4 cols) */}
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
                { id: 'all', label: 'All' },
                { id: 'math', label: 'Math' },
                { id: 'logic', label: 'Logic' },
                { id: 'memory', label: 'Memory' },
                { id: 'spatial', label: 'Spatial' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {visibleCatalog.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={FLOW_SPRING}
                onClick={() => setActiveGame(item.target)}
                className="group text-left fx-card hover:border-[#A3265B]/50 dark:hover:border-[#F56498]/50 rounded-2xl p-5 flex flex-col justify-between h-40 transition-colors cursor-pointer"
              >
                <div className="text-xs font-medium text-[#8A7177] dark:text-[#9D8F99] capitalize">
                  {item.category} · {item.meta}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3] group-hover:text-[#A3265B] dark:group-hover:text-[#FFB1C6] transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs text-[#006948] dark:text-[#6EE7B7] font-medium mt-1">
                    {item.stat}
                  </div>
                </div>
                <div className="text-xs font-semibold text-[#A3265B] dark:text-[#FFB1C6]">
                  Launch exercise →
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Cognitive Vitals Radar & Leaderboard */}
        <aside className="xl:col-span-4 flex flex-col gap-5">
          <section className="fx-card rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Cognitive Vitals
              </h3>
              <span className="text-xs font-semibold text-[#006948] dark:text-[#6EE7B7]">Live Profile</span>
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
                { rank: 3, name: 'Alex (You)', score: scores.totalPulse, tone: 'rose' as const, highlight: true },
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
