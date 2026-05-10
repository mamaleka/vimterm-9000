import { useRef, useCallback, useState, useEffect } from 'react'
import type { VimState, Position } from '../../types/vim'
import type { ChallengeDefinition } from '../../types/challenge'
import { VimEditor } from '../editor/VimEditor'

interface Props {
  challenge: ChallengeDefinition
  onSuccess: (keystrokes: number, timeMs: number) => void
  onArrowKeyPress: () => void
}

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

function getTargets(challenge: ChallengeDefinition): Position[] {
  const { successCondition } = challenge
  if (successCondition.type === 'allTargetsReached') {
    return successCondition.targets
  }
  return []
}

export function SpeedRun({ challenge, onSuccess, onArrowKeyPress }: Props) {
  const startTimeRef = useRef<number>(Date.now())
  const keystrokeCountRef = useRef<number>(0)
  const successFiredRef = useRef<boolean>(false)
  const currentWaypointIdxRef = useRef<number>(0)

  const targets = getTargets(challenge)

  const [currentWaypointIdx, setCurrentWaypointIdx] = useState<number>(0)
  const [, setTick] = useState<number>(0)

  const elapsedMs = Date.now() - startTimeRef.current

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (successFiredRef.current) return
      if (ARROW_KEYS.has(e.key)) return
      if (e.altKey || e.metaKey) return
      if (e.ctrlKey && e.key !== 'o' && e.key !== 'i') return
      keystrokeCountRef.current += 1
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleStateChange = useCallback(
    (state: VimState) => {
      if (successFiredRef.current) return

      const idx = currentWaypointIdxRef.current
      if (idx >= targets.length) return

      const currentTarget = targets[idx]
      if (
        state.cursor.row === currentTarget.row &&
        state.cursor.col === currentTarget.col
      ) {
        const nextIdx = idx + 1
        currentWaypointIdxRef.current = nextIdx
        setCurrentWaypointIdx(nextIdx)

        if (nextIdx === targets.length) {
          successFiredRef.current = true
          const elapsed = Date.now() - startTimeRef.current
          onSuccess(keystrokeCountRef.current, elapsed)
        }
      }
    },
    [targets, onSuccess]
  )

  const displayIdx = Math.min(currentWaypointIdx + 1, targets.length)
  const currentTarget = targets[currentWaypointIdx] as Position | undefined
  const isOverTime = elapsedMs > 2 * challenge.parTime

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 font-mono text-sm">
        <span data-testid="waypoint-counter" className="text-crt-text">
          {displayIdx}/{targets.length}
        </span>
        <span
          data-testid="elapsed-time"
          className={isOverTime ? 'text-crt-red' : 'text-crt-text'}
        >
          {(elapsedMs / 1000).toFixed(1)}s
        </span>
      </div>
      <VimEditor
        initialBuffer={challenge.initialBuffer}
        targets={currentTarget !== undefined ? [currentTarget] : []}
        onStateChange={handleStateChange}
        onArrowKey={onArrowKeyPress}
      />
    </div>
  )
}
