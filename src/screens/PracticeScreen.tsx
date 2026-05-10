import { useState, useCallback } from 'react'
import { useStore } from '../store'
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
  const setPendingChallengeResult = useStore((s) => s.setPendingChallengeResult)

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
    [challenge, completedChallenges, streak.current, addXP, completeChallenge, navigateTo, setPendingChallengeResult],
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
      <div className="flex items-center justify-center h-screen text-crt-dim font-mono">
        No challenge selected
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
