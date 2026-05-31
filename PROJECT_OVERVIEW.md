# CourseForge AI

CourseForge AI is an AI-powered course builder that turns a topic or uploaded PDF into a structured, interactive learning experience. It helps educators, trainers, and instructional designers quickly generate editable lessons with content blocks, quizzes, characters, media, and SCORM export support for LMS platforms such as Canvas.

## Project Summary

CourseForge AI was designed to reduce the friction of creating online learning materials. Instead of starting from a blank page, users can provide a topic or source document, customize the audience and desired output, and receive a multi-lesson course with interactive blocks already assembled.

The app supports both AI-assisted creation and manual editing. Users can refine content with AI, edit individual blocks through friendly form-based editors, add new blocks anywhere in a lesson, and export the final course as a SCORM package.

## Key Features

- **AI course generation** from a topic, PDF, or structured generation brief
- **Two-step creation flow** with source input first, then optional customization
- **Editable lesson blocks** including headings, paragraphs, lists, accordions, tabs, flashcards, quizzes, scenarios, characters, images, diagrams, YouTube videos, and drag-to-match activities
- **Friendly block editor** that replaces raw JSON editing with non-technical form controls
- **Manual block insertion** with subtle hover-based plus buttons between blocks
- **AI refinement** for improving individual lesson blocks
- **Character-based learning support** with custom character names, messages, and image uploads
- **SCORM 1.2 export** for Canvas and other LMS platforms
- **Configurable SCORM grading** based on either completion or quiz correctness
- **Canvas-friendly SCORM navigation** using a single course player with built-in lesson navigation

## Problem

Many course authoring tools require users to manually assemble content, structure lessons, design activities, and configure LMS export settings. This can be time-consuming, especially for instructors or teams who have source material but need help transforming it into an interactive course.

The original version of this project could generate useful course content, but several workflows needed improvement:

- Editing blocks exposed raw JSON, which was difficult for non-technical users.
- SCORM exports behaved differently inside Canvas than in the web preview.
- Users needed more control over generation quality and instructional intent.
- Manually adding or rearranging learning blocks was not intuitive.

## Solution

CourseForge AI combines AI generation with a visual editing workflow. Users start with a simple source input, then optionally provide context such as audience, learner level, course style, learning goals, lesson count, and special instructions.

Generated courses are not locked outputs. Each block can be edited through purpose-built controls, and new blocks can be inserted directly between existing content. The SCORM export pipeline was also improved to provide cleaner Canvas navigation and grading options.

## My Role

I designed and implemented the full application experience, including:

- Frontend architecture and interactive course preview
- AI generation workflow and prompt structure
- PDF extraction flow
- Block rendering system
- Friendly block editing and add-block workflow
- SCORM export generation
- Canvas compatibility fixes
- SCORM grading modes
- UI/UX improvements across creation, editing, and export flows

## Technical Stack

- **React** for the frontend application
- **Vite** for development and build tooling
- **Material UI** for UI components and styling
- **Zustand** for persisted course state
- **Claude API** for course generation and AI refinement
- **PDF.js** for PDF text extraction
- **JSZip** for SCORM package generation
- **dnd-kit** for drag-and-drop interactions
- **SCORM 1.2** for LMS export compatibility

## Notable Technical Work

### AI Course Generation

The generation flow converts a topic or PDF into a structured course JSON format. The model creates lessons and blocks that the app can render directly. A two-step creation flow lets users provide additional context before generation, making output more tailored and less “AI autopilot.”

### Friendly Block Editing

Instead of requiring users to edit raw JSON, the app provides form-based editors for every supported block type. Repeatable content such as list items, tabs, process steps, flashcards, scenario choices, and quiz options can be added or removed through UI controls.

### Manual Block Adding

Users can insert new blocks anywhere in a lesson. Hover-based plus buttons appear between blocks, keeping the page clean while still making insertion points discoverable.

### SCORM Export and Canvas Compatibility

The export system creates SCORM 1.2 packages that can be uploaded into Canvas. The original multi-resource export caused Canvas to show an awkward generated course menu. I redesigned the export to use a single SCORM course player with built-in lesson navigation, producing a cleaner learner experience.

### SCORM Grading Options

The export modal allows users to choose between:

- **Completion grading**, where students receive full credit for completing/opening the package
- **Correctness grading**, where scores are calculated from quiz-like interactions

This gives instructors flexibility depending on whether the course is meant for participation credit or assessment.

## UX Highlights

- Clean two-step course creation flow
- Optional customization instead of overwhelming setup
- Non-technical editing forms
- Subtle add-block hover affordances
- Editable character images and names
- Simple YouTube URL input instead of video ID entry
- SCORM settings designed around real Canvas behavior

## Challenges

One of the biggest challenges was making generated AI content editable without exposing users to the underlying JSON structure. Each block type has a different data shape, so the editor needed to support many forms while preserving the existing course schema.

Another major challenge was SCORM compatibility. Content that worked well in the web preview sometimes behaved differently inside Canvas, especially navigation, grading, embedded interactions, and media handling. I improved the export structure and interaction scripts to make the LMS version more reliable.

## Outcome

CourseForge AI became a more complete course authoring tool: users can generate, customize, edit, extend, and export interactive lessons without needing to write code. The project demonstrates how AI can support instructional design while still giving users control over the final learning experience.

## Future Improvements

- Add drag-and-drop block reordering
- Add reusable course templates
- Support richer LMS reporting through SCORM interactions
- Add collaborative editing
- Add accessibility checks for generated content
- Support more export formats such as xAPI or HTML package export
- Improve media asset management for uploaded images

