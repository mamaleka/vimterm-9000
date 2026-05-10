import { useState, useEffect, useRef, useCallback } from 'react'
import type { VimState } from '../../types/vim'
import type { ChallengeDefinition } from '../../types/challenge'
import { validateChallenge } from '../../engine/challengeValidator'
import { VimEditor } from '../editor/VimEditor'

export interface BossStageProps {
  challenge: ChallengeDefinition
  timeLimit: number
  onStageCleared: () => void
  onHeartLost: () => void
  onArrowKeyPress: () => void
}

export function BossStage({
  challenge,
  timeLimit,
  onStageCleared,
  onHeartLost,
  onArrowKeyPress,
}: BossStageProps) {
  const [remaining, setRemaining] = useState(timeLimit)

  const clearedRef = useRef(false)
  const heartLostRef = useRef(false)
  const wrongKeysRef = useRef(0)
  const onHeartLostRef = useRef(onHeartLost)
  const onStageClearedRef = useRef(onStageCleared)

  // Keep callback refs current without causing effect restarts
  onHeartLostRef.current = onHeartLost
  onStageClearedRef.current = onStageCleared

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Detect timer expiry
  useEffect(() => {
    if (remaining <= 0 && !clearedRef.current && !heartLostRef.current) {
      heartLostRef.current = true
      onHeartLostRef.current()
    }
  }, [remaining])

  // Wrong keystroke tracking
  useEffect(() => {
    const allowed = new Set(challenge.allowedMotions)

    function handleKeyDown(e: KeyboardEvent): void {
      if (clearedRef.current || heartLostRef.current) return
      if (!allowed.has(e.key)) {
        wrongKeysRef.current += 1
        if (wrongKeysRef.current >= 5) {
          heartLostRef.current = true
          onHeartLostRef.current()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [challenge.allowedMotions])

  const handleStateChange = useCallback(
    (state: VimState) => {
      if (clearedRef.current || heartLostRef.current) return
      if (validateChallenge(state, challenge.successCondition)) {
        clearedRef.current = true
        onStageClearedRef.current()
      }
    },
    [challenge.successCondition],
  )

  const isRed = remaining < timeLimit * 0.3

  return (
    <div data-testid="boss-stage">
      <div
        data-testid="boss-timer"
        className={
          isRed
            ? 'text-crt-red font-mono text-2xl tabular-nums'
            : 'text-crt-text font-mono text-2xl tabular-nums'
        }
      >
        {remaining}s
      </div>
      <VimEditor
        initialBuffer={challenge.initialBuffer}
        onStateChange={handleStateChange}
        onArrowKey={onArrowKeyPress}
      />
    </div>
  )
}
