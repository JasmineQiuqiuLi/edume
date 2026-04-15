# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

No test runner is configured.

## Stack

- **React 19** with JSX (`.jsx` files, no TypeScript)
- **Vite** for bundling
- **React Router v7** (`BrowserRouter` in `src/app/router.jsx`)
- **MUI v7** (`@mui/material`) for UI components
- **Zustand v5** for global state management
- **dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`) for drag-and-drop

## Architecture

The app entry point is `src/main.jsx`, which mounts the router from `src/app/router.jsx`. Routes map to page components in `src/pages/`. New pages should be added to `src/app/router.jsx`.

`src/App.jsx` is a leftover Vite template file and is not used in the app.

## ESLint

`no-unused-vars` is configured to ignore variables matching `^[A-Z_]` (uppercase-starting names are allowed to be unused — useful for component imports, constants, and MUI icons).
