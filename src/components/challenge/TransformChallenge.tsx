import { useRef, useCallback, useState } from 'react'
import type { VimState } from '../../types/vim'
import type { ChallengeDefinition } from '../../types/challenge'
import { validateChallenge } from '../../engine/challengeValidator'
import { VimEditor } from '../editor/VimEditor'

interface Props {
  challenge: ChallengeDefinition
  onSuccess: (keystrokes: number, timeMs: number) => void
  onArrowKeyPress: () => void
}

function countDiffLines(current: string[], expected: string[]): number {
  const maxLen = Math.max(current.length, expected.length)
  let count = 0
  for (let i = 0; i < maxLen; i++) {
    if (current[i] !== expected[i]) count++
  }
  return count
}

export function TransformChallenge({ challenge, onSuccess, onArrowKeyPress }: Props) {
  const startTimeRef = useRef<number>(Date.now())
  const keystrokeCountRef = useRef<number>(0)
  const successFiredRef = useRef<boolean>(false)

  const expected =
    challenge.successCondition.type === 'bufferEquals'
      ? challenge.successCondition.expected
      : []

  const [diffCount, setDiffCount] = useState<number>(
    () => countDiffLines(challenge.initialBuffer, expected)
  )

  const handleStateChange = useCallback(
    (state: VimState) => {
      const diff = countDiffLines(state.buffer, expected)
      setDiffCount(diff)

      if (successFiredRef.current) return

      keystrokeCountRef.current += 1

      if (validateChallenge(state, challenge.successCondition)) {
        successFiredRef.current = true
        const elapsed = Date.now() - startTimeRef.current
        onSuccess(keystrokeCountRef.current, elapsed)
      }
    },
    [challenge, expected, onSuccess]
  )

  return (
    <div className="flex flex-col gap-2">
      <div
        data-testid="diff-indicator"
        className="font-mono text-sm text-crt-text"
      >
        DIFF: {diffCount} line{diffCount !== 1 ? 's' : ''} remaining
      </div>
      <div className="flex gap-4">
        <div className="flex-1" data-testid="before-panel">
          <div className="font-mono text-xs text-crt-dim mb-1">BEFORE</div>
          <VimEditor
            initialBuffer={challenge.initialBuffer}
            onStateChange={handleStateChange}
            onArrowKey={onArrowKeyPress}
          />
        </div>
        <div className="flex-1" data-testid="after-panel">
          <div className="font-mono text-xs text-crt-dim mb-1">AFTER</div>
          <div className="font-mono bg-crt-bg text-crt-text p-2 border border-crt-border">
            {expected.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {line || ' '}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
