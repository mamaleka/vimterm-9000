import type { ChallengeDefinition } from './challenge'

export interface ChallengeRef {
  challengeId: string
}

export interface Lesson {
  id: string
  title: string
  theoryText: string
  challenges: ChallengeDefinition[]
  motionsIntroduced: string[]
}

export interface Zone {
  id: string
  name: string
  bossId: string
  lessons: Lesson[]
  unlockRequirement?: string
}
