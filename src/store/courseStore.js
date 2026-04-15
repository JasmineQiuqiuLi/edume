import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { generateCourse, refineBlock as refineBlockApi } from '../services/claudeService';
import DEFAULT_PROFILES from '../data/characterProfiles';

// Assign one approved character image per persona used in the course.
// Same persona → same image throughout the course (consistent social presence).
function resolveCharacterBlocks(course, approvedCharacters) {
  const personaMap = {}; // persona → resolved imageUrl

  for (const lesson of course.lessons ?? []) {
    for (const block of lesson.blocks ?? []) {
      if (block.type !== 'character') continue;
      const persona = block.persona ?? 'teacher';
      if (!personaMap[persona]) {
        const pool = approvedCharacters.filter((c) => c.persona === persona);
        if (pool.length > 0) {
          // Pick deterministically from the pool based on course title
          let h = 0;
          for (let i = 0; i < course.title.length; i++)
            h = Math.imul(31, h) + course.title.charCodeAt(i) | 0;
          personaMap[persona] = pool[Math.abs(h) % pool.length].url;
        }
      }
      block.imageUrl = personaMap[persona] ?? null;
    }
  }
}

const useCourseStore = create(
  persist(
    (set, get) => ({
      courses: [],
      activeCourseId: null,
      activeLessonId: null,
      status: 'idle', // 'idle' | 'generating' | 'refining' | 'error'
      error: null,

      // ── Character pool ────────────────────────────────────────────────
      // Only the removed IDs are persisted; approvedCharacters is always
      // derived from DEFAULT_PROFILES so URL changes in characterProfiles.js
      // are picked up immediately without stale localStorage values.
      removedCharacterIds: [],
      approvedCharacters: DEFAULT_PROFILES,

      removeCharacter: (id) =>
        set((s) => {
          const removedCharacterIds = [...s.removedCharacterIds, id];
          return {
            removedCharacterIds,
            approvedCharacters: DEFAULT_PROFILES.filter((p) => !removedCharacterIds.includes(p.id)),
          };
        }),

      resetCharacters: () =>
        set({ removedCharacterIds: [], approvedCharacters: DEFAULT_PROFILES }),

      // ── Course generation ──────────────────────────────────────────────
      generate: async (inputText) => {
        set({ status: 'generating', error: null });
        try {
          const course = await generateCourse(inputText);
          resolveCharacterBlocks(course, get().approvedCharacters);
          const id = uuidv4();
          const newCourse = {
            ...course,
            id,
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            courses: [newCourse, ...state.courses],
            activeCourseId: id,
            activeLessonId: newCourse.lessons[0]?.id ?? null,
            status: 'idle',
          }));
          return id;
        } catch (err) {
          set({ status: 'error', error: err.message });
          throw err;
        }
      },

      // ── Navigation ────────────────────────────────────────────────────
      setActiveCourse: (id) => {
        const course = get().courses.find((c) => c.id === id);
        set({
          activeCourseId: id,
          activeLessonId: course?.lessons[0]?.id ?? null,
        });
      },

      setActiveLesson: (id) => set({ activeLessonId: id }),

      // ── Block CRUD ────────────────────────────────────────────────────
      updateBlock: (courseId, lessonId, blockId, updatedBlock) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id !== courseId
              ? c
              : {
                  ...c,
                  lessons: c.lessons.map((l) =>
                    l.id !== lessonId
                      ? l
                      : {
                          ...l,
                          blocks: l.blocks.map((b) =>
                            b.id === blockId ? { ...updatedBlock, id: blockId } : b
                          ),
                        }
                  ),
                }
          ),
        }));
      },

      deleteBlock: (courseId, lessonId, blockId) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id !== courseId
              ? c
              : {
                  ...c,
                  lessons: c.lessons.map((l) =>
                    l.id !== lessonId
                      ? l
                      : { ...l, blocks: l.blocks.filter((b) => b.id !== blockId) }
                  ),
                }
          ),
        }));
      },

      refineBlock: async (courseId, lessonId, blockId, instruction) => {
        const state = get();
        const course = state.courses.find((c) => c.id === courseId);
        const lesson = course?.lessons.find((l) => l.id === lessonId);
        const block = lesson?.blocks.find((b) => b.id === blockId);
        if (!block) return;

        set({ status: 'refining', error: null });
        try {
          const refined = await refineBlockApi(block, instruction);
          get().updateBlock(courseId, lessonId, blockId, refined);
          set({ status: 'idle' });
        } catch (err) {
          set({ status: 'error', error: err.message });
          throw err;
        }
      },

      // ── Library ───────────────────────────────────────────────────────
      deleteCourse: (id) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
          activeCourseId: state.activeCourseId === id ? null : state.activeCourseId,
        }));
      },
    }),
    {
      name: 'ai-tutorial-courses',
      partialize: (state) => ({
        courses: state.courses,
        removedCharacterIds: state.removedCharacterIds,
      }),
      // Rebuild approvedCharacters from DEFAULT_PROFILES after rehydration
      // so URL changes in characterProfiles.js are always picked up.
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.approvedCharacters = DEFAULT_PROFILES.filter(
            (p) => !state.removedCharacterIds.includes(p.id)
          );
        }
      },
    }
  )
);

export default useCourseStore;
