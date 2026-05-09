export interface StreakState {
  current: number
  longest: number
  lastActivityDate: string
  graceUsed: boolean
}

export interface AchievementRecord {
  unlockedAt: string
  progress?: number
}

export interface PlayerState {
  id: string
  displayName: string
  xp: number
  level: number
  streak: StreakState
  achievements: Record<string, AchievementRecord>
  title: string
}
