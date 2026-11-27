# FocusX — Student Productivity & Learning Companion

FocusX is an all-in-one digital study workspace built with React, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Recharts, and Lucide Icons. It brings together deep focus sessions, study analytics, task management, reading tracking, community notes, realistic text-to-handwriting rendering, and cognitive training games in one cohesive Light/Dark interface.

## Key Modules & Features

- **Overview & Study Time**: Personalized daily goal ring, Academic Vitals (`Today / Week / Month`), live mini Focus Studio with ambient audio waves, active checklist, reading progress, upcoming deadlines, and recent handwriting artifacts.
- **Focus Mode**: Interactive Pomodoro & deep-work timer (`25m`, `50m`, `5m`, `15m`) with subject presets, Web Audio API ambient soundscapes (Library Rain, Binaural 40Hz, Café Lo-Fi, Warm Static), live visualizer bars, and session tracking.
- **Study Analytics**: 7-day and 14-day focus trend charts, subject time allocation bars, productivity insights, and an interactive 28-day study consistency heatmap.
- **Task Manager**: Switchable List & Kanban Board views, priority/status filtering, focus-block progress meters, and smooth modal task creation.
- **Reading Tracker**: Digital bookshelf (`Currently Reading`, `Want to Read`, `Finished`, `Textbooks`), page logging (`+10` / `+25`), reading streak calendar, expandable quote highlights, and book creation modal.
- **Notes Explorer**: Searchable, filterable study guides with Grid/List layouts, bookmarks, upvotes, full reader modal, and note publishing.
- **Text to Handwriting Studio**: Converts typed text into realistic handwritten sheets with selectable paper styles (Ruled, Grid, Dot Grid, Vintage Cream, Plain), multiple handwriting fonts, ink color/size/slant controls, print layout, and high-res PNG export (`focusx-handwritten-notes.png`).
- **Mind & Logic Games**: Four playable cognitive games — 24-Math Blitz, Stroop Color Sprint, Pattern Matrix Memory, and Formal Logic Deduction — with score & streak tracking.
- **Global `⌘K` / `Ctrl+K` Command Palette**: Instant keyboard navigation across all studios, timer controls, theme switching, and live search across tasks, books, and notes.
- **Fluid Motion & Adaptive Theming**: Shared-element `layoutId` controls, staggered Bento entrances, spring hover/tap physics, full `prefers-reduced-motion` support, and carefully balanced Light & Dark themes.

## Getting Started

```bash
npm install
npm run dev
```

## Build & Type-Check

```bash
npm run lint
npm run build
```
