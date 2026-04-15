# AI Tutorial Builder

A React app that generates structured, interactive courses from a topic or PDF using Claude AI.

## Getting started

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

## Prerequisites

Create a `.env.local` file with your Anthropic API key:

```
VITE_ANTHROPIC_API_KEY=your_key_here
```

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Stack

- React 19 + Vite
- MUI v7 for UI components
- Zustand v5 for state (persisted to localStorage)
- dnd-kit for drag-and-drop interactions
- React Router v7
- Claude API (claude-sonnet-4-6) for course generation
