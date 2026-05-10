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

const ENEMY_TOKENS = ['[X]', '>><<', '"VIRUS"', '{BOSS}']

function countTokenOccurrences(line: string, token: string): number {
  let count = 0
  let start = 0
  while (start < line.length) {
    const idx = line.indexOf(token, start)
    if (idx === -1) break
    count++
    start = idx + token.length
  }
  return count
}

function countEnemies(buffer: string[]): number {
  return buffer.reduce(
    (total, line) =>
      total + ENEMY_TOKENS.reduce((sum, token) => sum + countTokenOccurrences(line, token), 0),
    0
  )
}

export function DeleteEnemies({ challenge, onSuccess, onArrowKeyPress }: Props) {
  const startTimeRef = useRef<number>(Date.now())
  const keystrokeCountRef = useRef<number>(0)
  const successFiredRef = useRef<boolean>(false)

  const [enemyCount, setEnemyCount] = useState<number>(
    () => countEnemies(challenge.initialBuffer)
  )

  const handleStateChange = useCallback(
    (state: VimState) => {
      const remaining = countEnemies(state.buffer)
      setEnemyCount(remaining)

      if (successFiredRef.current) return

      keystrokeCountRef.current += 1

      if (validateChallenge(state, challenge.successCondition)) {
        successFiredRef.current = true
        const elapsed = Date.now() - startTimeRef.current
        onSuccess(keystrokeCountRef.current, elapsed)
      }
    },
    [challenge, onSuccess]
  )

  return (
    <div className="flex flex-col gap-2">
      <div
        data-testid="enemy-count"
        className="font-mono text-sm text-crt-red"
      >
        ENEMIES: {enemyCount}
      </div>
      <VimEditor
        initialBuffer={challenge.initialBuffer}
        onStateChange={handleStateChange}
        onArrowKey={onArrowKeyPress}
      />
    </div>
  )
}
