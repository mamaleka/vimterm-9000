import { HomeScreen } from './screens/HomeScreen'
import { WorldMapScreen } from './screens/WorldMapScreen'
import { SkillTreeScreen } from './screens/SkillTreeScreen'
import { LessonScreen } from './screens/LessonScreen'
import { PracticeScreen } from './screens/PracticeScreen'
import { BossFightScreen } from './screens/BossFightScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import SettingsScreen from './screens/SettingsScreen'
import ChallengeCompleteScreen from './screens/ChallengeCompleteScreen'
import { useStore } from './store'
import { zone1, zone2, zone3, zone4, zone5 } from './data/curriculum'
import type { Zone } from './types/curriculum'

const ALL_ZONES: Zone[] = [zone1, zone2, zone3, zone4, zone5]

function findNextChallenge(
  currentChallengeId: string,
): { nextChallengeId: string; nextLessonId: string } | { goToLesson: string } | null {
  for (const zone of ALL_ZONES) {
    for (let li = 0; li < zone.lessons.length; li++) {
      const lesson = zone.lessons[li]
      const ci = lesson.challenges.findIndex((c) => c.id === currentChallengeId)
      if (ci === -1) continue
      if (ci < lesson.challenges.length - 1) {
        return {
          nextChallengeId: lesson.challenges[ci + 1].id,
          nextLessonId: lesson.id,
        }
      }
      // Last challenge in this lesson — go to next lesson if available
      if (li < zone.lessons.length - 1) {
        const nextLesson = zone.lessons[li + 1]
        return { goToLesson: nextLesson.id }
      }
      // Last lesson in zone — return null (go to worldMap)
      return null
    }
  }
  return null
}

export default function App() {
  const currentScreen = useStore((s) => s.currentScreen)
  const navigateTo = useStore((s) => s.navigateTo)
  const pendingChallengeResult = useStore((s) => s.pendingChallengeResult)
  const currentChallengeId = useStore((s) => s.currentChallengeId)
  const setCurrentChallenge = useStore((s) => s.setCurrentChallenge)
  const setCurrentLesson = useStore((s) => s.setCurrentLesson)

  function handleContinue() {
    if (!currentChallengeId) {
      navigateTo('worldMap')
      return
    }
    const next = findNextChallenge(currentChallengeId)
    if (!next) {
      navigateTo('worldMap')
      return
    }
    if ('goToLesson' in next) {
      setCurrentLesson(next.goToLesson)
      navigateTo('lesson')
    } else {
      setCurrentChallenge(next.nextChallengeId)
      setCurrentLesson(next.nextLessonId)
      navigateTo('practice')
    }
  }

  switch (currentScreen) {
    case 'home':
      return <HomeScreen />
    case 'worldMap':
      return <WorldMapScreen />
    case 'skillTree':
      return <SkillTreeScreen />
    case 'lesson':
      return <LessonScreen />
    case 'practice':
      return <PracticeScreen />
    case 'bossFight':
      return <BossFightScreen />
    case 'profile':
      return <ProfileScreen />
    case 'settings':
      return <SettingsScreen />
    case 'challengeComplete':
      if (!pendingChallengeResult) return <PracticeScreen />
      return (
        <ChallengeCompleteScreen
          xpEarned={pendingChallengeResult.xpEarned}
          stars={pendingChallengeResult.stars}
          keystrokes={pendingChallengeResult.keystrokes}
          timeMs={pendingChallengeResult.timeMs}
          parTime={pendingChallengeResult.parTime}
          firstCompletion={pendingChallengeResult.firstCompletion}
          streakDays={pendingChallengeResult.streakDays}
          onContinue={handleContinue}
        />
      )
  }
}
