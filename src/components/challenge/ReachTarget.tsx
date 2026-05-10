import { useRef, useCallback, useEffect } from 'react'
import type { VimState, Position } from '../../types/vim'
import type { ChallengeDefinition } from '../../types/challenge'
import { validateChallenge } from '../../engine/challengeValidator'
import { VimEditor } from '../editor/VimEditor'

interface Props {
  challenge: ChallengeDefinition
  onSuccess: (keystrokes: number, timeMs: number) => void
  onArrowKeyPress: () => void
}

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

function deriveTargets(challenge: ChallengeDefinition): Position[] {
  const { successCondition } = challenge
  if (successCondition.type === 'cursorAt') {
    return [successCondition.position]
  }
  if (successCondition.type === 'allTargetsReached') {
    return successCondition.targets
  }
  return []
}

export function ReachTarget({ challenge, onSuccess, onArrowKeyPress }: Props) {
  const startTimeRef = useRef<number>(Date.now())
  const keystrokeCountRef = useRef<number>(0)
  const successFiredRef = useRef<boolean>(false)

  const targets = deriveTargets(challenge)

  // Count every non-arrow keystroke independently of state batching
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

      if (validateChallenge(state, challenge.successCondition)) {
        successFiredRef.current = true
        const elapsed = Date.now() - startTimeRef.current
        onSuccess(keystrokeCountRef.current, elapsed)
      }
    },
    [challenge, onSuccess]
  )

  return (
    <VimEditor
      initialBuffer={challenge.initialBuffer}
      targets={targets}
      onStateChange={handleStateChange}
      onArrowKey={onArrowKeyPress}
    />
  )
}
