import { useEffect, useRef, useState } from 'react'
import { TerminalWindow } from '../components/ui/TerminalWindow'
import { useStore } from '../store'
import { zone1 } from '../data/curriculum'
import type { Lesson, Zone } from '../types/curriculum'

const ALL_ZONES: Zone[] = [zone1]

function findLesson(lessonId: string): { lesson: Lesson; zone: Zone } | null {
  for (const zone of ALL_ZONES) {
    const lesson = zone.lessons.find((l) => l.id === lessonId)
    if (lesson) return { lesson, zone }
  }
  return null
}

function isLastLessonInZone(lessonId: string, zone: Zone): boolean {
  return zone.lessons[zone.lessons.length - 1].id === lessonId
}

function allOtherChallengesComplete(
  lessonId: string,
  zone: Zone,
  completedChallenges: Record<string, unknown>,
): boolean {
  for (const lesson of zone.lessons) {
    if (lesson.id === lessonId) continue
    for (const challenge of lesson.challenges) {
      if (!(challenge.id in completedChallenges)) return false
    }
  }
  return true
}

export function LessonScreen() {
  const currentLesson = useStore((s) => s.currentLesson)
  const currentChallengeId = useStore((s) => s.currentChallengeId)
  const navigateTo = useStore((s) => s.navigateTo)
  const setCurrentChallenge = useStore((s) => s.setCurrentChallenge)
  const completedChallenges = useStore((s) => s.completedChallenges)

  const found = currentLesson ? findLesson(currentLesson) : null
  const lesson = found?.lesson ?? null
  const zone = found?.zone ?? null

  // Typewriter state
  const [displayedText, setDisplayedText] = useState('')
  const [typewriterDone, setTypewriterDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!lesson) return

    const fullText = lesson.theoryText
    let index = 0
    setDisplayedText('')
    setTypewriterDone(false)

    // Detect test/reduced-motion environment: matchMedia may not exist in jsdom
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setDisplayedText(fullText)
      setTypewriterDone(true)
      return
    }

    intervalRef.current = setInterval(() => {
      index += 1
      setDisplayedText(fullText.slice(0, index))
      if (index >= fullText.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setTypewriterDone(true)
      }
    }, 30)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [lesson])

  if (!lesson || !zone) {
    return (
      <TerminalWindow>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-crt-dim font-mono">No lesson selected.</div>
        </div>
      </TerminalWindow>
    )
  }

  const challenges = lesson.challenges
  const challengeIndex = currentChallengeId
    ? challenges.findIndex((c) => c.id === currentChallengeId)
    : -1

  const challengeNumber = challengeIndex + 1
  const challengeTotal = challenges.length

  function handleStartPractice() {
    if (challenges.length > 0) {
      setCurrentChallenge(challenges[0].id)
      navigateTo('practice')
    }
  }

  function handleCompleteChallenge() {
    if (!currentChallengeId) return

    const isLastChallenge = challengeIndex === challenges.length - 1
    const isLastLesson = isLastLessonInZone(lesson.id, zone)

    if (isLastChallenge && isLastLesson) {
      // Check if all other challenges in the zone are complete
      const allDone = allOtherChallengesComplete(lesson.id, zone, completedChallenges)
      if (allDone) {
        navigateTo('bossFight')
        return
      }
    }

    navigateTo('challengeComplete')
  }

  return (
    <TerminalWindow>
      <div className="flex flex-col min-h-screen p-8 gap-6 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateTo('worldMap')}
            className="text-crt-dim font-mono text-sm hover:text-crt-text transition-colors border border-crt-border px-3 py-1"
          >
            ← BACK TO WORLD MAP
          </button>
          <div className="text-crt-dim font-mono text-xs">{zone.name}</div>
        </div>

        {/* Lesson title */}
        <div>
          <div className="text-crt-dim font-mono text-xs tracking-widest mb-1">LESSON</div>
          <div className="text-crt-bright font-terminal text-2xl tracking-widest">
            {lesson.title}
          </div>
        </div>

        {/* Motions introduced */}
        <div className="flex flex-wrap gap-2">
          {lesson.motionsIntroduced.map((motion) => (
            <span
              key={motion}
              className="border border-crt-border text-crt-amber font-terminal text-sm px-2 py-0.5"
            >
              {motion}
            </span>
          ))}
        </div>

        {/* Theory text with typewriter effect */}
        <div className="border border-crt-border p-4 bg-crt-surface min-h-24">
          <div className="text-crt-dim font-mono text-xs mb-2 tracking-widest">THEORY</div>
          <p className="text-crt-text font-mono text-sm leading-relaxed">
            {displayedText}
            {!typewriterDone && (
              <span className="inline-block w-2 bg-crt-cursor animate-pulse ml-0.5">&nbsp;</span>
            )}
          </p>
        </div>

        {/* Challenge progress (only shown when a challenge is active) */}
        {challengeIndex >= 0 && (
          <div className="text-crt-text font-mono text-sm tracking-widest">
            Challenge {challengeNumber} of {challengeTotal}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4 mt-auto">
          <button
            type="button"
            onClick={handleStartPractice}
            className="border border-crt-text text-crt-text font-terminal px-6 py-2 tracking-widest hover:bg-crt-text hover:text-crt-bg transition-colors"
          >
            START PRACTICE
          </button>

          {challengeIndex >= 0 && (
            <button
              type="button"
              onClick={handleCompleteChallenge}
              className="border border-crt-border text-crt-dim font-terminal px-6 py-2 tracking-widest hover:border-crt-text hover:text-crt-text transition-colors"
            >
              COMPLETE CHALLENGE
            </button>
          )}
        </div>
      </div>
    </TerminalWindow>
  )
}
