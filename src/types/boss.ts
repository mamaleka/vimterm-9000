import type { ChallengeDefinition } from './challenge'

export interface BossDialogue {
  wrongKey: string[]
  timeout: string[]
  stageCleared: string[]
  defeat: string[]
}

export interface BossDefinition {
  id: string
  name: string
  zone: number
  asciiArt: string
  stages: ChallengeDefinition[]
  dialogue: BossDialogue
}
