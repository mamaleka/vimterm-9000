import { useState, useCallback, useEffect } from 'react'
import { useStore } from '../store'
import type { StreakState } from '../store/playerSlice'

const ARROW_KEYS_SET = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

function calcNewStreak(streak: StreakState, today: string): StreakState {
  if (streak.lastActivityDate === today) return streak
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)
  const newCurrent = streak.lastActivityDate === yesterdayStr ? streak.current + 1 : 1
  return {
    current: newCurrent,
    longest: Math.max(newCurrent, streak.longest),
    lastActivityDate: today,
    graceUsed: false,
  }
}
import { zone1 } from '../data/curriculum'
import type { Zone } from '../types/curriculum'
import type { ChallengeDefinition } from '../types/challenge'
import type { ChallengeResult } from '../store/progressSlice'
import { calculateXP } from '../utils/xp'
import { HUD } from '../components/ui/HUD'
import { HintPanel } from '../components/editor/HintPanel'
import { KeyHistoryDisplay } from '../components/editor/KeyHistoryDisplay'
import { ReachTarget } from '../components/challenge/ReachTarget'
import { DeleteEnemies } from '../components/challenge/DeleteEnemies'
import { TransformChallenge } from '../components/challenge/TransformChallenge'

const ALL_ZONES: Zone[] = [zone1]

function findChallenge(id: string): ChallengeDefinition | undefined {
  for (const zone of ALL_ZONES) {
    for (const lesson of zone.lessons) {
      for (const ch of lesson.challenges) {
        if (ch.id === id) return ch
      }
    }
  }
  return undefined
}

function calcStars(
  keystrokes: number,
  timeMs: number,
  parTime: number,
  maxKeystrokes: number | undefined,
): 1 | 2 | 3 {
  const speedOk = timeMs < parTime * 1000
  const accuracyOk = keystrokes <= (maxKeystrokes ?? Infinity)
  if (speedOk && accuracyOk) return 3
  if (timeMs < parTime * 2000) return 2
  return 1
}

export function PracticeScreen() {
  const currentChallengeId = useStore((s) => s.currentChallengeId)
  const addXP = useStore((s) => s.addXP)
  const streak = useStore((s) => s.streak)
  const completedChallenges = useStore((s) => s.completedChallenges)
  const completeChallenge = useStore((s) => s.completeChallenge)
  const navigateTo = useStore((s) => s.navigateTo)
  const recordArrowKeyPress = useStore((s) => s.recordArrowKeyPress)
  const recordMotionUse = useStore((s) => s.recordMotionUse)
  const updateStreak = useStore((s) => s.updateStreak)
  const setPendingChallengeResult = useStore((s) => s.setPendingChallengeResult)
  const recordKeystrokes = useStore((s) => s.recordKeystrokes)
  const addTimeSpent = useStore((s) => s.addTimeSpent)
  const recordDailyActivity = useStore((s) => s.recordDailyActivity)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (ARROW_KEYS_SET.has(e.key)) return
      if (e.altKey || e.metaKey) return
      if (e.ctrlKey && e.key !== 'o' && e.key !== 'i') return
      recordMotionUse(e.key)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [recordMotionUse])

  const [arrowWarning, setArrowWarning] = useState(false)
  const [keyHistory] = useState<string[]>([])

  const challenge = currentChallengeId ? findChallenge(currentChallengeId) : undefined

  const handleSuccess = useCallback(
    (keystrokes: number, timeMs: number) => {
      if (!challenge) return
      const speedBonus = timeMs < challenge.parTime * 1000
      const accuracyBonus = keystrokes <= (challenge.maxKeystrokes ?? Infinity)
      const firstCompletion = !(challenge.id in completedChallenges)
      const amount = calculateXP(100, speedBonus, accuracyBonus, firstCompletion, streak.current)
      addXP(amount)
      const stars = calcStars(keystrokes, timeMs, challenge.parTime, challenge.maxKeystrokes)
      const result: ChallengeResult = {
        attempts: 1,
        bestTime: timeMs,
        bestAccuracy:
          challenge.maxKeystrokes != null
            ? Math.min(100, Math.floor((challenge.maxKeystrokes / keystrokes) * 100))
            : 100,
        stars,
        xpEarned: amount,
      }
      completeChallenge(challenge.id, result)
      recordKeystrokes(keystrokes)
      addTimeSpent(Math.round(timeMs / 1000))
      const today = new Date().toISOString().slice(0, 10)
      recordDailyActivity(today)
      updateStreak(calcNewStreak(streak, today))
      setPendingChallengeResult({
        xpEarned: amount,
        stars,
        keystrokes,
        timeMs,
        parTime: challenge.parTime * 1000,
        firstCompletion,
        streakDays: streak.current,
      })
      navigateTo('challengeComplete')
    },
    [challenge, completedChallenges, streak.current, streak.lastActivityDate, addXP, completeChallenge, navigateTo, setPendingChallengeResult, recordKeystrokes, addTimeSpent, recordDailyActivity, updateStreak],
  )

  const handleArrowKeyPress = useCallback(() => {
    recordArrowKeyPress()
    setArrowWarning(true)
    setTimeout(() => {
      setArrowWarning(false)
    }, 1500)
  }, [recordArrowKeyPress])

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 text-crt-dim font-mono">
        <div>No challenge active</div>
        <button
          data-testid="go-to-world-map"
          onClick={() => navigateTo('worldMap')}
          className="border border-crt-border text-crt-text px-6 py-2 font-mono hover:text-crt-bright hover:border-crt-text transition-colors"
        >
          GO TO WORLD MAP
        </button>
      </div>
    )
  }

  const ChallengeComponent =
    challenge.type === 'deleteEnemies'
      ? DeleteEnemies
      : challenge.type === 'transform'
        ? TransformChallenge
        : ReachTarget

  return (
    <div className="flex flex-col h-screen bg-crt-bg text-crt-text font-mono">
      <HUD />
      <div className="flex-1 flex flex-col gap-2 p-4 overflow-hidden">
        <ChallengeComponent
          challenge={challenge}
          onSuccess={handleSuccess}
          onArrowKeyPress={handleArrowKeyPress}
        />
        <HintPanel hint={challenge.hint ?? null} />
        <KeyHistoryDisplay keys={keyHistory} />
        {arrowWarning && (
          <div data-testid="arrow-warning" className="text-crt-amber font-mono text-center">
            Use HJKL!
          </div>
        )}
      </div>
    </div>
  )
}
