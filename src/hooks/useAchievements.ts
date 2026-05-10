import { useEffect } from 'react'
import { useStore } from '../store'
import { achievements } from '../data/achievements'
import type { StatisticsState } from '../store/statisticsSlice'
import type { ProgressState } from '../store/progressSlice'

export function useAchievements(): void {
  const statistics = useStore((s) => s.statistics)
  const unlockedAchievements = useStore((s) => s.unlockedAchievements)
  const unlockAchievement = useStore((s) => s.unlockAchievement)

  // Progress state fields needed for condition checks
  const completedChallenges = useStore((s) => s.completedChallenges)
  const completedLessons = useStore((s) => s.completedLessons)
  const bossDefeats = useStore((s) => s.bossDefeats)
  const unlockedZones = useStore((s) => s.unlockedZones)
  const currentZone = useStore((s) => s.currentZone)
  const currentLesson = useStore((s) => s.currentLesson)

  useEffect(() => {
    const progress: ProgressState = {
      completedChallenges,
      completedLessons,
      bossDefeats,
      unlockedZones,
      currentZone,
      currentLesson,
    }

    const stats: StatisticsState = statistics

    for (const achievement of achievements) {
      if (!(achievement.id in unlockedAchievements)) {
        if (achievement.checkCondition(stats, progress)) {
          unlockAchievement(achievement.id)
        }
      }
    }
  }, [
    statistics,
    unlockedAchievements,
    unlockAchievement,
    completedChallenges,
    completedLessons,
    bossDefeats,
    unlockedZones,
    currentZone,
    currentLesson,
  ])
}
