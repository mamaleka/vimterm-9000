import type { VimState } from '../types/vim'
import type { SuccessCondition } from '../types/challenge'

const ENEMY_TOKENS = ['[X]', '>><<', '"VIRUS"', '{BOSS}']

export function validateChallenge(state: VimState, condition: SuccessCondition): boolean {
  switch (condition.type) {
    case 'cursorAt':
      return state.cursor.row === condition.position.row &&
             state.cursor.col === condition.position.col

    case 'bufferEquals':
      return state.buffer.length === condition.expected.length &&
             state.buffer.every((line, i) => line === condition.expected[i])

    case 'allTargetsReached': {
      const visited = state.visitedPositions ?? []
      if (!condition.inOrder) {
        return condition.targets.every(target =>
          visited.some(v => v.row === target.row && v.col === target.col)
        )
      }
      // inOrder: targets must appear as a subsequence within visited
      let targetIdx = 0
      for (const v of visited) {
        const target = condition.targets[targetIdx]
        if (target && v.row === target.row && v.col === target.col) {
          targetIdx++
        }
        if (targetIdx === condition.targets.length) return true
      }
      return targetIdx === condition.targets.length
    }

    case 'allEnemiesDeleted':
      return !state.buffer.some(line =>
        ENEMY_TOKENS.some(token => line.includes(token))
      )

    case 'motionUsed': {
      const counts = state.motionCounts ?? {}
      const used = counts[condition.motionType] ?? 0
      return used >= condition.count
    }
  }
}
