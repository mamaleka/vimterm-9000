import type { Position } from './vim'

export type ChallengeType =
  | 'reachTarget'
  | 'speedRun'
  | 'deleteEnemies'
  | 'transform'
  | 'bossStage'
  | 'flashcardDrill'
  | 'freePractice'

export type SuccessCondition =
  | { type: 'cursorAt'; position: Position }
  | { type: 'bufferEquals'; expected: string[] }
  | { type: 'allTargetsReached'; targets: Position[]; inOrder: boolean }
  | { type: 'allEnemiesDeleted' }
  | { type: 'motionUsed'; motionType: string; count: number }

export interface ChallengeDefinition {
  id: string
  type: ChallengeType
  initialBuffer: string[]
  initialCursor: Position
  successCondition: SuccessCondition
  allowedMotions: string[]
  parTime: number
  maxKeystrokes?: number
  hint?: string
}
