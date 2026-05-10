import { useEffect } from 'react'
import { useStore } from '../store'
import { achievements } from '../data/achievements'
import type { ProgressState } from '../store/progressSlice'

function selectProgress(s: ReturnType<typeof useStore.getState>): ProgressState {
  return {
    unlockedZones: s.unlockedZones,
    completedLessons: s.completedLessons,
    completedChallenges: s.completedChallenges,
    bossDefeats: s.bossDefeats,
    currentZone: s.currentZone,
    currentLesson: s.currentLesson,
  }
}

export function useAchievements(): void {
  const statistics = useStore((s) => s.statistics)
  const unlockedAchievements = useStore((s) => s.unlockedAchievements)
  const unlockAchievement = useStore((s) => s.unlockAchievement)
  const progress = useStore(selectProgress)

  useEffect(() => {
    for (const achievement of achievements) {
      if (!(achievement.id in unlockedAchievements) && achievement.checkCondition(statistics, progress)) {
        unlockAchievement(achievement.id)
      }
    }
  }, [statistics, unlockedAchievements, unlockAchievement, progress])
}
