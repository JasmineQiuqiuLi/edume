# AI Course Builder

AI Course Builder is a React application for creating interactive e-learning courses with AI. Users can generate structured multi-lesson courses from a topic or PDF, edit individual learning blocks, import supported Rise 360 SCORM packages, and export finished courses as SCORM 1.2 ZIP files for LMS platforms such as Canvas.

## Features

- Generate courses from a topic, prompt, or uploaded PDF
- Customize generation by audience, learner level, style, goals, and lesson count
- Edit generated lessons with reusable content and interaction blocks
- Add, update, delete, and refine individual course blocks
- Import Rise 360 SCORM ZIP packages into editable course content
- Export full courses or individual lessons as SCORM 1.2 packages
- Choose completion-based or correctness-based SCORM grading
- Manage generated and imported courses in a local course library
- Use character-based learning blocks for guided instruction

## Tech Stack

- React 19
- Vite
- Material UI
- Zustand
- React Router
- Claude API
- PDF.js
- JSZip
- dnd-kit

## Getting Started

### Prerequisites

- Node.js
- npm
- An Anthropic API key for Claude-powered generation

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

An example file is available at `.env.local.example`.

### Run the Development Server

```bash
npm run dev
```

The app will run at:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Project Structure

```text
src/
  app/              App router and theme configuration
  components/       Course blocks, lesson UI, and shared UI components
  data/             Character profile data
  pages/            Dashboard, library, course, and character pages
  services/         Claude, PDF, SCORM import/export, and YouTube services
  store/            Zustand course store
  utils/            Rich text utilities
public/
  characters/       Character SVG assets
scripts/            Utility scripts
```

## SCORM Support

The app can export SCORM 1.2 ZIP packages that include course HTML, shared styles, interaction scripts, a SCORM runtime wrapper, and an `imsmanifest.xml` file.

The import workflow currently supports Rise 360 SCORM exports. Supported Rise blocks are converted into editable internal blocks, while unsupported content is represented with warning placeholders so users can review and rebuild missing pieces.

## Notes

This project stores courses locally in the browser using persisted Zustand state. Generated, imported, and edited courses remain available in the local course library unless browser storage is cleared.
